/** 대한민국 국회 공개 일정 → 홈페이지 국회 토론회 일정 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'public', 'data', 'assembly-events.json');
const API = 'https://www.assembly.go.kr/portal/na/agenda/findAgendaSchl.json';
const AGENDA = 'https://www.assembly.go.kr/portal/na/agenda/agendaSchl.do?menuNo=600015';
const DAYS_BACK = 1;
const DAYS_AHEAD = 45;
const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 500;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 4;
const RETRY_BASE_MS = 1_000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function kstDate(offset = 0) {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  kst.setUTCDate(kst.getUTCDate() + offset);
  return kst.toISOString().slice(0, 10);
}

function decode(text = '') {
  return String(text)
    .replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

async function fetchDay(date) {
  const [meetYear, meetMonth, meetDate] = date.split('-');
  const body = new URLSearchParams({ meetYear, meetMonth, meetDate });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'user-agent': 'KoreaUniversityForum-ScheduleBot/1.0 (+https://www.univforum.kr)',
        },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) {
        const error = new Error(`HTTP ${res.status}`);
        error.retryable = res.status === 408 || res.status === 429 || res.status >= 500;
        throw error;
      }

      const json = await res.json();
      return (json.agendaSchl || [])
        .filter((item) => item.gubun === 'NAEVT')
        .map((item) => ({
          id: `assembly-${item.uniqId}`,
          title: decode(item.title),
          date: item.meettingDate || date,
          time: decode(item.meettingTime || ''),
          place: decode(item.infoName || ''),
          organizer: decode(item.orgName || ''),
          note: '국회에서 공개한 토론회·세미나·포럼 등 의원실 행사 일정입니다.',
          source: 'assembly',
          url: item.linkUrl || AGENDA,
        }));
    } catch (error) {
      const detail = error.cause?.code || error.code || error.message || String(error);
      if (attempt === MAX_ATTEMPTS || error.retryable === false) {
        throw new Error(`${date}: 국회 일정 요청 실패 (${detail}, ${attempt}회 시도)`);
      }

      const delay = RETRY_BASE_MS * 2 ** (attempt - 1);
      console.warn(`[assembly-sync] ${date}: ${detail} · ${delay}ms 후 재시도 (${attempt}/${MAX_ATTEMPTS})`);
      await wait(delay);
    }
  }

  throw new Error(`${date}: 국회 일정 요청 실패`);
}

async function main() {
  const dates = [];
  for (let i = -DAYS_BACK; i <= DAYS_AHEAD; i += 1) dates.push(kstDate(i));

  const events = [];
  // 국회 서버에 요청이 한꺼번에 몰리지 않도록 세 날짜씩 나누고 잠시 쉬어 받는다.
  for (let i = 0; i < dates.length; i += BATCH_SIZE) {
    const chunk = dates.slice(i, i + BATCH_SIZE);
    const result = await Promise.all(chunk.map(fetchDay));
    events.push(...result.flat());
    if (i + BATCH_SIZE < dates.length) await wait(BATCH_DELAY_MS);
  }

  const unique = [...new Map(events.map((event) => [event.id, event])).values()]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const next = {
    _안내: '대한민국 국회 홈페이지 공개 일정 중 국회행사(토론회·세미나·포럼 등)를 자동 수집합니다. 직접 편집하지 마세요.',
    source: AGENDA,
    range: { from: dates[0], to: dates.at(-1) },
    events: unique,
  };

  /* 5분마다 확인하더라도 실제 일정이 같으면 파일을 건드리지 않는다.
     updated 만 바뀌어 빈 커밋·재배포가 하루 288번 생기는 일을 막는다. */
  let current = null;
  try {
    current = JSON.parse(await readFile(OUTPUT, 'utf8'));
  } catch {
    // 첫 실행이거나 기존 파일이 깨졌다면 새 파일을 쓴다.
  }
  const comparable = current && {
    _안내: current._안내,
    source: current.source,
    range: current.range,
    events: current.events,
  };
  if (JSON.stringify(comparable) === JSON.stringify(next)) {
    console.log(`[assembly-sync] ${dates[0]} ~ ${dates.at(-1)}, ${unique.length}건 · 바뀐 일정 없음`);
    return;
  }

  const data = { ...next, updated: new Date().toISOString() };
  await writeFile(OUTPUT, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`[assembly-sync] ${dates[0]} ~ ${dates.at(-1)}, ${unique.length}건 저장`);
}

main().catch((error) => {
  console.error(`[assembly-sync] ${error.message}`);
  process.exitCode = 1;
});
