"use client";

import { useEffect, useState } from "react";
import { ChevronRight, UsersRound } from "lucide-react";
import { JOIN_FORM } from "@/lib/site";

/**
 * 여기 보일 활동.
 *
 * `due` 는 마감 날짜(YYYY-MM-DD). 비워 두면 상시 모집이다.
 * 🔴 D-DAY 를 여기 숫자로 적어 두면 안 된다. 홈페이지는 만들어 둘 때 한 번 찍혀 나가므로
 *    「D-8」 을 적어 두면 배포한 날에 굳어 다음 날부터 거짓말이 된다.
 *    아래 dday() 가 보는 사람의 화면에서 그날그날 계산한다.
 *
 * `href` 를 넣으면 카드가 통째로 그 주소로 가는 링크가 된다. 없으면 안 눌린다.
 */
const clubs: {
  category: string;
  title: string;
  description: string;
  schools: string;
  /** 마감 날짜 YYYY-MM-DD. 없으면 상시 모집 */
  due?: string;
  accent: "coral" | "blue" | "green";
  href?: string;
}[] = [
  {
    category: "문화 · 교류",
    title: "현재를 기록하는 대학생 에디터 클럽",
    description:
      "지금 우리 세대가 지나는 자리를 글과 사진으로 남깁니다. 캠퍼스와 도시에서 무엇을 기록할지는 팀이 함께 정합니다.",
    schools: "전국 대학생",
    due: "2026-09-13",
    accent: "green",
  },
  {
    category: "IT · 창업",
    title: "아이디어를 서비스로! 브랜드를 직접 만드는 사이드 프로젝트 팀",
    description:
      "기획·디자인·개발이 한 팀이 되어, 머릿속 아이디어를 실제로 굴러가는 서비스와 브랜드로 만듭니다.",
    schools: "전국 대학생",
    accent: "blue",
  },
  {
    category: "포럼 · 토론",
    title: "한국대학생포럼 회원 모집",
    description:
      "자유민주주의와 시장경제의 가치를 바탕으로 사회·정치·경제를 함께 공부하고 토론할 회원을 모집합니다. 월말 포럼·초청 강연·현장 탐방을 함께합니다.",
    schools: "전국 대학생",
    due: "2026-08-31",
    accent: "coral",
    href: JOIN_FORM,
  },
];

/* 사용자가 정해 둔 분야. 여기 없는 분야를 쓴 활동이 있으면 뒤에 덧붙는다
   - 활동은 있는데 고를 칸이 없어 「전체」에서만 보이는 일이 없도록. */
const BASE_FILTERS = ["기획 · 마케팅", "IT · 창업", "문화 · 교류"];
const FILTERS = [
  "전체",
  ...BASE_FILTERS,
  ...clubs.map((c) => c.category).filter((c) => !BASE_FILTERS.includes(c)),
].filter((f, i, a) => a.indexOf(f) === i);

/** 2026-09-13 → 오늘 기준 D-24. 지났으면 「마감」. */
function dday(due?: string): { label: string; over: boolean } {
  if (!due) return { label: "상시 모집", over: false };
  /* 🔴 시간대를 안 박으면 보는 사람이 어디 있느냐에 따라 하루가 어긋난다.
     마감은 한국 시간 그날 밤 11시 59분으로 본다. */
  const end = new Date(`${due}T23:59:59+09:00`).getTime();
  const days = Math.ceil((end - Date.now()) / 86_400_000);
  if (days < 0) return { label: "마감", over: true };
  if (days === 0) return { label: "오늘 마감", over: false };
  return { label: `D-${days}`, over: false };
}

/** 2026-09-13 → 9.13 */
function shortDate(due?: string): string {
  const p = String(due ?? "").split("-");
  return p.length === 3 ? `~${Number(p[1])}.${Number(p[2])}` : "";
}

export default function ClubFilter() {
  const [filter, setFilter] = useState("전체");
  /* 🔴 남은 날짜는 화면이 뜬 뒤에 센다. 서버에서 미리 세어 두면 만들어 둔 날짜로
     찍혀 나가 브라우저가 센 값과 어긋난다(hydration 어긋남). */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shown = clubs.filter((c) => filter === "전체" || c.category === filter);

  return (
    <>
      <div className="filters" aria-label="활동 분야 필터">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={filter === f ? "active" : ""}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="empty">
          {filter === "전체"
            ? "지금 모집 중인 활동이 없습니다. 새 활동이 열리면 여기에 올라옵니다."
            : `${filter} 분야에 지금 모집 중인 활동이 없습니다.`}
        </p>
      ) : (
        <div className="club-grid">
          {shown.map((club) => {
            const d = mounted ? dday(club.due) : { label: "", over: false };
            const Tag = club.href ? "a" : "article";
            return (
              <Tag
                className={`club-card${d.over ? " closed" : ""}`}
                key={club.title}
                {...(club.href
                  ? { href: club.href, target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                <div className={`club-cover ${club.accent}`}>
                  <span>{club.category}</span>
                  <div className="abstract-shape" />
                </div>
                <div className="club-body">
                  <div className="deadline">
                    <span>{d.over ? "모집 마감" : "모집 중"}</span>
                    <strong>{d.label}</strong>
                  </div>
                  <h3>{club.title}</h3>
                  <p>{club.description}</p>
                  <div className="club-meta">
                    <UsersRound size={16} /> {club.schools}
                    {club.due && <em>{shortDate(club.due)}</em>}
                    {club.href && <ChevronRight className="club-go" size={17} />}
                  </div>
                </div>
              </Tag>
            );
          })}
        </div>
      )}
    </>
  );
}
