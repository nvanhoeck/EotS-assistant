import type React from 'react';
import { Reinforcements } from './pages/Reinforcements';
import { Replacements } from './pages/Replacements';
import { StrategicWarfare } from './pages/StrategicWarfare';
import { StrategyCards } from './pages/StrategyCards';
import { UsPoliticalWill } from './pages/UsPoliticalWill';

/** Page id -> screen. A registered page without a screen falls back to Home in HelperScreen. */
export const SCREENS: Record<string, React.ComponentType> = {
  reinforcements: Reinforcements,
  replacements: Replacements,
  'strategy-cards': StrategyCards,
  'strategic-warfare': StrategicWarfare,
  'us-political-will': UsPoliticalWill,
};
