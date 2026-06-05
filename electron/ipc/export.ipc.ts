import { ipcMain, app, BrowserWindow, shell } from 'electron/main';
import path from 'node:path';
import fs from 'node:fs';
import { ipcFromError, ipcOk } from './ipcTypes';
import { exportWordSchema, exportPdfSchema, exportListeSchema } from '@server/validation/export.schema';
import { getMandantById } from '@server/db/repositories/mandanten.repository';
import { getRunById, getAntwortenByRun } from '@server/db/repositories/checklisten.repository';
import { getFormularById } from '@server/db/repositories/formulare.repository';
import { getFormularDefinition } from '@server/formulare/catalog';
import { createExportRecord, getExporteByMandant } from '@server/db/repositories/export.repository';
import { generiereWordExport } from '@server/export/word.export';
import { generiereFormularWordExport } from '@server/export/word.formular.export';
import { generiereHtmlTemplate, generiereFormularHtmlTemplate } from '@server/export/pdf.export';
import { detokenizeAll } from '@server/privacy/tokenVault';
import type { ChecklisteExportData } from '@server/export/types';
import type { FormularExportData } from '@server/formulare/types';

function getExportPfad(): string {
  const docPath = path.join(app.getPath('documents'), 'LPM Manager Exports');
  if (!fs.existsSync(docPath)) {
    fs.mkdirSync(docPath, { recursive: true });
  }
  return docPath;
}

function sanitizeDateiname(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-äöüÄÖÜß]/g, '_').slice(0, 80);
}

function generiereDateiname(mandantName: string, anlageId: string, format: string): string {
  const datum = new Date().toISOString().split('T')[0];
  const safe = sanitizeDateiname(mandantName);
  return `${datum}_${anlageId}_${safe}.${format}`;
}

async function ladeFormularExportData(
  mandantId: string,
  formularDbId: number
): Promise<FormularExportData> {
  const mandant = getMandantById(mandantId);
  if (!mandant) throw new Error(`Mandant nicht gefunden: ${mandantId}`);

  const formularRow = getFormularById(formularDbId);
  if (!formularRow) throw new Error(`Formular #${formularDbId} nicht gefunden`);

  const definition = getFormularDefinition(formularRow.formularId);
  if (!definition) throw new Error(`Formular-Definition für ${formularRow.formularId} nicht gefunden`);

  return {
    mandantName: mandant.name,
    mandantStandort: mandant.standort ?? null,
    formularDefinition: definition,
    felder: formularRow.felder,
    erstelltAm: formularRow.erstelltAm,
    geaendertAm: formularRow.geaendertAm,
  };
}

async function ladeChecklisteExportData(
  mandantId: string,
  runId: number
): Promise<ChecklisteExportData> {
  const mandant = getMandantById(mandantId);
  if (!mandant) {
    throw new Error(`Mandant nicht gefunden: ${mandantId}`);
  }

  const run = getRunById(runId);
  if (!run) {
    throw new Error(`Checklisten-Run nicht gefunden: ${runId}`);
  }

  if (run.status !== 'abgeschlossen') {
    throw new Error('Nur abgeschlossene Checklisten können exportiert werden.');
  }

  const antworten = getAntwortenByRun(runId);

  const kiZusammenfassung = run.kiZusammenfassung
    ? detokenizeAll(run.kiZusammenfassung)
    : null;

  return { mandant, run, antworten, kiZusammenfassung };
}

