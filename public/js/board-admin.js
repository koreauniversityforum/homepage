/* 한국대학생포럼 - 게시판 승인 화면
 *
 * 방문자가 올린 글은 무조건 「승인 대기」로 들어온다(막는 일은 DB 안에서 한다).
 * 이 화면은 그것을 열어 보고 공개할지 정하는 곳이다.
 *
 * 🔴 여기서 쓰는 키도 방문자와 똑같은 anon 키다. 권한은 키가 아니라
 *    "로그인했는가" 에서 나온다 - 로그인하면 받는 access_token 이 붙어야
 *    DB 가 승인·삭제를 허락한다. 그래서 이 파일이 공개돼도 문제가 없다.
 *
 * 🔴 주소·키를 바꾸면 lib/supabase.ts 도 같이 고쳐야 한다(두 곳이다).
 */

const SUPABASE_URL = 'https://nevitsamefsohuuaokdi.supabase.co';
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldml0c2FtZWZzb2h1dWFva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNzIwOTQsImV4cCI6MjEwMjc0ODA5NH0.tV7qRQ--7t3ZI6vUU6dYLgOJwCRnnKZV5HxFGHFYaHo';

/* 🔴 sessionStorage 다 - localStorage 가 아니다.
   탭을 닫으면 사라진다. 공용 PC 에서 로그인한 채로 남지 않게. */
const TOKEN_KEY = 'kuf_board_token';

const $ = (sel) => document.querySelector(sel);
const S = { token: sessionStorage.getItem(TOKEN_KEY) || '', rows: [] };

/* ── Supabase 두드리기 ─────────────────────────────────── */

async function api(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${S.token || SUPABASE_ANON}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    logout('로그인이 풀렸습니다. 다시 들어와 주세요.');
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`${res.status} ${detail.slice(0, 200)}`);
  }
  return res.status === 204 ? null : res.json();
}

async function login(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    /* Supabase 가 돌려주는 영문 사유를 그대로 보여 주면 도움이 안 된다 */
    throw new Error(
      /Invalid login/i.test(j.error_description || j.msg || '')
        ? '이메일이나 비밀번호가 맞지 않습니다.'
        : `로그인하지 못했습니다. (${res.status})`,
    );
  }
  return j.access_token;
}

function logout(msg) {
  S.token = '';
  sessionStorage.removeItem(TOKEN_KEY);
  $('#login').hidden = false;
  $('#board').hidden = true;
  $('#btn-logout').hidden = true;
  $('#login-status').textContent = msg || '';
}

/* ── 그리기 ────────────────────────────────────────────── */

const STATE_LABEL = { pending: '승인 대기', approved: '승인됨', rejected: '반려됨' };

/** 2026-08-20T05:12:00Z → 08.20 14:12 */
function when(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const two = (n) => String(n).padStart(2, '0');
  return `${two(d.getMonth() + 1)}.${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`;
}

