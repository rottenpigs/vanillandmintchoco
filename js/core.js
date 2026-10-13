'use strict';
/* =========================================================
   CORE: helpers, data, audio, effects, home screen, game shell
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of kids.flat()) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(c)); }
  return e;
}
const rand = (a, b) => Math.random() * (b - a) + a;
const ri = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[ri(0, a.length - 1)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pad2 = n => String(n).padStart(2, '0');

/* ---------- images with fallbacks ---------- */
const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const local = p => EXTS.map(e => `assets/${p}.${e}`);
function smartImg(cands, fb, cls) {
  const img = new Image();
  if (cls) img.className = cls;
  img.referrerPolicy = 'no-referrer';
  img.alt = '';
  img.draggable = false;
  let i = 0;
  const next = () => {
    if (i >= cands.length) {
      img.onerror = null;
      const f = fb && fb();
      if (f && img.parentNode) img.replaceWith(f); else if (!f) img.style.display = 'none';
      return;
    }
    img.src = cands[i++];
  };
  img.onerror = next;
  next();
  return img;
}
const PALS = ['#d90429', '#ef233c', '#a4161a', '#e5383b', '#ba181b', '#ff4d6d', '#8d0801'];
const initialPh = (txt, cls, i = 0) => () => h('div', { class: (cls || '') + ' ph', style: `background:${PALS[i % PALS.length]}` }, txt);

