# CLAUDE.md – LPM Manager
## Loss Prevention Management Desktop-App
## JW Safety & Security | Jörg Weidemann
## Version 1.0 – Initiale Spezifikation

---

## ENTWICKLUNGSSTAND
```
Erstellt:              01.06.2026
Letzter Checkpoint:    05.06.2026 – Phase 7 ABGESCHLOSSEN ✅
Abgeschlossene Phasen: 1a ✅, 1b ✅, 2 ✅, 3 ✅, 4 ✅, 5 ✅, 6 ✅, 7 ✅
Offene Phasen:         8
Nächster Schritt: Phase 8 – Einstellungen + Polish + Build
Privacy-Stack:         Verifiziert – [MANDANT_xxxx] / [PERSON_xxxx] ✅
Privacy-Modus:         Ollama lokal (Standard) / Extern (Anthropic, OpenAI, Gemini, OpenRouter)
Git:                   https://github.com/SAFSEC/LPM_Manager (main) ✅
node_modules:          installiert ✅
Neue Pakete (Phase 5):  docx@^9.6.1 (Word-Export)
```

### npm-Umgebung – Bekannte Lösungen

- SSL-Problem: `UNABLE_TO_VERIFY_LEAF_SIGNATURE` → immer mit `$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"` starten
- Start-Befehl: `$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"; npm run dev`
- Nach erneutem `npm install`: danach `npm run rebuild:native` für better-sqlite3
- `.npmrc` enthält NICHT `omit=optional` (wurde entfernt, da Rollup native Binary benötigt)
- **Preload-Format**: `electron.vite.config.ts` erzwingt `formats: ['cjs']` → Output `out/preload/preload.cjs`. `electron/index.ts` zeigt auf `'../preload/preload.cjs'`. Nie ändern – Electron-Sandbox unterstützt kein ESM-Preload!

### Checkpoint 02.06.2026 – Phasen 1a, 1b, 2, 3 abgeschlossen ✅

**Phase 1a – ABGESCHLOSSEN**

| Kriterium | Status | Anmerkung |
|-----------|--------|-----------|
| Electron + React + TS + Tailwind | ✅ | App startet, leeres Fenster erscheint |
| Ordnerstruktur | ✅ | `electron/`, `src/renderer/`, `src/server/`, `assets/` |
| electron-builder (.exe + .dmg) | ✅ | Config vorhanden |
| zod, pathSanitizer, promptSanitizer | ✅ | In `src/server/` |
| IPC preload alle Kanäle | ✅ | `electron/preload.ts` → `window.lpm` (inkl. KI-Streaming) |
| IPC Main-Handler | ✅ | `einstellungen`, `system:get-db-paths`, `ki:anfrage`, `ki:adapter-testen` funktional |
| contextIsolation / nodeIntegration | ✅ | `electron/index.ts` |
| App startet | ✅ | `npm run dev` → leeres Fenster |

**Phase 1b – ABGESCHLOSSEN**

