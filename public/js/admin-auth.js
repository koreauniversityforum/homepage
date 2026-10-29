/* 한국대학생포럼 - 관리자 화면 로그인과 GitHub 호출 길
 *
 * admin.js·admin-stats.js 가 GitHub 를 부를 때 둘 다 여기 KUF_ADMIN.gh 를 쓴다.
 * 길은 두 가지다.
 *   1. 관리자 로그인(기본) - 게시판 승인 화면과 같은 계정. 토큰 없이 서버(/api/admin/gh)가 대신 부른다.
 *      그래서 관리자 계정만 있으면 누구든 같은 권한으로 소식·뉴보대·일정을 고칠 수 있다.
 *   2. 개인 토큰(예전 방식) - 「저장소 설정」에 PAT 를 넣으면 브라우저가 GitHub 를 바로 부른다.
 * 둘 다 있으면 개인 토큰을 쓴다.
 *
 * 🔴 로그인 토큰은 board-admin.js 와 같은 sessionStorage 자리에 둔다.
 *    한 탭에서 한 번 로그인하면 「게시판 승인」 화면을 오가도 다시 묻지 않는다.
 * 🔴 Supabase 주소·키는 lib/supabase.ts · board-admin.js 와 같아야 한다(세 곳).
 */
(function () {
  'use strict';
  const SUPABASE_URL = 'https://nevitsamefsohuuaokdi.supabase.co';
  const SUPABASE_ANON =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldml0c2FtZWZzb2h1dWFva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNzIwOTQsImV4cCI6MjEwMjc0ODA5NH0.tV7qRQ--7t3ZI6vUU6dYLgOJwCRnnKZV5HxFGHFYaHo';
  const TOKEN_KEY = 'kuf_board_token';   // board-admin.js 와 같은 자리
  const EMAIL_KEY = 'kuf_board_email';
  const CFG_KEY = 'kuf_admin_cfg';       // admin.js 와 같은 자리

  const cfg = () => { try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch { return {}; } };
  const hasPat = () => { const c = cfg(); return !!(c.owner && c.repo && c.token); };
  const session = () => sessionStorage.getItem(TOKEN_KEY) || '';

  async function login(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        /Invalid login/i.test(j.error_description || j.msg || '')
          ? '이메일이나 비밀번호가 맞지 않습니다.'
          : `로그인하지 못했습니다. (${res.status})`,
      );
    }
    sessionStorage.setItem(TOKEN_KEY, j.access_token);
    sessionStorage.setItem(EMAIL_KEY, j.user?.email || email);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
  }

  /** GitHub 저장소 API 를 부른다. path 는 `/git/...` 처럼 저장소 뒤쪽만. fetch 의 Response 를 그대로 돌려준다. */
  async function gh(path, opts = {}) {
    const accept = opts.raw ? 'application/vnd.github.raw' : 'application/vnd.github+json';
    const body = opts.body ? { 'Content-Type': 'application/json' } : {};
    if (hasPat()) {
      const c = cfg();
      return fetch(`https://api.github.com/repos/${c.owner}/${c.repo}${path}`, {
        method: opts.method || 'GET',
        body: opts.body,
        headers: { Authorization: `Bearer ${c.token}`, Accept: accept, 'X-GitHub-Api-Version': '2022-11-28', ...body },
      });
    }
    const res = await fetch('/api/admin/gh?p=' + encodeURIComponent(path), {
      method: opts.method || 'GET',
      body: opts.body,
      headers: { Authorization: `Bearer ${session()}`, Accept: accept, ...body },
      cache: 'no-store',
    });
    /* Supabase 로그인은 1시간이면 풀린다. 풀렸으면 로그인 칸을 다시 띄운다. */
    if (res.status === 401) {
      logout();
      window.dispatchEvent(new Event('kuf-auth'));
    }
    return res;
  }

  window.KUF_ADMIN = {
    login,
    logout,
    gh,
    hasPat,
    loggedIn: () => !!session(),
    /* 게시판 승인 화면에서 로그인했으면 이메일 자리가 비어 있다 - 토큰 안에 적힌 것을 읽는다 */
    email: () => {
      const saved = sessionStorage.getItem(EMAIL_KEY);
      if (saved) return saved;
      try {
        const part = session().split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(escape(atob(part)))).email || '관리자';
      } catch { return '관리자'; }
    },
    /** GitHub 에 올릴 수 있는 상태인가 - 로그인했거나 개인 토큰이 있다 */
    canWrite: () => hasPat() || !!session(),
  };
})();
