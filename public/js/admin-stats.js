/**
 * 관리자 화면 「뉴보대 성과」 - 인스타 게시물 조회·도달·좋아요·댓글·저장·공유
 *
 * 숫자는 어디에도 저장하지 않는다(저장소가 공개라서).
 *   1. 이 브라우저가 그 자리에서 RSA 열쇠 쌍을 만든다(비밀 열쇠는 밖으로 못 꺼내게 만든다)
 *   2. 공개 열쇠만 실어 `insights-req` 를 부른다 → ig-insights.yml 이 숫자를 받아 그 열쇠로 잠근다
 *   3. `insights` 브랜치에 잠긴 결과가 올라오면 받아서 이 브라우저에서만 푼다
 * 열쇠(PAT)는 「저장소 설정」에 넣은 것을 그대로 쓴다(Contents 쓰기 - dispatch 에 필요).
 */
(function () {
  'use strict';
  const CFG_KEY = 'kuf_admin_cfg';                 // admin.js 와 같은 자리
  const $ = (s) => document.querySelector(s);
  const cfg = () => { try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch { return {}; } };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const num = (v) => (v == null ? '-' : Number(v).toLocaleString('ko-KR'));
  let busy = false;

  function status(msg, bad) {
    const el = $('#stats-status');
    el.textContent = msg;
    el.style.color = bad ? 'var(--danger)' : '';
  }

  async function gh(path, opts = {}) {
    const c = cfg();
    return fetch(`https://api.github.com/repos/${c.owner}/${c.repo}${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
    });
  }

  async function unseal(box, priv) {
    const raw = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, priv, b64(box.key));
    const aes = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(box.iv) }, aes, b64(box.ct));
    return JSON.parse(new TextDecoder().decode(pt));
  }

  async function load() {
    if (busy) return;
    const c = cfg();
    if (!(c.owner && c.repo && c.token)) { status('먼저 「저장소 설정」에서 owner·repo·토큰을 채워 주세요.', true); return; }
    busy = true; $('#btn-stats-load').disabled = true;
    try {
      status('1/3 열쇠를 만듭니다…');
      const pair = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, false, ['encrypt', 'decrypt']);
      const pub = await crypto.subtle.exportKey('jwk', pair.publicKey);
      const req = 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      status('2/3 깃허브에 성과를 부탁합니다…');
      const r = await gh('/dispatches', { method: 'POST',
        body: JSON.stringify({ event_type: 'insights-req', client_payload: { req, pub: { kty: pub.kty, n: pub.n, e: pub.e } } }) });
      if (r.status !== 204) throw new Error(r.status === 401 ? '토큰이 틀렸거나 만료됐습니다.' :
        r.status === 403 || r.status === 404 ? '토큰 권한이 모자랍니다(Contents: Read and write).' : 'GitHub ' + r.status);
      const until = Date.now() + 4 * 60e3;
      let box = null, n = 0;
      while (!box && Date.now() < until) {
        await sleep(4000);
        status('3/3 기다리는 중… ' + (n += 4) + '초 (보통 30초 안팎)');
        const g = await gh(`/contents/res/${req}.json?ref=insights`).catch(() => null);
        if (g && g.ok) {
          const j = await g.json();
          box = JSON.parse(new TextDecoder().decode(b64(j.content.replace(/\s/g, ''))));
        }
      }
      if (!box) throw new Error('4분 안에 결과가 안 왔습니다. 깃허브 Actions 의 「뉴보대 성과」 실행을 보세요.');
      draw(await unseal(box, pair.privateKey));
    } catch (e) {
      status('‼ ' + e.message, true);
    } finally {
      busy = false; $('#btn-stats-load').disabled = false;
    }
  }

  function draw(d) {
    const out = $('#stats-out');
    out.textContent = '';
    if (d.error) { status('‼ ' + d.error, true); return; }
    const when = new Date(d.at).toLocaleString('ko-KR');
    status(when + ' 기준 · @' + d.account.username + ' 팔로워 ' + num(d.account.followers) + ' · 게시물 ' + num(d.account.media));
    if (d.denied) {
      const w = document.createElement('p');
      w.className = 'warn';
      w.textContent = '조회·도달·저장·공유는 메타 앱에 인사이트 권한(instagram_manage_insights)이 없어 비어 있습니다. 좋아요·댓글 수만 보입니다.';
      out.append(w);
    }
    const cols = [['at', '날짜'], ['title', '게시물'], ['views', '조회'], ['reach', '도달'], ['likes', '좋아요'],
      ['comments', '댓글'], ['saved', '저장'], ['shares', '공유']];
    const t = document.createElement('table');
    t.className = 'stats';
    const hr = t.createTHead().insertRow();
    cols.forEach(([, h]) => { const th = document.createElement('th'); th.textContent = h; hr.append(th); });
    const tb = t.createTBody();
    const sum = {}, cnt = {};
    d.items.forEach((x) => {
      const tr = tb.insertRow();
      cols.forEach(([k]) => {
        const td = tr.insertCell();
        if (k === 'at') td.textContent = new Date(x.at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
        else if (k === 'title') {
          const a = document.createElement('a');
          a.href = x.permalink; a.target = '_blank'; a.rel = 'noreferrer';
          a.textContent = x.title || '(제목 없음)';
          td.append(a);
        } else {
          td.textContent = num(x[k]); td.className = 'n';
          if (x[k] != null) { sum[k] = (sum[k] || 0) + Number(x[k]); cnt[k] = (cnt[k] || 0) + 1; }
        }
      });
    });
    // 평균 줄 - 다음 글의 기준선
    const fr = t.createTFoot().insertRow();
    cols.forEach(([k]) => {
      const td = fr.insertCell();
      if (k === 'at') td.textContent = '평균';
      else if (k === 'title') td.textContent = d.items.length + '건';
      else { td.textContent = cnt[k] ? num(Math.round(sum[k] / cnt[k])) : '-'; td.className = 'n'; }
    });
    const wrap = document.createElement('div');
    wrap.className = 'stats-wrap';
    wrap.append(t);
    out.append(wrap);
  }

  $('#btn-stats').addEventListener('click', () => { $('#stats').hidden = !$('#stats').hidden; });
  $('#btn-stats-load').addEventListener('click', load);
})();
