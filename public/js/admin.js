/* 한국대학생포럼 홈페이지 - 소식 등록 화면
 *
 * 하는 일은 하나다: data/posts.json 과 data/newbodae.json 을 고쳐서 GitHub 에 올린다.
 * 토큰이 없으면 고친 결과를 파일로 내려받아 직접 올릴 수 있게 한다.
 */

const CFG_KEY = 'kuf_admin_cfg';

/* 🔴 저장소 안의 자리와 브라우저에서 보는 주소가 다르다.
   Next.js 는 public/ 을 주소 뿌리로 삼기 때문이다.
     저장소 public/data/posts.json  ↔  주소 /data/posts.json
     저장소 public/media/사진.jpg    ↔  주소 /media/사진.jpg
   JSON 안에는 '주소' 를 적고, 커밋할 때만 앞에 public 을 붙인다. */
const PATHS = { posts: 'data/posts.json', newbodae: 'data/newbodae.json', events: 'data/events.json' };
const repoPath = (webPath) => 'public/' + String(webPath).replace(/^\//, '');

const S = {
  kind: 'posts',
  data: { posts: null, newbodae: null, events: null },
  /** 일정 탭 달력이 보고 있는 달 */
  cal: null,
  /** 이번에 새로 얹을 이미지: [{path, base64, dataUrl, name}] */
  blobs: [],
  editingId: null,
  dirty: false,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ── 설정 ─────────────────────────────────────────────── */

function cfg() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch { return {}; }
}
function saveCfg(c) { localStorage.setItem(CFG_KEY, JSON.stringify(c)); }
function hasRepo() { const c = cfg(); return !!(c.owner && c.repo && c.token); }

function fillCfgForm() {
  const c = cfg();
  $('#cfg-owner').value = c.owner || '';
  $('#cfg-repo').value = c.repo || '';
  $('#cfg-branch').value = c.branch || 'main';
  $('#cfg-token').value = c.token || '';
}

/* ── 기록창 ───────────────────────────────────────────── */

function log(msg, keep = true) {
  const box = $('#log');
  box.hidden = false;
  box.textContent = (keep && box.textContent ? box.textContent + '\n' : '') + msg;
  box.scrollTop = box.scrollHeight;
}

/* ── GitHub ───────────────────────────────────────────── */

async function gh(path, opts = {}) {
  const c = cfg();
  const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${c.token}`,
      Accept: opts.raw ? 'application/vnd.github.raw' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`GitHub ${res.status} ${path}\n${detail.slice(0, 300)}`);
  }
  return opts.raw ? res.text() : res.json();
}

/** UTF-8 문자열 → base64. 한글이 섞여도 btoa 가 죽지 않게 바이트로 먼저 바꾼다. */
function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let out = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    out += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(out);
}

/**
 * 여러 파일을 커밋 하나로 묶어 올린다.
 * Contents API 를 파일마다 부르면 커밋이 여러 개 생겨 배포도 여러 번 돈다.
 * files: [{path, content}] 또는 [{path, base64}]
 */
async function commitFiles(files, message) {
  const c = cfg();
  const branch = c.branch || 'main';

  log(`· 브랜치 ${branch} 의 현재 위치를 확인합니다…`);
  const ref = await gh(`/git/ref/heads/${branch}`);
  const headSha = ref.object.sha;
  const head = await gh(`/git/commits/${headSha}`);

  const tree = [];
  for (const f of files) {
    log(`· 올리는 중: ${f.path}`);
    const blob = await gh('/git/blobs', {
      method: 'POST',
      body: JSON.stringify(
        f.base64 ? { content: f.base64, encoding: 'base64' } : { content: f.content, encoding: 'utf-8' }
      ),
    });
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const newTree = await gh('/git/trees', {
    method: 'POST',
    body: JSON.stringify({ base_tree: head.tree.sha, tree }),
  });
  const commit = await gh('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
  });
  await gh(`/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });
  return commit.sha;
}

/* ── 데이터 읽기 ───────────────────────────────────────── */

const EMPTY = {
  posts: { updated: '', posts: [] },
  newbodae: { updated: '', items: [] },
  events: { updated: '', events: [] },
};

