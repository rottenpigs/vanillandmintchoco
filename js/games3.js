'use strict';
/* Tile order (index): 0 happy birthday, 1 happy monthsary, 2 i love you, 3 you're my best friend,
   4 my forever (placeholder), 5 my world, 6 my ever after, 7 my sweetheart, 8 my happiness,
   9 my happy place, 10 and my family, 11 я тебя люблю, my cherry */

/* =========================================================
   index 4 — my forever (no content was specified, so a small interlude)
   ========================================================= */
GAMES[4] = function (ctx) {
  const root = ctx.root;
  const box = h('div', { class: 'fv' });
  box.innerHTML = `
    <svg class="fv-inf" viewBox="0 0 300 140" fill="none" stroke-linecap="round">
      <path class="fv-line" d="M150 70C120 20 40 20 40 70s80 50 110 0 110-50 110 0-80 50-110 0z"/>
    </svg>
    <div class="fv-t">my forever</div>`;
  root.append(box);
  for (let i = 0; i < 18; i++) box.append(h('span', { class: 'fv-h', style: `left:${rand(0, 96)}%;animation-delay:${-rand(0, 8)}s;font-size:${rand(16, 34)}px;animation-duration:${rand(6, 11)}s` }, pick(['♡', '♥', '∞'])));
  setTimeout(() => ctx.showNext(), 3500);
};

/* =========================================================
   index 9 — my happy place: which videos did you repost?
   ========================================================= */
GAMES[9] = function (ctx) {
  const root = ctx.root;
  const CORRECT = [1, 0, 3, 0, 2, 0, 1, 3];   // 0=A 1=B 2=C 3=D
  const L = ['A', 'B', 'C', 'D'];
  let round = 0;
  const top = h('div', { class: 'tk-top' },
    smartImg(['assets/profile/tiktok-layout.png'], () => h('div', { class: 'tk-fallback' }, 'rri · hiddensoulch · 38 Following · 23 Followers · 48 Likes'), 'tk-prof'),
    h('h3', {}, 'guess which videos you reposted?'));
  const meta = h('div', { class: 'tk-meta' });
  const grid = h('div', { class: 'tk-grid' });
  const done = h('div', { class: 'tk-done', hidden: '' }, 'you remembered them all ♡');
  root.append(top, meta, grid, done);

  const vids = [];
  const pauseAll = except => vids.forEach(v => { if (v !== except) v.pause(); });
  ctx.onLeave(() => vids.forEach(v => v.pause()));

  function load() {
    grid.innerHTML = ''; vids.length = 0;
    meta.textContent = `#${round + 1} of ${CORRECT.length}`;
    L.forEach((letter, k) => {
      const v = h('video', { src: `assets/videos/q${round + 1}-${letter}.mp4`, preload: 'metadata', loop: '' });
      v.setAttribute('playsinline', '');
      vids.push(v);
      const play = h('div', { class: 'tk-play' }, '▶');
      const missing = h('div', { class: 'tk-miss', hidden: '' }, `video file missing: assets/videos/q${round + 1}-${letter}.mp4`);
      v.addEventListener('error', () => { missing.hidden = false; play.hidden = true; });
      v.addEventListener('play', () => { pauseAll(v); play.classList.add('hide'); });
      v.addEventListener('pause', () => play.classList.remove('hide'));
      const screen = h('div', { class: 'tk-screen' }, v, play, missing);
      screen.onclick = () => { if (v.paused) v.play().catch(() => { }); else v.pause(); };
      const pickBtn = h('button', { class: 'tk-pick' }, `option ${letter}`);
      const card = h('div', { class: 'tk-opt' }, h('div', { class: 'tk-badge' }, letter), screen, pickBtn);
      pickBtn.onclick = () => choose(k, card);
      grid.append(card);
    });
  }
  function choose(k, card) {
    pauseAll();
    if (k === CORRECT[round]) {
      SFX.win(); card.classList.add('right');
      setTimeout(() => {
        round++;
        if (round >= CORRECT.length) { grid.innerHTML = ''; meta.textContent = ''; done.hidden = false; confetti(40, root, ['💖', '🎵', '✨']); ctx.showNext(); }
        else load();
      }, 450);
    } else {
      SFX.oops();
      root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake');
      card.classList.add('gone');
      const v = $('video', card); if (v) v.pause();
      setTimeout(() => card.remove(), 350);
    }
  }
  load();
};

