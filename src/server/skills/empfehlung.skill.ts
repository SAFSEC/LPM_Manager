export interface EmpfehlungInput {
  finding: string;
  anlage_id: string;
  branche?: string;
}

export function empfehlungSkill(input: EmpfehlungInput): string {
  return `Auf Basis von Anlage ${input.anlage_id} aus dem Buch "Loss Prevention Management und das Insider-Risiko":

FINDING: ${input.finding}
${input.branche ? `BRANCHE: ${input.branche}` : ''}

Gib 3 konkrete, umsetzbare Maßnahmenempfehlungen.
Jede Empfehlung mit: Was tun? Warum wichtig? Referenz auf Buchmodul oder Anlage.`.trim();
}
