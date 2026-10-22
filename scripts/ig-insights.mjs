/**
 * 뉴보대(@news_univ) 게시물 성과 → 관리자 화면 (저장하지 않는다)
 *
 * 관리자 화면(public/js/admin-stats.js)이 「성과 불러오기」를 누를 때마다 돈다.
 *   1. 그 화면이 그 자리에서 만든 RSA 공개 열쇠(PUB)와 요청 번호(REQ)를 받는다
 *   2. 최근 게시물과 각 게시물의 인사이트(조회·도달·저장·공유)를 받아 온다
 *   3. 결과를 AES-GCM 으로 잠그고, 그 열쇠를 RSA-OAEP 로 싸서 OUT 에 쓴다
 *      → 워크플로가 `insights` 브랜치에 올린다. 브랜치는 공개지만 **풀 열쇠는 관리자 브라우저에만** 있다.
 *
 * 🔴 저장소가 공개라 숫자를 그대로 커밋하면 누구나 본다(사용자 결정: 관리자만 보게, 2026-10-23).
 * 🔴 권한 `instagram_manage_insights` 가 없으면 인사이트는 (#10) 으로 막힌다. 그때도 좋아요·댓글 수는
 *    게시물 필드라서 나온다 - 화면이 무엇이 빠졌는지 알린다.
 *
 * 실행: IG_TOKEN=… IG_USER_NBD=… PUB='{jwk}' REQ=i… OUT=res.json node scripts/ig-insights.mjs
 */

import { writeFile } from 'node:fs/promises';
import crypto from 'node:crypto';

const API = 'https://graph.facebook.com/v21.0';
const { IG_TOKEN = '', IG_USER_NBD = '', PUB = '', REQ = '', OUT = 'res.json' } = process.env;
const LIMIT = 30;
// 게시물 인사이트(2025 이후 이름). 하나라도 안 되는 이름이 섞이면 묶음 전체가 실패하므로, 실패하면 하나씩 다시 묻는다.
const METRICS = ['views', 'reach', 'saved', 'shares', 'total_interactions'];

const log = (...a) => console.log('[ig-insights]', ...a);

async function graph(path, params = {}) {
  const u = new URL(API + path);
  for (const [k, v] of Object.entries({ ...params, access_token: IG_TOKEN })) u.searchParams.set(k, v);
  const res = await fetch(u);
  const json = await res.json().catch(() => ({}));
  if (json.error) throw new Error(`(#${json.error.code}) ${json.error.message}`);
  return json;
}

function titleOf(caption) {
  const line = String(caption || '').split('\n').map((s) => s.trim().replace(/^[·•\-–]\s*/, ''))
    .find((s) => s && !s.startsWith('#') && !(/^\p{Extended_Pictographic}/u.test(s) && s.length <= 16)) || '';
  const t = line.replace(/#[^\s#]+/g, '').trim();
  return t.length > 40 ? t.slice(0, 39) + '…' : t;
}

async function insightsOf(id) {
  const out = {};
  const put = (data) => { for (const m of data || []) out[m.name] = m.values?.[0]?.value ?? m.total_value?.value ?? null; };
  try {
    put((await graph(`/${id}/insights`, { metric: METRICS.join(',') })).data);
    return { values: out };
  } catch (e) {
    if (/\(#10\)|permission/i.test(e.message)) return { values: out, denied: true };
    let last = '';
    for (const m of METRICS) {
      try { put((await graph(`/${id}/insights`, { metric: m })).data); } catch (e2) { last = e2.message; }
    }
    return { values: out, error: Object.keys(out).length ? '' : last };
  }
}

async function collect() {
  if (!IG_TOKEN || !IG_USER_NBD) return { error: 'IG_TOKEN 또는 IG_USER_NBD 시크릿이 없습니다.' };
  const acc = await graph(`/${IG_USER_NBD}`, { fields: 'username,followers_count,media_count' });
  const media = (await graph(`/${IG_USER_NBD}/media`, {
    fields: 'id,caption,permalink,timestamp,media_type,like_count,comments_count', limit: String(LIMIT),
  })).data || [];
  const items = [];
  let denied = false;
  for (const m of media) {
    const ins = await insightsOf(m.id);
    denied ||= !!ins.denied;
    items.push({
      id: m.id, at: m.timestamp, type: m.media_type, title: titleOf(m.caption), permalink: m.permalink,
      likes: m.like_count ?? null, comments: m.comments_count ?? null,
      views: ins.values.views ?? null, reach: ins.values.reach ?? null, saved: ins.values.saved ?? null,
      shares: ins.values.shares ?? null, interactions: ins.values.total_interactions ?? null,
      error: ins.error || '',
    });
  }
  log(`게시물 ${items.length}건${denied ? ' (인사이트 권한 없음 - 좋아요·댓글만)' : ''}`);
  return {
    at: new Date().toISOString(),
    account: { username: acc.username, followers: acc.followers_count ?? null, media: acc.media_count ?? null },
    denied, items,
  };
}

/** 관리자 브라우저만 풀 수 있게 잠근다. 모양은 WebCrypto 가 그대로 받는 것(태그를 암호문 끝에 붙임). */
function seal(obj, jwk) {
  const pub = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const key = crypto.randomBytes(32), iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final(), c.getAuthTag()]);
  const wrapped = crypto.publicEncrypt({ key: pub, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, key);
  return { v: 1, req: REQ, iv: iv.toString('base64'), key: wrapped.toString('base64'), ct: ct.toString('base64') };
}

async function main() {
  if (!/^i[0-9a-z]{6,20}$/.test(REQ)) throw new Error('요청 번호 꼴이 아닙니다');
  let jwk;
  try { jwk = typeof PUB === 'string' ? JSON.parse(PUB) : PUB; } catch { throw new Error('공개 열쇠를 못 읽었습니다'); }
  if (jwk?.kty !== 'RSA' || !jwk.n || jwk.d) throw new Error('RSA 공개 열쇠가 아닙니다');   // d 가 있으면 비밀 열쇠 - 받지 않는다
  let result;
  try { result = await collect(); } catch (e) { result = { error: e.message }; log('🔴', e.message); }
  await writeFile(OUT, JSON.stringify(seal(result, jwk)));
  log('잠가서 썼습니다:', OUT);
}

main().catch((e) => { log('🔴', e.message); process.exitCode = 1; });
