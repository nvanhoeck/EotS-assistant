import React from 'react';
import { pickSections } from '../content';
import { GroupHeading, PageShell } from '../ui/PageShell';
import { RuleSection } from '../ui/RuleSection';

const PAGE = 'supply';

export function Supply() {
  const section = (keys: string[]) => pickSections(PAGE, keys).map((s) => <RuleSection key={s.key} pageId={PAGE} section={s} />);
  return (
    <PageShell title="Supply and HQ range" subtitle="Rulebook 13.0 to 13.3 and 7.5">
      <GroupHeading>Supply</GroupHeading>
      {section(['why', 'lines', 'sources', 'emergency'])}
      <GroupHeading>HQs and paths</GroupHeading>
      {section(['hq-range', 'paths'])}
    </PageShell>
  );
}
