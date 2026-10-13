'use strict';
/* =========================================================
   GAME 1 — happy birthday: catch the pink & purple butterflies
   ========================================================= */
GAMES[0] = function (ctx) {
  const root = ctx.root;
  const PINKS = ['#ff4d8d', '#ff7aa8', '#f0539b'], PURPS = ['#a855f7', '#8b5cf6', '#c084fc'];
  const DECOY = ['#ffd23f', '#38bdf8', '#fb923c', '#4ade80', '#f8fafc'];
  const TOTAL = 9, DECOYS = 7;
  let caught = 0, over = false;

  const counter = h('div', { class: 'bf-count' }, `caught 0 / ${TOTAL}`);
  const hint = h('div', { class: 'bf-hint' }, 'catch every pink and purple butterfly. leave the others alone ♡');
  const field = h('div', { class: 'bf-field' });
  const msg = h('div', { class: 'bf-msg', hidden: '' },
    h('div', { class: 'bf-msgin' },
      h('p', {}, 'Happiest birthday to my girl. I don\'t really know what else to give you, so despite me saying I am not going to code again, here I am maxing out my brain to give you something special, something that you can keep forever. I hope you can be as happy as a soul can be, and those who wished you ill will receive their karma. Words might not mean anything here, so I am not going to make this long. But I love you, and I\'ll look forward to your coming years. I\'ll wish you health and happiness, comfort and safety.')));
  root.append(hint, counter, field, msg);

  const flies = [];
  const make = (good, color, accent) => {
    const el = h('div', { class: 'bfly', html: butterflySVG(color, accent) });
    const W = field.clientWidth || 800, H = field.clientHeight || 420;
    const f = { el, good, x: rand(20, W - 80), y: rand(20, H - 80), vx: rand(-1.2, 1.2) || .6, vy: rand(-1.2, 1.2) || -.6, ph: rand(0, 6), alive: true };
    el.addEventListener('pointerdown', ev => {
      ev.preventDefault();
      if (!f.alive || over) return;
      if (good) {
        f.alive = false; caught++; SFX.pop();
        el.classList.add('caught'); setTimeout(() => el.remove(), 500);
        counter.textContent = `caught ${caught} / ${TOTAL}`;
        if (caught === TOTAL) finish();
      } else {
        SFX.oops(); field.classList.remove('nope'); void field.offsetWidth; field.classList.add('nope');
        hint.textContent = 'oops, that one isn\'t pink or purple!';
        el.classList.add('wiggle'); setTimeout(() => el.classList.remove('wiggle'), 500);
      }
    });
    field.append(el); flies.push(f);
  };
  for (let i = 0; i < TOTAL; i++) make(true, i % 2 ? pick(PINKS) : pick(PURPS), '#fff');
  for (let i = 0; i < DECOYS; i++) make(false, pick(DECOY), '#fff');

  let raf, last = performance.now();
  const tick = now => {
    const dt = Math.min(2.2, (now - last) / 16.7); last = now;
    const W = field.clientWidth, H = field.clientHeight;
    flies.forEach(f => {
      if (!f.alive) return;
      f.ph += .03 * dt;
      f.vx += Math.sin(f.ph * 1.7 + f.x * .01) * .05 * dt;
      f.vy += Math.cos(f.ph * 1.3 + f.y * .01) * .05 * dt;
      const sp = Math.hypot(f.vx, f.vy), max = 1.5;
      if (sp > max) { f.vx *= max / sp; f.vy *= max / sp; }
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.x < 0) { f.x = 0; f.vx = Math.abs(f.vx); } if (f.x > W - 60) { f.x = W - 60; f.vx = -Math.abs(f.vx); }
      if (f.y < 0) { f.y = 0; f.vy = Math.abs(f.vy); } if (f.y > H - 50) { f.y = H - 50; f.vy = -Math.abs(f.vy); }
      const ang = Math.atan2(f.vy, f.vx) * 180 / Math.PI + 90;
      f.el.style.transform = `translate(${f.x}px,${f.y}px) rotate(${ang}deg)`;
    });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  ctx.onLeave(() => cancelAnimationFrame(raf));

  function finish() {
    over = true; SFX.win(); confetti(50, root, ['🦋', '💜', '💗', '✨']);
    hint.textContent = 'you caught them all!';
    setTimeout(() => { msg.hidden = false; msg.classList.add('show'); msg.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 700);
    setTimeout(() => ctx.showNext(), 2600);
  }
};

/* =========================================================
   GAME 2 — happy monthsary: a jar of four poems
   ========================================================= */
const POEMS = [
  { age: 1, kind: 'prose', text: `the kettle rattles against the cast iron three minutes before six. it has done so since the winter the hemlocks froze along the creek. the pine floor before the stove still keeps the dip of your heels. fifty years of early dawns wore that grain down, half an inch scooped from the sapwood. i set two cups on the oilcloth. the blue willow for you, where your thumb naturally finds the notch flaked away the summer we raised the barn; the heavy stoneware for me. outside, rain needles the pasture, smelling of wet slate and rotting birch. a crow calls from the fence post, a draft slips under the pantry sill. people talk of eternity as an airy, celestial thing. a garden without seasons, an expanse of white light where nothing ever frays. they are mistaken. eternity has gravel in its treads and grease on its hinges. it is the latch on the woodbox oiled every october so the screech never wakes you. it is the tally of pencil marks on my notepad. your cardigan hangs on the iron hook behind the door, the navy yarn at the cuffs has frayed to spiderwebs, but the knit still holds the curve of your elbows as though you had only stepped out to check the hens. when dusk settles and the stove breathes its slow red heat, there is no panic in the quiet. i bank the coals against the frost. i sweep the hearth. i turn back the heavy quilt on your side first. the wool remembers you, and the morning, when it climbs the ridge, will find the coffee poured and waiting. for eternity, with you, always.` },
  { age: 2, kind: 'prose', text: `The cardboard boxes in the back closet have four distinct layers of tape on them. If you pick at the corners, you can read our departures like tree rings: clear cellophane over brown paper over masking tape from three autumns ago. We have packed our lives away from each other so often the cardboard is soft as felt. We know leaving. We've lived leaving. It works for five months. Sometimes eight. I learn to take the long way around the square to avoid your stoop. When mutual friends bring you up, I use that flat, steady tone and say, yes, I wish them well. And then the gravity asserts itself. It is a sudden downpour on 4th Avenue where neither of us has an umbrella. It is a text sent at 1:14 a.m. with no preamble. Or it is simply turning the corner by the butcher shop and seeing you standing in the sleet, your coat collar turned up, looking at the pavement as though you were waiting for a train that had already passed. We don't come back as clean slates. God, we are far from clean. We come back carrying every sharp word and every misunderstanding, and the bruised knowledge of how thoroughly we can ruin one another. There is no innocent optimism left in the room. Yet when you reach out, your fingers still fit the spaces between mine like a key sliding into a lock it ground out of raw iron. We are not an unbroken circle; we are a trail beaten through stubborn brambles, walked so many times the bare earth refuses to grow over our footsteps. We sit down at the kitchen table among the wreckage of our good intentions, look at each other across the salt cellar, and begin again. We will always begin again.` },
  { age: 3, kind: 'verse', text: `boxes taped anew\nyet the stubborn gravity\npulls us home again.` },
  { age: 4, kind: 'verse', text: `we pack our bags and we will not stay,\ndrop heavy keys upon the wooden grain,\nyet every road still bends us home again.\n\nthe seasons turn; we scrub our grief away,\nand walk alone through sudden autumn rain.\nwe pack our bags and swear we will not stay.\n\nwe learn the polite words we ought to say,\npretending silence cures the stubborn pain,\nyet every road bends us home again.\n\na midnight text, a drunk tone, a corner by the bay,\nthe sudden spark where only ash had lain-\nwe pack our bags and swear we will not stay.\n\nold scars remain, but neither turns away;\nthe gravity between us will not wane.\nyet every road still bends us home again.\n\nforgive the fractured vows of yesterday:\nwe pack our bags and swear we will not stay\nyet every road still bends us home again.` }
];

GAMES[1] = function (ctx) {
  const root = ctx.root;
  let remaining = shuffle([0, 1, 2, 3]);
  let open = false, shaking = false;
  const left = h('div', { class: 'jar-left' }, 'letters left in the jar: 4');
  const hint = h('div', { class: 'jar-hint' }, 'shake the jar — click it, or press the button');
  const notes = [0, 1, 2, 3].map(n => `<g class="jnote" data-n="${n}" transform="translate(${[88, 128, 106, 140][n]} ${[188, 168, 222, 208][n]}) rotate(${[-24, 18, 62, -50][n]})"><rect x="-26" y="-9" width="52" height="18" rx="4" fill="#f6e7c6" stroke="#5a1a1a" stroke-width="1.5"/><path d="M-18 -9v18M18 -9v18" stroke="#c1121f" stroke-width="2"/><circle cx="0" cy="0" r="4" fill="#c1121f"/></g>`).join('');
  const jar = h('div', { class: 'jar', tabindex: '0', 'aria-label': 'Shake the jar', html: `
    <svg viewBox="0 0 240 340">
      <defs><linearGradient id="gl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#ffdfe3" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity=".6"/></linearGradient></defs>
      <rect x="62" y="14" width="116" height="34" rx="8" fill="#7a2e1d" stroke="#3a1008" stroke-width="3"/>
      <path d="M70 22h100M70 32h100M70 42h100" stroke="#a0472d" stroke-width="2"/>
      <path d="M72 50h96v18c34 12 52 38 52 76v132c0 24-14 38-40 38H60c-26 0-40-14-40-38V144c0-38 18-64 52-76z" fill="url(#gl)" stroke="#14090b" stroke-width="4"/>
      <g class="jnotes">${notes}</g>
      <path d="M40 150v120" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".8"/>
      <rect x="62" y="262" width="116" height="40" rx="6" fill="#fff" stroke="#c1121f" stroke-width="2"/>
      <text x="120" y="288" text-anchor="middle" font-family="Gaegu,cursive" font-size="22" font-weight="700" fill="#c1121f">for you ♡</text>
    </svg>` });
  const btn = h('button', { class: 'jar-btn' }, 'shake the jar');
  root.append(h('div', { class: 'jar-wrap' }, left, jar, btn, hint));

  const shake = () => {
    if (open || shaking || !remaining.length) return;
    shaking = true; SFX.pop();
    jar.classList.add('shaking');
    [0, 90, 180, 270, 360].forEach(t => setTimeout(() => note(300 + ri(0, 200), 0, .08, { type: 'triangle', v: .05 }), t));
    setTimeout(() => {
      jar.classList.remove('shaking'); shaking = false;
      const idx = remaining[ri(0, remaining.length - 1)];
      showLetter(idx);
    }, 750);
  };
  jar.addEventListener('click', shake); btn.addEventListener('click', shake);
  jar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shake(); } });

  function showLetter(idx) {
    open = true;
    const p = POEMS[idx];
    const sheet = h('div', { class: `letter age${p.age}` });
    sheet.append(
      h('div', { class: 'l-orn' }, '❦'),
      h('div', { class: `l-body ${p.kind}` }, p.text.toLowerCase()),
      h('button', { class: 'l-close' }, 'fold it back up'));
    const m = h('div', { class: 'modal letter-m' }, sheet);
    sheet.querySelector('.l-close').onclick = () => {
      m.classList.add('out');
      setTimeout(() => m.remove(), 250);
      remaining = remaining.filter(r => r !== idx); open = false;
      const noteEl = $$('.jnote', jar)[remaining.length]; // hide one visible note
      if (noteEl) noteEl.classList.add('gone');
      left.textContent = `letters left in the jar: ${remaining.length}`;
      if (!remaining.length) {
        hint.textContent = 'the jar is empty now ♡'; jar.classList.add('empty'); SFX.win();
        setTimeout(() => ctx.showNext(), 700);
      } else hint.textContent = 'shake it again...';
    };
    $('#overlay').append(m);
  }
};

