import type { Section } from '../types';

export const NATIONAL_STATUS_SECTIONS: Section[] = [
  {
    key: 'general',
    title: 'How surrender works',
    statements: [
      { text: 'A nation surrenders if the opposing player controls certain hexes of that nation during the National Status segment.', cite: ['13.1', '4.31'] },
      { text: 'If an Allied nation surrenders, Japan automatically gains control of all its on-map airfields and ports that are not occupied by Allied units, unless the nation’s own surrender rule says otherwise (Malaya and Burma: no hexes change control).', cite: ['13.1', '13.32', '13.52'] },
      { text: 'An Allied nation can only surrender once per game. If the Allies recapture the locations Japan had to capture, they regain the nation’s airfields and ports, except hexes with a Japanese unit of any type. Those stay Japanese until evacuated or abandoned.', cite: ['13.1'] },
      { text: 'The Allied card draw does not recover when a nation that surrendered is recaptured.', cite: ['13.1', '12.52'] },
      { text: 'Each Allied surrender also lowers US Political Will.', cite: ['16.41'], links: ['us-political-will'] },
      { text: 'If Japan surrenders the game is over and the Allied player wins.', cite: ['13.1', '16.1'] },
    ],
  },
  {
    key: 'hex-control',
    title: 'Hex control',
    statements: [
      { text: 'The last player to have a ground unit enter or pass through a hex controls it. Ground units that enter an unoccupied hex by ground movement gain control immediately.', cite: ['6.5', '1.3'] },
      { text: 'Ground units that enter a hex by amphibious assault (ASP, organic naval or barge transport) and are not eliminated or forced to retreat gain control just before post-battle movement.', cite: ['6.5'] },
      { text: 'Air and naval units alone can never change hex control. Flags on the map are only a memory aid: hexes that never changed hands carry none, and players may place and remove flags as they need.', cite: ['1.3'] },
    ],
  },
  {
    key: 'philippines',
    title: 'The Philippines',
    statements: [
      { text: 'The Philippines are all hexes contiguous by land with Manila (2813) or Davao (2915), or an island hex within 2 hexes of Manila/Corregidor, plus Jolo Island (2715). Key bases: 2715, 2812, 2813, 2911, 2915, 3014.', cite: ['13.21'] },
      { text: 'They surrender when Japan controls Manila (2813) and Davao (2915).', cite: ['13.22'] },
      { text: 'Remove all Allied ground units in Philippine hexes in the National Status segment (a unit eligible to return, such as a US HQ, comes back through the reinforcement and HQ rules). US air or naval units there must make an Emergency Air or Naval move to leave; non-US air and naval units there are eliminated.', cite: ['13.22'] },
    ],
  },
  {
    key: 'malaya',
    title: 'Malaya and Siam',
    statements: [
      { text: 'Malaya is all contiguous land hexes within 3 hexes of Singapore (2015). Key bases: 1912, 1913, 2012, 2014, 2015, 2112.', cite: ['13.31'] },
      { text: 'Malaya surrenders when Japan controls Singapore (2015) and Kuantan (2014). No Allied units are removed from play and no hex control changes.', cite: ['13.32'] },
      { text: 'Siam has no forces and does not surrender. It is treated as individual hexes: the last side to move ground units through a Siam hex controls it.', cite: ['13.33', '6.5'] },
    ],
  },
  {
    key: 'dei',
    title: 'Dutch East Indies',
    statements: [
      { text: 'The Dutch East Indies are the islands of Sumatra (1813, 1914, 1916, 1917, 2017), Java (2018, 2019, 2220), Borneo (2216, 2318, 2415, 2517, 2616), Celebes (2620, 2719, 2917), Bali (2320), Amboina (2919), Timor (2721) and Morotai (3017).', cite: ['12.41'] },
      { text: 'They surrender when Japan controls the seven resource spaces on Sumatra, Borneo and Java and also controls Tjilatjap (2019).', cite: ['13.42', '12.11'] },
      { text: 'All Dutch units are removed from play, and Japan controls all Dutch airfields and ports that do not contain US or Commonwealth ground units (an HQ alone does not count). Allied air or naval units in the hexes Japan gains must immediately use air-naval emergency movement to leave.', cite: ['13.42'] },
    ],
  },
  {
    key: 'burma',
    title: 'Burma',
    statements: [
      { text: 'Burma is the bases in hexes 2006, 2008, 2106, 2206, 2305 and the adjacent jungle hexes without bases.', cite: ['13.51'] },
      { text: 'Burma surrenders when Japan controls Rangoon (2008), Mandalay (2106), Lashio (2206) and Myitkyina (2305).', cite: ['13.52'] },
      { text: 'Remove all Commonwealth units with Burma (B) in their unit designation in the National Status segment. No hexes change control.', cite: ['13.52'] },
    ],
  },
  {
    key: 'india',
    title: 'India',
    statements: [
      { text: 'India does not surrender by capturing a few hexes: it slides along a five-box India Status track (right to left: Stable, Unrest, Strikes, Unstable, Revolts). If the marker is in the Revolts box during a National Status segment, India surrenders. Once it surrenders it cannot come back into the war.', cite: ['13.62'] },
      { text: 'Japan controlling all of Northern India moves the marker one box along the track at each National Status segment. Allied control of any part of Northern India at a National Status segment returns it to Stable.', cite: ['13.62'] },
    ],
  },
  {
    key: 'china',
    title: 'China',
    statements: [
      { text: 'China does not surrender in the National Status segment. It surrenders the instant the China marker is in the China Collapses box during the Offensive segment, due to a China Offensive or an event.', cite: ['13.73'] },
    ],
  },
  {
    key: 'australia',
    title: 'Australia',
    statements: [
      { text: 'Australia has two parts: mainland Australia (all Australian hexes) and the Mandates (Admiralty Is. 3820, Kavieng 4020, Rabaul 4021, Bougainville 4222, Guadalcanal 4423 and the one-hex islands or land hexes adjacent to them).', cite: ['13.81'] },
      { text: 'Australia surrenders if all Australian coastal airfields and ports on the mainland (not the Mandates) are Japanese controlled during a National Status segment.', cite: ['13.82'] },
      { text: 'Australian units already in play are unaffected. Australian reinforcements arriving later are permanently lost; reduced Australian units may still get replacements but are removed if eliminated. It can surrender only once.', cite: ['13.82', '13.83'] },
      { text: 'Mandates: whoever controls Rabaul (4021) and Guadalcanal (4423) in a National Status segment controls all Mandate hexes not occupied by opposing ground units. Opposing air and naval units in hexes that change control must use emergency air-naval movement to leave. Changing control back takes both hexes in a National Status segment; retaking one is not enough.', cite: ['13.84'] },
      { text: 'New Guinea: whoever controls all the ports plus the resource hex in a National Status segment gains control of all named locations on New Guinea not occupied by opposing units.', cite: ['13.85'] },
    ],
  },
  {
    key: 'japan',
    title: 'Japan',
    statements: [
      { text: 'Japan has six parts: Honshu, Hokkaido, Kyushu and Shikoku (the Home Islands); Manchuko (3302, 3303 and adjacent hexes except 3304); Korea (3305 and adjacent hexes); and the Mandates (Formosa, Sakhalin, the Kuriles, Okinawa, Iwo Jima, Marcus, the Marianas minus Guam, the Carolines and the Marshalls).', cite: ['13.9'] },
      { text: 'Japanese and Allied units of any type may not enter Manchukuo. It can be conquered only by the Soviet Manchurian Offensive card.', cite: ['13.91'] },
      { text: 'Marshall Islands: if the Allies control Eniwetok (4415) and Kwajalein (4715) in the National Status segment, all Marshall islands (within 2 hexes of them) without Japanese land units become Allied controlled; Japanese air and naval units there must use emergency air-naval movement to leave.', cite: ['13.92'] },
      { text: 'Japan surrenders when all hexes on Honshu are Allied controlled, or when no ultimate Japanese supply source can trace a path to a resource hex for three consecutive National Status segments. The Allies then win immediately.', cite: ['13.93'] },
      { text: 'If the Allies control all Chinese coastal ports and both Korean port hexes, Japan can no longer remove divisions from China or conduct any further China Offensive.', cite: ['13.71'] },
      { text: 'Each city hex in the Home Islands holds an intrinsic 12-12 one-step ground unit (no stacking effect), always the last step eliminated. Once an Allied control marker is placed there it is permanently eliminated, even if Japan regains the hex.', cite: ['13.94'] },
    ],
  },
];
