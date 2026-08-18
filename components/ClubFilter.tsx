"use client";

import { useState } from "react";
import { ChevronRight, UsersRound } from "lucide-react";

const clubs = [
  {
    category: "기획 · 마케팅",
    title: "브랜드를 직접 만드는 대학생 기획단",
    description: "실제 지역 브랜드와 함께 캠페인을 기획하고 실행할 팀원을 찾습니다.",
    schools: "전국 대학생",
    deadline: "D-8",
    accent: "coral",
  },
  {
    category: "IT · 창업",
    title: "아이디어를 서비스로, 사이드 프로젝트 팀",
    description: "개발자·디자이너·기획자가 한 팀이 되어 8주 동안 MVP를 만듭니다.",
    schools: "수도권 대학생",
    deadline: "D-12",
    accent: "blue",
  },
  {
    category: "문화 · 교류",
    title: "도시를 기록하는 대학생 에디터 클럽",
    description: "우리 세대가 바라본 도시와 캠퍼스의 이야기를 콘텐츠로 남깁니다.",
    schools: "대학생·휴학생",
    deadline: "D-15",
    accent: "green",
  },
];

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
    </>
  );
}
