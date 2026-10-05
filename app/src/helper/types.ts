export type NationId = 'australia' | 'burma' | 'china' | 'dei' | 'india' | 'malaya' | 'philippines';

export const NATIONS: { id: NationId; label: string }[] = [
  { id: 'australia', label: 'Australia' },
  { id: 'burma', label: 'Burma' },
  { id: 'china', label: 'China' },
  { id: 'dei', label: 'Dutch East Indies' },
  { id: 'india', label: 'India' },
  { id: 'malaya', label: 'Malaya' },
  { id: 'philippines', label: 'Philippines' },
];

export type UsedFlag = 'alaskaScored' | 'hawaiiScored' | 'resourcePwScored';

export const USED_FLAGS: { id: UsedFlag; label: string }[] = [
  { id: 'alaskaScored', label: 'Alaska occupation already scored (16.42)' },
  { id: 'hawaiiScored', label: 'Hawaii occupation already scored (16.42)' },
  { id: 'resourcePwScored', label: 'Resource-hex +3 already scored (16.43 A)' },
];

export type WieLevel = 0 | 1 | 2 | 3 | 4;

/** Everything is optional: an unset field means "not known", never "zero". */
export interface GameContext {
  turn?: number;
  wieLevel?: WieLevel;
  surrendered: NationId[];
  used: UsedFlag[];
  japanResourceHexes?: number;
  /** Allied ASPs available at the end of this turn's Reinforcement segment. */
  alliedAsps?: number;
  /** Net Japanese hexes captured and retained by the Allies this turn. */
  capturedNet?: number;
}

export type Status = 'applies' | 'notNow' | 'unknown';

export interface Reminder {
  id: string;
  /** Page keys: "pageId" or "pageId#sectionKey". */
  pages: string[];
  text: string;
  /** The condition in words; always shown, so nothing depends on the context being right. */
  condition: string;
  cite: string[];
  /** Helper page ids to link to. */
  links?: string[];
  status(ctx: GameContext): Status;
  /** Extra line, for example the reason for "notNow" or a computed number. */
  detail?(ctx: GameContext): string | undefined;
}

export interface ReminderItem {
  reminder: Reminder;
  status: Status;
  detail?: string;
}

export interface Statement {
  text: string;
  cite?: string[];
  links?: string[];
}

export interface Section {
  key: string;
  title: string;
  statements: Statement[];
}

export interface Step {
  text: string;
  cite: string[];
}
