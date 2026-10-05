# Helper mode

## Goal

Add a **Helper** mode (AI | Search | **Helper**) to the mobile app. It answers "what can I do now, what must happen first, and where does it go?" during a game, without the player having to chase rules spread over several rulebook pages. It is organised by the Sequence of Play, bundles rules per topic (for example everything that moves US Political Will), and raises reminders when the player reaches the section they belong to.

Source of truth: `eotsrulesv2.0.pdf` (rules v2.0), as ingested in `server/data/chunks.json`. Informal brief: `flow-helper.md`.

## Decisions (agreed)

- **Content is written by the assistant** from the rulebook, then reviewed and corrected by the user. Every statement carries a rulebook reference (section id and page).
- **Bundled in the app, works offline.** Helper pages are paraphrased summaries (not verbatim rulebook text) shipped in the app bundle. Reference chips open the full rulebook text in the Reader when the server is reachable. The repo stays private.
- **One hand-coded screen per topic**, built from shared UI pieces. Logic lives in pure TypeScript files with no React, so it is unit-testable.
- **Light game context** (see below). Everything is optional. Nothing is hidden because the context is wrong or empty.
- Follows the rulebook where it differs from the informal brief: US Political Will +3 for Japan controlling **3 or fewer** resource hexes (16.43A), not "fewer than 3".

## Navigation

- Header toggle becomes **AI | Search | Helper**. Chat and Search state are kept when switching, as today.
- Helper has its own trail (same reducer style as `src/trail.ts`). Entries are `{ kind: 'page', id }` or `{ kind: 'section', sectionId }`. Back pops one entry (including the Android hardware back button), so five taps in means five Backs out.
- A rulebook reference chip (for example `§9.12 · p. 22`; the page numbers come from a generated `rulePages.ts`) pushes a `section` entry and shows it in the existing Reader. A `PageLink` pushes a `page` entry. Rulebook cross-references in the Reader may link to a helper page where one exists (registry lookup by section id); this is optional and can follow later.
- **Home**: the 10 segments of the Sequence of Play in order, then a **Topics** group (US Political Will; National restrictions: China, India, US). Segments not written yet show "coming soon" and are not hidden. A row shows a badge ("2 reminders") when something applies now.
- Accordion structure: home → page → accordion sections. Opening a section shows the rule statements.

## Files (`app/src/helper/`)

| Path | Purpose |
| --- | --- |
| `registry.ts` | Page registry: id → title, parent, group, screen. Sequence-of-play list and topic list. Section-id → helper-page lookup. |
| `context.ts` | `GameContext` type, defaults, reducer, validation (pure). |
| `contextStorage.ts` | Load/save the context with the existing storage module style (try/catch around every access). |
| `reminders.ts` | `Reminder` type, `Status` type, `activeReminders(page, ctx)` and badge counts (pure). |
| `logic/reinforcement.ts` | `checkReinforcement(answers, ctx)` (pure). |
| `logic/strategicWarfare.ts` | Japanese draw calculation, strategic warfare reminders (pure). |
| `logic/politicalWill.ts` | The list of US Political Will triggers, reminders, Progress of the War status (pure). |
| `pages/*.tsx` | One screen per topic: `Home`, `Reinforcements`, `StrategicWarfare`, `UsPoliticalWill`, later the rest. |
| `ui/*.tsx` | `Accordion`, `RuleRef`, `PageLink`, `ReminderBanner`, `ChoiceForm`, `VerdictCard`, `ContextBar`, `ContextEditor`. |

Screens only render. They call the logic files and the reminders module.

## Game context

Stored on the phone. Optional fields. A **Reset game** button clears it.

| Field | Meaning | Used by |
| --- | --- | --- |
| `turn` (1..) | current game turn | all turn-dependent reminders, Japanese strategic reserves (11.12), Allied draw (11.51), Progress of the War (from turn 4) |
| `wieLevel` (0..4) | War in Europe level (0 = no effect) | delayed reinforcements (9.21), Sent to Europe range (9.24), Allied draw limit at level 4 (11.52) |
| `surrendered` (set of nation ids) | Australia, Burma, China, Dutch East Indies, India, Malaya, Philippines | Allied draw limits (11.52), recapture note (16.41) |
| `used` (set of flags) | `alaskaScored`, `hawaiiScored`, `resourcePwScored` | greys out "once per game" reminders (16.42, 16.43A) |
| `japanResourceHexes` (0..14) | Japanese-controlled resource hexes (the 14 are listed in 11.11) | 16.43A reminder, base Japanese draw (11.11) |
| `alliedAsps` (0..) | Allied ASPs available at the end of the Reinforcement segment (this turn) | Progress of the War target |
| `capturedNet` (integer) | net Japanese hexes captured and retained by the Allies this turn | Progress of the War countdown |