/* =========================================================
   GAME 3 — i love you: letter matching
   ========================================================= */
GAMES[2] = function (ctx) {
  const root = ctx.root;
  const letters = ['I', 'L', 'O', 'V', 'E', 'Y', 'U'];
  const deck = shuffle([...letters, ...letters]);
  let first = null, lock = false, found = 0, moves = 0;
  const info = h('div', { class: 'mt-info' }, 'find the matching letters: i, l, o, v, e, y, u');
  const grid = h('div', { class: 'mt-grid' });
  const stageText = h('div', { class: 'mt-final', hidden: '' });
  root.append(info, grid, stageText);
  deck.forEach(L => {
    const c = h('button', { class: 'mt-card', 'data-l': L },
      h('span', { class: 'f front', html: '♡' }), h('span', { class: 'f back' }, L));
    c.onclick = () => {
      if (lock || c.classList.contains('flip') || c.classList.contains('done')) return;
      c.classList.add('flip'); SFX.tick();
      if (!first) { first = c; return; }
      moves++; lock = true;
      if (first.dataset.l === c.dataset.l) {
        const a = first; first = null;
        setTimeout(() => { a.classList.add('done'); c.classList.add('done'); SFX.match(); lock = false; found++; if (found === letters.length) done(); }, 350);
      } else {
        const a = first; first = null;
        setTimeout(() => { a.classList.remove('flip'); c.classList.remove('flip'); lock = false; }, 800);
      }
    };
    grid.append(c);
  });

  async function done() {
    info.textContent = `all matched in ${moves} tries!`;
    await sleep(700);
    grid.classList.add('away');
    await sleep(500);
    grid.hidden = true; stageText.hidden = false;
    const phrase = 'I LOVE YOU';
    const line = h('div', { class: 'mt-line' });
    stageText.append(line);
    // flying pizza + coffee
    const air = h('div', { class: 'mt-air' });
    for (let i = 0; i < 16; i++) air.append(h('span', { style: `left:${rand(0, 100)}%;top:${rand(0, 100)}%;font-size:${rand(26, 54)}px;animation-delay:${rand(0, 3)}s;animation-duration:${rand(5, 9)}s` }, i % 2 ? '🍕' : '☕'));
    stageText.prepend(air);
    for (const ch of phrase) {
      line.append(h('span', { class: ch === ' ' ? 'sp' : 'pl' }, ch === ' ' ? '\u00a0' : ch));
      if (ch !== ' ') { SFX.pop(); }
      await sleep(330);
    }
    SFX.win();
    await sleep(900);
    ctx.showNext();
  }
};

