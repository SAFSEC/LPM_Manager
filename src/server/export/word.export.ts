import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  PageBreak,
  Footer,
  Header,
} from 'docx';
import type { ChecklisteExportData, AbschnittStat } from './types';
import type { ChecklisteAntwortRow } from '../checklisten/types';

const FARBE_BLAU = '1e3a5f';
const FARBE_GOLD = 'd4a017';
const FARBE_GRUEN = '166534';
const FARBE_GRUEN_BG = 'dcfce7';
const FARBE_GELB = '854d0e';
const FARBE_GELB_BG = 'fef9c3';
const FARBE_ROT = '991b1b';
const FARBE_ROT_BG = 'fee2e2';
const FARBE_GRAU = '64748b';
const FARBE_GRAU_BG = 'f1f5f9';
const FARBE_KOPF_BG = '1e3a5f';

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

function bewertungFarbe(b: string | null): { text: string; bg: string } {
  switch (b) {
    case 'stabil': return { text: FARBE_GRUEN, bg: FARBE_GRUEN_BG };
    case 'eingeschraenkt': return { text: FARBE_GELB, bg: FARBE_GELB_BG };
    case 'instabil': return { text: FARBE_ROT, bg: FARBE_ROT_BG };
    default: return { text: FARBE_GRAU, bg: FARBE_GRAU_BG };
  }
}

function berechneAbschnittStats(antworten: ChecklisteAntwortRow[]): AbschnittStat[] {
  const map = new Map<string, AbschnittStat>();
  for (const a of antworten) {
    if (!map.has(a.abschnitt)) {
      map.set(a.abschnitt, {
        abschnitt: a.abschnitt,
        gesamt: 0,
        stabil: 0,
        eingeschraenkt: 0,
        instabil: 0,
        na: 0,
      });
    }
    const stat = map.get(a.abschnitt)!;
    stat.gesamt++;
    if (a.bewertung === 'stabil') stat.stabil++;
    else if (a.bewertung === 'eingeschraenkt') stat.eingeschraenkt++;
    else if (a.bewertung === 'instabil') stat.instabil++;
    else if (a.bewertung === 'na') stat.na++;
  }
  return Array.from(map.values());
}

function gesamtstatusBerechnen(antworten: ChecklisteAntwortRow[]): {
  label: string;
  farbe: string;
  bg: string;
} {
  const instabil = antworten.filter((a) => a.bewertung === 'instabil').length;
  const eingeschraenkt = antworten.filter((a) => a.bewertung === 'eingeschraenkt').length;

  if (instabil >= 3) return { label: 'KRITISCH', farbe: FARBE_ROT, bg: FARBE_ROT_BG };
  if (instabil > 0) return { label: 'EINGESCHRÄNKT', farbe: FARBE_GELB, bg: FARBE_GELB_BG };
  if (eingeschraenkt > 0) return { label: 'ÜBERWIEGEND STABIL', farbe: FARBE_GELB, bg: FARBE_GELB_BG };
  return { label: 'STABIL', farbe: FARBE_GRUEN, bg: FARBE_GRUEN_BG };
}

function tabellenKopfZelle(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            color: 'FFFFFF',
            size: 18,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: { type: ShadingType.SOLID, color: FARBE_KOPF_BG },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
  });
}

function einfacheZelle(
  text: string,
  opts?: { bold?: boolean; bg?: string; textColor?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType] }
): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: opts?.bold ?? false,
            color: opts?.textColor,
            size: 18,
          }),
        ],
        alignment: opts?.align ?? AlignmentType.LEFT,
      }),
    ],
    shading: opts?.bg ? { type: ShadingType.SOLID, color: opts.bg } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
    },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}

function abstandParagraph(groesse = 200): Paragraph {
  return new Paragraph({ spacing: { before: groesse } });
}

function ueberschrift1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, color: FARBE_BLAU, size: 28 })],
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: FARBE_GOLD } },
  });
}

function ueberschrift2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, color: FARBE_BLAU, size: 22 })],
    spacing: { before: 280, after: 120 },
  });
}

