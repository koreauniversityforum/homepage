import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Sparkles,
  UsersRound,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewbodaeRow from "@/components/NewbodaeRow";
import ClubFilter from "@/components/ClubFilter";
import { STATS, ABOUT_NUMBER } from "@/lib/site";
import { getPosts, pickNotice, firstImage, fmtDate, excerpt } from "@/lib/posts";

const posts_placeholder = [
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
          <p className="eyebrow">
            <Sparkles size={15} /> 학교 밖에서 시작되는 새로운 연결
          </p>
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
          {STATS.length > 0 && (
            <div className="trust-row">
              {STATS.map((s) => (
                <span key={s.label}>
                  <strong>{s.value}</strong> {s.label}
                </span>
              ))}
            </div>
          )}
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
            <p className="section-kicker">NOTICE</p>
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
            <p className="section-kicker">JOIN &amp; GROW</p>
            <h2>지금 함께할 활동을 찾아보세요</h2>
          </div>
        </div>
        <ClubFilter />
      </section>

      <section className="community-section" id="community">
        <div className="section two-column">
          <div className="community-intro">
            <p className="section-kicker">TALK TOGETHER</p>
            <h2>
              대학생의 진짜 이야기가
              <br />
              모이는 곳
            </h2>
            <p>
              궁금했던 것을 묻고, 먼저 경험한 사람의 답을 만나보세요. 학교가 달라도 고민은 닮아
              있습니다.
            </p>
            <a className="primary-button compact" href="#community">
              이야기 참여하기 <ArrowRight size={17} />
            </a>
          </div>
          <div className="post-list">
            <div className="post-list-head">
              <strong>지금 인기 있는 이야기</strong>
              <span>실시간</span>
            </div>
            {posts_placeholder.map((post) => (
              <a className="post-item" href="#community" key={post.title}>
                <span className="board-tag">{post.board}</span>
                <div>
                  <strong>{post.title}</strong>
                  <small>
                    {post.meta} · 댓글 {post.comments}
                  </small>
                </div>
                <ChevronRight size={18} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="events">
        <div className="section-heading">
          <div>
            <p className="section-kicker">UPCOMING EVENTS</p>
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

      <NewbodaeRow limit={6} />

      <section className="about-section" id="about">
        <div className="about-content">
          <span className="about-number">{ABOUT_NUMBER}</span>
          <div>
            <p className="section-kicker light">OUR NETWORK</p>
            <h2>
              한 학교의 경험을
              <br />
              모든 대학생의 기회로.
            </h2>
            <p>
              한대포는 대학생이 서로의 경험과 정보를 나누며 더 넓은 선택지를 발견하도록 돕는 열린
              네트워크입니다.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div>
          <p>YOUR NEXT CHAPTER</p>
          <h2>새로운 연결을 시작할 준비가 되었나요?</h2>
        </div>
        <a className="white-button" href="#clubs">
          한대포 시작하기 <ArrowRight size={18} />
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