/* =========================================================
   index 10 — and my family: sticky notes
   ========================================================= */
GAMES[10] = function (ctx) {
  const root = ctx.root;
  const NOTES = [
    ['harper', 'happy birthday... should i start calling you mom or ate?'],
    ['sloane', "happy birthday, you're old. like a dinosaur."],
    ['blair', "can i have a cake? do you have a princess cake? or a fairy cake? i don't want to be a fairy."],
    ['axl', 'HAPPPPPYYYYYYYYYYYYYY BIRTHDAYYYYYYYYYY', 'yes, he screamed that in real life'],
    ['hale', 'H-B-D'],
    ['jen', ':p'],
    ['nate', 'Happiest birthday, Riza. I hope you have the good days ahead of you. May you be free from anything bad and live your life to the fullest.'],
    ['me', "happy birthday, baby. maybe i wouldn't have to write so many letters if only we were near each other. but it's alright, this is the best i can do for now. i hope you have fun today, enjoy your birthday, and remember that you are loved by so many people in your life, including me. you may not see my kids as yours yet, but they see you as their mother, and i think that speaks to your good character. i love you, and again, enjoy."]
  ];
  const DOOD = ['♡', '☆', '✿', '〰', '✦', '☺'];
  const board = h('div', { class: 'sn-board' });
  root.append(h('h3', { class: 'sn-h' }, 'notes for you'), board);
  NOTES.forEach(([who, text, ital], i) => {
    const long = text.length > 140;
    const n = h('div', { class: `sn c${i % 4}${long ? ' long' : ''}`, style: `--rot:${rand(-3.5, 3.5)}deg;animation-delay:${i * .5}s` },
      h('i', { class: 'tape' }),
      h('div', { class: 'sn-from' }, `from ${who}:`),
      h('p', {}, text, ital ? [' (', h('i', {}, ital), ')'] : null),
      h('span', { class: 'sn-d d1' }, pick(DOOD)), h('span', { class: 'sn-d d2' }, pick(DOOD)));
    n.addEventListener('animationstart', () => setTimeout(() => SFX.pop(), 120), { once: true });
    board.append(n);
  });
  setTimeout(() => ctx.showNext(), NOTES.length * 500 + 1500);
};

/* =========================================================
   index 11 — я тебя люблю, my cherry: guess the Marvel character
   ========================================================= */
