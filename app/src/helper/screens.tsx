import type React from 'react';
import { Reinforcements } from './pages/Reinforcements';
import { StrategicWarfare } from './pages/StrategicWarfare';
import { UsPoliticalWill } from './pages/UsPoliticalWill';

/** Page id -> screen. A registered page without a screen falls back to Home in HelperScreen. */
export const SCREENS: Record<string, React.ComponentType> = {
  reinforcements: Reinforcements,
  'strategic-warfare': StrategicWarfare,
  'us-political-will': UsPoliticalWill,
};