function buildDeckblatt(data: ChecklisteExportData): Paragraph[] {
  const { mandant, run } = data;
  const pruefDatum = formatDatum(run.abgeschlossenAm ?? run.erstelltAm);

  return [
    new Paragraph({ spacing: { before: 1200 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'JW Safety & Security',
          bold: true,
          color: FARBE_GOLD,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Jörg Weidemann',
          color: FARBE_GRAU,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${run.anlageId} – ${run.anlageName}`,
          bold: true,
          color: FARBE_BLAU,
          size: 40,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Loss Prevention Management Audit',
          color: FARBE_GRAU,
          size: 24,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '', size: 2 })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: FARBE_GOLD } },
      spacing: { after: 600 },
    }),
    buildInfoZeile('Mandant:', mandant.name),
    buildInfoZeile('Standort:', mandant.standort ?? '–'),
    buildInfoZeile('Ansprechpartner:', mandant.ansprechpartner ?? '–'),
    buildInfoZeile('Branche:', mandant.branche ?? '–'),
    buildInfoZeile('Prüfdatum:', pruefDatum),
    buildInfoZeile('Durchgeführt durch:', 'Jörg Weidemann, JW Safety & Security'),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function buildInfoZeile(label: string, wert: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: label + '  ', bold: true, color: FARBE_BLAU, size: 20 }),
      new TextRun({ text: wert, size: 20 }),
    ],
    spacing: { after: 100 },
  });
}

function buildGesamtbewertung(data: ChecklisteExportData): (Paragraph | Table)[] {
  const { antworten } = data;
  const status = gesamtstatusBerechnen(antworten);
  const stats = berechneAbschnittStats(antworten);

  const gesamtInstabil = antworten.filter((a) => a.bewertung === 'instabil').length;
  const gesamtEingeschraenkt = antworten.filter((a) => a.bewertung === 'eingeschraenkt').length;
  const gesamtStabil = antworten.filter((a) => a.bewertung === 'stabil').length;

  const kopfRow = new TableRow({
    children: [
      tabellenKopfZelle('Abschnitt'),
      tabellenKopfZelle('Fragen'),
      tabellenKopfZelle('Stabil'),
      tabellenKopfZelle('Eingeschränkt'),
      tabellenKopfZelle('Instabil'),
      tabellenKopfZelle('N/A'),
    ],
    tableHeader: true,
  });

  const datenRows = stats.map(
    (s) =>
      new TableRow({
        children: [
          einfacheZelle(s.abschnitt, { bold: true }),
          einfacheZelle(String(s.gesamt), { align: AlignmentType.CENTER }),
          einfacheZelle(String(s.stabil), {
            align: AlignmentType.CENTER,
            textColor: s.stabil > 0 ? FARBE_GRUEN : undefined,
            bold: s.stabil > 0,
          }),
          einfacheZelle(String(s.eingeschraenkt), {
            align: AlignmentType.CENTER,
            textColor: s.eingeschraenkt > 0 ? FARBE_GELB : undefined,
            bold: s.eingeschraenkt > 0,
          }),
          einfacheZelle(String(s.instabil), {
            align: AlignmentType.CENTER,
            textColor: s.instabil > 0 ? FARBE_ROT : undefined,
            bold: s.instabil > 0,
            bg: s.instabil > 0 ? FARBE_ROT_BG : undefined,
          }),
          einfacheZelle(String(s.na), { align: AlignmentType.CENTER, textColor: FARBE_GRAU }),
        ],
      })
  );

  const summeRow = new TableRow({
    children: [
      einfacheZelle('GESAMT', { bold: true, bg: 'f8fafc' }),
      einfacheZelle(String(antworten.length), { align: AlignmentType.CENTER, bold: true, bg: 'f8fafc' }),
      einfacheZelle(String(gesamtStabil), {
        align: AlignmentType.CENTER,
        bold: true,
        bg: gesamtStabil > 0 ? FARBE_GRUEN_BG : 'f8fafc',
        textColor: gesamtStabil > 0 ? FARBE_GRUEN : undefined,
      }),
      einfacheZelle(String(gesamtEingeschraenkt), {
        align: AlignmentType.CENTER,
        bold: true,
        bg: gesamtEingeschraenkt > 0 ? FARBE_GELB_BG : 'f8fafc',
        textColor: gesamtEingeschraenkt > 0 ? FARBE_GELB : undefined,
      }),
      einfacheZelle(String(gesamtInstabil), {
        align: AlignmentType.CENTER,
        bold: true,
        bg: gesamtInstabil > 0 ? FARBE_ROT_BG : 'f8fafc',
        textColor: gesamtInstabil > 0 ? FARBE_ROT : undefined,
      }),
      einfacheZelle(
        String(antworten.filter((a) => a.bewertung === 'na').length),
        { align: AlignmentType.CENTER, bold: true, bg: 'f8fafc' }
      ),
    ],
  });

  const statistikTabelle = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [kopfRow, ...datenRows, summeRow],
  });

  const statusParagraph = new Paragraph({
    children: [
      new TextRun({ text: 'Gesamtstatus: ', bold: true, size: 22, color: FARBE_BLAU }),
      new TextRun({ text: status.label, bold: true, size: 22, color: status.farbe }),
    ],
    spacing: { before: 240, after: 160 },
  });

  return [ueberschrift1('1. Gesamtbewertung'), statusParagraph, statistikTabelle];
}

function buildKiZusammenfassung(ki: string | null): (Paragraph | Table)[] {
  if (!ki) {
    return [
      ueberschrift1('2. KI-Zusammenfassung'),
      new Paragraph({
        children: [new TextRun({ text: 'Keine KI-Zusammenfassung vorhanden.', italics: true, color: FARBE_GRAU })],
      }),
    ];
  }

  const zeilen = ki.split('\n');
  const paragraphs: Paragraph[] = zeilen.map((zeile) => {
    const trimmed = zeile.trim();
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return new Paragraph({
        children: [new TextRun({ text: trimmed.slice(2, -2), bold: true, size: 20, color: FARBE_BLAU })],
        spacing: { before: 160, after: 60 },
      });
    }
    if (/^\d+\./.test(trimmed)) {
      return new Paragraph({
        children: [new TextRun({ text: trimmed, size: 18 })],
        bullet: { level: 0 },
        spacing: { after: 60 },
      });
    }
    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      return new Paragraph({
        children: [new TextRun({ text: trimmed.slice(1).trim(), size: 18 })],
        bullet: { level: 0 },
        spacing: { after: 40 },
      });
    }
    return new Paragraph({
      children: [new TextRun({ text: trimmed || ' ', size: 18 })],
      spacing: { after: trimmed ? 60 : 20 },
    });
  });

  return [ueberschrift1('2. KI-Zusammenfassung'), ...paragraphs];
}

function buildDetailergebnisse(antworten: ChecklisteAntwortRow[]): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [ueberschrift1('3. Detailergebnisse')];

  const abschnitte = [...new Set(antworten.map((a) => a.abschnitt))];

  for (const abschnitt of abschnitte) {
    const gruppenAntworten = antworten.filter((a) => a.abschnitt === abschnitt);

    result.push(ueberschrift2(abschnitt));

    const kopfRow = new TableRow({
      children: [
        tabellenKopfZelle('#'),
        tabellenKopfZelle('Frage'),
        tabellenKopfZelle('Bewertung'),
        tabellenKopfZelle('Kommentar'),
      ],
      tableHeader: true,
    });

    const datenRows = gruppenAntworten.map((a, idx) => {
      const { bg } = bewertungFarbe(a.bewertung);
      const zeilenbg = a.bewertung === 'instabil' ? FARBE_ROT_BG : undefined;

      return new TableRow({
        children: [
          einfacheZelle(String(idx + 1), { align: AlignmentType.CENTER, bg: zeilenbg }),
          einfacheZelle(a.frageText, { bg: zeilenbg }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: bewertungLabel(a.bewertung),
                    bold: true,
                    color: bewertungFarbe(a.bewertung).text,
                    size: 18,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { type: ShadingType.SOLID, color: bg },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
            },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
          }),
          einfacheZelle(a.kommentar ?? '–', { bg: zeilenbg }),
        ],
      });
    });

    result.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [kopfRow, ...datenRows],
        columnWidths: [500, 4500, 1500, 3000],
      })
    );
    result.push(abstandParagraph());
  }

  return result;
}

function buildFindingsUebersicht(antworten: ChecklisteAntwortRow[]): (Paragraph | Table)[] {
  const findings = antworten.filter(
    (a) => a.bewertung === 'instabil' || a.bewertung === 'eingeschraenkt'
  );

  if (findings.length === 0) {
    return [
      ueberschrift1('4. Findings-Übersicht'),
      new Paragraph({
        children: [
          new TextRun({
            text: '✓ Keine kritischen oder eingeschränkten Findings identifiziert.',
            color: FARBE_GRUEN,
            bold: true,
          }),
        ],
        spacing: { before: 160 },
      }),
    ];
  }

  const kopfRow = new TableRow({
    children: [
      tabellenKopfZelle('Nr.'),
      tabellenKopfZelle('Abschnitt'),
      tabellenKopfZelle('Finding'),
      tabellenKopfZelle('Bewertung'),
      tabellenKopfZelle('Kommentar'),
    ],
    tableHeader: true,
  });

  const datenRows = findings.map((a, idx) => {
    const { bg, text: textFarbe } = bewertungFarbe(a.bewertung);
    return new TableRow({
      children: [
        einfacheZelle(String(idx + 1), { align: AlignmentType.CENTER }),
        einfacheZelle(a.abschnitt, { bold: true }),
        einfacheZelle(a.frageText),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: bewertungLabel(a.bewertung), bold: true, color: textFarbe, size: 18 }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: { type: ShadingType.SOLID, color: bg },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
          },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
        }),
        einfacheZelle(a.kommentar ?? '–'),
      ],
    });
  });

  return [
    ueberschrift1('4. Findings-Übersicht'),
    new Paragraph({
      children: [
        new TextRun({
          text: `${findings.length} Finding${findings.length !== 1 ? 's' : ''} identifiziert`,
          bold: true,
          color: findings.some((f) => f.bewertung === 'instabil') ? FARBE_ROT : FARBE_GELB,
          size: 20,
        }),
      ],
      spacing: { before: 160, after: 160 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [kopfRow, ...datenRows],
      columnWidths: [500, 2000, 4000, 1500, 2000],
    }),
  ];
}

export async function generiereWordExport(
  data: ChecklisteExportData
): Promise<Buffer> {
  const deckblatt = buildDeckblatt(data);
  const gesamtbewertung = buildGesamtbewertung(data);
  const kiZusammenfassung = buildKiZusammenfassung(data.kiZusammenfassung);
  const detailergebnisse = buildDetailergebnisse(data.antworten);
  const findingsUebersicht = buildFindingsUebersicht(data.antworten);

  const exportDatum = new Date().toLocaleDateString('de-DE');

  const doc = new Document({
    creator: 'LPM Manager – JW Safety & Security',
    title: `${data.run.anlageId} – ${data.run.anlageName}`,
    description: 'Loss Prevention Management Audit Report',
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: { font: 'Calibri', size: 20 },
        },
      ],
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `LPM Audit: ${data.run.anlageId} – ${data.mandant.name}`,
                    color: FARBE_GRAU,
                    size: 16,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
                border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'e2e8f0' } },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Erstellt mit LPM Manager  |  JW Safety & Security  |  ${exportDatum}`,
                    color: FARBE_GRAU,
                    size: 16,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'e2e8f0' } },
              }),
            ],
          }),
        },
        children: [
          ...deckblatt,
          ...gesamtbewertung,
          new Paragraph({ children: [new PageBreak()] }),
          ...kiZusammenfassung,
          new Paragraph({ children: [new PageBreak()] }),
          ...detailergebnisse,
          new Paragraph({ children: [new PageBreak()] }),
          ...findingsUebersicht,
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
