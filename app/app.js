// Leonida Trophy Guide: checklist, filters, spoiler setting, roadmap and
// progress that saves in localStorage and exports/imports as a JSON file.
// All data comes from data/trophies.json, fetched from this same app folder;
// the app makes no other request, so it works with the network off.
const STORE_KEY = 'gta6-trophy-guide-v1';
const KINDS = [
  { id: 'all', label: 'All' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'activities', label: 'Activities' },
  { id: 'online', label: 'Online' },
];
// Roadmap to the platinum, built from the official descriptions: which story
// chapters and missions, which collectibles and counts, in what order.
const ROADMAP = [
  {
    title: 'Play the story — Chapters 1–4 and the finale',
    text: 'Main missions in order: Gone Fishing, then Chapters 1 to 4 and the final mission, plus the named story missions (Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown, Operation Savage Glory). Keep a manual save at the start of every chapter — there is no mission replay.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: 'Do the meditation first — the one missable trophy',
    text: 'Meditate at all 18 spots, starting with Lucia\u2019s balcony in Chapter 1: that spot disappears when the chapter ends. Do it before you finish Chapter 1, then sweep the other 17 spots whenever you pass them.',
    ids: [28],
  },
  {
    title: 'Finish the character strands',
    text: 'Play the mission strands for Andy, Kenton, Billy, Randy and Tyrone through to each one\u2019s final mission, plus 8 stranger strands and Bret\u2019s hunt. Strands open as the story progresses, so sweep the map for markers after each chapter.',
    ids: [22, 23, 24, 26, 27, 25, 29],
  },
  {
    title: 'Collectibles across Leonida',
    text: 'Three card sets, WAiNK It at 100 locations, 100 vehicles discovered, all 52 areas explored, all 8 garages bought, 10 vehicles registered to the Scooter Bros app. These are cumulative — chip away at them while you travel.',
    ids: [30, 31, 35, 42, 54, 55],
  },
  {
    title: 'Activities and skills',
    text: '250 stunts, gold in all 42 Shooting Range challenges, drone-race wins at all 14 locations, 20 different race wins, beating Cal at fishing, one arcade game, a full bowling game, and 50 challenges. The shooting range is the only real skill gate here.',
    ids: [15, 16, 17, 18, 19, 20, 21, 32, 46, 51],
  },
  {
    title: 'Crime, money and chaos',
    text: 'Partner robberies, the undetected jewelry store, 5 bank vaults, one armored truck, one illegal operation per gang, the VCIA departure, the Rhino, Combat Focus, and the money trophies: $250,000 laundered and $100,000 spent. Plus the small-moment trophies on Ocean Beach and in the showroom.',
    ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 47, 48, 49, 50, 52, 53],
  },
  {
    title: 'Cleanup and 100%',
    text: 'Check the in-game completion screen and finish what it lists — A Long Road (100% completion) is the last trophy before the platinum, and it overlaps with almost everything above. Then Vice Got a Price! pops on its own.',
    ids: [14, 1],
  },
];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}'); } catch { saved = {}; }
const state = {
  earned: new Set((saved.earned ?? []).filter((n) => byName.has(n))),
  kind: 'all',
  grade: 'all',
  search: '',
  spoiler: saved.spoiler !== false,
  hideEarned: saved.hideEarned === true,
  selectedId: 28, // Positive Mental Attitude: the one missable trophy, shown first.
};

const $ = (id) => document.getElementById(id);
const els = {
  earnedCount: $('earnedCount'), progressPct: $('progressPct'), barFill: $('barFill'),
  barWrap: $('barWrap'), gradeChips: $('gradeChips'), missableBanner: $('missableBanner'),
  search: $('search'), kindFilters: $('kindFilters'), gradeFilter: $('gradeFilter'),
  spoilerToggle: $('spoilerToggle'), hideEarned: $('hideEarned'),
  listMeta: $('listMeta'), trophyList: $('trophyList'), emptyState: $('emptyState'),
  detail: $('detail'), stages: $('stages'),
  exportBtn: $('exportBtn'), importFile: $('importFile'),
};

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    earned: [...state.earned],
    spoiler: state.spoiler,
    hideEarned: state.hideEarned,
  }));
}

// The spoiler setting hides the name, description and guide of story
// trophies until they are earned — mirroring how PlayStation hides 28 of
// these trophies until earned. The platinum and the 100% trophy are the
// public goal, not story spoilers, so they always show.
function isHidden(t) {
  return state.spoiler && t.kind === 'story' && t.id !== 1 && t.id !== 14 && !state.earned.has(t.name);
}
function displayName(t) { return isHidden(t) ? 'Hidden story trophy' : t.name; }
function displayDesc(t) {
  return isHidden(t)
    ? 'Hidden until earned — this story trophy stays secret on PlayStation until you unlock it.'
    : t.description;
}
function gradeLabel(g) { return g[0].toUpperCase() + g.slice(1); }

