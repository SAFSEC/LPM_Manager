import type { ChecklisteExportData, AbschnittStat } from './types';
import type { ChecklisteAntwortRow } from '../checklisten/types';
import type { FormularExportData } from '../formulare/types';

function formatDatum(iso: string | null): string {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function bewertungLabel(b: string | null): string {
  switch (b) {
    case 'stabil': return 'Stabil';
    case 'eingeschraenkt': return 'Eingeschränkt';
    case 'instabil': return 'Instabil';
    case 'na': return 'N/A';
    default: return '–';
  }
}

function bewertungStyle(b: string | null): string {
  switch (b) {
    case 'stabil': return 'background:#dcfce7;color:#166534;font-weight:600;';
    case 'eingeschraenkt': return 'background:#fef9c3;color:#854d0e;font-weight:600;';
    case 'instabil': return 'background:#fee2e2;color:#991b1b;font-weight:600;';
    case 'na': return 'background:#f1f5f9;color:#64748b;';
    default: return 'background:#f8fafc;color:#64748b;';
  }
}

function berechneAbschnittStats(antworten: ChecklisteAntwortRow[]): AbschnittStat[] {
  const map = new Map<string, AbschnittStat>();
  for (const a of antworten) {
    if (!map.has(a.abschnitt)) {
      map.set(a.abschnitt, { abschnitt: a.abschnitt, gesamt: 0, stabil: 0, eingeschraenkt: 0, instabil: 0, na: 0 });
    }
    const s = map.get(a.abschnitt)!;
    s.gesamt++;
    if (a.bewertung === 'stabil') s.stabil++;
    else if (a.bewertung === 'eingeschraenkt') s.eingeschraenkt++;
    else if (a.bewertung === 'instabil') s.instabil++;
    else if (a.bewertung === 'na') s.na++;
  }
  return Array.from(map.values());
}

function gesamtstatus(antworten: ChecklisteAntwortRow[]): { label: string; style: string } {
  const instabil = antworten.filter((a) => a.bewertung === 'instabil').length;
  const eingeschraenkt = antworten.filter((a) => a.bewertung === 'eingeschraenkt').length;
  if (instabil >= 3) return { label: 'KRITISCH', style: 'background:#fee2e2;color:#991b1b;' };
  if (instabil > 0) return { label: 'EINGESCHRÄNKT', style: 'background:#fef9c3;color:#854d0e;' };
  if (eingeschraenkt > 0) return { label: 'ÜBERWIEGEND STABIL', style: 'background:#fef9c3;color:#854d0e;' };
  return { label: 'STABIL', style: 'background:#dcfce7;color:#166534;' };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function kiTextToHtml(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const t = line.trim();
      if (!t) return '<br>';
      if (t.startsWith('**') && t.endsWith('**')) {
        return `<p style="font-weight:700;color:#1e3a5f;margin:12px 0 4px;">${escapeHtml(t.slice(2, -2))}</p>`;
      }
      if (/^\d+\./.test(t)) {
        return `<p style="margin:4px 0 4px 20px;">${escapeHtml(t)}</p>`;
      }
      if (t.startsWith('-') || t.startsWith('•')) {
        return `<p style="margin:4px 0 4px 20px;">• ${escapeHtml(t.slice(1).trim())}</p>`;
      }
      return `<p style="margin:4px 0;">${escapeHtml(t)}</p>`;
    })
    .join('');
}

