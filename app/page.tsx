"use client";

import { ArrowRight, CalendarDays, ChevronRight, CircleUserRound, Clock3, MapPin, Menu, MessageCircle, Search, Sparkles, UsersRound, X } from "lucide-react";
import { useState } from "react";

const clubs = [
  { category: "기획 · 마케팅", title: "브랜드를 직접 만드는 대학생 기획단", description: "실제 지역 브랜드와 함께 캠페인을 기획하고 실행할 팀원을 찾습니다.", schools: "전국 대학생", deadline: "D-8", accent: "coral" },
  { category: "IT · 창업", title: "아이디어를 서비스로, 사이드 프로젝트 팀", description: "개발자·디자이너·기획자가 한 팀이 되어 8주 동안 MVP를 만듭니다.", schools: "수도권 대학생", deadline: "D-12", accent: "blue" },
  { category: "문화 · 교류", title: "도시를 기록하는 대학생 에디터 클럽", description: "우리 세대가 바라본 도시와 캠퍼스의 이야기를 콘텐츠로 남깁니다.", schools: "대학생·휴학생", deadline: "D-15", accent: "green" },
];

const posts = [
  { board: "자유", title: "연합동아리 첫 모임 장소 추천해주세요", meta: "12분 전", comments: 8 },
  { board: "진로", title: "학기 중 인턴과 수업, 다들 어떻게 병행하나요?", meta: "38분 전", comments: 15 },
  { board: "정보", title: "이번 달 대학생 공모전·대외활동 일정 모음", meta: "1시간 전", comments: 21 },
  { board: "협업", title: "학교별 축제 지도를 함께 만들 분을 찾습니다", meta: "2시간 전", comments: 6 },
];