function btn(label, cls, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

function card(p) {
  const li = document.createElement('li');
  li.className =
    'post-card' +
    (p.status === 'pending' ? ' wait' : '') +
    (p.flagged ? ' flag' : '') +
    (p.status === 'rejected' ? ' gone' : '');

  const top = document.createElement('div');
  top.className = 'pc-top';
  const state = document.createElement('span');
  state.className = `pc-state ${p.status}`;
  state.textContent = STATE_LABEL[p.status] || p.status;
  top.append(state);
  if (p.flagged) {
    const f = document.createElement('span');
    f.className = 'pc-flag';
    f.textContent = '링크·연락처 있음';
    top.append(f);
  }
  const title = document.createElement('span');
  title.className = 'pc-title';
  title.textContent = p.title;
  top.append(title);

  const meta = document.createElement('p');
  meta.className = 'pc-meta';
  meta.textContent = `${p.author} · ${when(p.created_at)} · ${p.ip || '-'}`;

  /* 🔴 innerHTML 로 넣으면 안 된다. 남이 쓴 글이라 태그가 섞여 올 수 있다.
     textContent 로 넣으면 태그가 글자로만 보인다. */
  const body = document.createElement('p');
  body.className = 'pc-body';
  body.textContent = p.body;

  const acts = document.createElement('div');
  acts.className = 'pc-actions';
  if (p.status !== 'approved') acts.append(btn('공개하기', 'ok', () => setStatus(p.id, 'approved')));
  if (p.status !== 'pending') acts.append(btn('대기로 되돌리기', 'ghost', () => setStatus(p.id, 'pending')));
  if (p.status !== 'rejected') acts.append(btn('반려(숨기기)', 'ghost', () => setStatus(p.id, 'rejected')));
  acts.append(btn('완전히 지우기', 'ghost danger', () => remove(p.id, p.title)));

  li.append(top, meta, body, acts);
  return li;
}

function render() {
  const list = $('#posts');
  list.textContent = '';
  const filter = $('#filter').value;
  const rows = filter === 'all' ? S.rows : S.rows.filter((p) => p.status === filter);

  const waiting = S.rows.filter((p) => p.status === 'pending').length;
  $('#board-title').textContent = `글 ${S.rows.length}건`;
  $('#board-note').textContent = waiting
    ? `승인을 기다리는 글이 ${waiting}건 있습니다. 공개 전까지 홈페이지에는 제목과 앞 한두 줄만 보입니다.`
    : '기다리는 글이 없습니다.';

  if (!rows.length) {
    const none = document.createElement('li');
    none.className = 'none';
    none.textContent = '해당하는 글이 없습니다.';
    list.append(none);
    return;
  }
  rows.forEach((p) => list.append(card(p)));
}

/* ── 동작 ──────────────────────────────────────────────── */

async function load() {
  S.rows = await api('/board_posts?select=*&order=created_at.desc&limit=300');
  render();
}

async function setStatus(id, status) {
  await api(`/board_posts?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status }),
  });
  await load();
}

async function remove(id, title) {
  if (!confirm(`「${title}」 글을 완전히 지웁니다. 되돌릴 수 없습니다.`)) return;
  await api(`/board_posts?id=eq.${id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  await load();
}

/** 링크·연락처가 붙은 대기글을 한 번에 반려한다 - 광고가 몰려 들어왔을 때 */
async function purge() {
  const targets = S.rows.filter((p) => p.status === 'pending' && p.flagged);
  if (!targets.length) {
    alert('표시된 대기글이 없습니다.');
    return;
  }
  if (!confirm(`링크·연락처가 붙은 대기글 ${targets.length}건을 모두 반려합니다.`)) return;
  await api('/board_posts?status=eq.pending&flagged=eq.true', {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'rejected' }),
  });
  await load();
}

/* ── 붙이기 ────────────────────────────────────────────── */

async function start() {
  $('#login').hidden = true;
  $('#board').hidden = false;
  $('#btn-logout').hidden = false;
  try {
    await load();
  } catch (e) {
    if (e.message !== 'unauthorized') alert(`목록을 불러오지 못했습니다.\n${e.message}`);
  }
}

$('#btn-login').addEventListener('click', async () => {
  const email = $('#in-email').value.trim();
  const pw = $('#in-pw').value;
  if (!email || !pw) {
    $('#login-status').textContent = '이메일과 비밀번호를 넣어 주세요.';
    return;
  }
  $('#login-status').textContent = '들어가는 중…';
  try {
    S.token = await login(email, pw);
    sessionStorage.setItem(TOKEN_KEY, S.token);
    $('#in-pw').value = '';
    await start();
  } catch (e) {
    $('#login-status').textContent = e.message;
  }
});

/* 비밀번호 칸에서 엔터를 쳐도 들어가지도록 */
$('#in-pw').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('#btn-login').click();
});

$('#btn-logout').addEventListener('click', () => logout(''));
$('#btn-reload').addEventListener('click', () => load().catch((e) => alert(e.message)));
$('#btn-purge').addEventListener('click', () => purge().catch((e) => alert(e.message)));
$('#filter').addEventListener('change', render);

if (S.token) start();
