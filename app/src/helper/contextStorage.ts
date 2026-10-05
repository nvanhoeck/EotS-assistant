import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseContext } from './context';
import type { GameContext } from './types';

const KEY = 'eots.gameContext';

export async function loadContext(): Promise<GameContext> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return parseContext(raw ? JSON.parse(raw) : null);
  } catch {
    return parseContext(null);
  }
}

export async function saveContext(ctx: GameContext): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ctx));
  } catch {
    // the helper still works for this session without persistence
  }
}