A **Next turn** button increments `turn` and resets the per-turn fields (`alliedAsps`, `capturedNet`). A **ContextBar** at the top of every helper page summarises the context ("Turn 6 · W.I.E. 2 · Japan 3 res. · PotW 1 of 3"). Tapping opens the `ContextEditor`.

This is deliberately not a game tracker: no US Political Will total, no ASP bookkeeping beyond the one per-turn number, no unit positions.

## Reminders

A reminder is a typed object:

```ts
interface Reminder {
  id: string;
  pages: string[];              // page ids, or "pageId#sectionKey" for an accordion section
  text: string;                 // short, imperative, rule-accurate
  condition: string;            // the condition written in words, always shown
  cite: string[];               // rulebook section ids
  links?: string[];             // helper page ids
  status(ctx: GameContext): 'applies' | 'notNow' | 'unknown';
  reason?(ctx: GameContext): string;   // why it is "notNow"
}
```

- **applies**: highlighted, expanded, listed in the page's `ReminderBanner`.
- **notNow**: greyed and collapsed, with the reason ("Turns 5–12 only; it is turn 3", "Already scored this game").
- **unknown** (the needed context field is unset): shown normally with the condition in words.
- Reminders are never hidden. They are shown when the page opens and again when their accordion section is opened.

### Initial reminders