/* ---------- audio (all synthesized, soft) ---------- */
let AC = null;
function ac() {
  try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { }
  return AC;
}
function note(f, t, d, o = {}) {
  const a = ac(); if (!a) return;
  const { type = 'sine', v = .06, to = null } = o;
  const os = a.createOscillator(), g = a.createGain(), T = a.currentTime + t;
  os.type = type; os.frequency.setValueAtTime(f, T);
  if (to) os.frequency.exponentialRampToValueAtTime(to, T + d);
  g.gain.setValueAtTime(.0001, T);
  g.gain.exponentialRampToValueAtTime(v, T + .01);
  g.gain.exponentialRampToValueAtTime(.0001, T + d);
  os.connect(g).connect(a.destination);
  os.start(T); os.stop(T + d + .05);
}
const SFX = {
  chime() { [1318.5, 1568, 2093].forEach((f, i) => note(f, i * .13, .9, { v: .03 })); note(659, 0, 1.1, { v: .018 }); },
  pop() { note(520, 0, .12, { type: 'triangle', v: .06, to: 900 }); },
  oops() { note(240, 0, .22, { type: 'square', v: .025, to: 150 }); },
  tick() { note(880, 0, .06, { type: 'triangle', v: .03 }); },
  match() { note(660, 0, .15, { type: 'triangle', v: .05 }); note(990, .1, .25, { type: 'triangle', v: .05 }); },
  win() { [523, 659, 784, 1047].forEach((f, i) => note(f, i * .11, .35, { type: 'triangle', v: .05 })); },
  wah() {
    const a = ac(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter(), t = a.currentTime;
    o.type = 'sawtooth'; f.type = 'lowpass';
    g.gain.setValueAtTime(.0001, t);
    [[311, 0, .6], [294, .65, .6], [277, 1.3, .6], [247, 1.95, 1.05]].forEach(([fr, s, d]) => {
      o.frequency.setValueAtTime(fr, t + s);
      f.frequency.setValueAtTime(500, t + s);
      f.frequency.linearRampToValueAtTime(1800, t + s + d * .5);
      f.frequency.linearRampToValueAtTime(400, t + s + d);
      g.gain.setValueAtTime(.0001, t + s);
      g.gain.linearRampToValueAtTime(.1, t + s + .05);
      g.gain.setValueAtTime(.1, t + s + d - .08);
      g.gain.linearRampToValueAtTime(.0001, t + s + d);
    });
    const lfo = a.createOscillator(), lg = a.createGain();
    lfo.frequency.value = 6; lg.gain.value = 8; lfo.connect(lg).connect(o.frequency);
    lfo.start(t + 1.95); lfo.stop(t + 3);
    o.connect(f).connect(g).connect(a.destination);
    o.start(t); o.stop(t + 3.05);
  },
  laugh() {
    const a = ac(); if (!a) return; const t = a.currentTime;
    for (let i = 0; i < 9; i++) {
      const s = i * .2, f0 = 260 - i * 6 + ri(-12, 12);
      const o = a.createOscillator(), g = a.createGain(), bp = a.createBiquadFilter();
      o.type = 'sawtooth'; bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 2;
      o.frequency.setValueAtTime(f0 * 1.25, t + s); o.frequency.exponentialRampToValueAtTime(f0, t + s + .15);
      g.gain.setValueAtTime(.0001, t + s); g.gain.exponentialRampToValueAtTime(.16, t + s + .02); g.gain.exponentialRampToValueAtTime(.0001, t + s + .16);
      o.connect(bp).connect(g).connect(a.destination); o.start(t + s); o.stop(t + s + .2);
    }
  }
};
function playLaugh() { // uses assets/audio/laugh.mp3 if you add one, otherwise a synthesized laugh
  const au = new Audio('assets/audio/laugh.mp3'); au.volume = .8;
  au.addEventListener('error', () => SFX.laugh(), { once: true });
  au.play().catch(() => SFX.laugh());
}

/* ---------- DATA ---------- */
const FRIENDS = [
  ['johnnyjsuh', 'MURDER MYSTERY 2'], ['taeoxo_nct', 'MACHINE PARTY'], ['yuu_taa_1026', 'KARINDERYA'],
  ['_jeongjaehyun', 'DETECTIVE DUCK'], ['tenlee_1001', 'CARVE WOOD'], ['haechanahceah', 'A QUIET PLACE'],
  ['djxiao_888', 'DEAD RAILS'], ['na.jaemin0813', 'ANIMAL HOSPITAL'], ['kun11xd', 'LAST TOP'],
  ['_shotaroo_', 'CARRY THE GLASS'], ['leejen_o_423', 'WHO FARTED?'], ['the__and.y', 'NIGHT AT THE INFIRMARY'],
  ['imnotningning', 'M.E.G'], ['vousmevoyez', 'IRON SOUL: DUNGEON']
].map(([u, g]) => ({ u, g }));

const MOVIES = [
  ['IRON MAN', 79, 'https://upload.wikimedia.org/wikipedia/en/0/02/Iron_Man_%282008_film%29_poster.jpg'],
  ['LOVE ISLAND AUSTRALIA', 61, 'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p25948805_b_v8_ac.jpg'],
  ['SCREAM', 74, 'https://m.media-amazon.com/images/I/7114ViRptyL.jpg'],
  ['WRONG TURN', 61, 'https://m.media-amazon.com/images/M/MV5BNGI5YWE4OTUtNTY2My00ZThmLWI5MTctM2U1YjhlODIxNTM2XkEyXkFqcGc@._V1_.jpg'],
  ['13 GOING ON 30', 65, 'https://m.media-amazon.com/images/M/MV5BMjE1NzI5NTkwMF5BMl5BanBnXkFtZTYwOTA4NzY2._V1_.jpg'],
  ['THE FALCON AND THE WINTER SOLDIER', 71, 'https://preview.redd.it/new-poster-for-the-falcon-and-the-winter-soldier-v0-5lcwk6xa95g61.jpg?auto=webp&s=b0bbac65773d71471986e5b4ff317c2a7e9b6fce'],
  ['READY OR NOT 2: HERE I COME', 65, 'https://preview.redd.it/official-poster-for-ready-or-not-2-here-i-come-v0-nhg46ckrwz4g1.jpeg?auto=webp&s=28fd97de89df04dbc25819df77b4d39457f538ff'],
  ['MAXXXINE', 62, 'https://upload.wikimedia.org/wikipedia/en/0/06/MaXXXine_%28poster%29.jpg'],
  ['OBSESSION', 78, 'https://i.redd.it/pmd8l3c219yg1.jpeg'],
  ['NOBODY', 74, 'https://preview.redd.it/official-poster-for-nobody-bob-odenkirk-plays-a-bystander-v0-9o8tmfirsd461.jpg?width=640&crop=smart&auto=webp&s=10574e926f76c6cb19163f73c6905442067b45dd'],
  ['NIGHT AT THE MUSEUM', 65, 'https://m.media-amazon.com/images/M/MV5BNGMyYjYyZDAtNzRiZC00ZjRkLTkwYjktODkxODQzNTFiMTVmXkEyXkFqcGc@._V1_.jpg'],
  ['HOW TO LOSE A GUY IN 10 DAYS', 66, 'https://m.media-amazon.com/images/M/MV5BMjE4NTA1NzExN15BMl5BanBnXkFtZTYwNjc3MjM3._V1_FMjpg_UX1000_.jpg']
].map(([t, r, u]) => ({ t, r, u }));

// [title, giphy id, header animal]
const GAMES_META = [
  ['happy birthday', 'nzgUOEYIU6lEu3awFo', '🐹'],
  ['happy monthsary', 'ockWXwGw4sJDhuFnMC', '🦉'],
  ['i love you', '12qmIyVnqFCMN2', '🐱'],
  ["you're my best friend", 'gKBaTLVPMKSGc', '🦦'],
  ['my forever', 'WoaFejnZvxZew', '🦋'],
  ['my world', 'KCdoj9F1OkJOmjf52W', '🐰'],
  ['my ever after', 'EKoaMZrIsCWIMbq1G0', '🐼'],
  ['my sweetheart', 'eE54UEcQEE4WA', '🦊'],
  ['my happiness', '5zTzgrTIFwe6d33yJT', '🐧'],
  ['my happy place', 'nSkIDOUmDd5odGUmnh', '🐨'],
  ['and my family', 'a3wTqwzjYQCiboWVQA', '🐸'],
  ['я тебя люблю, my cherry', 'l1Ku4wc2kZgE4Au7S', '🦈']
].map(([t, id, animal]) => ({ t, gif: `https://media.giphy.com/media/${id}/giphy.gif`, animal }));

const CAT_NAMES = ['Nathan', 'Cy', 'MJ', 'Anasui', 'Gene', 'Lance', 'Claude', 'Harper', 'Sloane', 'Blair', 'Axl', 'Jen', 'Ethan', 'Venice', 'Mina', 'Kelsey', 'Tris', 'Raissa', 'Chu', 'Cherry', 'Jilliane', 'Alice', 'Lacy', 'Roxy', 'Rieve', 'Jo', 'Raion', 'Chuchay', 'Oreo', 'Rai', 'Hale'];
const CAT_EMOJI = ['🐱', '😺', '😸', '🐈', '🐈‍⬛', '😻', '😽', '😼'];

const GAMES = [];            // each: function(ctx) filled by games1/2/3.js
const state = { cur: -1, pageClean: [], gameClean: [] };

/* ---------- shared svg ---------- */
function butterflySVG(color, accent) {
  const w = `<path d="M32 24C22 4 3 4 6 21C8 32 22 33 32 26Z" fill="${color}"/><path d="M32 26C23 28 12 40 20 45C27 47 32 36 32 26Z" fill="${accent || color}" opacity=".85"/><path d="M14 14c3 0 6 2 7 5" stroke="#fff" stroke-opacity=".6" fill="none" stroke-width="1.6" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 64 48"><g class="wings"><g>${w}</g><g transform="matrix(-1 0 0 1 64 0)">${w}</g></g><rect x="30.5" y="13" width="3" height="24" rx="1.5" fill="#14090b"/><path d="M31 14q-4-7-8-8M33 14q4-7 8-8" stroke="#14090b" fill="none" stroke-width="1.3" stroke-linecap="round"/></svg>`;
}
const ICON = {
  up: '<svg viewBox="0 0 24 24"><path d="M7 11v9H4v-9zM7 11l4-8c2 0 3 1 3 3v3h5.5a2 2 0 0 1 2 2.4l-1.3 6.6a2 2 0 0 1-2 1.6H7"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M17 13V4h3v9zM17 13l-4 8c-2 0-3-1-3-3v-3H4.5a2 2 0 0 1-2-2.4L3.8 6a2 2 0 0 1 2-1.6H17"/></svg>',
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c3 0 5 2 5 5"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 17v-6a6 6 0 1 1 12 0v6l2 2H4z"/><path d="M10 21h4"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.3l1.1-6.2L3 9.7l6.2-.9z"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M14 4l7 7-7 7v-4c-6 0-9 2-11 6 0-7 3-12 11-12z"/></svg>',
  flag: '<svg viewBox="0 0 24 24"><path d="M5 21V4M5 5h12l-2 4 2 4H5"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4v16l14-8z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg>'
};

/* ---------- popups & global effects ---------- */
function flashPic(path, emoji, ms = 1900) {
  const w = h('div', { class: 'flashpic' });
  w.append(smartImg(local(path), () => h('div', { class: 'flashemoji' }, emoji), 'flashimg'));
  w.addEventListener('click', () => w.remove());
  $('#overlay').append(w);
  setTimeout(() => w.classList.add('out'), ms - 350);
  setTimeout(() => w.remove(), ms);
}
function floatStars() {
  const box = h('div', { class: 'fxbox' });
  const svg = '<svg viewBox="0 0 24 24"><path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
  for (let i = 0; i < 46; i++) {
    const s = h('i', { class: 'fstar', html: svg });
    const sz = rand(18, 46);
    s.style.cssText = `left:${rand(0, 100)}%;width:${sz}px;height:${sz}px;animation-duration:${rand(2.6, 4.4)}s;animation-delay:${rand(0, 1)}s;--dx:${rand(-60, 60)}px;--r:${rand(-180, 180)}deg;${i % 3 ? '' : 'filter:none'}`;
    if (i % 4 === 0) s.classList.add('red');
    box.append(s);
  }
  $('#overlay').append(box);
  setTimeout(() => box.remove(), 5600);
}
const OWL = `<svg viewBox="0 0 100 100" class="owl"><g class="wingL"><ellipse cx="20" cy="60" rx="14" ry="26" transform="rotate(18 20 60)"/></g><g class="wingR"><ellipse cx="80" cy="60" rx="14" ry="26" transform="rotate(-18 80 60)"/></g><ellipse cx="50" cy="62" rx="27" ry="30"/><path d="M26 34 30 12 44 26zM74 34 70 12 56 26z"/><ellipse cx="50" cy="42" rx="27" ry="23"/><g fill="#fff"><circle cx="39" cy="42" r="10"/><circle cx="61" cy="42" r="10"/></g><g class="pup"><circle cx="40" cy="43" r="5"/><circle cx="60" cy="43" r="5"/><circle cx="41.6" cy="41" r="1.6" fill="#fff" stroke="none"/><circle cx="61.6" cy="41" r="1.6" fill="#fff" stroke="none"/></g><path class="beak" d="M46 51 50 59 54 51z"/><g class="fth" fill="none"><path d="M42 68q4 4 8 0M50 68q4 4 8 0M46 76q4 4 8 0"/></g><circle class="blush" cx="30" cy="52" r="3.5"/><circle class="blush" cx="70" cy="52" r="3.5"/></svg>`;
function flyOwl() {
  const o = h('div', { class: 'owlfly', html: OWL });
  $('#overlay').append(o);
  setTimeout(() => o.remove(), 8200);
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200);
}
function confetti(n = 70, host = $('#overlay'), emojis = ['💖', '✨', '🎉', '🌸', '⭐']) {
  const box = h('div', { class: 'fxbox' });
  for (let i = 0; i < n; i++) {
    box.append(h('i', { class: 'conf', style: `left:${rand(0, 100)}%;font-size:${rand(16, 34)}px;animation-duration:${rand(2.2, 4)}s;animation-delay:${rand(0, 1.2)}s;--dx:${rand(-80, 80)}px` }, pick(emojis)));
  }
  host.append(box); setTimeout(() => box.remove(), 6000);
}

