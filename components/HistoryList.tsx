"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { fmtHistoryDate, type HistoryItem } from "@/lib/history-shared";

/** 걸러 보기 알약의 종류 묶음. 자료의 kind 를 이 다섯으로 접는다. */
const KINDS: { key: string; label: string; match: (x: HistoryItem) => boolean }[] = [
  { key: "all", label: "전체", match: () => true },
  { key: "news", label: "기사", match: (x) => x.group === "기사" && !/칼럼|사설|인터뷰/.test(x.kind) },
  { key: "column", label: "칼럼·사설", match: (x) => /칼럼|사설/.test(x.kind) },
  { key: "interview", label: "인터뷰", match: (x) => /인터뷰/.test(x.kind) },
  { key: "blog", label: "블로그", match: (x) => x.group === "블로그" },
  { key: "paper", label: "논문·그 밖", match: (x) => x.group === "논문" || x.group === "기타" },
];

export default function HistoryList({ items }: { items: HistoryItem[] }) {
  const [year, setYear] = useState("all");
  const [kind, setKind] = useState("all");

  const years = useMemo(() => {
    const set = new Set(items.map((x) => x.date.slice(0, 4)));
    return [...set].sort().reverse();
  }, [items]);

  const shown = useMemo(() => {
    const k = KINDS.find((x) => x.key === kind) ?? KINDS[0];
    return items.filter((x) => (year === "all" || x.date.startsWith(year)) && k.match(x));
  }, [items, year, kind]);

  /* 연도별로 묶는다. items 가 이미 최신순이라 묶음도 최신 연도부터 나온다. */
  const byYear = useMemo(() => {
    const map = new Map<string, HistoryItem[]>();
    for (const x of shown) {
      const y = x.date.slice(0, 4);
      if (!map.has(y)) map.set(y, []);
      map.get(y)!.push(x);
    }
    return [...map.entries()];
  }, [shown]);

  return (
    <div className="history">
      <div className="filters" role="tablist" aria-label="종류">
        {KINDS.map((k) => (
          <button
            key={k.key}
            type="button"
            className={kind === k.key ? "active" : ""}
            onClick={() => setKind(k.key)}
          >
            {k.label}
          </button>
        ))}
      </div>
      <div className="filters history-years" role="tablist" aria-label="연도">
        <button type="button" className={year === "all" ? "active" : ""} onClick={() => setYear("all")}>
          모든 해
        </button>
        {years.map((y) => (
          <button key={y} type="button" className={year === y ? "active" : ""} onClick={() => setYear(y)}>
            {y}
          </button>
        ))}
      </div>

      <p className="history-count">{shown.length}건</p>

      {byYear.length === 0 ? (
        <p className="empty">해당하는 자료가 없습니다.</p>
      ) : (
        byYear.map(([y, list]) => (
          <section className="history-year" key={y}>
            <h2>{y}</h2>
            <div className="post-lines">
              {list.map((x) => (
                <a
                  className="post-line"
                  href={x.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  key={String(x.id)}
                >
                  <span className="board-tag">{x.kind}</span>
                  <div>
                    <strong>{x.title}</strong>
                    <small>
                      {fmtHistoryDate(x.date)} · {x.press}
                    </small>
                  </div>
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
