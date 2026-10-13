'use strict';
/* =========================================================
   GAME 5 — my world: sharks swim, then form "i love you"
   ========================================================= */
function drawShark(c, x, y, s, dir, wag) {
  c.save(); c.translate(x, y); c.scale(dir * s, s);
  c.lineWidth = 0.06; c.strokeStyle = '#14090b'; c.lineJoin = 'round';
  // tail
  c.fillStyle = '#fff';
  c.beginPath(); c.moveTo(-.38, 0); c.lineTo(-.74, -.26 + wag * .12); c.quadraticCurveTo(-.6, 0, -.72, .24 + wag * .1); c.closePath(); c.fill(); c.stroke();
  // dorsal fin
  c.beginPath(); c.moveTo(-.08, -.22); c.lineTo(.04, -.5); c.lineTo(.2, -.2); c.closePath(); c.fill(); c.stroke();
  // body
  c.beginPath(); c.ellipse(0, 0, .5, .27, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  // belly
  c.fillStyle = '#ffe3e6'; c.beginPath(); c.ellipse(.04, .12, .38, .13, 0, 0, Math.PI); c.fill();
  // pectoral fin
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(.0, .15); c.lineTo(-.12, .38); c.lineTo(.14, .2); c.closePath(); c.fill(); c.stroke();
  // eye, blush, smile
  c.fillStyle = '#14090b'; c.beginPath(); c.arc(.3, -.05, .045, 0, 7); c.fill();
  c.fillStyle = '#ff4d6d'; c.beginPath(); c.arc(.2, .06, .06, 0, 7); c.fill();
  c.strokeStyle = '#14090b'; c.lineWidth = .035; c.beginPath(); c.arc(.36, .07, .07, .1, 1.4); c.stroke();
  c.restore();
}

GAMES[5] = function (ctx) {
  const root = ctx.root;
  const wrap = h('div', { class: 'sk-wrap' });
  const cv = h('canvas', { class: 'sk-cv' });
  const txt = h('div', { class: 'sk-txt' }, 'i love you');
  wrap.append(cv, txt); root.append(wrap);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = wrap.clientWidth, H = wrap.clientHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  const c = cv.getContext('2d'); c.scale(dpr, dpr);

  // sample text points
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  const oc = off.getContext('2d');
  let fs = 200; oc.font = `700 ${fs}px Fredoka, Nunito, sans-serif`;
  const phrase = 'I LOVE YOU';
  fs = Math.min(fs * (W * .86) / oc.measureText(phrase).width, H * .5);
  oc.font = `700 ${fs}px Fredoka, Nunito, sans-serif`; oc.textAlign = 'center'; oc.textBaseline = 'middle';
  oc.fillStyle = '#000'; oc.fillText(phrase, W / 2, H / 2);
  const data = oc.getImageData(0, 0, W, H).data;
  let step = Math.max(10, Math.round(fs / 11)), pts;
  for (; ; step += 2) {
    pts = [];
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 140) pts.push([x, y]);
    if (pts.length <= 300) break;
  }
  const size = step * 1.9;
  const sharks = pts.map(([tx, ty]) => ({ x: rand(0, W), y: rand(0, H), vx: rand(-1.4, 1.4) || 1, vy: rand(-.8, .8), tx, ty, d: 1, ph: rand(0, 6), sz: size * rand(.85, 1.1) }));

  let t0 = performance.now(), phase = 0, raf, shown = false;
  const tick = now => {
    const t = (now - t0) / 1000;
    c.clearRect(0, 0, W, H);
    if (phase === 0 && t > 5.5) { phase = 1; txt.classList.add('fade'); }
    let settled = 0;
    sharks.forEach(s => {
      s.ph += .12;
      if (phase === 0) {
        s.vy += Math.sin(s.ph * .4) * .02; s.vx += Math.cos(s.ph * .2) * .01;
        const sp = Math.hypot(s.vx, s.vy), mx = 1.7; if (sp > mx) { s.vx *= mx / sp; s.vy *= mx / sp; }
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0 || s.x > W) s.vx *= -1; if (s.y < 0 || s.y > H) s.vy *= -1;
        s.x = Math.max(0, Math.min(W, s.x)); s.y = Math.max(0, Math.min(H, s.y));
        s.d = s.vx >= 0 ? 1 : -1;
      } else {
        const dx = s.tx - s.x, dy = s.ty - s.y, dist = Math.hypot(dx, dy);
        const k = Math.min(1, (t - 5.5) / 2.5);
        const sp = Math.min(dist, 2 + 9 * k);
        if (dist > 1.5) { s.x += dx / dist * sp; s.y += dy / dist * sp; s.d = dx >= 0 ? 1 : -1; }
        else { s.x = s.tx; s.y = s.ty; s.d = 1; settled++; }
      }
      const bob = phase && settled ? Math.sin(s.ph * .5) * 1.2 : 0;
      drawShark(c, s.x, s.y + bob, s.sz, s.d, Math.sin(s.ph));
    });
    if (phase === 1 && !shown && settled > sharks.length * .97) { shown = true; SFX.win(); ctx.showNext(); }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  ctx.onLeave(() => cancelAnimationFrame(raf));
};

