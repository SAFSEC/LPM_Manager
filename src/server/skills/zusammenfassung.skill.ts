export interface Finding {
  abschnitt: string;
  frage: string;
  bewertung: string;
  kommentar?: string;
}

export interface ZusammenfassungInput {
  anlage_id: string;
  anlage_name: string;
  findings: Finding[];
  gesamtbewertung: string;
  mandant_pseudonym: string;
}

export function zusammenfassungSkill(input: ZusammenfassungInput): string {
  const findingLines = input.findings
    .map(
      (f) =>
        `- [${f.bewertung.toUpperCase()}] ${f.abschnitt}: ${f.frage}${f.kommentar ? ` (Kommentar: ${f.kommentar})` : ''}`
    )
    .join('\n');

  return `Erstelle eine professionelle Management-Zusammenfassung für folgende LPM-Prüfung:

ANLAGE: ${input.anlage_id} – ${input.anlage_name}
MANDANT: ${input.mandant_pseudonym}
GESAMTBEWERTUNG: ${input.gesamtbewertung}

FINDINGS (${input.findings.length} identifizierte Schwachstellen):
${findingLines}

Erstelle:
1. Management-Zusammenfassung (3–5 Sätze, Führungsebene)
2. Priorisierte Handlungsempfehlungen (nach Dringlichkeit)
3. Positiv-Fazit (was funktioniert bereits gut)

Ton: professionell, sachlich, lösungsorientiert.`.trim();
}