/* typewriter */
function typeInto(el, text, speed = 26, skipTarget) {
  return new Promise(res => {
    let i = 0, done = false;
    el.textContent = '';
    const caret = h('span', { class: 'caret' });
    el.append(caret);
    const fin = () => { if (done) return; done = true; clearInterval(iv); el.textContent = text; res(); };
    const iv = setInterval(() => {
      i++;
      el.textContent = text.slice(0, i); el.append(caret);
      if (i % 3 === 0) SFX.tick && 0;
      if (i >= text.length) fin();
    }, speed);
    (skipTarget || el).addEventListener('click', fin, { once: true });
    state.gameClean.push(() => { done = true; clearInterval(iv); });
  });
}

/* ---------- HOME ---------- */
function renderHome() {
  const fr = $('#friends'); fr.innerHTML = '';
  fr.append(h('div', { class: 'fr add' },
    h('div', { class: 'av addav', html: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-4 2.6-6 6-6 1.6 0 3 .5 4 1.3"/><path d="M18 13v7M14.5 16.5h7"/></svg>' }),
    h('div', { class: 'fn' }, 'Add Friends')));
  FRIENDS.forEach((f, i) => {
    const av = h('div', { class: 'av' });
    av.append(smartImg(local('friends/' + f.u), initialPh(f.u.replace(/[^a-z0-9]/gi, '')[0].toUpperCase(), 'avph', i), 'avimg'), h('i', { class: 'dot' }));
    fr.append(h('div', { class: 'fr', title: `${f.u} — ${f.g}` }, av, h('div', { class: 'fn' }, f.u), h('div', { class: 'fg' }, f.g)));
  });

  const mv = $('#movies'); mv.innerHTML = '';
  MOVIES.forEach((m, i) => {
    const c = [m.u, ...local('movies/' + pad2(i + 1))];
    const th = h('div', { class: 'mvimg' });
    th.append(smartImg(c, () => null, 'mvbg'), smartImg(c, initialPh(m.t, 'mvph', i), 'mvfg'));
    mv.append(h('div', { class: 'mv' }, th,
      h('div', { class: 'mvt' }, m.t),
      h('div', { class: 'mvr', html: ICON.up + `<span>${m.r}% Rating in IMDb</span>` })));
  });

  const ct = $('#continue'); ct.innerHTML = '';
  GAMES_META.forEach((g, i) => {
    const th = h('div', { class: 'ctimg' });
    th.append(smartImg([g.gif], () => h('div', { class: 'ctph' }, g.t)));
    ct.append(h('a', { class: 'ct', href: `#/game/${i + 1}` }, th, h('div', { class: 'ctt' }, g.t)));
  });

  const av = () => smartImg(local('profile/aleksei'), initialPh('A', 'avph'), 'avimg');
  $('#topAv').replaceChildren(av()); $('#sideAv').replaceChildren(av());
}
$$('.tab').forEach(b => b.addEventListener('click', () => {
  $$('.tab').forEach(x => x.classList.toggle('on', x === b));
  if (b.dataset.tab === 'charts') { toast('charts are still being cooked 🍳'); setTimeout(() => { $$('.tab').forEach(x => x.classList.toggle('on', x.dataset.tab === 'foryou')); }, 900); }
}));

/* ---------- routing ---------- */
function runClean(list) { while (list.length) { try { list.pop()(); } catch (e) { } } }
function showHome() {
  runClean(state.gameClean); runClean(state.pageClean);
  state.cur = -1;
  $('#game').hidden = true; $('#game').innerHTML = '';
  $('#home').hidden = false; $('#side').classList.remove('away');
  $('#overlay').innerHTML = '';
  document.body.classList.remove('ingame');
  window.scrollTo(0, 0);
}
function route() {
  if (!$('#friends').children.length) renderHome();
  const m = location.hash.match(/^#\/game\/(\d+)/);
  const i = m ? +m[1] - 1 : -1;
  if (i >= 0 && i < GAMES_META.length) openGame(i); else showHome();
}
window.addEventListener('hashchange', route);

/* ---------- GAME PAGE ---------- */
function openGame(i) {
  runClean(state.gameClean); runClean(state.pageClean);
  $('#overlay').innerHTML = '';
  state.cur = i;
  const meta = GAMES_META[i];
  const rating = ri(68, 99), active = ri(120, 999);
  $('#home').hidden = true;
  document.body.classList.add('ingame');
  const g = $('#game'); g.hidden = false; g.innerHTML = '';
  g.style.setProperty('--hue', i);

  /* hero */
  const hero = h('div', { class: 'g-hero' });
  const bg = h('div', { class: 'g-bg' });
  bg.append(smartImg([meta.gif], () => null, 'g-bgimg'));
  const flash = h('div', { class: 'g-flash' }, h('span', { class: 'fa' }, meta.animal), h('i', { class: 's1' }, '✦'), h('i', { class: 's2' }, '✧'), h('i', { class: 's3' }, '✦'));
  const thumb = h('div', { class: 'g-thumb' });
  thumb.append(smartImg([meta.gif], () => h('div', { class: 'ph gph' }, meta.t)));
  const close = h('button', { class: 'g-close', 'aria-label': 'Close', html: ICON.x, onclick: () => { location.hash = '#/'; } });
  const playBtn = h('button', { class: 'g-play', html: ICON.play, 'aria-label': 'Play again', title: 'Restart this one' });
  hero.append(bg, flash, close,
    h('div', { class: 'g-head' }, thumb,
      h('div', { class: 'g-info' },
        h('h1', {}, meta.t),
        h('div', { class: 'g-mat' }, 'Maturity: Mild'),
        h('div', { class: 'g-by' }, 'ALEKSEI'),
        playBtn)));
  // gif for a few seconds, then flash a cute animal, repeat
  const cycle = () => {
    flash.classList.add('on');
    setTimeout(() => flash.classList.remove('on'), 1500);
  };
  const t1 = setTimeout(function loop() { cycle(); state.pageClean.push(() => clearTimeout(t2)); t2 = setTimeout(loop, 6500); }, 4500);
  let t2; state.pageClean.push(() => { clearTimeout(t1); clearTimeout(t2); });

  /* actions row */
  const likeBtn = h('button', { class: 'pill-b like', html: ICON.up, 'aria-label': 'Like' });
  const dislikeBtn = h('button', { class: 'pill-b dislike', html: ICON.down, 'aria-label': 'Dislike' });
  const pct = h('span', { class: 'pct' }, rating + '%');
  const rate = h('div', { class: 'ratepill' }, likeBtn, pct, dislikeBtn);
  let vote = 0;
  likeBtn.onclick = () => {
    if (vote === 1) { vote = 0; } else { vote = 1; SFX.pop(); flashPic('reactions/like', '💖', 1900); }
    likeBtn.classList.toggle('on', vote === 1); dislikeBtn.classList.remove('on');
  };
  dislikeBtn.onclick = () => {
    if (vote === -1) { vote = 0; } else { vote = -1; SFX.oops(); flashPic('reactions/dislike', '💔', 1900); }
    dislikeBtn.classList.toggle('on', vote === -1); likeBtn.classList.remove('on');
  };
  const actBtn = h('button', { class: 'abtn', html: ICON.people + `<span>${active} active</span>` });
  actBtn.onclick = () => openActive(active);
  const bellBtn = h('button', { class: 'abtn bell', html: ICON.bell + '<span>Notify</span>' });
  bellBtn.onclick = () => { bellBtn.classList.add('ring'); bellBtn.classList.toggle('on'); SFX.chime(); setTimeout(() => bellBtn.classList.remove('ring'), 1100); };
  const favBtn = h('button', { class: 'abtn', html: ICON.star + '<span>Favorite</span>' });
  favBtn.onclick = () => { favBtn.classList.toggle('on'); floatStars(); SFX.pop(); };
  const shBtn = h('button', { class: 'abtn', html: ICON.share + '<span>Share</span>' });
  shBtn.onclick = () => { flyOwl(); SFX.pop(); };
  const repBtn = h('button', { class: 'abtn', html: ICON.flag + '<span>Report</span>' });
  repBtn.onclick = () => { flashPic('reactions/crying-cat', '😿', 2200); SFX.oops(); };
  const actions = h('div', { class: 'g-actions' }, rate, actBtn, bellBtn, favBtn, shBtn, repBtn);

  /* stage + next */
  const stage = h('div', { class: 'g-stage', id: 'stage' });
  const last = i === GAMES_META.length - 1;
  const nextBtn = h('button', { class: 'g-next', hidden: '' }, last ? 'Back to home' : 'Next');
  nextBtn.onclick = () => { location.hash = last ? '#/' : `#/game/${i + 2}`; };

  g.append(hero, actions, stage, h('div', { class: 'g-nextwrap' }, nextBtn));

  const ctx = {
    root: stage, i,
    showNext() { nextBtn.hidden = false; nextBtn.classList.add('pop'); setTimeout(() => nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250); },
    onLeave(fn) { state.gameClean.push(fn); }
  };
  const start = () => {
    runClean(state.gameClean); stage.innerHTML = ''; stage.className = 'g-stage g' + (i + 1);
    nextBtn.hidden = true; nextBtn.classList.remove('pop');
    GAMES[i](ctx);
  };
  playBtn.onclick = () => { start(); stage.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  start();
  window.scrollTo(0, 0);
}

/* active list: same names every time, random order per click, each with a cat icon */
function openActive(n) {
  const order = shuffle(CAT_NAMES.map((name, i) => ({ name, i: i + 1 })));
  const list = h('div', { class: 'act-list' });
  order.forEach(o => {
    const av = h('div', { class: 'catav' });
    av.append(smartImg(local('cats/' + pad2(o.i)), () => h('div', { class: 'ph catph', style: `background:${PALS[o.i % PALS.length]}` }, CAT_EMOJI[o.i % CAT_EMOJI.length])), h('i', { class: 'dot' }));
    list.append(h('div', { class: 'act-row' }, av, h('div', { class: 'act-n' }, h('b', {}, o.name), h('small', {}, 'Active now'))));
  });
  const m = h('div', { class: 'modal' },
    h('div', { class: 'modal-card' },
      h('div', { class: 'modal-h' }, h('b', {}, `${n} active`), h('button', { class: 'modal-x', html: ICON.x, onclick: () => m.remove() })),
      list));
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  $('#overlay').append(m);
}
