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
  Footer,
  Header,
} from 'docx';
import type { FormularExportData } from '../formulare/types';
import type { FeldDefinition } from '../formulare/types';

const FARBE_BLAU = '1e3a5f';
const FARBE_GOLD = 'd4a017';
const FARBE_KOPF_BG = '1e3a5f';
const FARBE_KOPF_TEXT = 'FFFFFF';
const FARBE_ZEILE_BG = 'f8fafc';
const FARBE_ZEILE_ALT = 'FFFFFF';

function formatDatum(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function feldWertAnzeigen(_feld: FeldDefinition, wert: string | undefined): string {
  if (!wert) return '–';
  return wert;
}

function noBorder() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };
}

function thinBorder() {
  return {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'e2e8f0' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'e2e8f0' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };
}

function abstandParagraph(after = 200): Paragraph {
  return new Paragraph({ children: [], spacing: { after } });
}

function abschnittsUeberschrift(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 160 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: FARBE_GOLD },
    },
    children: [new TextRun({ text, bold: true, color: FARBE_BLAU, size: 22 })],
  });
}

function feldZeile(label: string, wert: string, index: number): TableRow {
  const bg = index % 2 === 0 ? FARBE_ZEILE_BG : FARBE_ZEILE_ALT;
  return new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, bold: true, size: 18, color: '475569' })],
          }),
        ],
        width: { size: 35, type: WidthType.PERCENTAGE },
        borders: thinBorder(),
        shading: { type: ShadingType.SOLID, color: bg },
        margins: { top: 80, bottom: 80, left: 120, right: 80 },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: wert || '–', size: 18, color: '1e293b' })],
          }),
        ],
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: thinBorder(),
        shading: { type: ShadingType.SOLID, color: bg },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
      }),
    ],
  });
}

function abschnittsTabelle(felder: FeldDefinition[], werte: Record<string, string>): Table {
  const rows = felder.map((feld, i) =>
    feldZeile(feld.label, feldWertAnzeigen(feld, werte[feld.id]), i)
  );

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
  });
}

function kopfzeilenTable(mandantName: string, formularId: string, datum: string): Table {
  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'JW Safety & Security', bold: true, size: 20, color: FARBE_KOPF_TEXT })],
              }),
              new Paragraph({
                children: [new TextRun({ text: 'Loss Prevention Management', size: 16, color: 'cbd5e1' })],
                spacing: { before: 40 },
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: FARBE_KOPF_BG },
            borders: noBorder(),
            margins: { top: 120, bottom: 120, left: 160, right: 80 },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: mandantName, bold: true, size: 18, color: FARBE_KOPF_TEXT })],
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({
                children: [new TextRun({ text: `${formularId} · ${datum}`, size: 16, color: 'cbd5e1' })],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 40 },
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: FARBE_KOPF_BG },
            borders: noBorder(),
            margins: { top: 120, bottom: 120, left: 80, right: 160 },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE, size: 0, color: 'auto' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' }, left: { style: BorderStyle.NONE, size: 0, color: 'auto' }, right: { style: BorderStyle.NONE, size: 0, color: 'auto' } },
  });
}

export async function generiereFormularWordExport(data: FormularExportData): Promise<Buffer> {
  const { mandantName, mandantStandort, formularDefinition, felder, erstelltAm } = data;
  const datumFormatiert = formatDatum(erstelltAm);

  const gruppenMap = new Map<string, FeldDefinition[]>();
  for (const feld of formularDefinition.felder) {
    const gruppe = feld.gruppe ?? 'Allgemein';
    if (!gruppenMap.has(gruppe)) {
      gruppenMap.set(gruppe, []);
    }
    gruppenMap.get(gruppe)!.push(feld);
  }

  const inhaltBlöcke: (Paragraph | Table)[] = [];

  inhaltBlöcke.push(kopfzeilenTable(mandantName, formularDefinition.formularId, datumFormatiert));
  inhaltBlöcke.push(abstandParagraph(400));

  inhaltBlöcke.push(
    new Paragraph({
      children: [
        new TextRun({ text: formularDefinition.formularId, bold: true, size: 32, color: FARBE_GOLD }),
        new TextRun({ text: '  ', size: 32 }),
        new TextRun({ text: '–  ' + formularDefinition.name, bold: true, size: 32, color: FARBE_BLAU }),
      ],
      spacing: { after: 120 },
    })
  );
  inhaltBlöcke.push(
    new Paragraph({
      children: [new TextRun({ text: 'Loss Prevention Management', size: 22, color: '64748b' })],
      spacing: { after: 80 },
    })
  );
  inhaltBlöcke.push(
    new Paragraph({
      children: [new TextRun({ text: `Mandant: ${mandantName}${mandantStandort ? ` · ${mandantStandort}` : ''}`, size: 20, color: '475569' })],
      spacing: { after: 60 },
    })
  );
  inhaltBlöcke.push(
    new Paragraph({
      children: [new TextRun({ text: `Erstellt: ${datumFormatiert}`, size: 18, color: '94a3b8' })],
      spacing: { after: 400 },
    })
  );

  for (const [gruppenName, gruppenFelder] of gruppenMap.entries()) {
    const hatWerte = gruppenFelder.some((f) => felder[f.id]);
    if (!hatWerte && gruppenFelder.every((f) => !f.pflichtfeld)) {
      const alleNPflicht = true;
      if (alleNPflicht) {
        const hatIrgendwas = gruppenFelder.some((f) => felder[f.id]);
        if (!hatIrgendwas) continue;
      }
    }

    inhaltBlöcke.push(abschnittsUeberschrift(gruppenName));
    inhaltBlöcke.push(abschnittsTabelle(gruppenFelder, felder));
    inhaltBlöcke.push(abstandParagraph(280));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 20 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        headers: {
          default: new Header({ children: [] }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Erstellt mit LPM Manager  ·  JW Safety & Security  ·  ${datumFormatiert}`, size: 16, color: '94a3b8' }),
                ],
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'e2e8f0' } },
                spacing: { before: 120 },
              }),
            ],
          }),
        },
        children: inhaltBlöcke,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