/* =========================================================
   GAME 6 — my ever after: sort the rainbow
   ========================================================= */
GAMES[6] = function (ctx) {
  const root = ctx.root;
  const COLS = ['#e63946', '#ff9f1c', '#ffd60a', '#2ec27e', '#3a86ff', '#5a4fcf', '#9b5de5'];
  const NAMES = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
  let order;
  do { order = shuffle([0, 1, 2, 3, 4, 5, 6]); } while (order.every((v, i) => v === i));
  let sel = -1, moves = 0, solved = false;
  const info = h('div', { class: 'rb-info' }, 'the colors are all mixed up. tap two bands to swap them until the rainbow is right.');
  const cx = 300, cy = 300, R0 = 270, GAP = 34;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 600 340'); svg.setAttribute('class', 'rb-svg');
  const arcs = [];
  for (let k = 0; k < 7; k++) {
    const r = R0 - k * GAP;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', `M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}`);
    p.setAttribute('class', 'rb-arc'); p.setAttribute('stroke-width', GAP - 3);
    p.addEventListener('click', () => pickBand(k));
    svg.append(p); arcs.push(p);
  }
  const clouds = `<g fill="#fff" stroke="#14090b" stroke-width="3"><path d="M20 330c-14 0-20-12-12-20 4-6 14-8 20-3 2-10 16-14 24-6 8-6 20 0 20 10 10 0 14 14 4 19z" transform="translate(0 -8)"/><path d="M470 330c-14 0-20-12-12-20 4-6 14-8 20-3 2-10 16-14 24-6 8-6 20 0 20 10 10 0 14 14 4 19z" transform="translate(70 -8)"/></g>`;
  const cl = document.createElementNS('http://www.w3.org/2000/svg', 'g'); cl.innerHTML = clouds; svg.append(cl);
  const msg = h('div', { class: 'rb-msg', hidden: '' }, h('p', {}, 'I know, I\'m making you work too hard on your birthday and on our monthsary. But I know you won\'t accept anything that involves money so... ironic, isn\'t it? I really hope you\'re having fun though.'));
  const counter = h('div', { class: 'rb-count' }, 'swaps: 0');
  root.append(info, svg, counter, msg);
  const paint = () => arcs.forEach((p, k) => { p.setAttribute('stroke', COLS[order[k]]); p.classList.toggle('sel', k === sel); });
  paint();
  function pickBand(k) {
    if (solved) return;
    SFX.tick();
    if (sel < 0) { sel = k; paint(); return; }
    if (sel === k) { sel = -1; paint(); return; }
    [order[sel], order[k]] = [order[k], order[sel]]; sel = -1; moves++;
    counter.textContent = `swaps: ${moves}`; SFX.pop(); paint();
    if (order.every((v, i) => v === i)) {
      solved = true; svg.classList.add('solved'); SFX.win(); confetti(40, root, ['🌈', '✨', '💖', '☁️']);
      info.textContent = 'a perfect rainbow ♡';
      setTimeout(() => { msg.hidden = false; msg.classList.add('show'); msg.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 800);
      setTimeout(() => ctx.showNext(), 2600);
    }
  }
};

/* =========================================================
   GAME 7 — my sweetheart: alek's diary
   ========================================================= */
const INK = 'currentColor';
const FXDEF = {
  stars: { n: 22, s: [12, 28], a: 'twinkle', svg: '<path d="M10 1 12 8 19 10 12 12 10 19 8 12 1 10 8 8z"/>' },
  cry: { n: 12, s: [26, 38], a: 'fall', svg: '<circle cx="10" cy="10" r="8"/><path d="M6 8q1.5-2 3 0M11 8q1.5-2 3 0M7.5 14.5q2.5-2.5 5 0"/><path d="M6.5 10.5q-1.2 2.5 0 3.6M13.5 10.5q1.2 2.5 0 3.6"/>' },
  wilt: { n: 8, s: [38, 56], a: 'sway', svg: '<path d="M10 20C10 14 11 9 14 5"/><circle cx="14.5" cy="4.5" r="2.4"/><path d="M12 5q-4-1-5 3M17 5q3 1 3 5M13 7q1 4-2 5"/><path d="M10 15q-4-1-5 2"/>' },
  diamond: { n: 14, s: [20, 34], a: 'twinkle', svg: '<path d="M5 3H15L19 8 10 19 1 8z"/><path d="M1 8H19M7 3 10 8 13 3M10 8V19"/>' },
  blossom: { n: 16, s: [20, 32], a: 'fall', svg: '<path d="M10 10C6 6 6 2 10 1 14 2 14 6 10 10zM10 10C14 6 18 7 18 11 16 14 12 13 10 10zM10 10C14 14 14 18 10 19 6 18 6 14 10 10zM10 10C6 14 2 13 2 9 4 6 8 7 10 10z"/><circle cx="10" cy="10" r="1"/>' },
  cherry: { n: 12, s: [26, 40], a: 'fall', svg: '<path d="M6 13C7 8 9 4 15 2M14 13C13 8 13 4 15 2"/><circle cx="6" cy="15" r="3.4"/><circle cx="14" cy="15" r="3.4"/><path d="M15 2q3 0 4 3-3 1-4-3z"/>' },
  fly: { n: 8, s: [28, 44], a: 'flutter', svg: '<path d="M10 10C6 2 1 3 2 8c1 4 5 4 8 2zM10 10C14 2 19 3 18 8c-1 4-5 4-8 2zM10 11C6 12 4 17 7 18c3 0 3-4 3-7zM10 11c4 1 6 6 3 7-3 0-3-4-3-7z"/><path d="M10 6v10"/>' },
  rain: { n: 70, s: [10, 20], a: 'rain', svg: '<path d="M10 1 8 19"/>' },
  rainbow: { n: 6, s: [60, 100], a: 'float', svg: '<path d="M1 18a9 9 0 0 1 18 0M4 18a6 6 0 0 1 12 0M7 18a3 3 0 0 1 6 0"/>' },
  mist: { n: 9, s: [140, 260], a: 'drift', svg: '<path d="M0 6q3-4 5 0t5 0 5 0 5 0M0 12q3-4 5 0t5 0 5 0 5 0" />', wide: true },
  fog: { n: 6, s: [200, 340], a: 'drift2', svg: '<path d="M0 5q4-5 8 0t8 0 8 0M2 10q4-5 8 0t8 0 8 0M0 15q4-5 8 0t8 0 8 0" />', wide: true },
  glow: { n: 5, s: [90, 260], a: 'pulse', svg: '<circle cx="10" cy="10" r="9"/><circle cx="10" cy="10" r="6"/>', center: true },
  spiral: { n: 5, s: [50, 110], a: 'spin', svg: '<path d="M10 10c0-1 1-1.5 1.5-1s0 2-1.5 2.4-3-.5-3-2.4 2-4 4.5-4 5 2 5 5-3 6.5-7 6.5-7.5-3-7.5-8" />' },
  flower: { n: 12, s: [26, 40], a: 'rise', svg: '<circle cx="10" cy="10" r="2"/><circle cx="10" cy="4.5" r="3"/><circle cx="15.2" cy="8.2" r="3"/><circle cx="13.2" cy="14.2" r="3"/><circle cx="6.8" cy="14.2" r="3"/><circle cx="4.8" cy="8.2" r="3"/>' },
  moon: { n: 0 }
};
function spawnFx(host, type) {
  host.innerHTML = '';
  if (!type) return;
  const d = FXDEF[type];
  if (type === 'moon') {
    host.innerHTML = `<svg class="moonfx" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M138 30a58 58 0 1 0 28 98 46 46 0 0 1-28-98z" /><g class="rays"><path d="M120 120 40 200M130 125 80 200M142 130 125 200M108 112 0 170M150 134 170 200"/></g></svg>`;
    for (let i = 0; i < 9; i++) {
      const s = h('i', { class: 'fxi a-twinkle', html: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M10 3v14M3 10h14"/></svg>`, style: `left:${rand(5, 90)}%;top:${rand(5, 70)}%;width:${rand(8, 16)}px;height:${rand(8, 16)}px;animation-delay:${rand(0, 3)}s` });
      host.append(s);
    }
    return;
  }
  for (let i = 0; i < d.n; i++) {
    const sz = rand(d.s[0], d.s[1]);
    const el = h('i', { class: `fxi a-${d.a}`, html: `<svg viewBox="0 0 ${d.wide ? '24 20' : '20 20'}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">${d.svg}</svg>` });
    const left = d.center ? 50 : rand(-4, 96), top = d.center ? 55 : rand(0, 92);
    el.style.cssText = `left:${left}%;top:${top}%;width:${sz}px;height:${d.wide ? sz * .8 : sz}px;animation-delay:${-rand(0, 8)}s;animation-duration:${d.a === 'rain' ? rand(.7, 1.3) : rand(5, 11)}s;--dx:${rand(-30, 30)}px`;
    if (d.center) el.style.marginLeft = el.style.marginTop = `${-sz / 2}px`;
    host.append(el);
  }
}
const SHARK_DOODLES = [
  '<path d="M6 34C14 14 40 10 64 24c8-4 18-4 24-14 0 10-4 20-12 24 6 4 10 10 10 18-8-4-14-6-22-4-18 6-44 2-58-14z"/><path d="M34 12 40 0 48 14M46 38l-6 12 14-8"/><circle cx="22" cy="28" r="2"/><path d="M12 34q5 4 10 2"/>',
  '<path d="M4 40c10-18 32-24 54-14 10-6 20-6 28-18 2 14-2 24-12 30 6 6 8 12 6 18-10-6-18-6-28-2C34 58 14 56 4 40z"/><path d="M30 22 38 6 48 24"/><circle cx="20" cy="36" r="2"/><path d="M8 42q8 6 16 2"/>'
];
function sharkDoodle(i, w) {
  return h('span', { class: 'sdood', style: `width:${w}px`, html: `<svg viewBox="0 0 96 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SHARK_DOODLES[i % 2]}</svg>` });
}

const DIARY = [
  [{ t: 'how many times have i told her i love her? i wonder if she ever gets tired of hearing it from me.', fx: 'stars' }, { t: 'she sent me another picture today. i think i\'m in love. oh no.', fx: 'cry' }],
  [{ t: 'i told her i love her for the first time today. of course, i pretended to be casual about it but... my heart\'s pounding out of my chest.', fx: 'moon' }, { t: 'i had an episode today. i want to talk to her again, but i feel shy and awkward. have i made her uncomfortable?', fx: 'wilt' }],
  [{ t: 'she\'s the one i want to marry.', fx: 'diamond' }, { t: 'i really hate changes, so i don\'t feel as comfortable with these feelings that i harbor for her. but at the same time, i can\'t breathe when she\'s not with me. what to do?', fx: 'blossom' }],
  [{ t: 'she reminds me of cherries. i don\'t really know why. and oh, butterflies.', fx: 'cherry+fly' }, { t: '', fx: null }],
  [{ t: '', fx: null }, { t: 'missing her again today.', fx: 'rain' }],
  [{ t: 'we got back together. this is maybe the happiest i have ever felt in two years.', fx: 'rainbow' }, { t: '', fx: null }],
  [{ t: '', fx: null }, { t: 'i feel insecure. what if i cannot give her what she wants and needs from me?', fx: 'mist' }],
  [{ t: 'i broke up with her again. why do i keep doing this to us?', fx: 'fog' }, { t: 'mom told me to get her back and gave me the ring dad gave her. all on her deathbed. how am i supposed to take this?', fx: 'glow' }],
  [{ t: 'we\'re talking again. i missed her. i completely forgot i have unfinished business with... eh. she doesn\'t deserve this kind of treatment so i will finish that business, and we vowed to just stay friends. and maybe i am okay with just being friends. am i? how do i tell people that whenever i talk to her, i feel like a teenage boy talking to his first time crush? with her presence alone reminds me that she\'s the one i\'ve ever wanted, but i don\'t want to ruin this friendship.', fx: 'spiral' }, { t: 'i dreamt of her today. god, she fills every aspect of my life.', fx: 'flower' }]
];

GAMES[7] = function (ctx) {
  const root = ctx.root;
  const wrap = h('div', { class: 'dy' });
  root.append(wrap);

  /* cover */
  const cover = h('div', { class: 'dy-cover' });
  const doodles = h('div', { class: 'dy-doodles' });
  for (let i = 1; i <= 15; i++) {
    const w = rand(70, 120);
    const box = h('div', { class: 'dy-d', style: `left:${rand(-2, 88)}%;top:${rand(-2, 86)}%;width:${w}px;transform:rotate(${rand(-40, 40)}deg)` });
    box.append(smartImg(local('sharks/' + pad2(i)), () => sharkDoodle(i, w)));
    doodles.append(box);
  }
  cover.append(doodles,
    h('div', { class: 'dy-label' },
      h('h2', {}, "alek's diary"),
      h('p', {}, 'these are real entries from my diary'),
      h('button', { class: 'dy-open' }, 'open the diary')));
  wrap.append(cover);
  cover.querySelector('.dy-open').onclick = () => { SFX.pop(); cover.classList.add('opened'); setTimeout(() => { cover.remove(); openBook(); }, 650); };

  function openBook() {
    const book = h('div', { class: 'dy-book' });
    const L = h('div', { class: 'dy-page l' }), R = h('div', { class: 'dy-page r' });
    const mk = p => { p.append(h('div', { class: 'fxl' }), h('div', { class: 'ptx' }), h('div', { class: 'dood' })); };
    mk(L); mk(R);
    const spine = h('div', { class: 'dy-spine' });
    const turn = h('button', { class: 'dy-turn', hidden: '' }, 'turn the page');
    const count = h('div', { class: 'dy-no' });
    book.append(L, R, spine);
    wrap.append(book, h('div', { class: 'dy-bar' }, count, turn));

    let idx = 0, busy = false, alive = true;
    ctx.onLeave(() => { alive = false; });

    async function fill(side, d, spreadIdx) {
      const host = side.querySelector('.fxl'), tx = side.querySelector('.ptx'), dd = side.querySelector('.dood');
      tx.textContent = ''; dd.innerHTML = '';
      if (d.fx && d.fx.includes('+')) {
        const [a, b] = d.fx.split('+'); spawnFx(host, a);
        const extra = h('div', { class: 'fxl2' }); host.append(extra); spawnFx(extra, b);
      } else spawnFx(host, d.fx);
      if (!d.t) { dd.append(sharkDoodle(spreadIdx + (side === R ? 1 : 0), 90)); }
    }
    async function writeBoth(d) {
      for (const [side, p] of [[L, d[0]], [R, d[1]]]) {
        if (!p.t) continue;
        await typeInto(side.querySelector('.ptx'), p.t, 24, side);
        if (!alive) return;
      }
    }
    async function show(i) {
      count.textContent = i < DIARY.length ? `page ${i + 1} of ${DIARY.length}` : '';
      if (i >= DIARY.length) return end();
      const d = DIARY[i];
      await fill(L, d[0], i); await fill(R, d[1], i);
      busy = true; turn.hidden = true;
      await writeBoth(d);
      if (!alive) return;
      busy = false; turn.hidden = false; turn.textContent = i === DIARY.length - 1 ? 'close the diary' : 'turn the page';
    }
    turn.onclick = async () => {
      if (busy) return; busy = true; turn.hidden = true; SFX.pop();
      const fl = h('div', { class: 'dy-flip' }, h('div', { class: 'ff' }), h('div', { class: 'fb' }));
      book.append(fl);
      await sleep(900); fl.remove();
      idx++; await show(idx);
    };
    function end() {
      L.querySelector('.fxl').innerHTML = ''; R.querySelector('.fxl').innerHTML = '';
      L.querySelector('.ptx').textContent = ''; L.querySelector('.dood').innerHTML = ''; R.querySelector('.dood').innerHTML = '';
      L.querySelector('.dood').append(sharkDoodle(0, 140));
      R.querySelector('.ptx').innerHTML = '<div class="theend">the end</div>';
      R.querySelector('.dood').append(sharkDoodle(1, 110));
      spawnFx(R.querySelector('.fxl'), 'stars');
      turn.hidden = true; count.textContent = '';
      SFX.win();
      setTimeout(() => ctx.showNext(), 900);
    }
    show(0);
  }
};

/* =========================================================
   GAME 8 — my happiness: the "math quiz"
   ========================================================= */
GAMES[8] = function (ctx) {
  const root = ctx.root;
  const bits = ['a² + b² = c²', 'x² − 5x + 6 = 0', 'π', '∠ABC = 90°', 'f(x) = 2x + 3', 'sin²θ + cos²θ = 1', 'y = mx + b', '√144 = 12', 'Δ', 'r = 7', '∑', 'x = ?', '3x + 7 = 22', 'A = πr²'];
  const shapes = ['<path d="M5 45 25 5 45 45z"/>', '<circle cx="25" cy="25" r="20"/>', '<rect x="6" y="6" width="38" height="38"/>', '<path d="M25 3 45 18 38 44H12L5 18z"/>', '<path d="M3 45 45 45 45 5z"/><path d="M38 45v-7h7"/>', '<path d="M2 25H48M25 2V48"/><path d="M25 25 45 10"/>'];
  const box = h('div', { class: 'mq' });
  const bgl = h('div', { class: 'mq-bg' });
  bits.forEach(b => bgl.append(h('span', { class: 'mq-f', style: `left:${rand(0, 90)}%;top:${rand(0, 92)}%;animation-delay:${-rand(0, 8)}s;font-size:${rand(16, 30)}px` }, b)));
  for (let i = 0; i < 12; i++) bgl.append(h('span', { class: 'mq-s', style: `left:${rand(0, 92)}%;top:${rand(0, 90)}%;width:${rand(36, 74)}px;animation-delay:${-rand(0, 8)}s`, html: `<svg viewBox="0 0 50 50" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round">${pick(shapes)}</svg>` }));
  const title = h('div', { class: 'mq-t' });
  [...'ready for your math quiz?'].forEach((ch, i) => title.append(h('span', { style: `animation-delay:${i * .07}s` }, ch === ' ' ? '\u00a0' : ch)));
  const psy = h('div', { class: 'mq-psy', hidden: '' }, 'PSYCHE!');
  const kid = h('div', { class: 'mq-kid', hidden: '' }, "just kidding. take a break. here's bucky barnes' fighting scenes.");
  const vid = h('div', { class: 'mq-vid', hidden: '' });
  box.append(bgl, title, psy, kid, vid);
  root.append(box);

  const T = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); T.push(t); };
  ctx.onLeave(() => T.forEach(clearTimeout));
  later(() => {
    box.classList.add('bright'); title.hidden = true; psy.hidden = false; playLaugh();
    confetti(60, box, ['🎉', '✨', '💥', '🎊']);
  }, 7000);
  later(() => { psy.classList.add('small'); kid.hidden = false; }, 9500);
  later(() => {
    vid.hidden = false;
    const f = h('iframe', { src: 'https://www.youtube.com/embed/Tbio5nr2ydk', title: 'Bucky Barnes fighting scenes', allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture', allowfullscreen: '' });
    f.addEventListener('load', () => { ctx.showNext(); }, { once: true });
    vid.append(h('div', { class: 'mq-frame' }, f));
    vid.append(h('p', { class: 'mq-alt' }, h('a', { href: 'https://www.youtube.com/watch?v=Tbio5nr2ydk', target: '_blank', rel: 'noopener' }, 'video not loading? open it on youtube')));
  }, 12500);
};