function visibleTrophies() {
  const q = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind === 'online') return false; // the official list has no online trophies
    if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.hideEarned && state.earned.has(t.name)) return false;
    if (q) {
      const hay = isHidden(t)
        ? 'hidden story trophy'
        : `${t.name} ${t.description} ${t.guide} ${t.sources.map((s) => s.name).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const n = state.earned.size;
  els.earnedCount.textContent = String(n);
  els.progressPct.textContent = `(${Math.round((n / trophies.length) * 100)}%)`;
  els.barFill.style.width = `${(n / trophies.length) * 100}%`;
  els.barWrap.setAttribute('aria-valuenow', String(n));
  const counts = {};
  for (const t of trophies) {
    counts[t.grade] = counts[t.grade] ?? [0, 0];
    counts[t.grade][1] += 1;
    if (state.earned.has(t.name)) counts[t.grade][0] += 1;
  }
  els.gradeChips.replaceChildren();
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const [got, total] = counts[g];
    const span = document.createElement('span');
    span.className = 'chip';
    span.innerHTML = '';
    const b = document.createElement('b');
    b.textContent = `${gradeLabel(g)} ${got}/${total}`;
    span.append(b);
    els.gradeChips.append(span);
  }
}

function renderBanner() {
  els.missableBanner.replaceChildren();
  const strong = document.createElement('strong');
  strong.textContent = '1 missable trophy: ';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Positive Mental Attitude';
  btn.addEventListener('click', () => selectTrophy(28, true));
  const rest = document.createTextNode(
    ' — meditate at Lucia\u2019s balcony in Chapter 1, before the chapter ends. There is no mission replay.',
  );
  els.missableBanner.append(strong, btn, rest);
}

function renderKindFilters() {
  els.kindFilters.replaceChildren();
  for (const k of KINDS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = k.label;
    b.setAttribute('aria-pressed', String(state.kind === k.id));
    b.addEventListener('click', () => { state.kind = k.id; renderAll(); });
    els.kindFilters.append(b);
  }
}

function toggleEarned(t) {
  if (state.earned.has(t.name)) state.earned.delete(t.name);
  else state.earned.add(t.name);
  saveState();
  renderAll();
}

function cardFor(t) {
  const li = document.createElement('li');
  li.className = 'card' + (state.earned.has(t.name) ? ' earned' : '') + (state.selectedId === t.id ? ' selected' : '');
  li.dataset.id = String(t.id);
  const check = document.createElement('label');
  check.className = 'check';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${displayName(t)} as earned`);
  box.addEventListener('change', (e) => { e.stopPropagation(); toggleEarned(t); });
  check.append(box);
  const body = document.createElement('div');
  body.className = 'card-body';
  const tags = document.createElement('div');
  tags.className = 'card-tags';
  const grade = document.createElement('span');
  grade.className = `grade-badge grade-${t.grade}`;
  grade.textContent = gradeLabel(t.grade);
  tags.append(grade);
  const kind = document.createElement('span');
  kind.className = 'kind-tag';
  kind.textContent = t.kind;
  tags.append(kind);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'missable-tag';
    m.textContent = 'Missable';
    tags.append(m);
  }
  if (t.count) {
    const c = document.createElement('span');
    c.className = 'count-tag';
    c.textContent = `× ${t.count}`;
    tags.append(c);
  }
  const h = document.createElement('h3');
  h.textContent = displayName(t);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = displayDesc(t);
  body.append(tags, h, desc);
  if (!isHidden(t)) {
    const teaser = document.createElement('p');
    teaser.className = 'teaser';
    teaser.textContent = t.guide.split('. ')[0] + '.';
    body.append(teaser);
  }
  li.append(check, body);
  li.addEventListener('click', (e) => {
    if (e.target === box) return;
    selectTrophy(t.id, false);
  });
  return li;
}

function renderList() {
  const list = visibleTrophies();
  els.listMeta.textContent = state.kind === 'online'
    ? 'Showing 0 of 55 — the official list has no online trophies; all 55 are single-player.'
    : `Showing ${list.length} of ${trophies.length} trophies` +
      (state.earned.size ? ` · ${state.earned.size} earned` : '');
  els.trophyList.replaceChildren();
  els.emptyState.hidden = list.length > 0;
  if (list.length === 0) {
    els.emptyState.textContent = state.kind === 'online'
      ? 'No online trophies. The official list (Exophase, via Push Square, 18 Nov 2026) is all single-player — nothing here needs GTA Online.'
      : 'No trophies match these filters. Clear the search or pick another kind or grade.';
  }
  for (const t of list) els.trophyList.append(cardFor(t));
}