const events = [
  { day: "24", month: "AUG", title: "대학생 네트워킹 나이트", place: "서울 성수", time: "18:30" },
  { day: "31", month: "AUG", title: "프로젝트 쇼케이스 데이", place: "온라인", time: "14:00" },
  { day: "07", month: "SEP", title: "신입 운영진 오리엔테이션", place: "서울 신촌", time: "16:00" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clubFilter, setClubFilter] = useState("전체");

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="한대포 홈"><span className="brand-mark">한</span><span><strong>한대포</strong><small>한국 대학생 포럼</small></span></a>
        <nav className="desktop-nav" aria-label="주요 메뉴"><a href="#clubs">동아리</a><a href="#community">커뮤니티</a><a href="#events">행사</a><a href="#about">한대포 소개</a></nav>
        <div className="header-actions"><button className="icon-button desktop-search" type="button" aria-label="검색"><Search size={20} /></button><button className="login-button" type="button"><CircleUserRound size={18} /> 로그인</button><button className="icon-button menu-button" type="button" aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
        {menuOpen && <nav className="mobile-nav" aria-label="모바일 메뉴">{[["동아리","clubs"],["커뮤니티","community"],["행사","events"],["한대포 소개","about"]].map(([label,id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>}
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" /><div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
        <div className="hero-content"><p className="eyebrow"><Sparkles size={15} /> 학교 밖에서 시작되는 새로운 연결</p><h1>대학생의 연결이,<br /><em>더 큰 가능성</em>이 되도록.</h1><p className="hero-copy">학교의 경계를 넘어 사람을 만나고, 경험을 나누고,<br className="desktop-break" /> 함께 새로운 기회를 만들어 보세요.</p><div className="hero-actions"><a className="primary-button" href="#clubs">활동 찾아보기 <ArrowRight size={18} /></a><a className="secondary-button" href="#community">커뮤니티 둘러보기</a></div><div className="trust-row"><span><strong>42</strong> 참여 대학</span><span><strong>128</strong> 활동 모임</span><span><strong>3,200+</strong> 연결된 대학생</span></div></div>
        <div className="hero-visual" aria-label="한대포 커뮤니티 활동 미리보기"><div className="floating-card card-main"><div className="card-label"><span /> 이번 주 인기 모임</div><h3>서로 다른 학교,<br />하나의 프로젝트</h3><div className="avatar-row"><span>민</span><span>준</span><span>서</span><span>윤</span><b>+24</b></div></div><div className="floating-card card-note"><MessageCircle size={20} /><span><strong>새로운 답변 18개</strong><small>지금 이야기가 이어지고 있어요</small></span></div><div className="floating-card card-date"><CalendarDays size={20} /><span><strong>8월 24일</strong><small>네트워킹 나이트</small></span></div></div>
      </section>

      <section className="section" id="clubs">
        <div className="section-heading"><div><p className="section-kicker">JOIN &amp; GROW</p><h2>지금 함께할 활동을 찾아보세요</h2></div><a className="text-link" href="#clubs">전체 활동 보기 <ChevronRight size={17} /></a></div>
        <div className="filters" aria-label="활동 분야 필터">{["전체", "기획 · 마케팅", "IT · 창업", "문화 · 교류"].map((filter) => <button key={filter} type="button" className={clubFilter === filter ? "active" : ""} onClick={() => setClubFilter(filter)}>{filter}</button>)}</div>
        <div className="club-grid">{clubs.filter((club) => clubFilter === "전체" || club.category === clubFilter).map((club) => <article className="club-card" key={club.title}><div className={`club-cover ${club.accent}`}><span>{club.category}</span><div className="abstract-shape" /></div><div className="club-body"><div className="deadline"><span>모집 중</span><strong>{club.deadline}</strong></div><h3>{club.title}</h3><p>{club.description}</p><div className="club-meta"><UsersRound size={16} /> {club.schools}<ChevronRight size={17} /></div></div></article>)}</div>
      </section>

      <section className="community-section" id="community"><div className="section two-column"><div className="community-intro"><p className="section-kicker">TALK TOGETHER</p><h2>대학생의 진짜 이야기가<br />모이는 곳</h2><p>궁금했던 것을 묻고, 먼저 경험한 사람의 답을 만나보세요. 학교가 달라도 고민은 닮아 있습니다.</p><a className="primary-button compact" href="#community">이야기 참여하기 <ArrowRight size={17} /></a></div><div className="post-list"><div className="post-list-head"><strong>지금 인기 있는 이야기</strong><span>실시간</span></div>{posts.map((post) => <a className="post-item" href="#community" key={post.title}><span className="board-tag">{post.board}</span><div><strong>{post.title}</strong><small>{post.meta} · 댓글 {post.comments}</small></div><ChevronRight size={18} /></a>)}</div></div></section>

      <section className="section" id="events"><div className="section-heading"><div><p className="section-kicker">UPCOMING EVENTS</p><h2>곧 만날 수 있는 자리</h2></div><a className="text-link" href="#events">전체 일정 보기 <ChevronRight size={17} /></a></div><div className="event-list">{events.map((event) => <article className="event-item" key={event.title}><div className="event-date"><strong>{event.day}</strong><span>{event.month}</span></div><div className="event-info"><span>한대포 공식 행사</span><h3>{event.title}</h3><p><MapPin size={15} /> {event.place}<Clock3 size={15} /> {event.time}</p></div><button type="button" aria-label={`${event.title} 자세히 보기`}><ArrowRight size={19} /></button></article>)}</div></section>

      <section className="about-section" id="about"><div className="about-content"><span className="about-number">42</span><div><p className="section-kicker light">OUR NETWORK</p><h2>한 학교의 경험을<br />모든 대학생의 기회로.</h2><p>한대포는 대학생이 서로의 경험과 정보를 나누며 더 넓은 선택지를 발견하도록 돕는 열린 네트워크입니다.</p></div></div></section>
      <section className="cta-section"><div><p>YOUR NEXT CHAPTER</p><h2>새로운 연결을 시작할 준비가 되었나요?</h2></div><a className="white-button" href="#clubs">한대포 시작하기 <ArrowRight size={18} /></a></section>

      <footer><div className="footer-main"><a className="brand footer-brand" href="#top"><span className="brand-mark">한</span><span><strong>한대포</strong><small>한국 대학생 포럼</small></span></a><div className="footer-links"><div><strong>서비스</strong><a href="#clubs">동아리</a><a href="#community">커뮤니티</a><a href="#events">행사</a></div><div><strong>안내</strong><a href="#about">한대포 소개</a><a href="mailto:hello@univforum.kr">문의하기</a><a href="#top">공지사항</a></div><div><strong>정책</strong><a href="#top">이용약관</a><a href="#top">개인정보처리방침</a><a href="#top">커뮤니티 운영정책</a></div></div></div><div className="footer-bottom"><span>© 2026 Korea University Forum. All rights reserved.</span><span>대학생의 더 넓은 가능성을 연결합니다.</span></div></footer>
    </main>
  );
}
