import type { Section } from '../types';

export const NATIONAL_STATUS_SECTIONS: Section[] = [
  {
    key: 'general',
    title: 'How surrender works',
    statements: [
      { text: 'A nation surrenders if the opposing player controls certain hexes of that nation during the National Status segment.', cite: ['12.0', '4.31'] },
      { text: 'If an Allied nation surrenders, Japan automatically gains control of all its on-map airfields and ports that are not occupied by Allied units.', cite: ['12.0'] },
      { text: 'An Allied nation can only surrender once per game. If the Allies recapture the locations Japan had to capture, they regain the nation’s airfields and ports, except hexes with a Japanese unit of any type. Those stay Japanese until evacuated or abandoned.', cite: ['12.0'] },
      { text: 'The Allied card draw does not recover when a nation that surrendered is recaptured.', cite: ['12.0', '11.52'] },
      { text: 'Each Allied surrender also lowers US Political Will.', cite: ['16.41'], links: ['us-political-will'] },
      { text: 'If Japan surrenders the game is over and the Allied player wins.', cite: ['12.0', '16.1'] },
    ],
  },
  {
    key: 'hex-control',
    title: 'Hex control',
    statements: [
      { text: 'The last player to have a ground unit enter or pass through a hex using normal movement controls the hex. The player whose units occupy, or were last to occupy, a hex controls it.', cite: ['12.1', '4.31'] },
      { text: 'Ground units that enter a hex by amphibious assault (ASP, organic naval or barge transport) and are not eliminated or forced to retreat gain control before post-battle movement.', cite: ['12.1'] },
      { text: 'Control markers are placed at the instant control is established. As a shortcut, any hex without a Japanese flag can be treated as Allied controlled.', cite: ['12.1', '4.31'] },
    ],
  },
  {
    key: 'philippines',
    title: 'The Philippines',
    statements: [
      { text: 'The Philippines are all hexes contiguous by land with Manila (2813) or Davao (2915), or an island hex within 2 hexes of Manila/Corregidor, plus Jolo Island (2715). Key bases: 2715, 2812, 2813, 2911, 2915, 3014.', cite: ['12.21'] },
      { text: 'They surrender when Japan controls Manila (2813) and Davao (2915).', cite: ['12.22'] },
      { text: 'Remove all Allied ground units in Philippine hexes in the National Status segment (a unit eligible to return, such as a US HQ, comes back through the reinforcement and HQ rules). US air or naval units there make an Emergency Air or Naval move.', cite: ['12.22'] },
    ],
  },
  {
    key: 'malaya',
    title: 'Malaya and Siam',
    statements: [
      { text: 'Malaya is all contiguous land hexes within 3 hexes of Singapore (2015). Key bases: 1912, 1913, 2012, 2014, 2015, 2112.', cite: ['12.31'] },
      { text: 'Malaya surrenders when Japan controls Singapore (2015) and Kuantan (2014). No Allied units are removed from play.', cite: ['12.32'] },
      { text: 'Siam has no forces and does not surrender. It is treated as individual hexes: the last side to move ground units through a Siam hex controls it.', cite: ['12.33'] },
    ],
  },
  {
    key: 'dei',
    title: 'Dutch East Indies',
    statements: [
      { text: 'The Dutch East Indies are the islands of Sumatra (1813, 1914, 1916, 1917, 2017), Java (2018, 2019, 2220), Borneo (2216, 2318, 2415, 2517, 2616), Celebes (2620, 2719, 2917), Bali (2320), Amboina (2919), Timor (2721) and Morotai (3017).', cite: ['12.41'] },
      { text: 'They surrender when Japan controls the seven resource spaces on Sumatra, Borneo and Java and also controls Tjilatjap (2019).', cite: ['12.42', '11.11'] },
      { text: 'All Dutch units are removed from play, and Japan controls all Dutch airfields and ports that do not contain US or Commonwealth ground units.', cite: ['12.42'] },
    ],
  },
  {
    key: 'burma',
    title: 'Burma',
    statements: [
      { text: 'Burma is the bases in hexes 2006, 2008, 2106, 2206, 2305 and the adjacent jungle hexes without bases.', cite: ['12.51'] },
      { text: 'Burma surrenders when Japan controls Rangoon (2008), Mandalay (2106), Lashio (2206) and Myitkyina (2305).', cite: ['12.52'] },
      { text: 'Remove all Commonwealth units with Burma (B) in their unit designation in the National Status segment.', cite: ['12.52'] },
    ],
  },
  {
    key: 'india',
    title: 'India',
    statements: [
      { text: 'India does not surrender by capturing a few hexes: it slides through Unrest and Unstable on the India track, and surrenders after being Unstable for two consecutive National Status segments. Once it surrenders it cannot come back into the war.', cite: ['12.62'] },
      { text: 'Japan controlling all of Northern India moves the marker to Unrest. Allied control of any part of Northern India restores it to Stable at the next National Status segment.', cite: ['12.62'] },
    ],
  },
  {
    key: 'china',
    title: 'China',
    statements: [
      { text: 'China does not surrender in the National Status segment. It surrenders the instant the China marker is in the China Collapses box during the Offensive segment, and that only through a Chinese offensive started by an OC.', cite: ['12.73'] },
    ],
  },
  {
    key: 'australia',
    title: 'Australia',
    statements: [
      { text: 'Australia has two parts: mainland Australia (all Australian hexes) and the Mandates (Admiralty Is. 3820, Kavieng 4020, Rabaul 4021, Bougainville 4222, Guadalcanal 4423 and the one-hex islands or land hexes adjacent to them).', cite: ['12.81'] },
      { text: 'Australia surrenders if all Australian coastal airfields and ports on the mainland (not the Mandates) are Japanese controlled during a National Status segment.', cite: ['12.82'] },
      { text: 'Australian units already in play are unaffected. Australian reinforcements arriving later are permanently lost; reduced Australian units may still get replacements but are removed if eliminated. It can surrender only once.', cite: ['12.82', '12.83'] },
      { text: 'Mandates: whoever controls Rabaul (4021) and Guadalcanal (4423) in a National Status segment controls all Mandate hexes not occupied by opposing ground units.', cite: ['12.84'] },
      { text: 'New Guinea: whoever controls all the ports plus the resource hex automatically gains control of all named locations on New Guinea not occupied by opposing units.', cite: ['12.85'] },
    ],
  },
  {
    key: 'japan',
    title: 'Japan',
    statements: [
      { text: 'Japan has six parts: Honshu, Hokkaido, Kyushu and Shikoku (the Home Islands); Manchuko (3302, 3303 and adjacent hexes except 3304); Korea (3305 and adjacent hexes); and the Mandates (Formosa, Sakhalin, the Kuriles, Okinawa, Iwo Jima, Marcus, the Marianas minus Guam, the Carolines and the Marshalls).', cite: ['12.9'] },
      { text: 'Manchuko cannot be entered except through the Soviet Manchurian Offensive card.', cite: ['12.91'] },
      { text: 'Marshall Islands: if the Allies control Eniwetok (4415) and Kwajalein (4715) in the National Status segment, all Marshall islands (within 2 hexes of them) without land units become Allied controlled; Japanese air and naval units there may use emergency air-naval movement.', cite: ['12.92'] },
      { text: 'Japan surrenders when all hexes on Honshu are Allied controlled, or when no ultimate Japanese supply source can trace a path to a resource hex for three consecutive National Status segments.', cite: ['12.93'] },
      { text: 'If the Allies control all Chinese coastal ports and Korea, Japan can no longer remove divisions from China or conduct any China Offensive.', cite: ['12.93'] },
      { text: 'Each city hex in the Home Islands holds an intrinsic 12-12 one-step ground unit (no stacking effect), always the last step eliminated. Once an Allied control marker is placed there it is permanently eliminated.', cite: ['12.94'] },
    ],
  },
];
