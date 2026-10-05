import type React from 'react';
import { Attrition } from './pages/Attrition';
import { EndOfTurn } from './pages/EndOfTurn';
import { NationalChina, NationalIndia, NationalUs } from './pages/NationalTopics';
import { NationalStatus } from './pages/NationalStatus';
import { Battle } from './pages/Battle';
import { Movement } from './pages/Movement';
import { Offensives } from './pages/Offensives';
import { Initiative } from './pages/Initiative';
import { Reinforcements } from './pages/Reinforcements';
import { Replacements } from './pages/Replacements';
import { StrategicWarfare } from './pages/StrategicWarfare';
import { StrategyCards } from './pages/StrategyCards';
import { Supply } from './pages/Supply';
import { WarInEurope } from './pages/WarInEurope';
import { UsPoliticalWill } from './pages/UsPoliticalWill';

/** Page id -> screen. A registered page without a screen falls back to Home in HelperScreen. */
export const SCREENS: Record<string, React.ComponentType> = {
  reinforcements: Reinforcements,
  replacements: Replacements,
  initiative: Initiative,
  attrition: Attrition,
  offensives: Offensives,
  movement: Movement,
  battle: Battle,
  'end-of-turn': EndOfTurn,
  supply: Supply,
  'national-status': NationalStatus,
  'war-in-europe': WarInEurope,
  'national-china': NationalChina,
  'national-india': NationalIndia,
  'national-us': NationalUs,
  'strategy-cards': StrategyCards,
  'strategic-warfare': StrategicWarfare,
  'us-political-will': UsPoliticalWill,
};
