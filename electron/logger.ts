import fs from 'node:fs';
import path from 'node:path';

let logFile: string | null = null;

export function initLogger(userDataPath: string): void {
  logFile = path.join(userDataPath, 'lpm-startup.log');
}

export function log(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(msg);
  if (logFile) {
    try {
      fs.appendFileSync(logFile, line);
    } catch {
      /* ignore */
    }
  }
}

export function getLogFilePath(): string | null {
  return logFile;
}
