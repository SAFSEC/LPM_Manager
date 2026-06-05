# Starter-Prompt – LPM Manager
## Für Claude Code | JW Safety & Security

---

Lies zuerst vollständig die CLAUDE.md in diesem Verzeichnis.
Stelle keine Fragen – alle Entscheidungen sind dort getroffen.

WICHTIG: Starte mit Phase 1a – Projekt-Setup + Security-Fundament (Abschnitt 11 in CLAUDE.md).

Phase 1a abgeschlossen wenn:
- Electron + React + TypeScript + Tailwind läuft
- Ordnerstruktur exakt wie in Abschnitt 3 angelegt
- electron-builder konfiguriert (.dmg + .exe Targets)
- zod, pathSanitizer, promptSanitizer installiert
- IPC-Bridge (preload.ts) mit allen Kanälen definiert
- App startet und zeigt ein leeres Fenster

Dann weiter mit Phase 1b – Datenbank + Privacy-Fundament:
- Drizzle Schema (alle Tabellen aus Abschnitt 5)
- Privacy-Stack aus Gutachter-Software portieren (server/privacy/)
- LPM-spezifische Identifier-Regeln: name, ansprechpartner
- Token-Vault als separate tokens.db

Phase 1b abgeschlossen wenn:
- main.db wird beim App-Start angelegt
- privacyFilter({ name: "Musterfirma GmbH" }, "anthropic") gibt [MANDANT_xxxx] zurück
- tokens.db liegt separat von main.db
- TypeScript tsc --noEmit = 0 Fehler

Melde dich mit "Phase 1a + 1b abgeschlossen – weiter mit Phase 2?" und warte.

---

Hinweise für Claude Code:

1. Electron-Architektur: Renderer hat keinen direkten Node.js-Zugriff.
   Alle DB- und Dateisystem-Operationen laufen im Main-Prozess via IPC.
   contextIsolation: true und nodeIntegration: false – nicht ändern.

2. Privacy-Stack: Aus JW Gutachter-Software (Next.js) in Electron-Main-Prozess portieren.
   Struktur bleibt identisch (server/privacy/), nur Transportschicht ändert sich
   (kein HTTP, stattdessen direkter Funktionsaufruf im Main-Prozess).

3. API-Keys: In Electron safeStorage verschlüsseln, nicht als Klartext in DB oder Config.

4. Jede Phase erfordert bestandene Tests bevor die nächste startet.
   Nicht unkontrolliert durchlaufen.