| Kriterium | Status | Anmerkung |
|-----------|--------|-----------|
| Drizzle Schema alle Tabellen | ✅ | `src/server/db/schema.ts` |
| main.db beim Start angelegt | ✅ | `%APPDATA%\lpm-manager\main.db` |
| Privacy-Stack | ✅ | `src/server/privacy/` |
| Token-Vault tokens.db separat | ✅ | `%APPDATA%\lpm-manager\tokens.db` |
| privacyFilter API | ✅ | `privacyFilter(data, adapter)` |
| Token-Format | ✅ | `[MANDANT_<8 hex>]`, `[PERSON_<8 hex>]` |
| `npm run test:privacy` | ✅ | Gibt `[MANDANT_3bae8089]` zurück |
| `npm run typecheck` | ✅ | 0 Fehler (src/**) |

**Phase 2 – KI-Infrastruktur – ABGESCHLOSSEN**

| Kriterium | Status | Anmerkung |
|-----------|--------|-----------|
| Ollama-Adapter | ✅ | `src/server/ki/adapters/ollama.adapter.ts` – lokal, kein Privacy-Filter |
| Anthropic-Adapter | ✅ | `src/server/ki/adapters/anthropic.adapter.ts` – Privacy-Filter Pflicht |
| OpenAI-Adapter | ✅ | `src/server/ki/adapters/openai.adapter.ts` – Privacy-Filter Pflicht |
| Gemini-Adapter | ✅ | `src/server/ki/adapters/gemini.adapter.ts` – Privacy-Filter Pflicht |
| OpenRouter-Adapter | ✅ | `src/server/ki/adapters/openrouter.adapter.ts` – Privacy-Filter Pflicht |
| SSE-Streaming | ✅ | fetch + ReadableStream, Chunks via `ki:stream-chunk` IPC-Event |
| Use-Case-Router | ✅ | `src/server/ki/router.ts` – DB-Einstellungen, Defaults: Ollama außer RISIKO→Anthropic |
| Skills | ✅ | system, erklaerung, zusammenfassung, empfehlung, risiko in `src/server/skills/` |
| KI-Audit-Log | ✅ | `src/server/db/repositories/ki-audit.repository.ts` → `lpm_ki_audit` |
| IPC ki:anfrage | ✅ | startet Stream, Chunks per `event.sender.send('ki:stream-chunk', ...)` |
| IPC ki:adapter-testen | ✅ | Verbindungstest je Adapter |
| Privacy vor externem Aufruf | ✅ | `sendKiAnfrage()` filtert automatisch bei nicht-Ollama |
| App startet mit KI-Code | ✅ | 33 Module transformiert, 0 Fehler |

**Phase 3 – Grundlayout + Mandantenverwaltung – ABGESCHLOSSEN**

| Kriterium | Status | Anmerkung |
|-----------|--------|-----------|
| AppLayout + Router | ✅ | `App.tsx` mit React Router, Platzhalter für Phasen 4–8 |
| Sidebar, Header, StatusBar | ✅ | `src/renderer/components/layout/` |
| KI-Modus-Anzeige | ✅ | `AdapterBadge` + `useKiModus` (Ollama lokal / Extern) |
| Dashboard | ✅ | Mandantenkarten, Anlegen-Dialog, archivierte optional |
| MandantDetail | ✅ | Stammdaten bearbeiten, archivieren |
| Mandanten-Switcher | ✅ | Header-Dropdown, Persistenz via `localStorage` |
| Mandant CRUD (Backend) | ✅ | Repository, zod-Validation, IPC vollständig |
| Toast-Fehlerbehandlung | ✅ | `ToastContext` – keine weißen Screens |
| **Test:** Persistent nach Neustart | ✅ | SQLite + `lpm.activeMandantId` |
| `npm run typecheck` | ✅ | 0 Fehler (src/**) |

**Neue Dateien Phase 3**

- Backend: `src/server/mandanten/types.ts`, `src/server/validation/mandanten.schema.ts`, `src/server/db/repositories/mandanten.repository.ts`
- IPC: `electron/ipc/mandanten.ipc.ts` (funktional, keine Stubs mehr)
- Layout: `AppLayout.tsx`, `Sidebar.tsx`, `Header.tsx`, `StatusBar.tsx`
- Mandant-UI: `MandantForm.tsx`, `MandantCard.tsx`
- Context/Hooks: `MandantContext.tsx`, `ToastContext.tsx`, `useKiModus.ts`, `useSystemStatus.ts`
- Seiten: `Dashboard.tsx`, `MandantDetail.tsx` (vollständig)

**Behobener Bug (04.06.2026)**

| Bug | Ursache | Fix |
|-----|---------|-----|
| Checklisten und Export zeigten "Platzhalter"-Seite | `App.tsx` wurde nach Phase 4 und 5 nie aktualisiert – Routen zeigten noch `PlaceholderPage` statt der echten Komponenten | `ChecklistenRunner` und `ExportPage` in `App.tsx` importiert und Routen umgebunden |

**Bekannte Bugs (offen)**

Keine bekannten offenen Bugs.

**Behobene Bugs (03.06.2026)**

| Bug | Ursache | Fix |
|-----|---------|-----|
| Alle IPC-Aufrufe schlugen fehl (Mandant anlegen, Liste laden, etc.) | **Preload nie geladen**: `electron/index.ts` suchte `../preload/index.js`, tatsächliche Ausgabedatei war `out/preload/preload.mjs` (electron-vite + `"type":"module"` in package.json → ESM-Output mit Originalname) → `window.lpm` war `undefined` im Renderer | Pfad in `electron/index.ts` auf `'../preload/preload.mjs'` geändert; `electron.vite.config.ts` fixiert `fileName: () => 'preload'` |
| IPC: `undefined`-Felder in contextBridge | Electron contextBridge kann Objekte mit expliziten `undefined`-Werten nicht serialisieren | `formValuesToCreate` baut Objekt ohne `undefined`-Schlüssel; `preload.ts` sanitiert alle Payloads vor IPC-Übergabe |

> **Wichtiger Hinweis für zukünftige Projekte mit electron-vite + `"type":"module"`:**
> Immer prüfen welchen Dateinamen electron-vite für das Preload erzeugt und den Pfad in `electron/index.ts` entsprechend setzen. Der Kompilierungsoutput (`out/preload/*.mjs` oder `*.js`) muss exakt mit dem Pfad in `webPreferences.preload` übereinstimmen.

**Offene IPC-Stubs (für spätere Phasen)**

- `formulare:*`, `export:*` → `{ success: false, error: "…Phase …" }`

**Phase 7 – ABGESCHLOSSEN ✅**

| Kriterium | Status | Anmerkung |
|-----------|--------|-----------|
| kapitel.json vollständig | ✅ | Teil I–V + Glossar · 9 Kapitel, 10 Stories, 12 Module, 18 Anlagen, 23 Glossareinträge |
| BuchNavigator (Sidebar-Navigation) | ✅ | Collapsible-Baum durch alle Buchteile |
| InhaltAnzeige (Detailansicht) | ✅ | Kapitel, Story, Modul, Anlage mit Schlüsselkonzepten |
| Glossar mit Suche | ✅ | Live-Suche mit Highlight-Funktion |
| KI-Erklärung (Streaming) | ✅ | Kurz / Ausführlich via Ollama – Wort für Wort |
| App.tsx Route aktualisiert | ✅ | `/wissensbasis` → `Wissensbasis` statt Platzhalter |
| `npm run typecheck` | ✅ | 0 Fehler |

**Neue Dateien Phase 7**

- `assets/buchinhalt/kapitel.json` (vollständig befüllt)
- `src/renderer/types/wissensbasis.ts`
- `src/renderer/hooks/useWissensbasis.ts`
- `src/renderer/components/wissensbasis/BuchNavigator.tsx`
- `src/renderer/components/wissensbasis/InhaltAnzeige.tsx`
- `src/renderer/components/wissensbasis/KiErklaerPanel.tsx`
- `src/renderer/components/wissensbasis/GlossarSeite.tsx`
- `src/renderer/pages/Wissensbasis.tsx` (vollständig)

**Wichtige Dateien (Einstieg Phase 8)**

- Einstellungen-Stub: `src/renderer/pages/Einstellungen.tsx` (noch Platzhalter → vollständig implementieren)
- Einstellungen-IPC: `electron/ipc/einstellungen.ipc.ts` ✅ fertig (`einstellungen:laden` / `einstellungen:speichern`)
- Einstellungen-Repository: `src/server/db/repositories/einstellungen.repository.ts` ✅ fertig (Key-Value in `lpm_einstellungen`)
- KI-Router: `src/server/ki/router.ts` – liest Einstellungen mit folgenden DB-Schlüsseln:
  - `ki.adapter.erklaerung` / `ki.adapter.zusammenfassung` / `ki.adapter.empfehlung` / `ki.adapter.risiko`
  - `ki.apikey.anthropic` / `ki.apikey.openai` / `ki.apikey.gemini` / `ki.apikey.openrouter`
  - `ki.baseurl.ollama` (Standard: `http://localhost:11434`)
  - `ki.modell.anthropic` / `ki.modell.openai` / `ki.modell.gemini` / `ki.modell.openrouter`
- App-Icons: `assets/icons/` (noch leer)
  - `icon.icns` → macOS (.dmg)
  - `icon.ico` → Windows (.exe)
  - `icon.png` 1024×1024 (Basis für beide)
- Build-Konfiguration: `electron-builder.config.js` ✅ vorhanden (appId: `de.jwsafety.lpm-manager`, NSIS + DMG)

**Phase-8-Umfang (Checkliste)**

1. `Einstellungen.tsx` vollständig: KI-Adapter-Auswahl je Use-Case, API-Keys, Ollama-URL, Modellauswahl
2. Verbindungstest-Button je Adapter (`ki:adapter-testen` IPC ist bereits implementiert)
3. App-Icons erstellen/einfügen (`icon.icns`, `icon.ico`, `icon.png`)
4. `npm run build` / `npm run make` – finaler Build-Test (Windows .exe)
5. Edge Cases und Loading States überprüfen

**Phase 6 – ABGESCHLOSSEN ✅**

| Kriterium | Status | Anmerkung |
|-----------|--------|-----------|
| Formular-Katalog (F-01 bis F-07) | ✅ | `src/server/formulare/catalog.ts` – alle 7 Formulare mit Gruppen und Feldtypen |
| Formular-Repository | ✅ | `src/server/db/repositories/formulare.repository.ts` → `lpm_formulare` |
| Formular-IPC (katalog, laden, speichern, von-mandant, finalisieren, löschen) | ✅ | `electron/ipc/formulare.ipc.ts` vollständig |
| Word-Export Formulare | ✅ | `src/server/export/word.formular.export.ts` – Deckblatt, gruppenweise Feldtabellen |
| PDF-Export Formulare | ✅ | `generiereFormularHtmlTemplate()` in `pdf.export.ts` |
| Export-IPC Formular-Typ | ✅ | `export.ipc.ts` erkennt `typ: 'formular'` und delegiert korrekt |
| FormularEditor UI | ✅ | `FormularEditor.tsx` + `FormularAuswahl.tsx` + `FormularFormView.tsx` + `FormularFeld.tsx` |
| Auto-Speichern (800ms Debounce) | ✅ | `useFormular.ts` – speichert automatisch beim Tippen |
| Finalisieren (Status → final, readOnly) | ✅ | Formular wird als Final markiert und gesperrt |
| App.tsx Route aktualisiert | ✅ | `/formulare` → `FormularEditor` statt Platzhalter |
| `npm run typecheck` | ✅ | 0 Fehler |

**Neue Dateien Phase 6**

- Server: `src/server/formulare/types.ts`, `src/server/formulare/catalog.ts` (vollständig)
- DB: `src/server/db/repositories/formulare.repository.ts`
- Validation: `src/server/validation/formulare.schema.ts`
- IPC: `electron/ipc/formulare.ipc.ts` (vollständig, inkl. `finalisieren`, `loeschen`)
- Export: `src/server/export/word.formular.export.ts`; `pdf.export.ts` um `generiereFormularHtmlTemplate()` erweitert
- Renderer: `src/renderer/types/formular.ts`, `src/renderer/hooks/useFormular.ts`
- UI: `src/renderer/components/formulare/FormularAuswahl.tsx`, `FormularFeld.tsx`, `FormularFormView.tsx`
- `src/renderer/pages/FormularEditor.tsx` (vollständig)

**Wichtige Dateien (Einstieg Phase 7)**

- Wissensbasis-Stub: `src/renderer/pages/Wissensbasis.tsx` (noch Platzhalter)
- Buchstruktur-JSON: `assets/buchinhalt/kapitel.json` (noch anzulegen)
- KI-Erklärung: `src/server/skills/erklaerung.skill.ts` (bereits vorhanden, Phase 7 nutzt diesen)
- Referenz: `src/renderer/pages/ChecklistenRunner.tsx` (Muster für Wissensbasis-Navigation)

**Phase 5 – ABGESCHLOSSEN ✅**

| Kriterium | Status | Anmerkung |
|-----------|--------|-----------|
| Word-Export (.docx) | ✅ | `src/server/export/word.export.ts` – docx@9 Library, Deckblatt, Tabellen, KI-Summary, Findings |
| PDF-Export | ✅ | `src/server/export/pdf.export.ts` – HTML-Template + Electron `printToPDF()` (kein Extra-Paket) |
| Token-Vault-Rückauflösung | ✅ | `detokenizeAll()` auf ki_zusammenfassung vor Export |
| Export-Repository | ✅ | `src/server/db/repositories/export.repository.ts` → `lpm_exporte` |
| Export-IPC (word, pdf, liste, datei-oeffnen, ordner-oeffnen) | ✅ | `electron/ipc/export.ipc.ts` vollständig |
| Export-Seite UI | ✅ | `Export.tsx` + `ExportRunCard.tsx` + `ExportHistoryTable.tsx` |
| `npm run typecheck` | ✅ | 0 Fehler |

**Neue Dateien Phase 5**

- Server: `src/server/export/types.ts`, `src/server/export/word.export.ts`, `src/server/export/pdf.export.ts`
- DB: `src/server/db/repositories/export.repository.ts`
- Validation: `src/server/validation/export.schema.ts`
- IPC: `electron/ipc/export.ipc.ts` (vollständig, inkl. `export:datei-oeffnen`, `export:ordner-oeffnen`)
- Renderer: `src/renderer/hooks/useExport.ts`
- UI: `src/renderer/pages/Export.tsx`, `src/renderer/components/export/ExportRunCard.tsx`, `src/renderer/components/export/ExportHistoryTable.tsx`

**Wichtige Technische Entscheidungen Phase 5**

- **PDF via Electron `printToPDF()`**: Kein Puppeteer, kein pdfkit – nutzt Electrons eingebautes Chromium. `renderHtmlToPdf()` erstellt hidden BrowserWindow, lädt HTML via data-URL, ruft `webContents.printToPDF({ pageSize: 'A4', printBackground: true })` auf.
- **Export-Pfad**: Standard `Documents/LPM Manager Exports/`, wird beim ersten Export automatisch angelegt.
- **Dateiname-Schema**: `YYYY-MM-DD_A-XX_Mandantname.docx/pdf`
- **Token-Vault Rückauflösung**: Nur auf `ki_zusammenfassung` (einziges Feld das externe KI-Tokens enthalten kann). Mandant-Daten sind Klartext in der DB.

**Phase 4 – ABGESCHLOSSEN ✅**

| Kriterium | Status | Anmerkung |
|-----------|--------|-----------|
| Checklisten-Katalog (18 Anlagen A-01–A-18) | ✅ | `src/server/checklisten/catalog.ts` – je 3–4 Abschnitte, 10–16 Fragen pro Anlage |
| ChecklistenRunner UI | ✅ | `src/renderer/pages/ChecklistenRunner.tsx` |
| Anlage auswählen / laufende Runs fortsetzen | ✅ | `AnlagenAuswahl.tsx` |
| 4-Button-Bewertungs-Toggle | ✅ | `BewertungToggle.tsx` – Stabil / Eingeschränkt / Instabil / N/A |
| FrageCard mit Kommentarfeld | ✅ | `FrageCard.tsx` – Auto-Kommentar bei Finding |
| Fortschrittsbalken | ✅ | `ChecklisteProgress.tsx` |
| Auto-Save Antworten (debounced) | ✅ | `useCheckliste.ts` – 500ms Debounce |
| Run abschließen | ✅ | Status → `abgeschlossen`, IPC `runAbschliessen` |
| KI-Zusammenfassung | ✅ | `KiSummaryPanel.tsx` + `ki:anfrage` Streaming + `checklisten:ki-speichern` |
| `npm run typecheck` | ✅ | 0 Fehler |

**Neue Dateien Phase 4**

- Server: `src/server/checklisten/types.ts`, `src/server/checklisten/catalog.ts` (vollständig), `src/server/checklisten/runner.ts`, `src/server/db/repositories/checklisten.repository.ts`, `src/server/validation/checklisten.schema.ts`
- IPC: `electron/ipc/checklisten.ipc.ts` (vollständig, inkl. `checklisten:ki-speichern`)
- Renderer: `src/renderer/types/checkliste.ts`, `src/renderer/hooks/useCheckliste.ts`
- UI: `src/renderer/pages/ChecklistenRunner.tsx`, `src/renderer/components/checkliste/` (5 Dateien), `src/renderer/components/ki/KiSummaryPanel.tsx`

**Wichtige Dateien (Einstieg Phase 6)**

- Formulare-Stub: `electron/ipc/formulare.ipc.ts` (noch NOT_IMPLEMENTED)
- Formulare-Katalog: `src/server/formulare/catalog.ts` (noch anzulegen)
- Formulare-Seite: `src/renderer/pages/FormularEditor.tsx` (noch Platzhalter)
- Checklisten-Referenz: `src/server/checklisten/catalog.ts` (Muster für Formular-Katalog)

> **Hinweis für alle zukünftigen Phasen:** Nach jeder Phase `App.tsx` aktualisieren und neue Seiten aus PlaceholderPage auf echte Komponenten umstellen!

**Hinweis TypeScript / Electron-Importe**

- Electron 34 hat Inkompatibilität mit `moduleResolution: bundler` bei `import { app } from 'electron'`
- Fix: Electron-Files importieren aus `electron/main` bzw. `electron/renderer`
- `npm run typecheck` prüft nur `src/**` – Electron-Files werden von electron-vite beim Build kompiliert
- `npm run typecheck:all` prüft zusätzlich Electron-Files (bekannte TS2459 von Electrons eigenen Typen)

---

## 1. PRODUKT-VISION

**Was:** Desktop-App für professionelles Loss Prevention Management auf Basis des Buches
"Loss Prevention Management und das Insider-Risiko" (Jörg Weidemann, 692 Seiten).

**Kernfunktionen:**
- Buchinhalt-Wissensbasis: Kapitel, Konzepte und Definitionen abrufbar und per KI erklärbar
- Managementsystem: Mandanten/Standorte anlegen und verwalten
- Geführte Checklisten: Alle 18 Anlagen (A-01 bis A-18) als interaktive Prüfabläufe
- Formulare: Alle 7 Formulare (F-01 bis F-07) ausfüllbar
- KI-Zusammenfassung: Ergebnisse per KI strukturiert zusammenfassen
- Export: Word (.docx) und PDF – professionell formatiert, direkt beim Kunden verwendbar

**Für wen:** Jörg Weidemann als Berater – ein Nutzer, mehrere Mandanten (Kunden).
Kunden haben keinen eigenen Login. Jörg arbeitet für sie in der App.

**Deployment:** Electron Desktop-App für macOS (.dmg) und Windows (.exe).
Keine Cloud, kein Server, kein Hosting. Alle Daten lokal auf dem Rechner.

**Zukunftsvorbereitung:** Architektur ist auf Electron-Distribution mit Lizenzkey vorbereitet
(gleicher Ansatz wie Risikobeurteilungs-Modul). mandant_id in allen Tabellen von Tag 1.

---

## 2. TECH STACK

### Desktop-Framework
- **Electron 28+** – Desktop-App-Wrapper (.exe / .dmg)
- **React 18** – UI-Framework (im Electron-Renderer-Prozess)
- **TypeScript 5 strict** – kein `any`, keine Ausnahmen
- **Tailwind CSS 3** – Styling

### Datenbank
- **SQLite** via `better-sqlite3` – lokal, keine Server-Abhängigkeit
- **Drizzle ORM** – typsichere Datenbankzugriffe
- Datenbankdatei liegt im Electron `userData`-Verzeichnis

### KI-Infrastruktur (aus JW Gutachter-Software portiert)
- **Ollama** – lokaler Standard, 0€, kein Privacy-Filter nötig
- **Anthropic Claude** – extern, Privacy-Filter Pflicht
- **OpenAI GPT** – extern, Privacy-Filter Pflicht
- **Google Gemini** – extern, Privacy-Filter Pflicht
- **OpenRouter** – extern, Gateway zu vielen Modellen, Privacy-Filter Pflicht
- SSE-Streaming für alle Adapter (Antwort erscheint Wort für Wort)
- Use-Case-basierte Adapter-Auswahl (App empfiehlt, Nutzer kann übersteuern)

### Export
- **docx** Library – Word-Export (.docx), professionell formatiert
- **Puppeteer** (Electron-kompatibel) oder **@react-pdf/renderer** – PDF-Export
- Export enthält: Mandantenname, Datum, Checklistenergebnisse, Findings, KI-Zusammenfassung

### Security
- **helmet** (soweit in Electron anwendbar) – HTTP-Header-Schutz
- **zod** – Input-Validierung aller Formulare und API-Inputs
- **pathSanitizer** – Pfad-Traversal-Schutz bei Dateioperationen
- **promptSanitizer** – Injection-Schutz vor KI-Prompt-Aufbau

### Privacy-Stack (leicht – nur für externe API-Calls)
- Pseudonymisierung von Mandantenname + Ansprechpartner vor externen API-Calls
- Token-Vault: separate SQLite-DB für Pseudonym-Rückauflösung
- Audit-Log: welcher externe Adapter wurde wann mit welchem Use-Case aufgerufen
- Ollama-Adapter: kein Privacy-Filter (lokal = keine Daten verlassen den Rechner)

---

## 3. PROJEKTSTRUKTUR

```
lpm-manager/
├── electron/
│   ├── index.ts                   ← Electron Hauptprozess, Fenster, IPC
│   ├── preload.ts                 ← Sichere Bridge zwischen Main und Renderer
│   └── ipc/
│       ├── mandanten.ipc.ts       ← IPC-Handler Mandantenverwaltung ✅
│       ├── checklisten.ipc.ts     ← IPC-Handler Checklisten (Stub)
│       ├── formulare.ipc.ts       ← IPC-Handler Formulare (Stub)
│       ├── ki.ipc.ts              ← IPC-Handler KI-Aufrufe ✅
│       ├── einstellungen.ipc.ts   ← IPC-Handler Einstellungen ✅
│       └── export.ipc.ts          ← IPC-Handler Export (Stub)
├── src/
│   ├── renderer/
│   │   ├── App.tsx                ← Root-Komponente, React Router ✅
│   │   ├── main.tsx               ← React-Einstiegspunkt
│   │   ├── context/
│   │   │   ├── MandantContext.tsx ← Mandanten-State + IPC ✅
│   │   │   └── ToastContext.tsx   ← Fehler-/Erfolgs-Toasts ✅
│   │   ├── hooks/
│   │   │   ├── useKiModus.ts      ← KI lokal/extern Erkennung ✅
│   │   │   └── useSystemStatus.ts ← DB-Pfade für StatusBar ✅
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      ← Mandantenübersicht ✅
│   │   │   ├── MandantDetail.tsx  ← Mandant bearbeiten/archivieren ✅
│   │   │   ├── Wissensbasis.tsx   ← Phase 7
│   │   │   ├── ChecklistenRunner.tsx ← Phase 4
│   │   │   ├── FormularEditor.tsx ← Phase 6
│   │   │   ├── Einstellungen.tsx  ← Phase 8
│   │   │   └── Export.tsx         ← Phase 5
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx  ← Shell: Sidebar + Header + Main ✅
│   │   │   │   ├── Sidebar.tsx    ← Navigation ✅
│   │   │   │   ├── Header.tsx     ← Mandant-Switcher, KI-Badge ✅
│   │   │   │   └── StatusBar.tsx  ← KI-Modus, DB-Pfad, Version ✅
│   │   │   ├── mandant/
│   │   │   │   ├── MandantForm.tsx  ← Anlegen/Bearbeiten ✅
│   │   │   │   └── MandantCard.tsx  ← Dashboard-Karte ✅
│   │   │   ├── checkliste/        ← Phase 4
│   │   │   ├── ki/
│   │   │   │   ├── AdapterBadge.tsx ← KI-Modus-Badge ✅
│   │   │   │   ├── KiPanel.tsx
│   │   │   │   └── KiConfirm.tsx
│   │   │   ├── export/            ← Phase 5
│   │   │   └── ui/
│   │   │       └── Toast.tsx      ← Toast-Komponente ✅
│   │   └── types/
│   │       └── mandant.ts         ← Mandant-Typen (Renderer) ✅
│   ├── server/                    ← Business-Logik (läuft im Main-Prozess)
│   │   ├── mandanten/
│   │   │   └── types.ts           ← Mandant-Typen (Server) ✅
│   │   ├── validation/
│   │   │   └── mandanten.schema.ts ← zod-Schemas ✅
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   ├── client.ts
│   │   │   └── repositories/
│   │   │       ├── mandanten.repository.ts ✅
│   │   │       ├── einstellungen.repository.ts
│   │   │       └── ki-audit.repository.ts
│   │   ├── privacy/               ← Privacy-Stack (portiert aus Gutachter-Software)
│   │   │   ├── index.ts           ← privacyFilter() Haupt-Export
│   │   │   ├── pseudonymizer.ts   ← Pseudonymisierung
│   │   │   ├── tokenVault.ts      ← Token-Vault (separate DB)
│   │   │   ├── sanitizer.ts       ← Freitext-Bereinigung
│   │   │   ├── auditLog.ts        ← Audit-Protokoll
│   │   │   ├── types.ts           ← Typdefinitionen
│   │   │   └── rules/
│   │   │       └── identifiers.ts ← LPM-spezifische Identifier-Regeln
│   │   ├── ki/
│   │   │   ├── adapters/
│   │   │   │   ├── ollama.adapter.ts      ← Ollama (lokal, kein Filter)
│   │   │   │   ├── anthropic.adapter.ts   ← Anthropic (Privacy-Filter Pflicht)
│   │   │   │   ├── openai.adapter.ts      ← OpenAI (Privacy-Filter Pflicht)
│   │   │   │   ├── gemini.adapter.ts      ← Google Gemini (Privacy-Filter Pflicht)
│   │   │   │   └── openrouter.adapter.ts  ← OpenRouter (Privacy-Filter Pflicht)
│   │   │   ├── router.ts          ← Use-Case → Adapter Routing
│   │   │   └── index.ts           ← KI-Haupt-Export
│   │   ├── skills/                ← KI-Prompt-Templates
│   │   │   ├── system.ts          ← Basis-Systemprompt (LPM-Kontext)
│   │   │   ├── erklaerung.skill.ts    ← Buchinhalt erklären
│   │   │   ├── zusammenfassung.skill.ts ← Checklisten-Ergebnisse zusammenfassen
│   │   │   ├── empfehlung.skill.ts    ← Maßnahmen-Empfehlungen
│   │   │   ├── risiko.skill.ts        ← Risikoeinschätzung
│   │   │   └── index.ts           ← Skill-Router
│   │   ├── checklisten/
│   │   │   ├── catalog.ts         ← Alle 18 Anlagen als strukturierte Daten
│   │   │   └── runner.ts          ← Checklisten-Ablauflogik
│   │   ├── formulare/
│   │   │   └── catalog.ts         ← Alle 7 Formulare (F-01 bis F-07)
│   │   └── export/
│   │       ├── word.export.ts     ← Word-Export mit docx-Library
│   │       └── pdf.export.ts      ← PDF-Export
├── assets/
│   ├── buchinhalt/
│   │   └── kapitel.json           ← Buchstruktur als strukturierte JSON-Daten
│   └── icons/                     ← App-Icons für .exe/.dmg
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── electron-builder.config.js     ← Build-Konfiguration für .exe/.dmg
└── drizzle.config.ts
```

**Erklärung Electron-Architektur:**
Electron hat zwei Prozesse: `main` (Node.js, Datenbankzugriff, Dateisystem) und `renderer`
(React, was der Nutzer sieht). Diese kommunizieren über IPC (Inter-Process Communication) –
wie ein sicherer Nachrichtenkanal. `preload.ts` definiert welche Nachrichten erlaubt sind.

---

## 4. FEATURES (V1 / MVP)

### Mandantenverwaltung
- Mandant anlegen (Name, Standort, Ansprechpartner, Branche, Notizen)
- Mandant bearbeiten, archivieren
- Mandanten-Switcher im Header – schneller Wechsel
- Alle Checklisten und Formulare sind mandantengebunden

### Wissensbasis (Buchinhalt)
- Buchstruktur navigierbar: Teil I–V, Kapitel, Anlagen, Module
- Kurzinhalt je Kapitel abrufbar (aus vorbereiteter JSON-Datei)
- KI-Erklärung: "Erkläre mir Kapitel X" → Ollama antwortet mit Streaming
- Glossar: Zentrale Begriffe aus dem Buchanhang

### Checklisten (18 Anlagen A-01 bis A-18)
- Alle Anlagen als geführte interaktive Checklisten
- Bewertung je Frage: Stabil / Eingeschränkt stabil / Instabil / Nicht anwendbar
- Freitextkommentar je Frage möglich
- Fortschrittsanzeige pro Anlage
- Abschluss-Status: offen / in Bearbeitung / abgeschlossen
- KI-Zusammenfassung nach Abschluss: Ollama fasst Findings zusammen
- Export nach Abschluss: Word oder PDF

### Formulare (7 Formulare F-01 bis F-07)
- F-01: Wareneingang-Check
- F-02: Schichtübergabe-Karte
- F-03: Auf- & Verschlussliste
- F-04: Fremdfirmen- & Besucherbriefing
- F-05: Notfallkarte M5
- F-06: Schlüssel- & Spezialmittelverzeichnis
- F-07: Erstmeldung Störfall
- Alle Formulare: ausfüllen, speichern, exportieren (Word/PDF)

### KI-Funktionen
- Buchinhalt erklären (Use-Case: ERKLAERUNG → Ollama bevorzugt)
- Checklisten-Zusammenfassung (Use-Case: ZUSAMMENFASSUNG → Ollama bevorzugt)
- Maßnahmen-Empfehlungen (Use-Case: EMPFEHLUNG → Ollama oder Anthropic)
- Risikoeinschätzung (Use-Case: RISIKO → Anthropic/OpenAI für komplexere Analyse)
- Adapter-Auswahl manuell übersteuern in den Einstellungen

### Export
- Word (.docx): Deckblatt (Mandant, Datum, Anlage), Checklistenergebnisse tabellarisch,
  Findings hervorgehoben, KI-Zusammenfassung als eigener Abschnitt, Footer mit JW Safety & Security
- PDF: identisches Layout, direkt versendbar
- Exportierte Dokumente werden lokal gespeichert (wählbarer Pfad)

### Einstellungen
- KI-Adapter konfigurieren: API-Keys für Anthropic, OpenAI, Gemini, OpenRouter
- Ollama-URL konfigurieren (Standard: http://localhost:11434)
- Standard-Adapter je Use-Case festlegen
- Export-Pfad festlegen
- Datenbankpfad anzeigen (für Backup-Zwecke)

---

## 5. DATENMODELL

Alle Tabellen enthalten `mandant_id` – auch wenn heute nur ein Nutzer existiert.
Das ermöglicht spätere Multi-Tenant-Erweiterung ohne Datenbankumbau.

```sql
-- Mandanten (Kunden von Jörg)
CREATE TABLE lpm_mandanten (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id      TEXT NOT NULL UNIQUE,    -- UUID, externe Referenz
  name            TEXT NOT NULL,
  standort        TEXT,
  ansprechpartner TEXT,
  branche         TEXT,
  notizen         TEXT,
  aktiv           INTEGER NOT NULL DEFAULT 1,
  erstellt_am     TEXT NOT NULL,
  geaendert_am    TEXT NOT NULL
);

-- Checklisten-Durchläufe (eine Anlage für einen Mandanten)
CREATE TABLE lpm_checklisten_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id      TEXT NOT NULL,
  anlage_id       TEXT NOT NULL,           -- z.B. "A-06"
  anlage_name     TEXT NOT NULL,           -- z.B. "Perimeter- und Zonencheckliste"
  status          TEXT NOT NULL DEFAULT 'offen',  -- offen | in_bearbeitung | abgeschlossen
  ki_zusammenfassung TEXT,
  ki_adapter      TEXT,                    -- welcher Adapter wurde verwendet
  erstellt_am     TEXT NOT NULL,
  geaendert_am    TEXT NOT NULL,
  abgeschlossen_am TEXT,
  FOREIGN KEY (mandant_id) REFERENCES lpm_mandanten(mandant_id)
);

-- Einzelne Checklisten-Antworten
CREATE TABLE lpm_checklisten_antworten (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id      TEXT NOT NULL,
  run_id          INTEGER NOT NULL,
  frage_id        TEXT NOT NULL,           -- z.B. "A-06-1-1"
  abschnitt       TEXT NOT NULL,           -- z.B. "1. Perimeter"
  frage_text      TEXT NOT NULL,
  bewertung       TEXT,                    -- stabil | eingeschraenkt | instabil | na
  kommentar       TEXT,
  ist_finding     INTEGER NOT NULL DEFAULT 0,  -- 1 = als Finding markiert
  erstellt_am     TEXT NOT NULL,
  geaendert_am    TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES lpm_checklisten_runs(id)
);

-- Formulare
CREATE TABLE lpm_formulare (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id      TEXT NOT NULL,
  formular_id     TEXT NOT NULL,           -- z.B. "F-01"
  formular_name   TEXT NOT NULL,
  felder          TEXT NOT NULL,           -- JSON: { feldname: wert }
  status          TEXT NOT NULL DEFAULT 'entwurf',  -- entwurf | final
  erstellt_am     TEXT NOT NULL,
  geaendert_am    TEXT NOT NULL,
  FOREIGN KEY (mandant_id) REFERENCES lpm_mandanten(mandant_id)
);

-- Export-Protokoll
CREATE TABLE lpm_exporte (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id      TEXT NOT NULL,
  typ             TEXT NOT NULL,           -- checkliste | formular
  referenz_id     INTEGER NOT NULL,        -- run_id oder formular_id
  format          TEXT NOT NULL,           -- word | pdf
  dateiname       TEXT NOT NULL,
  dateipfad       TEXT NOT NULL,
  erstellt_am     TEXT NOT NULL,
  FOREIGN KEY (mandant_id) REFERENCES lpm_mandanten(mandant_id)
);

-- KI-Audit-Log (welche externen API-Calls wurden gemacht)
CREATE TABLE lpm_ki_audit (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  mandant_id      TEXT NOT NULL,           -- pseudonymisiert gespeichert
  use_case        TEXT NOT NULL,           -- ERKLAERUNG | ZUSAMMENFASSUNG | EMPFEHLUNG | RISIKO
  adapter         TEXT NOT NULL,           -- ollama | anthropic | openai | gemini | openrouter
  modell          TEXT,
  token_input     INTEGER,
  token_output    INTEGER,
  dauer_ms        INTEGER,
  erfolg          INTEGER NOT NULL DEFAULT 1,
  erstellt_am     TEXT NOT NULL
);

-- App-Einstellungen (Key-Value)
CREATE TABLE lpm_einstellungen (
  schluessel      TEXT PRIMARY KEY,
  wert            TEXT NOT NULL,
  geaendert_am    TEXT NOT NULL
);
```

---

## 6. IPC-ROUTEN (Electron Inter-Process Communication)

Statt HTTP-Routen verwendet Electron IPC-Kanäle. Gleiche Logik, anderes Transport-Protokoll.

```
mandanten:liste           → alle Mandanten laden
mandanten:erstellen       → neuen Mandanten anlegen (Input: MandantCreate)
mandanten:aktualisieren   → Mandant bearbeiten (Input: MandantUpdate)
mandanten:archivieren     → Mandant deaktivieren (Input: { mandant_id })

checklisten:anlagen-liste → alle 18 Anlagen mit Metadaten
checklisten:run-starten   → neuen Durchlauf starten (Input: { mandant_id, anlage_id })
checklisten:run-laden     → Durchlauf mit allen Antworten laden
checklisten:antwort-speichern → Einzelantwort speichern (Input: AntwortSave)
checklisten:run-abschliessen  → Durchlauf abschließen
checklisten:runs-von-mandant  → alle Durchläufe eines Mandanten

formulare:katalog         → alle 7 Formulare mit Felddefinitionen
formulare:laden           → ausgefülltes Formular laden
formulare:speichern       → Formular speichern (Input: FormularSave)
formulare:von-mandant     → alle Formulare eines Mandanten

ki:anfrage                → KI-Anfrage senden (Input: KiAnfrage, SSE-Stream zurück)
ki:adapter-testen         → Verbindungstest für einen Adapter

export:word               → Word-Export (Input: { typ, referenz_id, mandant_id })
export:pdf                → PDF-Export (Input: { typ, referenz_id, mandant_id })
export:liste              → Exporthistorie eines Mandanten

einstellungen:laden       → alle Einstellungen
einstellungen:speichern   → Einstellung setzen (Input: { schluessel, wert })
```

---

## 7. KI-PROMPT-TEMPLATES (SKILLS)

### system.ts – Basis-Systemprompt
```typescript
export const systemPrompt = (): string => `
Du bist ein Experte für Loss Prevention Management (LPM) auf Basis des Buches 
"Loss Prevention Management und das Insider-Risiko" von Jörg Weidemann.

Das Buch gliedert sich in:
- Teil I: Fachtheorie (9 Kapitel, Kapitel 1–9)
- Teil II: 10 Praxis-Stories aus dem Industriealltag
- Teil III: 12 operative Arbeitsmodule (M1–M12)
- Teil IV: 7 Formulare (F-01 bis F-07)
- Teil V: 18 Anlagen (A-01 bis A-18) als Audit- und Managementwerkzeuge

Antworte immer auf Deutsch, präzise und praxisorientiert.
Verweise bei Bedarf auf konkrete Kapitel, Module oder Anlagen aus dem Buch.
`.trim();
```

### erklaerung.skill.ts
```typescript
export interface ErklaerungInput {
  kapitel_oder_anlage: string;   // z.B. "Kapitel 2 – Insider-Risiko" oder "Anlage A-06"
  kontext?: string;              // optionaler Mandantenkontext (bereits pseudonymisiert)
  tiefe: "kurz" | "ausfuehrlich";
}

export const erklaerungSkill = (input: ErklaerungInput): string => `
Erkläre den folgenden Abschnitt aus dem Buch "Loss Prevention Management und das Insider-Risiko":

ABSCHNITT: ${input.kapitel_oder_anlage}
TIEFE: ${input.tiefe === "kurz" ? "Kurze Zusammenfassung (3–5 Sätze)" : "Ausführliche Erklärung mit Praxisbezug"}
${input.kontext ? `KONTEXT: ${input.kontext}` : ""}

Antworte strukturiert und praxisnah.
`.trim();
```

### zusammenfassung.skill.ts
```typescript
export interface ZusammenfassungInput {
  anlage_id: string;             // z.B. "A-06"
  anlage_name: string;
  findings: Finding[];           // Fragen mit Bewertung instabil/eingeschraenkt
  gesamtbewertung: string;       // stabil | gemischt | kritisch
  mandant_pseudonym: string;     // pseudonymisierter Mandantenname
}

export interface Finding {
  abschnitt: string;
  frage: string;
  bewertung: string;
  kommentar?: string;
}

export const zusammenfassungSkill = (input: ZusammenfassungInput): string => `
Erstelle eine professionelle Management-Zusammenfassung für folgende LPM-Prüfung:

ANLAGE: ${input.anlage_id} – ${input.anlage_name}
MANDANT: ${input.mandant_pseudonym}
GESAMTBEWERTUNG: ${input.gesamtbewertung}

FINDINGS (${input.findings.length} identifizierte Schwachstellen):
${input.findings.map(f => `- [${f.bewertung.toUpperCase()}] ${f.abschnitt}: ${f.frage}${f.kommentar ? ` (Kommentar: ${f.kommentar})` : ""}`).join("\n")}

Erstelle:
1. Management-Zusammenfassung (3–5 Sätze, Führungsebene)
2. Priorisierte Handlungsempfehlungen (nach Dringlichkeit)
3. Positiv-Fazit (was funktioniert bereits gut)

Ton: professionell, sachlich, lösungsorientiert.
`.trim();
```

### empfehlung.skill.ts
```typescript
export interface EmpfehlungInput {
  finding: string;
  anlage_id: string;
  branche?: string;              // pseudonymisiert
}

export const empfehlungSkill = (input: EmpfehlungInput): string => `
Auf Basis von Anlage ${input.anlage_id} aus dem Buch "Loss Prevention Management und das Insider-Risiko":

FINDING: ${input.finding}
${input.branche ? `BRANCHE: ${input.branche}` : ""}

Gib 3 konkrete, umsetzbare Maßnahmenempfehlungen.
Jede Empfehlung mit: Was tun? Warum wichtig? Referenz auf Buchmodul oder Anlage.
`.trim();
```

### risiko.skill.ts
```typescript
export interface RisikoInput {
  findings_kritisch: number;
  findings_eingeschraenkt: number;
  findings_stabil: number;
  anlage_id: string;
  mandant_pseudonym: string;
}

export const risikoSkill = (input: RisikoInput): string => `
Risikoeinschätzung für LPM-Audit ${input.anlage_id}:
Mandant: ${input.mandant_pseudonym}

Ergebnis:
- Kritische Findings (instabil): ${input.findings_kritisch}
- Eingeschränkte Findings: ${input.findings_eingeschraenkt}  
- Stabile Bereiche: ${input.findings_stabil}

Bewerte das Gesamtrisiko (niedrig / mittel / hoch / kritisch) mit Begründung.
Empfehle die nächste Prüffrequenz (monatlich / quartalsweise / jährlich).
`.trim();
```

---

## 8. UI-DESIGN-REGELN

### Farbschema
- Primär: Dunkelblau `#1e3a5f` – professionell, sicherheitsorientiert
- Akzent: Gold/Amber `#d4a017` – Hervorhebungen, CTAs
- Hintergrund: `#f8f9fa` (hell) / `#1a1a2e` (dunkel, optional)
- Bewertungsfarben: Grün `#22c55e` (stabil), Gelb `#eab308` (eingeschränkt), Rot `#ef4444` (instabil), Grau `#94a3b8` (n/a)
- Gefahr/Finding: `#fef2f2` Hintergrund mit rotem Rand

### Layout
- Sidebar (links, 240px): Navigation zwischen Bereichen
- Header (oben): Aktueller Mandant, KI-Status-Badge (🟢 Ollama lokal / 🟡 Extern)
- Hauptbereich: Seiteninhalte
- StatusBar (unten, 28px): KI-Modus, DB-Pfad, Version

### Komponenten-Regeln
- Keine Komponente größer als 200 Zeilen – aufteilen wenn nötig
- Jede Seite hat einen eigenen Loading-State
- Fehler werden als Toast angezeigt, kein weißer Screen
- KI-Panel mit Streaming: Antwort erscheint Wort für Wort (SSE)
- Vor jedem externen API-Call: KiConfirm-Dialog ("Daten werden an [Adapter] gesendet. Fortfahren?")
- Fortschrittsbalken bei langen Checklisten (z.B. A-18 hat viele Fragen)

### Checklisten-UI
- Fragen in Abschnitten gruppiert (wie im Buch)
- Bewertung als 4-Button-Toggle: Stabil | Eingeschränkt | Instabil | N/A
- Instabil-Fragen werden automatisch als Finding markiert (roter Rand)
- Kommentarfeld klappt auf bei Instabil/Eingeschränkt
- Abschnitt-Fortschritt sichtbar: "3 / 8 Fragen beantwortet"

---

## 9. EXPORT-SPEZIFIKATION

### Word-Export (.docx)
**Deckblatt:**
- Logo-Platzhalter (JW Safety & Security)
- Titel: "[Anlage-ID] – [Anlage-Name]"
- Untertitel: "Loss Prevention Management Audit"
- Mandant: [Mandantenname]
- Standort: [Standort]
- Datum: [Datum der Prüfung]
- Durchgeführt durch: Jörg Weidemann, JW Safety & Security

**Inhaltsverzeichnis** (automatisch)

**Abschnitt 1 – Gesamtbewertung:**
- Bewertungsübersicht als Tabelle (Abschnitt | Anzahl Fragen | Stabil | Eingeschränkt | Instabil)
- Gesamtstatus farbig hervorgehoben

**Abschnitt 2 – KI-Zusammenfassung:**
- Management-Summary (aus KI-Skill)
- Priorisierte Handlungsempfehlungen (nummeriert)

**Abschnitt 3 – Detailergebnisse:**
- Je Abschnitt: Überschrift + alle Fragen mit Bewertung und Kommentar
- Findings (instabil) in roter Schrift mit grauem Hintergrund

**Abschnitt 4 – Findings-Übersicht:**
- Alle instabilen und eingeschränkten Findings tabellarisch
- Spalten: Nr. | Abschnitt | Finding | Bewertung | Kommentar | Empfehlung

**Footer:** "Erstellt mit LPM Manager | JW Safety & Security | [Datum]"

### PDF-Export
Identisches Layout wie Word, gerendert aus HTML-Template via Puppeteer oder @react-pdf/renderer.
Optimiert für A4-Druck, Seitenzahlen, professionelle Darstellung.

### Token-Vault-Rückauflösung
Vor dem Export: Pseudonyme werden durch Originaldaten ersetzt (Token-Vault-Lookup).
Exportiertes Dokument enthält immer Klardaten (Mandantenname etc.).

---

## 10. DATENSCHUTZ-STACK (leicht)

### Grundsatz
Ollama = lokal = kein Filter nötig.
Anthropic / OpenAI / Gemini / OpenRouter = extern = Privacy-Filter Pflicht vor jedem Aufruf.

### Was pseudonymisiert wird
- `mandant.name` → `[MANDANT_xxxx]`
- `mandant.ansprechpartner` → `[PERSON_xxxx]`
- `mandant.standort` → bleibt (zu allgemein für Identifizierung)
- Freitextkommentare in Checklisten → Regex-Scan auf Namen/E-Mails/Telefonnummern

### Implementierung (aus Gutachter-Software portieren)
```
server/privacy/
├── index.ts           ← privacyFilter(data, adapter) → gefilterte Daten
├── pseudonymizer.ts   ← Feldnamen → Token-Mapping
├── tokenVault.ts      ← SQLite: tokens.db (getrennt von main.db)
├── sanitizer.ts       ← Freitext-Regex-Bereinigung
├── auditLog.ts        ← Log: use_case, adapter, timestamp (keine Klardaten)
├── types.ts
└── rules/
    └── identifiers.ts ← LPM-spezifische Felder: name, ansprechpartner
```

### Harte Regeln
- `privacyFilter()` MUSS vor jedem externen Adapter-Aufruf stehen
- Token-Vault-DB liegt in separater Datei (`tokens.db`), nie über Haupt-DB-Verbindung
- Audit-Log enthält keine personenbezogenen Werte
- `PRIVACY_BLOCK_ON_FAIL=true` als Standard
- Ollama-Adapter ruft `privacyFilter()` nie auf

---

## 11. STARTER-REIHENFOLGE (Entwicklungsphasen)

### Phase 1a – Projekt-Setup + Security-Fundament ✅ ABGESCHLOSSEN
1. [x] Electron + React + TypeScript + Tailwind initialisieren
2. [x] Ordnerstruktur anlegen
3. [x] `electron-builder` konfigurieren (.exe + .dmg Targets)
4. [x] Security installieren: zod, pathSanitizer, promptSanitizer
5. [x] IPC-Bridge (preload.ts) mit allen Kanälen definieren
6. [x] **Test:** App startet, leeres Fenster erscheint ✅

### Phase 1b – Datenbank + Privacy-Fundament ✅ ABGESCHLOSSEN
1. [x] Drizzle Schema anlegen (alle Tabellen aus Abschnitt 5)
2. [x] DB-Migration ausführen, `main.db` wird angelegt ✅
3. [x] Privacy-Stack aus Gutachter-Software portieren
4. [x] Token-Vault als separate `tokens.db` anlegen ✅
5. [x] **Test:** `privacyFilter(...)` gibt `[MANDANT_3bae8089]` zurück ✅
6. [x] **Test:** `tsc --noEmit` = 0 Fehler ✅

### Phase 2 – KI-Infrastruktur ✅ ABGESCHLOSSEN
1. [x] Alle 5 Adapter implementiert (Ollama, Anthropic, OpenAI, Gemini, OpenRouter)
2. [x] SSE-Streaming für alle Adapter (fetch + ReadableStream)
3. [x] Use-Case-Router mit DB-Einstellungen (ERKLAERUNG/ZUSAMMENFASSUNG → Ollama default)
4. [x] Alle Skills implementiert (system, erklaerung, zusammenfassung, empfehlung, risiko)
5. [x] KI-Audit-Log: `ki-audit.repository.ts` + `lpm_ki_audit` Tabelle
6. [x] IPC-Handler `ki:anfrage` (Streaming via `ki:stream-chunk` Event) + `ki:adapter-testen`
7. [x] Privacy-Filter vor externen Adapter-Aufrufen (Ollama ausgenommen)
8. [x] **Test:** App startet mit 33 Modulen, TypeCheck 0 Fehler ✅

### Phase 3 – Grundlayout + Mandantenverwaltung ✅ ABGESCHLOSSEN
1. [x] Sidebar, Header, StatusBar implementieren
2. [x] KI-Modus-Anzeige in StatusBar (Ollama lokal / Extern)
3. [x] Dashboard-Seite: Mandantenübersicht
4. [x] Mandant anlegen / bearbeiten / archivieren
5. [x] Mandanten-Switcher im Header
6. [x] **Test:** Mandant anlegen, wechseln, bearbeiten – alles persistent nach App-Neustart

### Phase 4 – Checklisten-Kern (MVP) ✅ ABGESCHLOSSEN
1. [x] Checklisten-Katalog: Alle 18 Anlagen als strukturierte Daten in `catalog.ts`
2. [x] ChecklistenRunner: Anlage auswählen → Run starten → Fragen beantworten
3. [x] Bewertungs-UI: 4-Button-Toggle, Kommentarfeld, Finding-Markierung
4. [x] Run abschließen, Status speichern
5. [x] KI-Zusammenfassung nach Abschluss (Ollama Standard)
6. **Test (MVP-Kriterium):** Mandant anlegen → A-06 durchführen → KI-Zusammenfassung erscheint

### Phase 5 – Export (MVP-Abschluss)
1. Word-Export implementieren (docx-Library)
2. PDF-Export implementieren
3. Token-Vault-Rückauflösung vor Export
4. Export-Protokoll in DB schreiben
5. **Test (MVP-Abschluss):** A-06 Export als Word → öffnet sich, ist professionell formatiert, direkt verwendbar

### Phase 6 – Formulare
1. Formular-Katalog: Alle 7 Formulare als Felddefinitionen
2. FormularEditor: Formular ausfüllen, speichern
3. Formular-Export: Word + PDF
4. **Test:** F-01 Wareneingang-Check ausfüllen → exportieren

### Phase 7 – Wissensbasis
1. Buchstruktur als JSON aufbereiten (Kapitel, Anlagen, Glossar)
2. Wissensbasis-Seite: Navigation durch Buchstruktur
3. KI-Erklärung: Kapitel auswählen → Ollama erklärt
4. Glossar-Seite aus Buchanhang
5. **Test:** Kapitel 2 (Insider-Risiko) → KI erklärt mit Streaming

### Phase 8 – Einstellungen + Polish
1. Einstellungs-Seite: API-Keys, Adapter-Defaults, Export-Pfad
2. Fehlerbehandlung und Edge Cases
3. Loading States überall konsistent
4. App-Icons für .exe/.dmg
5. electron-builder: finaler Build-Test auf macOS und Windows
6. **Test:** Vollständiger Nutzer-Workflow ohne Fehler, Build läuft durch

---

## 12. CODING-REGELN

### TypeScript
- `strict: true` in tsconfig.json – keine Ausnahmen
- Kein `any` – niemals. Immer `unknown` + Type-Guard wenn Typ unklar
- Interfaces für alle Datenstrukturen in `types.ts` je Modul
- Drizzle-Typen aus Schema ableiten, nicht neu definieren

### Electron
- Renderer-Prozess hat keinen direkten Node.js-Zugriff – immer über IPC
- `contextIsolation: true` und `nodeIntegration: false` in BrowserWindow – nicht ändern
- Alle Dateisystem-Operationen nur im Main-Prozess
- Sensitive Daten (API-Keys) im Electron `safeStorage` verschlüsseln

### Komponenten
- Maximale Komponentengröße: 200 Zeilen
- Custom Hooks für wiederverwendbare Logik (`useCheckliste`, `useMandant`, `useKi`)
- Keine Business-Logik in Komponenten – nur in Hooks und IPC-Handlern
- Alle Formulare mit zod validiert

### Privacy-Regeln
- `privacyFilter()` MUSS vor jedem externen Adapter-Aufruf stehen – keine Ausnahmen
- Lokale Adapter (Ollama) rufen `privacyFilter()` nie auf
- Skills dürfen niemals rohe Mandantendaten direkt einbauen wenn externer Adapter folgt
- Audit-Log enthält nur: use_case, adapter, timestamp, token-count – keine Klardaten

### Fehlerbehandlung
- Alle IPC-Handler mit try/catch
- Fehler als typisierte Objekte: `{ success: false, error: string }`
- KI-Fehler werden dem Nutzer verständlich erklärt (kein Stack-Trace)
- DB-Fehler: App läuft weiter, Fehlermeldung als Toast

### Datenbankzugriff
- Nur über Drizzle ORM – kein rohes SQL
- Alle Queries in dedizierten Repository-Funktionen, nicht direkt in IPC-Handlern
- Transaktionen für mehrstufige Operationen (z.B. Run abschließen + KI-Ergebnis speichern)

---

## 13. ZUKUNFTS-VORBEREITUNG

### Lizenzkey-System (nächste Phase nach V1)
- Electron-App mit Lizenzkey-Prüfung beim Start
- Gleicher Ansatz wie geplant für Risikobeurteilungs-Modul
- Architektur heute: App-ID in `electron/main.ts` als Konstante, Lizenz-Check-Modul als Platzhalter

### Multi-Tenant / SaaS (langfristig)
- `mandant_id` in allen Tabellen von Tag 1 – Migration entfällt
- Datenbankschema ist SaaS-ready: Tabellen-Prefix `lpm_`, UUID als externe IDs
- Auth-System: Platzhalter in `einstellungen`-Tabelle vorhanden

### Weitere Buchmodule
- Buchstruktur in `kapitel.json` ist erweiterbar
- KI-Skills sind modular – neue Skills als neue Dateien, keine bestehenden anfassen
- Checklisten-Katalog in `catalog.ts` ist erweiterbar ohne Code-Änderung

### Automatisierung mit N8N (optional, ergänzend zur App)
Sinnvolle N8N-Workflows die parallel zur App laufen können:
- **Export → Ablage**: Neuer Export in App → N8N legt Word/PDF automatisch in NAS-Ordner
  des Mandanten ab (Trigger: neue Datei im Export-Pfad)
- **Monats-Reminder**: Am 1. des Monats → N8N prüft welche Mandanten keine aktuelle
  A-08 (monatliche Standortbewertung) haben → E-Mail-Erinnerung an Jörg
- **Audit-Report**: Quartalsweise → N8N aggregiert alle Exports eines Mandanten,
  erstellt Zusammenfassungs-E-Mail

---

*LPM Manager CLAUDE.md v1.0 – JW Safety & Security*
*Basiert auf JW_Software_Workflow_Template_v2.0*
*Buchgrundlage: "Loss Prevention Management und das Insider-Risiko" – Jörg Weidemann, 2026*