| Id | Page(s) | Text | Status rule |
| --- | --- | --- | --- |
| `pw-resource` | StrategicWarfare, UsPoliticalWill | Turns 5–12: Japan controls 3 or fewer resource hexes → US Political Will +3. Once per game. (16.43A) | applies if turn ∈ [5,12] ∧ `japanResourceHexes` ≤ 3 ∧ ¬`resourcePwScored`; notNow if turn out of range or already scored; unknown if turn or hex count unset |
| `pw-bombing` | StrategicWarfare, UsPoliticalWill | US Strategic Bombing cut the Japanese draw by one or more → PW one box right, even if already at the minimum. Max once per turn. (16.43B, 11.32) | unknown (depends on this turn's rolls); notNow before turn 9 (first B-29 arrives turn 9, 11.31) |
| `pw-progress` | Reinforcements (end), UsPoliticalWill, Home badge | From turn 4: capture and retain Japanese hexes (named location, resource, port or airfield) equal to the smaller of 4 and your ASPs after the Reinforcement segment, or PW −1. Note your ASPs now. (16.47) | applies if turn ≥ 4; notNow before turn 4; shows the countdown when `alliedAsps` and `capturedNet` are set |
| `pw-alaska`, `pw-hawaii` | UsPoliticalWill | Japanese unit continuously in the Aleutians (hexes 4600–5100) for 3 consecutive PW segments / in Hawaii or Midway (5708, 5808, 5908, 5108) for 2 → PW −1, once per game each. (16.42) | notNow if the flag is used; otherwise unknown |
| `pw-casualties` | UsPoliticalWill | Allied offensive wipes out the whole ground attacking force including at least one US division/corps that can receive replacements → PW −1, max once per turn. (16.45) | unknown |
| `pw-navy` | UsPoliticalWill | End of turn: no US carriers on the map → PW −1; also no US naval units of any type → another −1. (16.46) | unknown |
| `reinf-delay` | Reinforcements | Allied player: first release units in the Delay box, then check W.I.E. / events / Inter-Service Rivalry for delaying this turn's reinforcements. (9.21) | applies if `wieLevel` ≥ 1; unknown if unset |
| `sw-japan-draw` | StrategicWarfare | Japanese base draw: one card per 2 resource hexes rounded up; turns 2–4 always 7; minimum 4. (11.11, 11.12, 11.4) | applies once `japanResourceHexes` or turn set (shows the computed base draw) |

More reminders are added as further segments are written.

## Pilot pages

### Reinforcements (Sequence of Play: Reinforcement Segment)

1. **Reinforcement helper**: the form (below).
2. **Who can be placed where**: accordions for Ground, Naval, Air and HQ.
3. **General restrictions**.
4. **Placement of reinforcements and ZOI**.
5. **National restrictions**: Chinese units; Allied delayed reinforcements (Sent to Europe).
6. Reminders banner (includes `pw-progress` ASP note).

#### Form

One question at a time, only the ones relevant after earlier answers, with a back step. Every question except Side and Unit class (the player always knows what is in their hand) has a **Not sure** answer; the result then lists the outcomes that depend on it.

1. Side: Allied / Japanese.
2. Unit class: Ground / Naval / Air / HQ.
3. Allied only: nationality and type: US Army, US Marine, US naval (carrier / CVE / other), Commonwealth, B-29, Chinese.
4. Allied only: reinforcements being delayed this turn? (W.I.E. level from the context; plus event or Inter-Service Rivalry delay yes/no.)

`checkReinforcement(answers, ctx)` returns:

```ts
{
  verdict: 'place' | 'delay' | 'cannotDelay' | 'depends',
  doFirst: Step[],        // ordered
  where: Placement[],     // alternatives when "Not sure"
  restrictions: string[],
  mapChecks: string[],    // conditions only the player can judge on the board
  because: { text: string; cite: string }[],
}
```

Behaviour to implement and test (all from section 9):

- Allied places all reinforcements before the Japanese (9.11). Delayed units are released first (9.21).
- Ground or naval → friendly supply-eligible **port** within Activation Range of an HQ that can activate the unit. Air → friendly supply-eligible **airfield**. Never in an un-neutralized enemy ZOI. HQ must have started the turn on the map. A reinforcement cannot alter enemy ZOI to allow other placements; stacking and placement limits apply. (9.11)
- An arriving HQ is placed in a friendly supply-eligible port and can place reinforcements only in its own hex. (9.11)
- US ground and naval → range of US or Joint HQs. US air → range of any friendly HQ. Commonwealth → Commonwealth or Joint HQs. A Chinese unit placed as a reinforcement → Kunming (2407) only. (9.12)
- Joint HQs include ANZAC and ABDA; US HQs include Central, South, Southwest; Commonwealth HQs include Malaya and SEAC. (9.12)
- Japanese: any HQ for any unit (9.13). Never delayed or diverted (4.11). Voluntary delay only when there is no usable point of entry (9.14).
- Allied W.I.E. at level 1 or higher, or an event or Inter-Service Rivalry delay → this turn's Allied reinforcements go to the Delay box. (9.21)
- HQs and US B-29 units can never be delayed. (9.23)
- Sent to Europe: eligible are US Army (blue) ground and air units (not Marines) and US CVE (not CV or CVL). A die roll is made for each eligible unit when it enters the Delay box; if it falls within the W.I.E. range (none: no roll; level 1: 0–1; level 2: 0–3; level 3: 0–5; level 4: 0–7) the unit returns 3 turns later. A unit can be sent more than once. (9.22, 9.24) **The range table must be checked against the page image of rulebook page 22 before it is relied on.**
- An Allied unit already in the Delay box is eligible for Sent to Europe each turn it remains there (9.14).
- `mapChecks` are always listed; the form never says that a specific hex is legal.

### Strategic Warfare (Sequence of Play: Strategic Warfare Segment)

Accordions: **Japanese strategy cards** (resource hexes with the 14-hex checklist, base draw, strategic reserves turns 2–4, minimum 4, passes); **Submarine warfare** (procedure and modifiers, ASP and Escort effects); **Strategic bombing** (B-29 availability, procedure, the "loses a step on a 9 unless an airfield within 3 hexes of Tokyo" rule, B-29 event cards, maximum two cards); **Allied strategy cards** (draw by turn, draw limitations 11.52, passes). Reminders: `pw-resource`, `pw-bombing`, `sw-japan-draw`, each with a PageLink to UsPoliticalWill. A small calculator shows the Japanese draw from the game context (resource hexes → base draw, minus the player-entered submarine and bombing reductions, floor 4).

### US Political Will (Topic)

One page that gathers every effect on US Political Will, grouped, each with its reference chip and reminder where relevant:

1. **Surrenders (16.41)**: table of nations and values, with the recapture rule (asterisked nations), "all nations surrendered −2". Surrender states pre-filled from the context.
2. **Occupation (16.42)**: Alaska, Hawaii.
3. **Strategic Warfare (16.43)**: `pw-resource`, `pw-bombing`.
4. **Events (16.44)**: Operation Z +8, other events per text.
5. **US casualties (16.45)**, **Strategic naval situation (16.46)**.
6. **Progress of the War (16.47)** with the countdown.
7. **War in Europe level 4 (16.48 → 15.5 E)**: PageLink placeholder until the W.I.E. page exists; reference chip to 15.5.

The segment this belongs to (National Status Segment 4.31 and US Political Will Segment 4.32) is shown at the top with a link to the Sequence of Play entry.

### Replacements (added after the pilots)

Same shape as Reinforcements: a form, then rules by topic. The form asks side, unit class, where the unit is (reduced on the map, or in the eliminated pile), the single-dot question (10.1) and, for Allied units, nationality and (for eliminated US or Commonwealth ground units) whether it is a Marine division or corps-size unit. `checkReplacement` returns a verdict (`yes` / `no` / `depends`), how many replacements the side gets, what the unit costs, the supply or placement conditions (an eliminated unit returns like a reinforcement), the map checks, and notes. The game context decides availability: no Allied ground or US naval replacements on turn 1, Chinese replacements only on odd turns while China has not surrendered, Commonwealth naval only on turns 6, 9 and 12. Reminders: `repl-lost`, `repl-allotment`, `repl-chinese`, `repl-cw-naval`, `repl-oahu`, `repl-japan-china`.

Known gaps: the Replacements Chart (scheduled naval numbers, and the step cost of returning a Japanese naval unit) is not in the extracted rule text, so the helper points at the chart instead of inventing numbers. 10.31 names only US Marine divisions and US or Commonwealth corps-size units as returning from the pile; other eliminated Allied ground units give `depends` with that wording quoted.

### Strategy Cards (added after the pilots)

One page for the Deal Strategy Cards segment (4.14) and the cards themselves (section 5). The home row is now titled **Strategy Cards**. The form asks the player's role (Offensives or Reaction), what they want to do (OC, event, discard, pass), the kind of event the card has (Military, Reaction, Resource, Political, Special) and, for a Reaction event, which of the five kinds. `checkCardPlay` returns allowed / not allowed / depends, what happens (units activated = OC value or Logistics value + HQ efficiency), conditions, what happens to the card (draw cap of 3, removal, Discard pile) and notes. Reminders: `cards-deal` (shows the Allied draw and the Japanese base draw for the current turn, using the Strategic Warfare maths), `cards-turn1`, `cards-draw-cap`, `cards-special`. The page links to Strategic Warfare, Reinforcements, Replacements and US Political Will.

Known gap: the cards themselves are not in the rulebook text, so the helper cannot say which kind a particular card is; the player picks it.

## Rollout order

1. Helper shell: toggle, trail, registry, home (with "coming soon" rows), context + reminders modules.
2. Reinforcements page and form with tests.
3. Strategic Warfare page and calculator.
4. US Political Will page and Progress of the War countdown.
5. Remaining segments follow in later iterations (user-driven).

## Testing

- Pure-function tests: context reducer and validation; reminder statuses for every reminder across set/unset/boundary contexts (turn 4/5/12/13, hexes 3/4, used flags); `checkReinforcement` table-driven over side × class × nationality × W.I.E.; Japanese draw calculator (including turns 2–4, floor 4, rounding up); Progress of the War target and countdown (the rulebook example: 3 ASPs, 5 captured, 3 retaken → target 3, net 2).
- Helper trail reducer tests, same style as `trail.test.ts`.
- **Reference integrity test**: every cited section id exists in `server/data/chunks.json`, and every PageLink target exists in the registry.
- Screens are verified manually (as for Search).

## Out of scope

Full game tracker (PW total, ASP bookkeeping, unit positions); LLM-generated helper content; verbatim rulebook text in helper pages; hex-level legality checks; segments beyond the three pilots in this iteration (they appear as "coming soon"); opening helper pages from AI citation chips.

## Open items for the user's review

- Confirm the 16.43A wording ("3 or less") and that the bundled paraphrases read accurately.
- Confirm the Sent to Europe die ranges against the printed table.
- Which segment to write next.
