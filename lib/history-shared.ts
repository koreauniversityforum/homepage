/**
 * 과거 활동 이력에서 서버·브라우저가 함께 쓰는 형식과 함수.
 * 파일 읽기(node:fs)는 lib/history.ts 에만 둔다 - 브라우저 번들에 들어가면 빌드가 깨진다.
 */
export type HistoryItem = {
  id: string | number;
  /** 기사 | 논문 | 블로그 | 기타 */
  group: string;
  /** 기사 | 칼럼 | 사설 | 인터뷰 | 사진기사 | 블로그 | 카페 글 | 논문 | 기타 ... */
  kind: string;
  /** YYYY-MM-DD 또는 YYYY-MM 또는 YYYY */
  date: string;
  /** 언론사·블로그 이름 */
  press: string;
  title: string;
  url: string;
  summary?: string;
};

/** 2015-10-16 → 2015.10.16, 2015-10 → 2015.10, 2015 → 2015 */
export function fmtHistoryDate(d: string): string {
  return d.replace(/-/g, ".");
}
