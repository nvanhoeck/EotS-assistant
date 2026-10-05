import type { Reminder, Step } from '../types';

export type MoveKind = 'ground' | 'groundTransport' | 'amphibious' | 'naval' | 'air';

export interface MoveInput {
  kind: MoveKind;
  /** The Operations value of the card (1, 2 or 3), or the Logistics value if an event replaces it. */
  ocValue: number;
  /** Air units: the printed range, or the extended range if you use it. */
  airRange?: number;
  /**
   * Naval: port to port. Strategic ground transport: starting in a friendly port. Air: strategic air transport.
   * It has no effect on a plain ground move or an amphibious assault.
   */
  strategic?: boolean;
}

export interface MoveResult {
  /** Movement points (ground), hexes (naval) or total hexes over all legs (air). */
  points: number;
  legs?: number;
  legLength?: number;
  steps: Step[];
}

const s = (text: string, ...cite: string[]): Step => ({ text, cite });

export function movementAllowance(i: MoveInput): MoveResult {
  if (!Number.isInteger(i.ocValue) || i.ocValue < 1 || i.ocValue > 3) throw new RangeError('the OC value must be 1, 2 or 3');
  const oc = i.ocValue;

  switch (i.kind) {
    case 'ground':
      return {
        points: oc,
        steps: [
          s(`A ground unit has ${oc} movement point${oc === 1 ? '' : 's'}: base 1 times the OC value.`, '5.11', '7.11'),
          s('Terrain costs per land hex entered: open terrain 1 point, a mountain hex 3 points, all other terrain 2 points. A unit cannot enter a hex it lacks the points for. Entering a hex with no enemy units along a transport route costs half a movement point.', '7.41'),
          s('A ground unit must stop on entering a hex with enemy land or air units or an enemy HQ. Enemy naval units do not stop it.', '7.41'),
        ],
      };
    case 'naval': {
      const points = 5 * oc * (i.strategic ? 2 : 1);
      const steps = [s(`A naval unit moves ${points} hexes: base 5 times the OC value${i.strategic ? ', doubled for strategic naval movement' : ''}. It spends 1 point per hex entered.`, '5.11', '7.21')];
      if (i.strategic) {
        steps.push(s('Strategic naval movement is port to port only. The unit cannot enter a battle or an un-neutralized opposing air ZOI.', '7.23'));
      }
      return { points, steps };
    }
    case 'amphibious':
      return {
        points: 5 * oc,
        steps: [
          s(`An amphibious assault moves like a naval unit: ${5 * oc} hexes. It never doubles, even if it ends in a friendly port.`, '7.45'),
          s('It needs Amphibious Shipping Points, cannot enter or leave an un-neutralized opposing air ZOI, and cannot enter or leave a hex with an opposing naval unit unless it moves with a friendly naval unit all the way.', '7.45'),
        ],
      };
    case 'groundTransport': {
      const points = 5 * oc * (i.strategic ? 2 : 1);
      return {
        points,
        steps: [
          s(`Strategic ground transport covers the distance a friendly naval unit may move in this offensive: ${points} hexes${i.strategic ? ' (doubled because the unit starts in a friendly port)' : ''}.`, '7.44'),
          s('It must end in a friendly port, never enter an un-neutralized opposing air ZOI or a battle hex, and cannot be combined with other movement in the same offensive. It uses no ASPs.', '7.44'),
        ],
      };
    }
    case 'air': {
      if (!Number.isInteger(i.airRange) || (i.airRange as number) < 1) throw new RangeError('an air unit needs a range of 1 or more');
      const range = i.airRange as number;
      const legs = oc * (i.strategic ? 2 : 1);
      const steps = [
        s(`An air unit flies up to ${legs} leg${legs === 1 ? '' : 's'} of ${range} hexes or fewer: ${legs * range} hexes in all.`, '5.11', '7.31'),
        s('Every leg must start and end at a friendly airfield (the first may start from a battle hex). If you use a parenthetical extended range, the unit cannot take part in a battle.', '5.11', '7.31'),
      ];
      if (i.strategic) {
        steps.push(s('Strategic air transport: it must land at an airfield after each leg, never enter an un-neutralized opposing air ZOI, and cannot be used in a battle during that offensive.', '7.33'));
      }
      return { points: legs * range, legs, legLength: range, steps };
    }
  }
}

export type AspSize = 'division' | 'corps' | 'koreanArmy';

/** 7.45 A: ASPs needed for one ground unit to conduct an amphibious assault. */
export function aspCost(i: { size: AspSize; full: boolean }): number {
  if (i.size === 'division') return 1;
  const steps = i.full ? 2 : 1;
  return i.size === 'koreanArmy' ? steps * 2 : steps;
}

export const movementReminders: Reminder[] = [
  {
    id: 'mov-stacking',
    pages: ['movement#stacking'],
    text: 'Stacking is checked at the end of every Strategy card play: at most 3 friendly air and/or ground units per hex, and 6 naval units outside an offensive or battle. Excess units are removed, air units first.',
    condition: 'After every card play.',
    cite: ['7.34', '7.48', '7.24'],
    status: () => 'unknown',
  },
  {
    id: 'mov-asp',
    pages: ['movement#amphibious'],
    text: 'Each Amphibious Shipping Point can be used once per turn: record it on the Strategic Record. In Reaction, no more than one ASP may be used.',
    condition: 'Whenever a ground unit conducts an amphibious assault.',
    cite: ['7.45'],
    status: () => 'unknown',
  },
];
