import { politicalWillReminders } from './logic/politicalWill';
import { offensiveReminders } from './logic/activation';
import { attritionReminders } from './logic/attrition';
import { battleReminders } from './logic/battle';
import { movementReminders } from './logic/movement';
import { endOfTurnReminders } from './logic/endOfTurn';
import { initiativeReminders } from './logic/initiative';
import { nationalTopicReminders } from './logic/nationalTopics';
import { nationalStatusReminders } from './logic/nationalStatus';
import { reinforcementReminders } from './logic/reinforcement';
import { replacementReminders } from './logic/replacement';
import { warInEuropeReminders } from './logic/warInEurope';
import { strategicWarfareReminders } from './logic/strategicWarfare';
import { strategyCardReminders } from './logic/strategyCards';
import type { GameContext, Reminder, ReminderItem, Status } from './types';

export const ALL_REMINDERS: Reminder[] = [...politicalWillReminders, ...strategicWarfareReminders, ...reinforcementReminders, ...replacementReminders, ...strategyCardReminders, ...initiativeReminders, ...attritionReminders, ...endOfTurnReminders, ...nationalStatusReminders, ...warInEuropeReminders, ...nationalTopicReminders, ...offensiveReminders, ...movementReminders, ...battleReminders];

const RANK: Record<Status, number> = { applies: 0, unknown: 1, notNow: 2 };

function collect(match: (pageKey: string) => boolean, ctx: GameContext): ReminderItem[] {
  return ALL_REMINDERS.filter((r) => r.pages.some(match))
    .map((reminder) => ({ reminder, status: reminder.status(ctx), detail: reminder.detail?.(ctx) }))
    .sort((a, b) => RANK[a.status] - RANK[b.status]);
}

/** Reminders attached to exactly "pageId" or "pageId#sectionKey". */
export function remindersFor(pageKey: string, ctx: GameContext): ReminderItem[] {
  return collect((k) => k === pageKey, ctx);
}

/** Every reminder on a page, whichever of its sections it belongs to. */
export function remindersForPage(pageId: string, ctx: GameContext): ReminderItem[] {
  return collect((k) => k === pageId || k.startsWith(`${pageId}#`), ctx);
}

export function appliesCount(pageId: string, ctx: GameContext): number {
  return remindersForPage(pageId, ctx).filter((i) => i.status === 'applies').length;
}