/* 파일마다 목록이 담긴 열쇠 이름이 다르다. 한 곳에만 적어 둔다. */
const KEY = { posts: 'posts', newbodae: 'items', events: 'events' };
const KINDS = ['posts', 'newbodae', 'events'];

function listOf(kind) {
  return S.data[kind][KEY[kind]];
}
function setListOf(kind, arr) {
  S.data[kind][KEY[kind]] = arr;
}

async function loadOne(kind) {
  const path = PATHS[kind];
  /* 토큰이 있으면 GitHub 쪽을 원본으로 본다 - 배포 캐시 때문에 옛 내용을 볼 일이 없다. */
  if (hasRepo()) {
    try {
      const c = cfg();
      const text = await gh(`/contents/${repoPath(path)}?ref=${c.branch || 'main'}`, { raw: true });
      return JSON.parse(text);
    } catch (e) {
      log(`· ${path} 을 GitHub 에서 읽지 못했습니다(${e.message.split('\n')[0]}). 홈페이지 쪽을 봅니다.`);
    }
  }
  try {
    const res = await fetch('/' + path + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch {
    log(`· ${path} 을 읽지 못해 빈 목록으로 시작합니다.`);
    return structuredClone(EMPTY[kind]);
  }
}

async function loadAll() {
  for (const kind of KINDS) {
    S.data[kind] = await loadOne(kind);
    if (!Array.isArray(listOf(kind))) setListOf(kind, []);
  }
  sortAll();
  renderList();
}

function sortAll() {
  for (const kind of KINDS) {
    /* 소식·카드는 새 것이 위로(내림차순), 일정은 달력 순서 그대로 오름차순이 읽기 쉽다. */
    const dir = kind === 'events' ? 1 : -1;
    setListOf(kind, listOf(kind).slice().sort(
      (a, b) => dir * String(a.date || '').localeCompare(String(b.date || ''))
    ));
  }
}

/* ── 목록 그리기 ───────────────────────────────────────── */

function renderList() {
  const ul = $('#items');
  ul.textContent = '';
  const arr = listOf(S.kind);
  $('#side-title').textContent =
    S.kind === 'posts' ? `등록된 글 ${arr.length}건`
    : S.kind === 'newbodae' ? `등록된 카드 ${arr.length}건`
    : `등록된 일정 ${arr.length}건`;

  /* 일정은 목록보다 달력이 읽기 쉽다 - 언제 비어 있는지가 한눈에 보인다. */
  if (S.kind === 'events') { renderCal(); return; }

  if (!arr.length) {
    const li = document.createElement('li');
    li.className = 'none';
    li.textContent = '아직 없습니다. 「+ 새 글」로 시작하세요.';
    ul.appendChild(li);
    return;
  }

  arr.forEach((it) => {
    const li = document.createElement('li');
    if (it.id === S.editingId) li.className = 'on';
    const t = document.createElement('span');
    t.className = 't';
    t.textContent = it.title || '(제목 없음)';
    const m = document.createElement('span');
    m.className = 'm';
    const d = document.createElement('span');
    d.textContent = it.date || '';
    m.appendChild(d);
    if (S.kind === 'posts') {
      const c = document.createElement('span');
      c.textContent = it.category || '소식';
      m.appendChild(c);
      if (it.pinned) {
        const p = document.createElement('span');
        p.className = 'pin';
        p.textContent = '● 공지';
        m.appendChild(p);
      }
    }
    if ((it.images || []).length) {
      const im = document.createElement('span');
      im.textContent = `🖼 ${it.images.length}`;
      m.appendChild(im);
    }
    li.append(t, m);
    li.addEventListener('click', () => openEditor(it.id));
    ul.appendChild(li);
  });
}

/* ── 달력 (일정 탭) ───────────────────────────────────── */

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/** '2026-08-24' → {y,m,d} */
function ymd(date) {
  const [y, m, d] = String(date || '').split('-').map(Number);
  return { y, m, d };
}
function dateStr(y, m, d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${y}-${p(m)}-${p(d)}`;
}

function calCursor() {
  if (S.cal) return S.cal;
  /* 처음 열면 오늘이 있는 달. 일정이 한 건도 없어도 자리는 보여야 한다. */
  const t = ymd(todayStr());
  S.cal = { y: t.y, m: t.m };
  return S.cal;
}

function renderCal() {
  const { y, m } = calCursor();
  $('#cal-title').textContent = `${y}년 ${m}월`;

  const grid = $('#cal-grid');
  grid.textContent = '';

  WEEK.forEach((w) => {
    const s = document.createElement('span');
    s.className = 'cal-wd';
    s.textContent = w;
    grid.appendChild(s);
  });

  const lead = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const today = todayStr();

  for (let i = 0; i < lead; i++) {
    const cell = document.createElement('span');
    cell.className = 'cal-cell blank';
    grid.appendChild(cell);
  }

  for (let d = 1; d <= days; d++) {
    const date = dateStr(y, m, d);
    const cell = document.createElement('div');
    cell.className = 'cal-cell' + (date === today ? ' today' : '');

    /* 빈 곳을 누르면 그 날짜로 새 일정. 「+ 새 일정」을 누르고 날짜를 다시 고르는 수고를 던다. */
    const num = document.createElement('button');
    num.type = 'button';
    num.className = 'cal-day';
    num.textContent = d;
    num.title = `${m}월 ${d}일에 새 일정`;
    num.addEventListener('click', () => openEditor(null, date));
    cell.appendChild(num);

    listOf('events')
      .filter((e) => e.date === date)
      .forEach((e) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'cal-chip' + (e.id === S.editingId ? ' on' : '');
        chip.textContent = (e.time ? e.time + ' ' : '') + (e.title || '(제목 없음)');
        chip.title = '이 일정 고치기';
        chip.addEventListener('click', () => openEditor(e.id));
        cell.appendChild(chip);
      });

    grid.appendChild(cell);
  }
}

function moveCal(step) {
  const { y, m } = calCursor();
  const d = new Date(y, m - 1 + step, 1);
  S.cal = { y: d.getFullYear(), m: d.getMonth() + 1 };
  renderCal();
}

$('#cal-prev').addEventListener('click', () => moveCal(-1));
$('#cal-next').addEventListener('click', () => moveCal(1));
$('#cal-today').addEventListener('click', () => { S.cal = null; renderCal(); });

/* ── 편집기 ───────────────────────────────────────────── */

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 화면 위쪽 칸들 중 지금 탭에 없는 것들을 숨긴다. */
function applyKindUi() {
  const isPost = S.kind === 'posts';
  const isEvent = S.kind === 'events';

  $('#row-category').hidden = !isPost;
  $('#row-summary').hidden = !isPost;
  $('#row-pin').hidden = !isPost;
  $('#row-when').hidden = !isEvent;   // 시간·장소는 일정에만
  $('#row-images').hidden = isEvent;  // 일정에는 사진을 안 받는다
  $('#thumbs').hidden = isEvent;

  /* 일정 탭에서는 왼쪽이 목록이 아니라 달력이다 - 달력이 주인공이라 칸도 넓어진다. */
  $('#items').hidden = isEvent;
  $('#cal').hidden = !isEvent;
  $('.layout').classList.toggle('events', isEvent);
  $('#btn-new').textContent = isEvent ? '+ 새 일정' : '+ 새 글';
  $('#side-hint').innerHTML = isEvent
    ? '달력에서 <b>날짜</b>를 누르면 그 날 새 일정, <b>일정 이름</b>을 누르면 그 일정을 고칩니다.'
    : '지난 소식을 <b>누르면</b> 오른쪽에서 고칠 수 있습니다.';

  $('#f-body').placeholder = isPost
    ? '인스타 캡션을 그대로 붙여넣어도 됩니다. 빈 줄로 문단이 나뉩니다.'
    : isEvent
      ? '한 줄 안내(선택). 예) 사전 신청 없이 오셔도 됩니다.'
      : '카드 설명(캡션). 홈페이지 목록에는 앞부분만 보입니다.';
  $('#tab-note').textContent = isPost
    ? '새 글을 공지로 올리면 이전 공지는 자동으로 일반글이 됩니다.'
    : isEvent
      ? '홈페이지는 지난 일정 1건과 다가오는 일정 2건을 보여 주고, 「달력」으로도 볼 수 있습니다.'
      : '뉴보대 카드는 홈페이지에서 인스타 게시물로 바로 이어집니다.';
}

let pending = []; // 현재 편집 중인 글의 이미지 경로 목록

function openEditor(id, presetDate) {
  S.editingId = id;
  const it = listOf(S.kind).find((x) => x.id === id) || null;

  $('#f-title').value = it?.title || '';
  $('#f-date').value = it?.date || presetDate || todayStr();
  $('#f-time').value = it?.time || '';
  $('#f-place').value = it?.place || '';
  $('#f-category').value = it?.category || (S.kind === 'posts' ? '공지' : '');
  $('#f-permalink').value = it?.permalink || '';
  $('#f-summary').value = it?.summary || '';
  $('#f-body').value =
    (S.kind === 'posts' ? it?.body : S.kind === 'events' ? it?.note : it?.caption) || '';
  $('#f-pinned').checked = it ? !!it.pinned : true;
  $('#btn-delete').hidden = !it;
  $('#form-status').textContent = '';

  /* 지금 새 글을 쓰는 중인지, 있던 글을 고치는 중인지 위에 적어 둔다.
     목록을 눌러야 고쳐진다는 걸 알 방법이 없어 기능이 없는 줄 알았던 자리다. */
  const what = S.kind === 'posts' ? '소식' : S.kind === 'events' ? '일정' : '카드';
  $('.editor-head').classList.toggle('editing', !!it);
  $('#editor-mode').textContent = it ? `고치는 중: ${it.title || '(제목 없음)'}` : `새 ${what} 쓰기`;
  $('#editor-what').textContent = it
    ? S.kind === 'events'
      ? `${it.date || ''} 일정입니다. 고친 뒤 「저장」을 누르세요.`
      : `${it.date || ''} 에 올린 글입니다. 고친 뒤 「저장」을 누르세요.`
    : S.kind === 'events'
      ? '달력에서 날짜를 누르면 그 날짜로 시작합니다.'
      : '왼쪽에서 글을 고르면 그 글을 고칩니다.';
  $('#btn-save').textContent = it ? '고친 내용 저장' : `${what} 저장`;

  pending = (it?.images || []).slice();
  renderThumbs();
  renderList();
}

function renderThumbs() {
  const ul = $('#thumbs');
  ul.textContent = '';
  pending.forEach((path, i) => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    const fresh = S.blobs.find((b) => b.path === path);
    img.src = fresh ? fresh.dataUrl : path;
    img.alt = '';
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'rm';
    rm.textContent = '×';
    rm.title = '이 사진 빼기';
    rm.addEventListener('click', () => { pending.splice(i, 1); renderThumbs(); });
    const nm = document.createElement('span');
    nm.className = 'nm';
    nm.textContent = path;
    li.append(img, rm, nm);
    ul.appendChild(li);
  });
}

/** 파일 → 가로 1080px JPEG 데이터URL. 끄면 원본 그대로 읽는다. */
async function toDataUrl(file, shrink) {
  if (!shrink) {
    return await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1080 / bmp.width);
  const cv = document.createElement('canvas');
  cv.width = Math.round(bmp.width * scale);
  cv.height = Math.round(bmp.height * scale);
  cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
  bmp.close?.();
  return cv.toDataURL('image/jpeg', 0.88);
}

function extOf(dataUrl) {
  const m = /^data:image\/([a-z0-9+.-]+);/i.exec(dataUrl || '');
  const t = (m ? m[1] : 'jpeg').toLowerCase();
  return t === 'jpeg' ? 'jpg' : t === 'svg+xml' ? 'svg' : t;
}

function makeId(kind, date) {
  const base = kind === 'newbodae' ? `nb-${date}` : date;
  const used = new Set(listOf(kind).map((x) => x.id));
  let n = 1;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

$('#f-files').addEventListener('change', async (ev) => {
  const files = Array.from(ev.target.files || []);
  if (!files.length) return;
  const shrink = $('#f-shrink').checked;
  const date = $('#f-date').value || todayStr();
  const id = S.editingId || makeId(S.kind, date);

  for (const file of files) {
    try {
      const dataUrl = await toDataUrl(file, shrink);
      let n = pending.length + 1;
      /* JSON 에는 웹 주소(/media/…)를 적는다. 커밋할 때만 public 을 앞에 붙인다. */
      let path = `/media/${id}-${n}.${extOf(dataUrl)}`;
      while (pending.includes(path) || S.blobs.some((b) => b.path === path)) {
        path = `/media/${id}-${++n}.${extOf(dataUrl)}`;
      }
      S.blobs.push({ path, dataUrl, base64: dataUrl.split(',')[1], name: file.name });
      pending.push(path);
    } catch (e) {
      log(`🔴 ${file.name} 을 읽지 못했습니다: ${e.message}`);
    }
  }
  ev.target.value = '';
  renderThumbs();
  markDirty();
});

$('#form').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const date = $('#f-date').value || todayStr();
  const arr = listOf(S.kind);
  let it = arr.find((x) => x.id === S.editingId);
  const isNew = !it;

  if (isNew) {
    it = { id: makeId(S.kind, date) };
    arr.push(it);
  }

  it.title = $('#f-title').value.trim();
  it.date = date;

  if (S.kind === 'events') {
    it.time = $('#f-time').value.trim();
    it.place = $('#f-place').value.trim();
    it.note = $('#f-body').value.trim();
  } else {
    it.permalink = $('#f-permalink').value.trim();
    it.images = pending.slice();
  }

  if (S.kind === 'posts') {
    it.category = $('#f-category').value;
    it.summary = $('#f-summary').value.trim();
    it.body = $('#f-body').value;
    it.source = it.source || (it.permalink ? 'instagram' : 'manual');
    it.account = it.account || 'universityforum_korea';

    /* 공지는 한 건만. 새 글을 공지로 올리면 이전 공지가 일반글로 내려간다. */
    if ($('#f-pinned').checked) {
      arr.forEach((x) => { x.pinned = false; });
      it.pinned = true;
    } else {
      it.pinned = false;
    }
  } else if (S.kind === 'newbodae') {
    it.caption = $('#f-body').value;
  }

  S.data[S.kind].updated = todayStr();
  S.editingId = it.id;
  sortAll();
  renderList();
  markDirty();
  const what = S.kind === 'events' ? '일정' : '글';
  $('#form-status').textContent = isNew
    ? `새 ${what}으로 담았습니다 (${it.id}). 아래 「GitHub에 올리기」를 눌러야 홈페이지에 나옵니다.`
    : '고친 내용을 담았습니다. 아래에서 올리면 홈페이지에 반영됩니다.';
});

$('#btn-delete').addEventListener('click', () => {
  const it = listOf(S.kind).find((x) => x.id === S.editingId);
  if (!it) return;
  if (!confirm(`「${it.title || it.id}」 을(를) 목록에서 지웁니다.\n올린 뒤에는 홈페이지에서도 사라집니다. 계속할까요?`)) return;
  setListOf(S.kind, listOf(S.kind).filter((x) => x.id !== it.id));
  S.data[S.kind].updated = todayStr();
  S.editingId = null;
  renderList();
  openEditor(null);
  markDirty();
  $('#form-status').textContent = '지웠습니다. 「GitHub에 올리기」를 눌러야 홈페이지에도 반영됩니다.';
});

$('#btn-new').addEventListener('click', () => openEditor(null));

/* ── 탭 ───────────────────────────────────────────────── */

$$('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.tab').forEach((b) => b.classList.toggle('on', b === btn));
    S.kind = btn.dataset.kind;
    S.editingId = null;
    applyKindUi();
    renderList();
    openEditor(null);
  });
});

/* ── 내보내기 ─────────────────────────────────────────── */

function markDirty() {
  S.dirty = true;
  const st = $('#dock-state');
  st.classList.add('dirty');
  const imgs = S.blobs.length;
  st.textContent = `올릴 것 있음 - 목록 파일 ${KINDS.length}개${imgs ? ` + 사진 ${imgs}장` : ''}`;
  $('#btn-commit').disabled = !hasRepo();
}

function jsonText(kind) {
  return JSON.stringify(S.data[kind], null, 2) + '\n';
}

function download(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

$('#btn-download').addEventListener('click', async () => {
  log('── 파일로 내려받기 ──', false);
  for (const kind of KINDS) {
    download(kind + '.json', new Blob([jsonText(kind)], { type: 'application/json' }));
  }
  log('· posts.json / newbodae.json / events.json 을 받았습니다 → 저장소의 public/data/ 폴더에 덮어쓰세요.');
  for (const b of S.blobs) {
    await new Promise((r) => setTimeout(r, 350)); // 브라우저가 연속 내려받기를 막지 않도록 띄운다
    const bin = Uint8Array.from(atob(b.base64), (ch) => ch.charCodeAt(0));
    download(b.path.split('/').pop(), new Blob([bin]));
  }
  if (S.blobs.length) log(`· 사진 ${S.blobs.length}장을 받았습니다 → 저장소의 public/media/ 폴더에 넣으세요.`);
  log('· 브라우저가 「여러 파일 내려받기」를 물어보면 허용해야 전부 받아집니다.');
});

$('#btn-commit').addEventListener('click', async () => {
  if (!hasRepo()) { alert('먼저 「저장소 설정」에서 owner·repo·토큰을 채워 주세요.'); return; }
  const btn = $('#btn-commit');
  btn.disabled = true;
  log('── GitHub에 올리기 ──', false);
  try {
    const files = [
      ...KINDS.map((kind) => ({ path: repoPath(PATHS[kind]), content: jsonText(kind) })),
      ...S.blobs.map((b) => ({ path: repoPath(b.path), base64: b.base64 })),
    ];
    const sha = await commitFiles(files, `소식 갱신 (${todayStr()})`);
    S.blobs = [];
    S.dirty = false;
    $('#dock-state').classList.remove('dirty');
    $('#dock-state').textContent = '올렸습니다';
    log(`✅ 커밋 ${sha.slice(0, 7)} 완료. Vercel 이 다시 빌드해 1~3분 안에 새로 띄웁니다.`);
    log('· 홈페이지에서 바로 안 보이면 새로고침(Ctrl+Shift+R)을 한 번 하세요.');
  } catch (e) {
    log(`🔴 실패: ${e.message}`);
    log('· 토큰 권한(Contents: Read and write)과 브랜치 이름을 확인해 주세요.');
  } finally {
    btn.disabled = !hasRepo();
  }
});

/* ── 설정 화면 ─────────────────────────────────────────── */

$('#btn-settings').addEventListener('click', () => { $('#settings').hidden = !$('#settings').hidden; });

$('#btn-cfg-save').addEventListener('click', async () => {
  saveCfg({
    owner: $('#cfg-owner').value.trim(),
    repo: $('#cfg-repo').value.trim(),
    branch: $('#cfg-branch').value.trim() || 'main',
    token: $('#cfg-token').value.trim(),
  });
  $('#cfg-status').textContent = hasRepo() ? '저장했습니다. 목록을 다시 읽습니다…' : '저장했습니다(토큰 없음 - 내려받기 방식으로 씁니다).';
  $('#btn-commit').disabled = !(hasRepo() && S.dirty);
  await loadAll();
  $('#cfg-status').textContent = '준비됐습니다.';
});

$('#btn-cfg-clear').addEventListener('click', () => {
  const c = cfg();
  delete c.token;
  saveCfg(c);
  $('#cfg-token').value = '';
  $('#btn-commit').disabled = true;
  $('#cfg-status').textContent = '토큰을 지웠습니다.';
});

window.addEventListener('beforeunload', (e) => {
  if (S.dirty) { e.preventDefault(); e.returnValue = ''; }
});

/* ── 시작 ─────────────────────────────────────────────── */

(async function start() {
  fillCfgForm();
  applyKindUi();
  if (!hasRepo()) $('#settings').hidden = false;
  await loadAll();
  openEditor(null);
})();