export function generiereHtmlTemplate(data: ChecklisteExportData): string {
  const { mandant, run, antworten, kiZusammenfassung } = data;
  const pruefDatum = formatDatum(run.abgeschlossenAm ?? run.erstelltAm);
  const exportDatum = new Date().toLocaleDateString('de-DE');
  const stats = berechneAbschnittStats(antworten);
  const status = gesamtstatus(antworten);
  const findings = antworten.filter((a) => a.bewertung === 'instabil' || a.bewertung === 'eingeschraenkt');
  const abschnitte = [...new Set(antworten.map((a) => a.abschnitt))];

  const statRows = stats
    .map(
      (s) => `
      <tr>
        <td style="font-weight:600;">${escapeHtml(s.abschnitt)}</td>
        <td style="text-align:center;">${s.gesamt}</td>
        <td style="text-align:center;${s.stabil > 0 ? 'color:#166534;font-weight:600;' : ''}">${s.stabil}</td>
        <td style="text-align:center;${s.eingeschraenkt > 0 ? 'color:#854d0e;font-weight:600;' : ''}">${s.eingeschraenkt}</td>
        <td style="text-align:center;${s.instabil > 0 ? 'background:#fee2e2;color:#991b1b;font-weight:600;' : ''}">${s.instabil}</td>
        <td style="text-align:center;color:#64748b;">${s.na}</td>
      </tr>`
    )
    .join('');

  const detailSektionen = abschnitte
    .map((abschnitt) => {
      const gruppe = antworten.filter((a) => a.abschnitt === abschnitt);
      const frageRows = gruppe
        .map(
          (a, i) => `
        <tr style="${a.bewertung === 'instabil' ? 'background:#fff5f5;' : ''}">
          <td style="text-align:center;color:#94a3b8;">${i + 1}</td>
          <td>${escapeHtml(a.frageText)}</td>
          <td style="text-align:center;${bewertungStyle(a.bewertung)};padding:4px 8px;border-radius:4px;">${bewertungLabel(a.bewertung)}</td>
          <td style="color:#64748b;font-size:12px;">${a.kommentar ? escapeHtml(a.kommentar) : '–'}</td>
        </tr>`
        )
        .join('');
      return `
      <h3 style="color:#1e3a5f;font-size:14px;margin:20px 0 8px;border-left:3px solid #d4a017;padding-left:8px;">${escapeHtml(abschnitt)}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;">
        <thead>
          <tr style="background:#1e3a5f;color:white;">
            <th style="width:40px;padding:6px;">#</th>
            <th style="text-align:left;padding:6px;">Frage</th>
            <th style="width:120px;padding:6px;">Bewertung</th>
            <th style="width:200px;text-align:left;padding:6px;">Kommentar</th>
          </tr>
        </thead>
        <tbody>${frageRows}</tbody>
      </table>`;
    })
    .join('');

  const findingRows = findings
    .map(
      (a, i) => `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td style="font-weight:600;">${escapeHtml(a.abschnitt)}</td>
        <td>${escapeHtml(a.frageText)}</td>
        <td style="${bewertungStyle(a.bewertung)};text-align:center;padding:4px 8px;border-radius:4px;">${bewertungLabel(a.bewertung)}</td>
        <td style="color:#64748b;font-size:12px;">${a.kommentar ? escapeHtml(a.kommentar) : '–'}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 20mm 18mm 20mm 18mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a202c; margin: 0; }
    h1 { color: #1e3a5f; font-size: 20px; border-bottom: 2px solid #d4a017; padding-bottom: 6px; margin: 24px 0 12px; }
    h2 { color: #1e3a5f; font-size: 15px; margin: 16px 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px; }
    th { background: #1e3a5f; color: white; padding: 7px 8px; text-align: left; }
    td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    .page-break { page-break-before: always; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 13px; }
    .footer-note { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    .deckblatt { text-align: center; padding: 60px 0 40px; }
    .deckblatt .company { color: #d4a017; font-weight: 700; font-size: 16px; margin-bottom: 4px; }
    .deckblatt .person { color: #64748b; font-size: 13px; margin-bottom: 40px; }
    .deckblatt .titel { color: #1e3a5f; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .deckblatt .untertitel { color: #64748b; font-size: 15px; font-style: italic; margin-bottom: 40px; }
    .deckblatt .trennlinie { border: none; border-top: 3px solid #d4a017; margin: 0 80px 32px; }
    .deckblatt .info-grid { display: grid; grid-template-columns: 160px 1fr; gap: 8px 4px; text-align: left; max-width: 480px; margin: 0 auto; font-size: 13px; }
    .deckblatt .info-label { font-weight: 600; color: #1e3a5f; }
    .ki-text { background: #f8fafc; border-left: 3px solid #1e3a5f; padding: 12px 16px; border-radius: 0 4px 4px 0; line-height: 1.6; }
  </style>
</head>
<body>

  <div class="deckblatt">
    <div class="company">JW Safety &amp; Security</div>
    <div class="person">Jörg Weidemann</div>
    <div class="titel">${escapeHtml(run.anlageId)} – ${escapeHtml(run.anlageName)}</div>
    <div class="untertitel">Loss Prevention Management Audit</div>
    <hr class="trennlinie">
    <div class="info-grid">
      <span class="info-label">Mandant:</span><span>${escapeHtml(mandant.name)}</span>
      <span class="info-label">Standort:</span><span>${escapeHtml(mandant.standort ?? '–')}</span>
      <span class="info-label">Ansprechpartner:</span><span>${escapeHtml(mandant.ansprechpartner ?? '–')}</span>
      <span class="info-label">Branche:</span><span>${escapeHtml(mandant.branche ?? '–')}</span>
      <span class="info-label">Prüfdatum:</span><span>${pruefDatum}</span>
      <span class="info-label">Durchgeführt durch:</span><span>Jörg Weidemann, JW Safety &amp; Security</span>
    </div>
  </div>

  <div class="page-break"></div>
  <h1>1. Gesamtbewertung</h1>
  <p>Gesamtstatus: <span class="badge" style="${status.style}">${status.label}</span></p>
  <table>
    <thead>
      <tr>
        <th>Abschnitt</th>
        <th style="width:70px;text-align:center;">Fragen</th>
        <th style="width:70px;text-align:center;">Stabil</th>
        <th style="width:90px;text-align:center;">Eingeschränkt</th>
        <th style="width:70px;text-align:center;">Instabil</th>
        <th style="width:50px;text-align:center;">N/A</th>
      </tr>
    </thead>
    <tbody>${statRows}</tbody>
  </table>

  <div class="page-break"></div>
  <h1>2. KI-Zusammenfassung</h1>
  ${
    kiZusammenfassung
      ? `<div class="ki-text">${kiTextToHtml(kiZusammenfassung)}</div>`
      : '<p style="color:#64748b;font-style:italic;">Keine KI-Zusammenfassung vorhanden.</p>'
  }

  <div class="page-break"></div>
  <h1>3. Detailergebnisse</h1>
  ${detailSektionen}

  <div class="page-break"></div>
  <h1>4. Findings-Übersicht</h1>
  ${
    findings.length === 0
      ? '<p style="color:#166534;font-weight:600;">✓ Keine kritischen oder eingeschränkten Findings identifiziert.</p>'
      : `<p style="${findings.some((f) => f.bewertung === 'instabil') ? 'color:#991b1b;' : 'color:#854d0e;'}font-weight:600;">${findings.length} Finding${findings.length !== 1 ? 's' : ''} identifiziert</p>
      <table>
        <thead>
          <tr>
            <th style="width:40px;text-align:center;">Nr.</th>
            <th style="width:140px;">Abschnitt</th>
            <th>Finding</th>
            <th style="width:110px;text-align:center;">Bewertung</th>
            <th style="width:160px;">Kommentar</th>
          </tr>
        </thead>
        <tbody>${findingRows}</tbody>
      </table>`
  }

  <div class="footer-note">
    Erstellt mit LPM Manager &nbsp;|&nbsp; JW Safety &amp; Security &nbsp;|&nbsp; ${exportDatum}
  </div>

</body>
</html>`;
}

export function generiereFormularHtmlTemplate(data: FormularExportData): string {
  const { mandantName, mandantStandort, formularDefinition, felder } = data;
  const exportDatum = new Date().toLocaleDateString('de-DE');

  const gruppenMap = new Map<string, typeof formularDefinition.felder>();
  for (const feld of formularDefinition.felder) {
    const gruppe = feld.gruppe ?? 'Allgemein';
    if (!gruppenMap.has(gruppe)) gruppenMap.set(gruppe, []);
    gruppenMap.get(gruppe)!.push(feld);
  }

  const abschnittHtml = Array.from(gruppenMap.entries())
    .filter(([, gruppenFelder]) => gruppenFelder.some((f) => felder[f.id]))
    .map(([gruppenName, gruppenFelder]) => {
      const zeilen = gruppenFelder
        .map((feld, i) => {
          const wert = felder[feld.id] ?? '';
          const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
          return `<tr style="background:${bg};">
            <td style="font-weight:600;color:#475569;width:35%;padding:7px 10px;">${escapeHtml(feld.label)}</td>
            <td style="padding:7px 10px;">${wert ? escapeHtml(wert) : '<span style="color:#94a3b8;">–</span>'}</td>
          </tr>`;
        })
        .join('');
      return `<h2 style="color:#1e3a5f;font-size:14px;margin:20px 0 8px;border-left:3px solid #d4a017;padding-left:8px;">${escapeHtml(gruppenName)}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px;border:1px solid #e2e8f0;">
        <tbody>${zeilen}</tbody>
      </table>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 20mm 18mm 20mm 18mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a202c; margin: 0; }
    .page-break { page-break-before: always; }
    .footer-note { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    .header-bar { background: #1e3a5f; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  </style>
</head>
<body>

  <div class="header-bar">
    <div>
      <div style="font-weight:700;font-size:14px;">JW Safety &amp; Security</div>
      <div style="font-size:11px;color:#cbd5e1;">Loss Prevention Management</div>
    </div>
    <div style="text-align:right;">
      <div style="font-weight:600;font-size:13px;">${escapeHtml(mandantName)}</div>
      <div style="font-size:11px;color:#cbd5e1;">${escapeHtml(formularDefinition.formularId)} · ${exportDatum}</div>
    </div>
  </div>

  <h1 style="color:#1e3a5f;font-size:20px;border-bottom:2px solid #d4a017;padding-bottom:6px;margin:0 0 4px;">
    <span style="color:#d4a017;">${escapeHtml(formularDefinition.formularId)}</span>
    &nbsp;–&nbsp;${escapeHtml(formularDefinition.name)}
  </h1>
  <p style="color:#64748b;font-size:12px;margin:4px 0 20px;">
    ${escapeHtml(mandantName)}${mandantStandort ? ` · ${escapeHtml(mandantStandort)}` : ''} · Erstellt: ${exportDatum}
  </p>

  ${abschnittHtml}

  <div class="footer-note">
    Erstellt mit LPM Manager &nbsp;|&nbsp; JW Safety &amp; Security &nbsp;|&nbsp; ${exportDatum}
  </div>

</body>
</html>`;
}