GAMES[11] = function (ctx) {
  const root = ctx.root;
  const Q = [
    ['hulk'], ['ant-man'], ['pepper potts', 'pepper'], ['pietro', 'pietro maximoff'], ['yellowjacket'],
    ['moon knight'], ['okoye'], ['natasha', 'natasha romanoff'], ['thor'], ['hela'],
    ['spiderman', 'spider-man'], ['america', 'america chavez'], ['rocket'], ['yinsen'], ['mystique'],
    ['yondu'], ['loki', 'loki laufeyson', 'loki odinson'], ['odin'], ['vision'], ['ebony', 'ebony maw']
  ];
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const GROUPS = ['HAPPY', 'MONTHSARY,', 'MY', 'LOVE'];
  const FIRSTS = Q.map(a => a[0][0].toUpperCase());      // H A P P Y M O N T H S A R Y M Y L O V E
  let n = 0, wrong = 0;

  const side = h('aside', { class: 'mv-side' }, h('div', { class: 'mv-sh' }, 'collected'));
  const slots = [];
  let gi = 0;
  GROUPS.forEach(g => {
    const row = h('div', { class: 'mv-word' });
    for (const ch of g) {
      if (ch === ',') { row.append(h('span', { class: 'mv-comma' }, ',')); continue; }
      const s = h('span', { class: 'mv-slot' }, '');
      slots.push(s); row.append(s);
    }
    side.append(row);
  });
  const main = h('div', { class: 'mv-main' });
  const count = h('div', { class: 'mv-count' });
  const frame = h('div', { class: 'mv-frame' });
  const input = h('input', { class: 'mv-in', type: 'text', placeholder: 'who is this?', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Your guess' });
  const go = h('button', { class: 'mv-go' }, 'guess');
  const fb = h('div', { class: 'mv-fb' });
  const hintBtn = h('button', { class: 'mv-hint', hidden: '' }, 'need a hint?');
  main.append(count, frame, h('div', { class: 'mv-form' }, input, go), fb, hintBtn);
  root.append(h('div', { class: 'mv-wrap' }, side, main));

  function show() {
    wrong = 0; hintBtn.hidden = true; fb.textContent = ''; input.value = '';
    count.textContent = `guess #${n + 1} of ${Q.length}`;
    frame.innerHTML = '';
    frame.append(smartImg(local('marvel/' + pad2(n + 1)), () => h('div', { class: 'mv-miss' }, h('b', {}, '?'), h('small', {}, `add assets/marvel/${pad2(n + 1)}.jpg`)), 'mv-img'));
    input.focus({ preventScroll: true });
  }
  function submit() {
    const g = norm(input.value);
    if (!g) return;
    if (Q[n].some(a => norm(a) === g)) {
      SFX.match();
      const s = slots[n]; s.textContent = FIRSTS[n]; s.classList.add('on');
      n++;
      fb.textContent = 'correct ♡'; fb.className = 'mv-fb ok';
      input.disabled = go.disabled = true;
      setTimeout(() => {
        input.disabled = go.disabled = false;
        if (n >= Q.length) finale(); else { fb.className = 'mv-fb'; show(); }
      }, 800);
    } else {
      wrong++; SFX.oops();
      fb.textContent = 'not quite — try again'; fb.className = 'mv-fb bad';
      main.classList.remove('shake'); void main.offsetWidth; main.classList.add('shake');
      if (wrong >= 3) hintBtn.hidden = false;
    }
  }
  go.onclick = submit;
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  hintBtn.onclick = () => { const a = Q[n][0]; fb.textContent = `hint: starts with "${a[0].toUpperCase()}" and has ${a.replace(/[^a-z]/g, '').length} letters`; fb.className = 'mv-fb'; };

  function finale() {
    SFX.win();
    const ov = h('div', { class: 'finale' });
    const words = h('div', { class: 'fin-words' });
    let k = 0;
    GROUPS.forEach(g => {
      const w = h('div', { class: 'fin-w' });
      for (const ch of g) w.append(h('span', { class: 'fin-l', style: `animation-delay:${(k++) * .12}s` }, ch));
      words.append(w);
    });
    ov.append(words);
    const cols = ['#ffffff', '#ffd6dc', '#ff8fa3', '#ffffff', '#ffb3c1'];
    const flies = [];
    for (let i = 0; i < 22; i++) {
      const el = h('div', { class: 'fin-bf', html: butterflySVG(pick(cols), '#fff') });
      const sz = rand(40, 90); el.style.width = sz + 'px';
      ov.append(el);
      flies.push({ el, x: rand(0, innerWidth), y: rand(0, innerHeight), vx: rand(-1.4, 1.4), vy: rand(-1.4, 1.4), ph: rand(0, 6), sz });
    }
    const back = h('button', { class: 'g-next pop fin-back' }, 'Back to home');
    back.onclick = () => { location.hash = '#/'; };
    ov.append(back);
    document.body.append(ov);
    let raf, last = performance.now();
    const tick = now => {
      const dt = Math.min(2.2, (now - last) / 16.7); last = now;
      flies.forEach(f => {
        f.ph += .03 * dt;
        f.vx += Math.sin(f.ph * 1.7) * .05 * dt; f.vy += Math.cos(f.ph * 1.3) * .05 * dt;
        const sp = Math.hypot(f.vx, f.vy); if (sp > 1.8) { f.vx *= 1.8 / sp; f.vy *= 1.8 / sp; }
        f.x += f.vx * dt; f.y += f.vy * dt;
        if (f.x < -f.sz) f.x = innerWidth; if (f.x > innerWidth) f.x = -f.sz;
        if (f.y < -f.sz) f.y = innerHeight; if (f.y > innerHeight) f.y = -f.sz;
        f.el.style.transform = `translate(${f.x}px,${f.y}px) rotate(${Math.atan2(f.vy, f.vx) * 180 / Math.PI + 90}deg)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    ctx.onLeave(() => { cancelAnimationFrame(raf); ov.remove(); });
  }
  show();
};
