export interface Citation {
  sectionId: string;
  label: string;
  headingPath: string[];
  pageStart: number;
  pageEnd: number;
  quote: string;
  verified: boolean;
  text: string;
}
export interface ClarifyQuestion {
  text: string;
  options: string[];
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
