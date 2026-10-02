export interface Paragraph {
  lead: string | null; // a leading rule number such as "4.11", shown as a bold run-in
  text: string;
}

const LEAD = /^(\d{1,2}\.\d{1,3}(?:\.[A-Z0-9]{1,2})?)\s+([\s\S]*)$/;
const LONG = 600; // paragraphs up to this length are left alone
const TARGET = 420; // longer ones are re-wrapped into pieces of about this size

/** Sentence pieces; a full stop inside a token such as "e.g." or "U.S." is not a sentence end. */
function sentences(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  const re = /[.!?]\s+(?=[A-Z(])/g;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const end = m.index + 1;
    const token = text.slice(start, end).split(/\s+/).pop() ?? '';
    if (/[A-Za-z]\.[A-Za-z]/.test(token)) continue;
    out.push(text.slice(start, end));
    start = m.index + m[0].length;
  }
  out.push(text.slice(start));
  return out.map((s) => s.trim()).filter(Boolean);
}

function wrap(text: string): string[] {
  if (text.length <= LONG) return [text];
  const out: string[] = [];
  let current = '';
  for (const s of sentences(text)) {
    if (current && current.length + s.length + 1 > TARGET) {
      out.push(current);
      current = s;
    } else {
      current = current ? `${current} ${s}` : s;
    }
  }
  if (current) out.push(current);
  return out;
}

export function toParagraphs(text: string): Paragraph[] {
  const out: Paragraph[] = [];
  for (const raw of text.split(/\n+/)) {
    const flat = raw.replace(/\s+/g, ' ').trim();
    if (!flat) continue;
    wrap(flat).forEach((piece, i) => {
      const m = i === 0 ? LEAD.exec(piece) : null;
      out.push(m ? { lead: m[1], text: m[2] } : { lead: null, text: piece });
    });
  }
  return out;
}

/** Drops a run-in lead that merely repeats the section id already shown as the eyebrow. */
export function dropLead(paragraphs: Paragraph[], sectionId: string): Paragraph[] {
  return paragraphs.map((p) => (p.lead === sectionId ? { ...p, lead: null } : p));
}
