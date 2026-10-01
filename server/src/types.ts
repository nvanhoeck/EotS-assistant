export interface RuleBlock {
  id: string; // e.g. "4.11"
  heading: boolean; // standalone heading line (e.g. "4.1 The Strategic Phase")
  title: string | null; // only for headings
  page: number; // 1-based PDF page where the block starts
  pageEnd: number;
  text: string; // full block text including the leading id
}

export interface Chunk {
  id: string; // unique: "4.11", "4.11#1" (split part), "4.11~2" (duplicate section id)
  sectionId: string; // rule number, e.g. "4.11"
  label: string; // "4.1 The Strategic Phase" or "4.11 Reinforcement Segment Each player"
  headingPath: string[]; // ancestor headings, e.g. ["4.0 Sequence of Play", "4.1 The Strategic Phase"]
  pageStart: number;
  pageEnd: number;
  text: string;
  crossRefs: string[]; // known section ids referenced in the text
  conditionals: string[]; // sentences with if/unless/except/only/...
  part: number; // 0 unless the block was split
  summary?: string; // one-line extract for outlines; "" for heading-only blocks (older chunks.json: absent)
}

export interface Citation {
  sectionId: string;
  label: string;
  headingPath: string[];
  pageStart: number;
  pageEnd: number;
  quote: string; // verified exact quote, or "" when unverified
  verified: boolean;
  text: string; // full chunk text for the source viewer
}

export interface ClarifyQuestion {
  text: string;
  options: string[]; // always ends with "Not sure"
  sourceSectionId: string;
}

export interface ClarifyResult {
  type: 'clarify';
  pendingId: string;
  questions: ClarifyQuestion[];
}

export interface AnswerResult {
  type: 'answer';
  answer: string;
  steps: string[];
  assumptions: string[];
  citations: Citation[];
  unverified: number;
}

export interface NotFoundResult {
  type: 'not_found';
  nearest: Citation[];
}

export type AskResult = ClarifyResult | AnswerResult | NotFoundResult;

export const NOT_SURE = 'Not sure';
