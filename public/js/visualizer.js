// Animation page. Express (via EJS) already ran the algorithm and embedded
// the result as JSON, so this file only plays the steps back.
const $ = (id) => document.getElementById(id);

const { array, steps } = JSON.parse($('viz-data').textContent);
const state = { idx: -1, playing: false, timer: null };

const TAG_COLORS = {
  low: '#60a5fa', prev: '#60a5fa',
  high: '#c084fc', jump: '#c084fc',
  mid: '#fbbf24', pos: '#fbbf24', i: '#fbbf24', mid1: '#fbbf24',
  mid2: '#fb923c',
  found: '#34d399',
};

/* ---------------- build the boxes + log ---------------- */
function build() {
  const viz = $('viz');
  viz.innerHTML = '';
  array.forEach((v, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerHTML = `<div class="tags"></div><div class="box">${v}</div><div class="idx">${i}</div>`;
    viz.appendChild(cell);
  });

  const log = $('log');
  steps.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = s.msg;
    li.addEventListener('click', () => { pause(); go(i); });
    log.appendChild(li);
  });
}

/* ---------------- playback ---------------- */
function delay() {
  return 1900 - Number($('speed').value) * 170; // slider 1 -> ~1730ms, 10 -> 200ms
}

function play() {
  if (state.idx >= steps.length - 1) go(0);
  state.playing = true;
  $('playBtn').textContent = '⏸';
  clearInterval(state.timer);
  state.timer = setInterval(() => {
    if (state.idx >= steps.length - 1) return pause();
    go(state.idx + 1);
  }, delay());
}

function pause() {
  state.playing = false;
  clearInterval(state.timer);
  $('playBtn').textContent = '▶';
}

/* ---------------- render one step ---------------- */
function go(i) {
  i = Math.max(0, Math.min(steps.length - 1, i));
  const prevIdx = state.idx;
  state.idx = i;
  const step = steps[i];
  const last = i === steps.length - 1;

  // everything compared in earlier steps counts as "checked"
  const visited = new Set();
  let comparisons = 0;
  for (let j = 0; j <= i; j++) {
    steps[j].compare.forEach((c) => { visited.add(c); comparisons++; });
  }
  if (step.found !== undefined) visited.delete(step.found);

  // current search range = last range defined up to this step
  let range = null;
  for (let j = i; j >= 0; j--) {
    if (steps[j].range) { range = steps[j].range; break; }
  }

  // pointers: index -> [labels]
  const byIndex = {};
  Object.entries(step.pointers || {}).forEach(([name, idx]) => {
    if (idx >= 0 && idx < array.length) (byIndex[idx] = byIndex[idx] || []).push(name);
  });

  const cells = $('viz').children;
  for (let k = 0; k < cells.length; k++) {
    const cell = cells[k];
    let cls = 'cell';
    if (range) cls += k >= range[0] && k <= range[1] ? ' in-range' : ' out';
    if (visited.has(k)) cls += ' visited';
    if (step.compare.includes(k)) cls += ' current';
    if (step.found === k) cls += ' found';
    cell.className = cls;

    const tags = cell.querySelector('.tags');
    tags.innerHTML = '';
    (byIndex[k] || []).forEach((name) => {
      const t = document.createElement('span');
      t.className = 'tag';
      t.textContent = name;
      const color = TAG_COLORS[name] || '#e2e8f0';
      t.style.background = color;
      t.style.borderTopColor = color;
      tags.appendChild(t);
    });
  }

  $('viz').classList.toggle('notfound', !!step.notFound);

  const msg = $('message');
  msg.textContent = step.msg;
  msg.className = 'message' + (step.found !== undefined ? ' ok' : step.notFound ? ' bad' : '');

  $('sStep').textContent = `${i + 1} / ${steps.length}`;
  $('sCmp').textContent = comparisons;
  $('sStatus').textContent = step.found !== undefined ? '✅ Found' : step.notFound ? '❌ Not found' : last ? 'Done' : 'Searching…';
  $('bar').style.width = `${((i + 1) / steps.length) * 100}%`;

  const items = $('log').children;
  for (let k = 0; k < items.length; k++) items[k].classList.toggle('active', k === i);
  if (items[i]) {
    const box = $('log');
    box.scrollTop = items[i].offsetTop - box.offsetTop - 60;
  }

  if (step.found !== undefined && prevIdx !== i) confetti();
}

/* ---------------- confetti ---------------- */
function confetti() {
  const canvas = $('confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const colors = ['#7c5cff', '#22d3ee', '#34d399', '#fbbf24', '#f472b6'];
  const parts = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2,
    y: innerHeight * 0.55,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 15 - 4,
    s: 5 + Math.random() * 6,
    c: colors[Math.floor(Math.random() * colors.length)],
    r: Math.random() * 6,
  }));
  let frames = 0;
  (function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.r += 0.2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    });
    if (++frames < 110) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}

/* ---------------- wire up ---------------- */
build();
$('playBtn').addEventListener('click', () => (state.playing ? pause() : play()));
$('nextBtn').addEventListener('click', () => { pause(); go(state.idx + 1); });
$('prevBtn').addEventListener('click', () => { pause(); go(state.idx - 1); });
$('resetBtn').addEventListener('click', () => { pause(); go(0); play(); });
$('speed').addEventListener('input', () => { if (state.playing) { pause(); play(); } });

go(0);
setTimeout(play, 700);