export function registerExportIpc(): void {
  ipcMain.handle('export:word', async (_event, raw: unknown) => {
    try {
      const input = exportWordSchema.parse(raw);

      if (input.typ === 'formular') {
        const formularData = await ladeFormularExportData(input.mandant_id, input.referenz_id);
        const buffer = await generiereFormularWordExport(formularData);
        const exportPfad = getExportPfad();
        const dateiname = generiereDateiname(formularData.mandantName, formularData.formularDefinition.formularId, 'docx');
        const dateipfad = path.join(exportPfad, dateiname);
        fs.writeFileSync(dateipfad, buffer);
        createExportRecord({ mandantId: input.mandant_id, typ: 'formular', referenzId: input.referenz_id, format: 'word', dateiname, dateipfad });
        return ipcOk({ dateiname, dateipfad });
      }

      const data = await ladeChecklisteExportData(input.mandant_id, input.referenz_id);
      const buffer = await generiereWordExport(data);

      const exportPfad = getExportPfad();
      const dateiname = generiereDateiname(data.mandant.name, data.run.anlageId, 'docx');
      const dateipfad = path.join(exportPfad, dateiname);

      fs.writeFileSync(dateipfad, buffer);

      createExportRecord({
        mandantId: input.mandant_id,
        typ: input.typ,
        referenzId: input.referenz_id,
        format: 'word',
        dateiname,
        dateipfad,
      });

      return ipcOk({ dateiname, dateipfad });
    } catch (err) {
      console.error('[export:word]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('export:pdf', async (_event, raw: unknown) => {
    try {
      const input = exportPdfSchema.parse(raw);

      if (input.typ === 'formular') {
        const formularData = await ladeFormularExportData(input.mandant_id, input.referenz_id);
        const html = generiereFormularHtmlTemplate(formularData);
        const pdfBuffer = await renderHtmlToPdf(html);
        const exportPfad = getExportPfad();
        const dateiname = generiereDateiname(formularData.mandantName, formularData.formularDefinition.formularId, 'pdf');
        const dateipfad = path.join(exportPfad, dateiname);
        fs.writeFileSync(dateipfad, pdfBuffer);
        createExportRecord({ mandantId: input.mandant_id, typ: 'formular', referenzId: input.referenz_id, format: 'pdf', dateiname, dateipfad });
        return ipcOk({ dateiname, dateipfad });
      }

      const data = await ladeChecklisteExportData(input.mandant_id, input.referenz_id);
      const html = generiereHtmlTemplate(data);

      const pdfBuffer = await renderHtmlToPdf(html);

      const exportPfad = getExportPfad();
      const dateiname = generiereDateiname(data.mandant.name, data.run.anlageId, 'pdf');
      const dateipfad = path.join(exportPfad, dateiname);

      fs.writeFileSync(dateipfad, pdfBuffer);

      createExportRecord({
        mandantId: input.mandant_id,
        typ: input.typ,
        referenzId: input.referenz_id,
        format: 'pdf',
        dateiname,
        dateipfad,
      });

      return ipcOk({ dateiname, dateipfad });
    } catch (err) {
      console.error('[export:pdf]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('export:liste', (_event, raw: unknown) => {
    try {
      const input = exportListeSchema.parse(raw);
      return ipcOk(getExporteByMandant(input.mandant_id));
    } catch (err) {
      console.error('[export:liste]', err);
      return ipcFromError(err);
    }
  });

  ipcMain.handle('export:datei-oeffnen', (_event, raw: unknown) => {
    try {
      const input = raw as { dateipfad: string };
      if (typeof input.dateipfad !== 'string') {
        throw new Error('Ungültiger Dateipfad');
      }
      if (!fs.existsSync(input.dateipfad)) {
        throw new Error('Datei nicht mehr vorhanden');
      }
      shell.openPath(input.dateipfad);
      return ipcOk(undefined);
    } catch (err) {
      return ipcFromError(err);
    }
  });

  ipcMain.handle('export:ordner-oeffnen', () => {
    try {
      const exportPfad = getExportPfad();
      shell.openPath(exportPfad);
      return ipcOk(undefined);
    } catch (err) {
      return ipcFromError(err);
    }
  });
}

async function renderHtmlToPdf(html: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        javascript: true,
      },
    });

    win.webContents.on('did-finish-load', () => {
      win.webContents
        .printToPDF({
          pageSize: 'A4',
          printBackground: true,
          margins: { marginType: 'custom', top: 0, bottom: 0, left: 0, right: 0 },
        })
        .then((data) => {
          win.destroy();
          resolve(Buffer.from(data));
        })
        .catch((err: Error) => {
          win.destroy();
          reject(err);
        });
    });

    win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      win.destroy();
      reject(new Error(`PDF-Rendering fehlgeschlagen: ${errorDescription} (${errorCode})`));
    });

    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  });
}
