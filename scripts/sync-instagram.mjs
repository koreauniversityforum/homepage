/**
 * 인스타그램 새 글 → 홈페이지 소식 자동 등록 (틀)
 *
 * 지금은 잠들어 있다. GitHub 저장소 Secrets 에 토큰을 넣는 순간 켜진다.
 *   IG_TOKEN     : Meta 장기 액세스 토큰(60일)
 *   IG_USER_KUF  : 한국대학생포럼 인스타 비즈니스 계정 ID
 *   IG_USER_NBD  : 뉴보대(@news_univ) 인스타 비즈니스 계정 ID   ← 둘 다 없어도 있는 것만 돈다
 *
 * 하는 일
 *   1. 각 계정의 최근 게시물을 받아 온다
 *   2. 이미 등록된 것(ig 아이디로 비교)은 건너뛴다
 *   3. 사진을 media/ 에 내려받는다 (인스타 CDN 주소는 며칠 뒤 만료되므로 반드시 사본을 둔다)
 *   4. 한대포 새 글이 가장 최신이면 그 글을 공지로 올리고, 이전 공지는 일반글로 내린다
 *
 * 실행: node scripts/sync-instagram.mjs
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const API = 'https://graph.facebook.com/v21.0';
/* 🔴 URL.pathname 을 그대로 쓰면 윈도우에서 /C:/… 가 되어 파일을 못 찾는다. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
const FILES = {
  posts: path.join(ROOT, 'public', 'data', 'posts.json'),
  newbodae: path.join(ROOT, 'public', 'data', 'newbodae.json'),
};

const TOKEN = process.env.IG_TOKEN || '';
const ACCOUNTS = [
  { kind: 'posts', id: process.env.IG_USER_KUF || '', handle: 'universityforum_korea' },
  { kind: 'newbodae', id: process.env.IG_USER_NBD || '', handle: 'news_univ' },
];

const MAX_FETCH = 10;   // 한 번에 확인할 최근 게시물 수
const MAX_IMAGES = 4;   // 한 게시물에서 가져올 사진 수(캐러셀 대비)

/* ── 도구 ─────────────────────────────────────────────── */

const log = (...a) => console.log('[ig-sync]', ...a);

async function readJson(file, fallback) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch { return structuredClone(fallback); }
}

async function writeJson(file, obj) {
  await writeFile(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

/** 캡션 첫 줄에서 제목을 만든다. 해시태그 줄과 빈 줄은 건너뛴다. */
function titleFrom(caption, fallback) {
  const line = String(caption || '')
    .split('\n')
    .map((s) => s.trim())
    .find((s) => s && !s.startsWith('#'));
  if (!line) return fallback;
  const clean = line.replace(/#[^\s#]+/g, '').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  return clean.length > 42 ? clean.slice(0, 41) + '…' : clean;
}

/** 2026-08-18T05:11:22+0000 → 2026-08-18 (한국 시간 기준) */
function dateFrom(timestamp) {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const kst = new Date(d.getTime() + 9 * 3600 * 1000);
  return kst.toISOString().slice(0, 10);
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`사진 내려받기 실패 ${res.status}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function graph(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`${json.error.type}: ${json.error.message}`);
  return json;
}

/* ── 본체 ─────────────────────────────────────────────── */

async function fetchMedia(userId) {
  const fields = [
    'id', 'caption', 'media_type', 'media_url', 'thumbnail_url',
    'permalink', 'timestamp', 'children{media_url,media_type}',
  ].join(',');
  const url = `${API}/${userId}/media?fields=${fields}&limit=${MAX_FETCH}&access_token=${encodeURIComponent(TOKEN)}`;
  const json = await graph(url);
  return json.data || [];
}

/** 게시물 하나의 사진 주소들 (동영상은 미리보기 이미지로 대신한다) */
function imageUrls(m) {
  if (m.children?.data?.length) {
    return m.children.data.map((c) => c.media_url).filter(Boolean).slice(0, MAX_IMAGES);
  }
  const one = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url;
  return one ? [one] : [];
}

async function syncAccount({ kind, id, handle }) {
  if (!id) { log(`${kind}: 계정 ID 가 없어 건너뜁니다.`); return 0; }

  const file = FILES[kind];
  const empty = kind === 'posts' ? { updated: '', posts: [] } : { updated: '', items: [] };
  const data = await readJson(file, empty);
  const list = kind === 'posts' ? (data.posts ||= []) : (data.items ||= []);
  const known = new Set(list.map((x) => x.ig).filter(Boolean));

  const media = await fetchMedia(id);
  log(`${kind}: 인스타에서 ${media.length}건 확인, 이미 등록된 것 ${known.size}건`);

  const fresh = media.filter((m) => !known.has(m.id));
  if (!fresh.length) return 0;

  if (!existsSync(MEDIA_DIR)) await mkdir(MEDIA_DIR, { recursive: true });

  /* 오래된 것부터 넣어야 목록 순서와 공지 승격이 자연스럽다 */
  fresh.reverse();

  for (const m of fresh) {
    const date = dateFrom(m.timestamp);
    const entryId = `${kind === 'posts' ? '' : 'nb-'}${date}-ig${m.id.slice(-6)}`;
    const images = [];

    for (const [i, url] of imageUrls(m).entries()) {
      /* JSON 에는 웹 주소(/media/…)를 적고, 파일은 public/media/ 에 받는다 */
      const rel = `/media/${entryId}-${i + 1}.jpg`;
      try {
        await download(url, path.join(MEDIA_DIR, `${entryId}-${i + 1}.jpg`));
        images.push(rel);
      } catch (e) {
        log(`  사진을 못 받았습니다(${rel}): ${e.message}`);
      }
    }

    const base = {
      id: entryId,
      ig: m.id,
      title: titleFrom(m.caption, kind === 'posts' ? '새 소식' : '오늘의 카드뉴스'),
      date,
      permalink: m.permalink || '',
      images,
    };

    if (kind === 'posts') {
      list.push({ ...base, category: '소식', pinned: false, source: 'instagram', account: handle, summary: '', body: m.caption || '' });
    } else {
      list.push({ ...base, caption: m.caption || '' });
    }
    log(`  + ${entryId} - ${base.title}`);
  }

  list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  /* 한대포 계정만 공지를 갖는다. 가장 최신 글 하나에 pinned 를 몰아 준다. */
  if (kind === 'posts' && list.length) {
    list.forEach((x) => { x.pinned = false; });
    list[0].pinned = true;
    log(`  공지: ${list[0].id}`);
  }

  data.updated = new Date().toISOString().slice(0, 10);
  await writeJson(file, data);
  return fresh.length;
}

async function main() {
  if (!TOKEN) {
    log('IG_TOKEN 이 없습니다. 자동 수집은 아직 꺼져 있습니다 - 이건 오류가 아닙니다.');
    log('켜는 방법은 docs/인스타_자동수집_켜기.md 를 보세요.');
    return;
  }
  let added = 0;
  for (const acc of ACCOUNTS) {
    try {
      added += await syncAccount(acc);
    } catch (e) {
      /* 한 계정이 실패해도 나머지는 돌게 둔다. 토큰 만료면 여기로 온다. */
      log(`🔴 ${acc.kind} 실패: ${e.message}`);
      process.exitCode = 1;
    }
  }
  log(added ? `새 글 ${added}건을 담았습니다.` : '새 글이 없습니다.');
}

main();
