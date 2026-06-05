export interface ErklaerungInput {
  kapitel_oder_anlage: string;
  kontext?: string;
  tiefe: 'kurz' | 'ausfuehrlich';
}

export function erklaerungSkill(input: ErklaerungInput): string {
  return `Erkläre den folgenden Abschnitt aus dem Buch "Loss Prevention Management und das Insider-Risiko":

ABSCHNITT: ${input.kapitel_oder_anlage}
TIEFE: ${input.tiefe === 'kurz' ? 'Kurze Zusammenfassung (3–5 Sätze)' : 'Ausführliche Erklärung mit Praxisbezug'}
${input.kontext ? `KONTEXT: ${input.kontext}` : ''}

Antworte strukturiert und praxisnah.`.trim();
}
