/**
 * 일정 읽기.
 *
 * 소식(posts.ts)과 같은 방식이다 - public/data/events.json 을 빌드할 때 읽어 둔다.
 * 관리 화면(admin.html 「일정」 탭)이 그 파일을 고쳐 GitHub 에 커밋하면 Vercel 이 다시 빌드한다.
 */
import fs from "node:fs";
import path from "node:path";

export type SiteEvent = {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** 24시간제 HH:MM. 없으면 화면에서 시간 줄을 안 보여 준다. */
  time?: string;
  place?: string;
  note?: string;
  hidden?: boolean;
};

const DATA = path.join(process.cwd(), "public", "data");

export function getEvents(): SiteEvent[] {
  try {
    const raw = fs.readFileSync(path.join(DATA, "events.json"), "utf8");
    const json = JSON.parse(raw) as { events?: unknown };
    const list = Array.isArray(json.events) ? (json.events as SiteEvent[]) : [];
    return list
      .filter((e) => e && e.id && e.date && !e.hidden)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  } catch {
    // 파일이 없거나 깨져도 화면은 살려 둔다 - 일정 칸만 비어 보인다.
    return [];
  }
}
