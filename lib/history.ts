/**
 * 과거 활동 이력 - 한대포를 다룬 기사·칼럼·인터뷰·블로그 글·논문 목록.
 *
 * 자료는 public/data/history.json 에 있다. 외장하드의 선별 화면
 * (F:\한대포\이력과 경력\한대포 관련 자료 목록.html)에서 고른 뒤 「선택 내보내기 JSON」으로
 * 받은 파일을 그대로 items 에 넣으면 된다. 그 화면이 내보내는 배열 자체를 파일로 두어도 읽힌다.
 *
 * 외부 글은 제목·출처·날짜·링크만 싣는다. 본문은 싣지 않는다(저작권).
 * 서버 전용 - 브라우저 컴포넌트는 lib/history-shared.ts 만 가져간다.
 */
import fs from "node:fs";
import path from "node:path";
import type { HistoryItem } from "./history-shared";

export type { HistoryItem } from "./history-shared";
export { fmtHistoryDate } from "./history-shared";

export function getHistory(): HistoryItem[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "public", "data", "history.json"), "utf8");
    const json = JSON.parse(raw) as unknown;
    const list = Array.isArray(json)
      ? json
      : ((json as { items?: unknown }).items ?? []);
    return (Array.isArray(list) ? (list as HistoryItem[]) : [])
      .filter((x) => x && x.title && x.url && x.date)
      .map((x) => ({ ...x, date: String(x.date), group: x.group || "기사", kind: x.kind || x.group || "기사" }))
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}
