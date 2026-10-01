const INTENTS: { pattern: RegExp; majors: number[] }[] = [
  { pattern: /\b(set ?up|setup|start(ing)?|deploy|scenario|initial)\b/i, majors: [2, 17] },
  { pattern: /\b(sequence of play|turn|phase|segment|next|deal|dealt|order of play)\b/i, majors: [3, 4] },
  { pattern: /\b(combat|battle|attack|defen[cd]e|retreat|hits?|air.naval|ground)\b/i, majors: [8] },
  { pattern: /\b(offensive|activate|activation|reaction|intercept|ambush|surprise|intelligence)\b/i, majors: [6] },
  { pattern: /\b(card|cards|event|operations?|oc|ec)\b/i, majors: [1, 5] },
  { pattern: /\b(mov(e|ing|ement)|stack(ing)?|zoc)\b/i, majors: [7] },
  { pattern: /\b(reinforcement|amphibious|shipping)\b/i, majors: [9] },
  { pattern: /\b(replacement|replace)\b/i, majors: [10] },
  { pattern: /\b(submarine|strategic warfare|bombing)\b/i, majors: [11] },
  { pattern: /\b(supply|attrition)\b/i, majors: [13] },
];

export function intentMajors(question: string): Set<number> {
  const out = new Set<number>();
  for (const i of INTENTS) if (i.pattern.test(question)) i.majors.forEach((m) => out.add(m));
  return out;
}

export function majorOf(sectionId: string): number {
  return Number(sectionId.split('.')[0]);
}
