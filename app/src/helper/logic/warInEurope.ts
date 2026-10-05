import type { Reminder, Step, WieLevel } from '../types';

const s = (text: string, ...cite: string[]): Step => ({ text, cite });

const RANGE: Record<1 | 2 | 3 | 4, string> = { 1: '0–1', 2: '0–3', 3: '0–5', 4: '0–7' };
const CITE: Record<1 | 2 | 3 | 4, string> = { 1: '15.2', 2: '15.3', 3: '15.4', 4: '15.5' };

export function effectsAt(level: WieLevel): Step[] {
  if (level === 0) return [];
  const out: Step[] = [
    s('Allied reinforcements are delayed.', CITE[level], '10.21'),
    s(`The US Sent to Europe die roll range is ${RANGE[level]}.`, CITE[level], '10.24'),
  ];
  if (level >= 3) out.push(s('The Allies lose their Amphibious Shipping Point reinforcement.', CITE[level], '10.31'));
  if (level === 4) out.push(s('The Allies draw one card fewer.', '15.5', '12.52'));
  return out;
}

export interface WieLevelDef {
  level: WieLevel;
  label: string;
  /** The printed range of the WIE track for this level. */
  track: string;
}

export const WIE_LEVELS: WieLevelDef[] = [
  { level: 0, label: 'No Effect', track: '+1 to +3' },
  { level: 1, label: 'Level 1', track: '0 to −2' },
  { level: 2, label: 'Level 2', track: '−3 to −4' },
  { level: 3, label: 'Level 3', track: '−5 to −6' },
  { level: 4, label: 'Level 4', track: '−7' },
];

/** The marker can never go above +3 or below −7 (15.7). */
export function wieLevelForTrack(track: number): WieLevel {
  const t = Math.min(3, Math.max(-7, Math.round(track)));
  if (t >= 1) return 0;
  if (t >= -2) return 1;
  if (t >= -4) return 2;
  if (t >= -6) return 3;
  return 4;
}

export const warInEuropeReminders: Reminder[] = [
  {
    id: 'wie-level',
    pages: ['war-in-europe#effects'],
    text: 'War in Europe level 1 or more delays Allied reinforcements and sets the Sent to Europe range. Levels 3 and 4 also cost the Allied ASP reinforcement, and level 4 costs a card.',
    condition: 'The War in Europe level is 1 or higher.',
    cite: ['15.2', '15.5'],
    status(ctx) {
      if (ctx.wieLevel === undefined) return 'unknown';
      return ctx.wieLevel >= 1 ? 'applies' : 'notNow';
    },
    detail(ctx) {
      if (ctx.wieLevel === undefined) return undefined;
      if (ctx.wieLevel === 0) return 'War in Europe has no effect.';
      return `Level ${ctx.wieLevel}: ${effectsAt(ctx.wieLevel).map((e) => e.text).join(' ')}`;
    },
  },
];
