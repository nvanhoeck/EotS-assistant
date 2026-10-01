import { Platform, useColorScheme } from 'react-native';

export interface Palette {
  page: string; // paper
  ink: string; // body text
  muted: string; // breadcrumb, page numbers, summaries
  rule: string; // hairlines
  accent: string; // rule numbers and links
  bar: string; // top and bottom bars
}

const paper: Palette = { page: '#f6efe0', ink: '#2b2418', muted: '#8a7d66', rule: '#d9ccb0', accent: '#8a3b12', bar: '#efe6d0' };
const night: Palette = { page: '#1d1a15', ink: '#e6dcc6', muted: '#9c917b', rule: '#3a3428', accent: '#e0955c', bar: '#252118' };

/** System serif: no font dependency. */
export const serif = Platform.select({ ios: 'Georgia', default: 'serif' });

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? night : paper;
}
