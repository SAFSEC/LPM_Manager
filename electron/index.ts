import { app, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron/main';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase, getDbPaths } from '@server/db/client';
import { initPrivacyVault } from '@server/privacy/tokenVault';
import { initLogger, log, getLogFilePath } from './logger';
import { registerMandantenIpc } from './ipc/mandanten.ipc';
import { registerChecklistenIpc } from './ipc/checklisten.ipc';
import { registerFormulareIpc } from './ipc/formulare.ipc';
import { registerKiIpc } from './ipc/ki.ipc';
import { registerExportIpc } from './ipc/export.ipc';
import { registerEinstellungenIpc } from './ipc/einstellungen.ipc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APP_ID = 'de.jwsafety.lpm-manager';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (process.env.ELECTRON_RENDERER_URL) {
      mainWindow?.webContents.openDevTools();
    }
  });

  globalShortcut.register('F12', () => {
    mainWindow?.webContents.toggleDevTools();
  });

  mainWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
    log(`PRELOAD-ERROR: ${preloadPath} :: ${error.message}`);
    dialog.showErrorBox(
      'LPM Manager – Preload-Fehler',
      `Das Preload-Script konnte nicht geladen werden:\n\n${preloadPath}\n\nFehler: ${error.message}`
    );
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    log(`RENDERER[${level}]: ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    log(`DID-FAIL-LOAD: ${errorCode} ${errorDescription} url=${validatedURL}`);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    log(`RENDER-PROCESS-GONE: reason=${details.reason} exitCode=${details.exitCode}`);
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerSystemIpc(): void {
  ipcMain.handle('system:get-db-paths', () => {
    try {
      const paths = getDbPaths();
      return { success: true, data: paths };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      return { success: false, error: message };
    }
  });
}

app.setAppUserModelId(APP_ID);

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack ?? ''}`);
  dialog.showErrorBox('LPM Manager – Startfehler', `Unerwarteter Fehler:\n\n${err.message}\n\n${err.stack ?? ''}`);
  app.quit();
});

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  log(`UNHANDLED REJECTION: ${msg}`);
});

app.whenReady().then(() => {
  const userData = app.getPath('userData');
  initLogger(userData);
  log('=== LPM Manager Start ===');
  log(`userData: ${userData}`);
  log(`__dirname: ${__dirname}`);
  log(`preload path: ${path.join(__dirname, '../preload/preload.cjs')}`);

  try {
    log('initDatabase...');
    initDatabase(userData);
    log('initDatabase OK');
    log('initPrivacyVault...');
    initPrivacyVault(path.join(userData, 'tokens.db'));
    log('initPrivacyVault OK');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`DB FEHLER: ${msg}`);
    dialog.showErrorBox('LPM Manager – Datenbankfehler', `Die Datenbank konnte nicht initialisiert werden:\n\n${msg}\n\nLog: ${getLogFilePath() ?? 'unbekannt'}`);
    app.quit();
    return;
  }

  log('registerIpc...');
  registerSystemIpc();
  registerMandantenIpc();
  registerChecklistenIpc();
  registerFormulareIpc();
  registerKiIpc();
  registerExportIpc();
  registerEinstellungenIpc();
  log('registerIpc OK');

  createWindow();
  log('createWindow OK');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