/* =========================================================
   GAME 4 — you're my best friend: the hamster mystery
   ========================================================= */
GAMES[3] = function (ctx) {
  const root = ctx.root;
  const SUS = [
    { id: 'biscuit', n: 'Biscuit', r: 'the foodie', age: 2, e: '🐹', c: '#ff8fa3', t: `Biscuit has never met a snack he didn't like. He is just a regular visitor to the pantry and is notorious for claiming that he is just checking the quality. He says he was beside the food bowl from 8:00 to 8:45 pm, eating his usual dinner. However, a witness heard him say, "THAT much seeds? that's an awful lot of seeds for one jar."` },
    { id: 'nibbles', n: 'Nibbles', r: 'the collector', age: 1.5, e: '🐹', c: '#ffd6a5', t: `Nibbles collects shiny pebbles, buttons, dried flowers, sticks, and basically anything that fits inside a tiny box. He believes that everything deserves a safe place. He claims he spent the evening organizing his personal collection in the storage room. He insists he never touched the festival seeds. Nobody can confirm exactly what he was organizing or when he left the storage room.` },
    { id: 'poppy', n: 'Poppy', r: 'the sweetheart', age: 2, e: '🐹', c: '#ffb3c1', t: `Poppy is the village's caretaker. She helps everyone, remembers birthdays, and leaves little gifts outside burrows. She says she was in the play area with Pip, discussing their plans for the festival. She admits she entered the pantry earlier that afternoon to deliver flowers.` },
    { id: 'cheddar', n: 'Cheddar', r: 'the troublemaker', age: 1, e: '🐹', c: '#ffc971', t: `Cheddar is a notorious prankster who enjoys making dramatic accusations and pretending to be the villain in every situation. He claims he was outside the enclosure, running on the wheel and stretching his legs. However, a sunflower seed was found stuck in his fur. He says he picked it up during the festival preparations.` },
    { id: 'mochi', n: 'Mochi', r: 'the quiet one', age: 2, e: '🐹', c: '#f1e3d3', t: `Mochi prefers solitude and peace. She rarely speaks unless someone asks her about her favourite snacks. She claims she stayed in her bedroom and fell asleep before 8:30 pm. She heard someone moving a wooden box late that evening but insists she was too sleepy to investigate.` },
    { id: 'pip', n: 'Pip', r: 'the daydreamer', age: 1, e: '🐹', c: '#e5d4ff', t: `Pip is a gentle dreamer who forgets and regularly falls asleep in strange places. He says he was napping in his bed. Poppy can confirm that they spent time together earlier, but not for the entire evening. He remembers seeing a small green object near the pantry but cannot recall what it was.` }
  ];
  const EVID = [
    ['several empty sunflower seed shells lead from the pantry toward the storage room.', 'whoever took the seeds probably carried them through this passage.'],
    ['a trail of tiny pawprints crosses the dusty floor between the pantry and the storage room. one print contains a distinctive notch on the outer edge.', "compare the print with the suspects' paws. only one suspect has a matching notch on their left hind paw."],
    ["a short green thread is caught on the storage room's wooden box latch.", 'one suspect wears a green scarf. the thread is the same shade as that scarf.'],
    ['the emergency snack reserve was stored in a wooden box behind the supply crates. the box has been moved to a corner of the storage room, where it is partly concealed by a cloth.', 'the box was too heavy to move without leaving marks in the dust. the marks lead to the same corner where the suspect with the green scarf keeps their collection supplies.'],
    ['a golden strand of fur is found beside the pantry jar, with a sunflower seed shell stuck to it.', 'this appears to implicate Cheddar. however, the strand is found beside the jar, not inside the stash box. is this evidence of the theft, or merely evidence that Cheddar was near the pantry?'],
    ['a note is found tucked under the empty jar: "Good seeds make happy days. A little stash makes tomorrow easier." the handwriting matches the labels on the storage boxes used to organize one suspect\'s personal collection.', 'the author has a habit of labeling everything they collect.']
  ];
  const WIT = [
    ['hazel', 'Hazel', '"I checked the jar at 7:30 PM. All seeds were there. I returned at 9:00 PM, and every single one was gone. I also noticed that the emergency reserve box was missing."'],
    ['mochi', 'Mochi', '"I heard a wooden box scrape against the floor sometime after 8:30 PM. I didn\'t see who moved it, but I remember hearing a tiny sneeze afterward."'],
    ['poppy', 'Poppy', '"I was with Pip in the play area earlier. Before I left, I saw Nibbles carrying a little box toward the storage room. He told me it contained his collection."'],
    ['pip', 'Pip', '"I remember a green thread! I thought it was a piece of grass. Also, I heard someone sneeze near the storage room. I don\'t know who it was, though."']
  ];
  const MOTIVE = 'Nibbles is a compulsive collector who believes that having a reserve of supplies means he will never run out of the things he loves. When he learned that the festival would use the village\'s entire supply of sunflower seeds, he panicked at the thought of having nothing left afterward. He decided to keep the seeds for himself. He took all festival seeds and the emergency reserve, intending to store them in his personal collection until he could figure out what to do with them. He did not think of himself as a thief. He convinced himself that he was simply being prepared. Unfortunately, he never asked permission, and the entire village went without its festival feast.';
  const face = (id, e, c, cls) => smartImg(local('hamsters/' + id), () => h('div', { class: 'ph hface', style: `background:${c || '#ffd6a5'}` }, e || '🐹'), cls || 'hpic');

  const file = h('div', { class: 'hm' });
  file.append(
    h('div', { class: 'hm-tags' }, ...['CLASSIFIED FILE CASE', 'HAMSTER MYSTERY', 'MONTHSARY SPECIAL EDITION'].map(t => h('button', { class: 'hm-tag', disabled: '' }, t))),
    h('h2', { class: 'hm-title' }, 'THE CASE OF MISSING SUNFLOWER SEEDS'),
    h('div', { class: 'hm-case' },
      h('div', { class: 'hm-stamp' }, 'CASE NO. 001'),
      h('h3', {}, 'The Great Sunflower Seed Heist'),
      h('dl', {},
        h('dt', {}, 'Location'), h('dd', {}, 'Honey Crumbs'),
        h('dt', {}, 'Time'), h('dd', {}, '4th monthsary of the Hamster Festival'),
        h('dt', {}, 'Your role'), h('dd', {}, 'The head hamster detective'),
        h('dt', {}, 'The objective'), h('dd', {}, 'Identify the hamster who secretly hoarded 1000000 sunflower seeds from the community\'s festival before the final bell rang.'),
        h('dt', {}, 'The twist'), h('dd', {}, 'Every suspect has something to hide, but only one of them stole the seeds. Who will it be?'))),
    h('div', { class: 'hm-story' },
      h('h4', {}, 'The incident'), h('p', {}, 'The hamsters were preparing for their annual festival. The village had gathered premium seeds for the grand communal feast. The seeds were stored in a little wooden jar inside the pantry.'),
      h('h4', {}, 'The discovery'), h('p', {}, 'At 9:00 pm, the village\'s pantry keeper discovered that the jar was completely empty. The seeds had vanished and the emergency snack reserve was also missing. In its place was a handwritten note saying "good seeds make happy days :p!"'),
      h('h4', {}, 'The investigation'), h('p', {}, 'Six hamsters were near the pantry that evening. Every one of them claims to be innocent.')));

  const sg = h('div', { class: 'hm-sus' });
  SUS.forEach((s, i) => sg.append(h('article', { class: 'hm-card' },
    h('div', { class: 'hm-ph' }, face(s.id, s.e, s.c), h('span', { class: 'hm-no' }, 'suspect ' + (i + 1))),
    h('h4', {}, s.n), h('div', { class: 'hm-role' }, `${s.r} · age ${s.age} in hamster years`), h('p', {}, s.t))));
  file.append(h('h3', { class: 'hm-h' }, 'The suspects'), sg);

  const ev = h('div', { class: 'hm-ev' });
  EVID.forEach((e, i) => ev.append(h('div', { class: 'hm-evi' }, h('b', {}, `evidence #${i + 1}`), h('p', {}, e[0]), h('p', { class: 'dn' }, h('i', {}, `detective note: ${e[1]}`)))));
  file.append(h('h3', { class: 'hm-h' }, 'The evidence'), ev);

  const wg = h('div', { class: 'hm-wit' });
  WIT.forEach((w, i) => wg.append(h('div', { class: 'hm-w' }, face(w[0], '🐹', '#ffe5ec', 'wpic'), h('div', {}, h('b', {}, `witness #${i + 1}: ${w[1]}`), h('p', {}, w[2])))));
  file.append(h('h3', { class: 'hm-h' }, 'The witness statements'), wg);

  const ask = h('div', { class: 'hm-ask' }, h('h3', {}, 'who stole the sunflower seeds?'));
  const opts = h('div', { class: 'hm-opts' });
  const result = h('div', { class: 'hm-result', hidden: '' });
  SUS.forEach(s => {
    const b = h('button', { class: 'hm-opt' }, face(s.id, '🐹', s.c, 'optpic'), h('span', {}, s.n));
    b.onclick = () => verdict(s.id, b);
    opts.append(b);
  });
  ask.append(opts); file.append(ask, result);
  root.append(file);

  let answered = false;
  function verdict(id, btn) {
    if (answered) return; answered = true;
    $$('.hm-opt', opts).forEach(b => b.disabled = true); btn.classList.add('pick');
    const right = id === 'nibbles';
    const ov = h('div', { class: 'verdict ' + (right ? 'win' : 'lose') });
    if (right) {
      SFX.win();
      ov.append(h('div', { class: 'v-text' }, 'best hammie in the world! congratulations, detective. you\'ve won your case. here\'s a sunflower!', h('div', { class: 'v-sun' }, '🌻')));
      for (let i = 0; i < 220; i++) {
        const w = rand(14, 34);
        ov.append(h('i', { class: 'seed', style: `left:${rand(-2, 100)}%;--y:${rand(0, 96)}vh;width:${w}px;height:${w * 1.7}px;--r:${rand(0, 360)}deg;animation-delay:${rand(0, 2.4)}s` }));
      }
    } else {
      SFX.wah();
      ov.append(h('div', { class: 'v-text' }, 'sad hamster... wrong hamster in jail....'));
      for (let i = 0; i < 26; i++) ov.append(h('i', { class: 'sadh', style: `left:${rand(0, 96)}%;font-size:${rand(34, 80)}px;animation-delay:${rand(0, 2)}s;animation-duration:${rand(2.6, 4.5)}s` }, i % 2 ? '🐹' : '😭'));
      ov.append(h('div', { class: 'bars' }));
    }
    ov.addEventListener('click', () => ov.remove());
    $('#overlay').append(ov);
    setTimeout(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 500); }, right ? 4200 : 3000);
    setTimeout(() => {
      result.hidden = false;
      result.append(
        h('h3', {}, right ? 'case closed ✔' : 'the real culprit was...'),
        h('div', { class: 'hm-cul' }, face('nibbles', '🐹', '#ffd6a5', 'hpic'), h('div', {}, h('b', {}, 'Nibbles, the collector'), h('p', { class: 'dn' }, h('i', {}, 'the motive')), h('p', {}, MOTIVE))));
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ctx.showNext();
    }, right ? 4300 : 3100);
  }
};
