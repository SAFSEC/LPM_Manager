export interface RisikoInput {
  findings_kritisch: number;
  findings_eingeschraenkt: number;
  findings_stabil: number;
  anlage_id: string;
  mandant_pseudonym: string;
}

export function risikoSkill(input: RisikoInput): string {
  return `Risikoeinschätzung für LPM-Audit ${input.anlage_id}:
Mandant: ${input.mandant_pseudonym}

Ergebnis:
- Kritische Findings (instabil): ${input.findings_kritisch}
- Eingeschränkte Findings: ${input.findings_eingeschraenkt}
- Stabile Bereiche: ${input.findings_stabil}

Bewerte das Gesamtrisiko (niedrig / mittel / hoch / kritisch) mit Begründung.
Empfehle die nächste Prüffrequenz (monatlich / quartalsweise / jährlich).`.trim();
}
