import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  UsersRound,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewbodaeRow from "@/components/NewbodaeRow";
import Activities from "@/components/Activities";
import Board from "@/components/Board";
import IgGlyph from "@/components/IgGlyph";
import { ABOUT_MORE, INSTAGRAM, JOIN_FORM } from "@/lib/site";
import { getPosts, pickNotice, firstImage, fmtDate, excerpt } from "@/lib/posts";

const events = [
  { day: "24", month: "AUG", title: "대학생 네트워킹 나이트", place: "서울 성수", time: "18:30" },
  { day: "31", month: "AUG", title: "프로젝트 쇼케이스 데이", place: "온라인", time: "14:00" },
  { day: "07", month: "SEP", title: "신입 운영진 오리엔테이션", place: "서울 신촌", time: "16:00" },
];

export default function Home() {
  const allPosts = getPosts();
  const notice = pickNotice(allPosts);
  const recent = allPosts.filter((p) => p !== notice).slice(0, 3);

  return (
    <main>
      <SiteHeader />

      <section className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="hero-content">
          <h1>
            대학생의 연결이,
            <br />
            <em>더 큰 가능성</em>이 되도록.
          </h1>
          <p className="hero-copy">
            학교의 경계를 넘어 사람을 만나고, 경험을 나누고,
            <br className="desktop-break" /> 함께 새로운 기회를 만들어 보세요.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#clubs">
              활동 찾아보기 <ArrowRight size={18} />
            </a>
            <Link className="secondary-button" href="/news">
              소식 보기
            </Link>
          </div>
        </div>
        <div className="hero-visual" aria-label="한대포 활동 미리보기">
          <div className="floating-card card-main">
            <div className="card-label">
              <span /> 이번 주 인기 모임
            </div>
            <h3>
              서로 다른 학교,
              <br />
              하나의 프로젝트
            </h3>
            <div className="avatar-row">
              <span>민</span>
              <span>준</span>
              <span>서</span>
              <span>윤</span>
              <b>+24</b>
            </div>
          </div>
          <div className="floating-card card-note">
            <MessageCircle size={20} />
            <span>
              <strong>새로운 답변 18개</strong>
              <small>지금 이야기가 이어지고 있어요</small>
            </span>
          </div>
          <div className="floating-card card-date">
            <CalendarDays size={20} />
            <span>
              <strong>8월 24일</strong>
              <small>네트워킹 나이트</small>
            </span>
          </div>
        </div>
      </section>

      {/* ── 공지 + 최근 소식 ─────────────────────────────── */}
      <section className="section" id="notice">
        <div className="section-heading">
          <div>
            <h2>지금 알아두실 것</h2>
          </div>
          <Link className="text-link" href="/news">
            소식 전체 보기 <ChevronRight size={17} />
          </Link>
        </div>

        {notice ? (
          <div className="notice-band">
            <Link className="notice-card" href={`/news/${notice.id}`}>
              {firstImage(notice) && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={firstImage(notice)!} alt="" loading="lazy" />
              )}
              <div className="notice-copy">
                <span className="notice-badge">공지</span>
                <h3>{notice.title}</h3>
                <p>{excerpt(notice.summary || notice.body, 120)}</p>
                <span className="notice-date">{fmtDate(notice.date)}</span>
              </div>
            </Link>

            <div className="post-lines">
              {recent.length === 0 ? (
                <p className="empty">지난 소식이 아직 없습니다.</p>
              ) : (
                recent.map((p) => (
                  <Link className="post-line" href={`/news/${p.id}`} key={p.id}>
                    <span className="board-tag">{p.category ?? "소식"}</span>
                    <div>
                      <strong>{p.title}</strong>
                      <small>{fmtDate(p.date)}</small>
                    </div>
                    <ChevronRight size={18} />
                  </Link>
                ))
              )}
            </div>
          </div>
        ) : (
          <p className="empty">아직 등록된 소식이 없습니다.</p>
        )}
      </section>

      <section className="section" id="clubs">
        <div className="section-heading">
          <div>
            <h2>이런 활동을 함께합니다</h2>
          </div>
        </div>
        <Activities />
      </section>

      <section className="community-section" id="community">
        <div className="section two-column">
          <div className="community-intro">
            <h2>
              대학생의 진짜 이야기가
              <br />
              모이는 곳
            </h2>
            <p>
              궁금했던 것을 묻고, 먼저 경험한 사람의 답을 만나보세요. 학교가 달라도 고민은 닮아
              있습니다.
            </p>
            <Link className="primary-button compact" href="/board">
              이야기 참여하기 <ArrowRight size={17} />
            </Link>
          </div>
          {/* 진짜 게시판에서 최근 몇 건만 끌어다 보여 준다.
              compact 라서 글쓰기 칸은 나오지 않는다 - 쓰기는 /board 에서. */}
          <div className="post-list">
            <Board limit={5} compact />
          </div>
        </div>
      </section>

      <section className="section" id="events">
        <div className="section-heading">
          <div>
            <h2>곧 만날 수 있는 자리</h2>
          </div>
        </div>
        <div className="event-list">
          {events.map((event) => (
            <article className="event-item" key={event.title}>
              <div className="event-date">
                <strong>{event.day}</strong>
                <span>{event.month}</span>
              </div>
              <div className="event-info">
                <span>한대포 공식 행사</span>
                <h3>{event.title}</h3>
                <p>
                  <MapPin size={15} /> {event.place}
                  <Clock3 size={15} /> {event.time}
                </p>
              </div>
              <span className="event-go" aria-hidden="true">
                <ArrowRight size={19} />
              </span>
            </article>
          ))}
        </div>
      </section>

      <NewbodaeRow limit={5} />

      <section className="about-section" id="about">
        <div className="about-content">
          {/* 유리판이 흐릴 것이 있어야 유리로 보인다 - 뒤에 깔아 두는 빛 무리 */}
          <span className="about-glow" aria-hidden="true" />
          {/* 로고를 얹은 유리 원판. 겹 순서가 곧 효과다(그림자 → 흐린 판 → 흰 막 → 빛줄기·테두리). */}
          <span className="glass-mark" aria-hidden="true">
            <span className="glass-mark-plate" />
            <span className="glass-mark-sheen" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="" />
          </span>
          <div>
            <h2>
              2009년 연세대학교에서 시작된
              <br />
              대학생 경제·시사 연합 동아리
            </h2>
            <p>
              한대포는 대학생들이 서로의 경험과 정보를 나누며 더 넓은 선택지를 발견하도록
              <br />
              열린 네트워크를 만들고, 현업에 계신 분들과 꾸준히 만남을 이어 갑니다.
            </p>

            {/* 유리 알약 두 개. 왼쪽은 꼬리표(계정), 오른쪽은 행동 하나.
                🔴 두 겹 다 유리로 두되 흰 막 농도로 계급을 나눈다 - 같은 세기로 두면
                   어느 쪽을 눌러야 하는지 알 수 없다. */}
            <div className="about-actions">
              <a
                className="glass-pill"
                href={`https://www.instagram.com/${INSTAGRAM.kuf}/`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="glass-pill-plate" />
                <span className="glass-pill-sheen" />
                <IgGlyph size={18} />
                <b>{INSTAGRAM.kuf}</b>
              </a>

              <a className="glass-pill solid" href={ABOUT_MORE}>
                <span className="glass-pill-plate" />
                <span className="glass-pill-sheen" />
                <b>더 자세히 보기</b>
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div>
          <h2>새로운 연결을 시작할 준비가 되었나요?</h2>
        </div>
        {/* 가입 신청은 구글 폼으로 받는다. 주소가 바뀌면 lib/site.ts 의 JOIN_FORM 만 고치면 된다. */}
        <a className="white-button" href={JOIN_FORM} target="_blank" rel="noreferrer">
          한대포 시작하기 <ArrowRight size={18} />
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
