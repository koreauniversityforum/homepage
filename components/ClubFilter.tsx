"use client";

import { useState } from "react";
import { ChevronRight, UsersRound } from "lucide-react";

/**
 * 여기 보일 활동.
 *
 * 🔴 원래 이 자리에는 지어낸 것 세 건이 「모집 중 D-8」 같은 없는 마감일을 달고
 *    떠 있었다(브랜드 기획단 · 사이드 프로젝트 팀 · 에디터 클럽).
 *    실제로 모집하는 줄 알고 찾아올 수 있어 그대로 둘 수 없었다.
 *    분야 거르개(FILTERS)는 쓰던 대로 두고 내용만 비웠다.
 *
 * 실제 활동을 넣을 때 한 건이 이렇게 생겼다:
 *   { category: "IT · 창업", title: "...", description: "...",
 *     schools: "수도권 대학생", deadline: "D-12", accent: "blue" }
 * accent 는 coral | blue | green (표지 색), category 는 아래 FILTERS 중 하나.
 */
const clubs: {
  category: string;
  title: string;
  description: string;
  schools: string;
  deadline: string;
  accent: string;
}[] = [];


const FILTERS = ["전체", "기획 · 마케팅", "IT · 창업", "문화 · 교류"];

export default function ClubFilter() {
  const [filter, setFilter] = useState("전체");
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
        {shown.map((club) => (
          <article className="club-card" key={club.title}>
            <div className={`club-cover ${club.accent}`}>
              <span>{club.category}</span>
              <div className="abstract-shape" />
            </div>
            <div className="club-body">
              <div className="deadline">
                <span>모집 중</span>
                <strong>{club.deadline}</strong>
              </div>
              <h3>{club.title}</h3>
              <p>{club.description}</p>
              <div className="club-meta">
                <UsersRound size={16} /> {club.schools}
                <ChevronRight size={17} />
              </div>
            </div>
          </article>
        ))}
      </div>
      )}
    </>
  );
}
