import type { Reminder } from '../types';

export const nationalTopicReminders: Reminder[] = [
  {
    id: 'china-oc',
    pages: ['national-china#offensives', 'national-status#china'],
    text: 'Japan can conduct a China OC Offensive (playing a 3 OC card) no more than once per two turns: on any game turn, but not on consecutive game turns. There is no limit on China Offensive Event cards.',
    condition: 'China has not surrendered, and Japan did not conduct a China OC Offensive last game turn.',
    cite: ['13.72'],
    status: (ctx) => (ctx.surrendered.includes('china') ? 'notNow' : 'unknown'),
    detail: (ctx) => (ctx.surrendered.includes('china') ? 'China has surrendered.' : undefined),
  },
  {
    id: 'india-stability',
    pages: ['national-india#stability', 'national-status#india'],
    text: 'At each National Status segment: Japan controlling all of Northern India moves the India marker one box (Stable, Unrest, Strikes, Unstable, Revolts). Allied control of any part of Northern India moves it back to Stable. In Revolts at a National Status segment: India surrenders.',
    condition: 'Every National Status segment, while India has not surrendered.',
    cite: ['13.62'],
    status: (ctx) => (ctx.surrendered.includes('india') ? 'notNow' : 'unknown'),
    detail: (ctx) => (ctx.surrendered.includes('india') ? 'India has surrendered and cannot come back into the war.' : undefined),
  },
  {
    id: 'isr-us',
    pages: ['national-us#isr-us'],
    text: 'While US Inter-Service Rivalry is in effect: all US Army/Air Corps reinforcements are automatically delayed, every diverted-to-Europe die roll gets −1, and an HQ cannot activate both US Army and US Navy units in the same offensive or reaction.',
    condition: 'The US Inter-Service Rivalry marker is on its Rivalry side.',
    cite: ['14.1'],
    status: () => 'unknown',
  },
  {
    id: 'isr-japan',
    pages: ['national-us#isr-japan'],
    text: 'While Japanese Inter-Service Rivalry is in effect: an HQ cannot activate both army and naval units in the same offensive or reaction, and Japan can use only half (rounded up) of its Amphibious Shipping Points.',
    condition: 'The Japanese Inter-Service Rivalry marker is on its Rivalry side.',
    cite: ['14.2'],
    status: () => 'unknown',
  },
];