function selectTrophy(id, scroll) {
  state.selectedId = id;
  renderList();
  renderDetail();
  if (scroll) els.detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderDetail() {
  const t = byId.get(state.selectedId) ?? trophies[0];
  const d = els.detail;
  d.replaceChildren();
  const tags = document.createElement('div');
  tags.className = 'card-tags';
  const grade = document.createElement('span');
  grade.className = `grade-badge grade-${t.grade}`;
  grade.textContent = gradeLabel(t.grade);
  tags.append(grade);
  const kind = document.createElement('span');
  kind.className = 'kind-tag';
  kind.textContent = t.kind;
  tags.append(kind);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'missable-tag';
    m.textContent = 'Missable';
    tags.append(m);
  }
  if (t.count) {
    const c = document.createElement('span');
    c.className = 'count-tag';
    c.textContent = `× ${t.count}`;
    tags.append(c);
  }
  const h = document.createElement('h2');
  h.textContent = displayName(t);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = displayDesc(t);
  d.append(tags, h, desc);

  if (isHidden(t)) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Spoiler hidden: turn off “Hide story spoilers” above, or earn this trophy, to reveal its guide and sources.';
    d.append(note);
  } else {
    if (t.missable && t.missable_reason) {
      const warn = document.createElement('p');
      warn.className = 'spoiler-note';
      warn.textContent = `Why it is missable: ${t.missable_reason}`;
      d.append(warn);
    }
    const gl = document.createElement('p');
    gl.className = 'guide-label';
    gl.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    d.append(gl, guide);
    const sl = document.createElement('p');
    sl.className = 'sources-label';
    sl.textContent = 'Sources';
    const ul = document.createElement('ul');
    ul.className = 'sources';
    for (const s of t.sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      li.append(a);
      ul.append(li);
    }
    d.append(sl, ul);
  }

  const row = document.createElement('label');
  row.className = 'earned-row';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(t.name);
  box.addEventListener('change', () => toggleEarned(t));
  const span = document.createElement('span');
  span.textContent = state.earned.has(t.name) ? 'Earned — ticked off' : 'Mark as earned';
  row.append(box, span);
  d.append(row);

  const nav = document.createElement('div');
  nav.className = 'nav-row';
  const list = visibleTrophies();
  const idx = list.findIndex((x) => x.id === t.id);
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = '← Previous';
  prev.disabled = idx <= 0;
  prev.addEventListener('click', () => selectTrophy(list[idx - 1].id, false));
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next →';
  next.disabled = idx < 0 || idx >= list.length - 1;
  next.addEventListener('click', () => selectTrophy(list[idx + 1].id, false));
  nav.append(prev, next);
  d.append(nav);
}

function renderRoadmap() {
  els.stages.replaceChildren();
  ROADMAP.forEach((stage, i) => {
    const li = document.createElement('li');
    li.className = 'stage';
    const num = document.createElement('div');
    num.className = 'stage-num';
    num.textContent = String(i + 1);
    const body = document.createElement('div');
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'stage-chips';
    for (const id of stage.ids) {
      const t = byId.get(id);
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = displayName(t);
      if (state.earned.has(t.name)) b.classList.add('done');
      b.addEventListener('click', () => selectTrophy(id, true));
      chips.append(b);
    }
    body.append(h, p, chips);
    li.append(num, body);
    els.stages.append(li);
  });
}

function renderAll() {
  renderProgress();
  renderBanner();
  renderKindFilters();
  renderList();
  renderDetail();
  renderRoadmap();
}

function exportProgress() {
  const payload = {
    app: 'gta6-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned],
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    const known = names.filter((n) => byName.has(n));
    if (known.length === 0) throw new Error('no known trophies');
    state.earned = new Set(known);
    saveState();
    renderAll();
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
}

els.exportBtn.addEventListener('click', exportProgress);
els.importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) importProgress(file);
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned ticks?')) {
    state.earned.clear();
    saveState();
    renderAll();
  }
});
els.search.addEventListener('input', () => { state.search = els.search.value; renderList(); });
els.gradeFilter.addEventListener('change', () => { state.grade = els.gradeFilter.value; renderList(); });
els.spoilerToggle.checked = state.spoiler;
els.spoilerToggle.addEventListener('change', () => {
  state.spoiler = els.spoilerToggle.checked;
  saveState();
  renderAll();
});
els.hideEarned.checked = state.hideEarned;
els.hideEarned.addEventListener('change', () => {
  state.hideEarned = els.hideEarned.checked;
  saveState();
  renderList();
});

renderAll();
