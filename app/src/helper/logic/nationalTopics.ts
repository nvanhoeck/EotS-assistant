import type { Reminder } from '../types';

export const nationalTopicReminders: Reminder[] = [
  {
    id: 'china-oc',
    pages: ['national-china#offensives', 'national-status#china'],
    text: 'Japan can conduct a China OC Offensive (playing a 3 OC card) only on an even-numbered turn, and only once per turn, so at most 6 per game. There is no limit on China Offensive Event cards.',
    condition: 'Even-numbered game turn, and China has not surrendered.',
    cite: ['12.72'],
    status(ctx) {
      if (ctx.surrendered.includes('china')) return 'notNow';
      if (ctx.turn === undefined) return 'unknown';
      return ctx.turn % 2 === 0 ? 'applies' : 'notNow';
    },
    detail(ctx) {
      if (ctx.surrendered.includes('china')) return 'China has surrendered.';
      if (ctx.turn === undefined) return undefined;
      return ctx.turn % 2 === 0
        ? `Turn ${ctx.turn} is even-numbered: Japan may conduct one China OC Offensive.`
        : `Only on even-numbered turns; it is turn ${ctx.turn}.`;
    },
  },
  {
    id: 'india-stability',
    pages: ['national-india#stability', 'national-status#india'],
    text: 'At each National Status segment: Japan controlling all of Northern India moves the India marker to Unrest. Allied control of any part of Northern India moves it back to Stable. Two consecutive segments Unrest then Unstable, then two Unstable: India surrenders.',
    condition: 'Every National Status segment, while India has not surrendered.',
    cite: ['12.62'],
    status: (ctx) => (ctx.surrendered.includes('india') ? 'notNow' : 'unknown'),
    detail: (ctx) => (ctx.surrendered.includes('india') ? 'India has surrendered and cannot come back into the war.' : undefined),
  },
  {
    id: 'isr-us',
    pages: ['national-us#isr-us'],
    text: 'While US Inter-Service Rivalry is in effect: all US Army/Air Corps reinforcements are automatically delayed, every diverted-to-Europe die roll gets −1, and a US HQ cannot activate both US Army and US Naval units in the same offensive or reaction.',
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
