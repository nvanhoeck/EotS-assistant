import { createContext, useContext } from 'react';
import type { ContextAction } from './context';
import type { GameContext } from './types';

export interface HelperApi {
  ctx: GameContext;
  dispatch(action: ContextAction): void;
  openPage(id: string): void;
  openSection(sectionId: string): void;
}

const HelperCtx = createContext<HelperApi | null>(null);
export const HelperProvider = HelperCtx.Provider;

export function useHelper(): HelperApi {
  const v = useContext(HelperCtx);
  if (!v) throw new Error('HelperProvider is missing');
  return v;
}
