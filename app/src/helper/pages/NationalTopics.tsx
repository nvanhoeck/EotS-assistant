import React from 'react';
import { pickSections } from '../content';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import { GroupHeading, PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { RuleSection } from '../ui/RuleSection';

interface Group {
  heading: string;
  keys: string[];
}

function makeTopicPage(pageId: string, title: string, subtitle: string, groups: Group[]): React.ComponentType {
  return function TopicPage() {
    const { ctx } = useHelper();
    return (
      <PageShell title={title} subtitle={subtitle}>
        <ReminderBanner items={remindersForPage(pageId, ctx)} />
        {groups.map((g) => (
          <React.Fragment key={g.heading}>
            <GroupHeading>{g.heading}</GroupHeading>
            {pickSections(pageId, g.keys).map((s) => <RuleSection key={s.key} pageId={pageId} section={s} />)}
          </React.Fragment>
        ))}
      </PageShell>
    );
  };
}

export const NationalChina = makeTopicPage('national-china', 'China', 'Everything about China, from rulebook 12.7 and the rules that refer to it', [
  { heading: 'Surrender and offensives', keys: ['surrender', 'offensives'] },
  { heading: 'On the map', keys: ['movement', 'air-box', 'supply', 'japan-strength'] },
  { heading: 'Elsewhere in the rules', keys: ['allied-effects'] },
]);

export const NationalIndia = makeTopicPage('national-india', 'India', 'Everything about India, from rulebook 12.6 and the rules that refer to it', [
  { heading: 'Territory and stability', keys: ['territory', 'stability'] },
  { heading: 'Consequences', keys: ['surrender-effects', 'units'] },
]);

export const NationalUs = makeTopicPage('national-us', 'US and Inter-Service Rivalry', 'Rulebook 14.0 and the US-specific rules from elsewhere', [
  { heading: 'Inter-Service Rivalry', keys: ['isr-general', 'isr-us', 'isr-japan'] },
  { heading: 'US units', keys: ['us-placement', 'us-replacements', 'us-pw'] },
]);
