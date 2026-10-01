import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SIZE_INDEX, TEXT_SIZES } from './textSize';

const URL_KEY = 'eots.serverUrl';
const SESSION_KEY = 'eots.sessionId';
const SIZE_KEY = 'eots.textSize';

export async function loadServerUrl(): Promise<string> {
  return (await AsyncStorage.getItem(URL_KEY)) ?? 'http://192.168.0.10:8787';
}
export async function saveServerUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(URL_KEY, url);
}
export async function loadSessionId(): Promise<string> {
  const existing = await AsyncStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const fresh = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(SESSION_KEY, fresh);
  return fresh;
}

export async function loadTextSize(): Promise<number> {
  const raw = await AsyncStorage.getItem(SIZE_KEY);
  if (raw == null) return DEFAULT_SIZE_INDEX;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n < TEXT_SIZES.length ? n : DEFAULT_SIZE_INDEX;
}
export async function saveTextSize(index: number): Promise<void> {
  await AsyncStorage.setItem(SIZE_KEY, String(index));
}
