import path from 'node:path';
import fs from 'node:fs/promises';

export function assertSafePath(basePath: string, userFilename: string): string {
  const safeFilename = path.basename(userFilename);
  const resolved = path.resolve(basePath, safeFilename);
  const base = path.resolve(basePath);

  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    throw new Error(`[Security] Pfad-Traversal blockiert: ${userFilename}`);
  }

  return resolved;
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}
