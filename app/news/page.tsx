import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewbodaeRow from "@/components/NewbodaeRow";
import { getPosts, pickNotice, firstImage, fmtDate, excerpt } from "@/lib/posts";

export const metadata: Metadata = {
  title: "소식",
  description: "한대포의 공지와 활동 소식입니다.",
};

export default function NewsPage() {
  const posts = getPosts();
  const notice = pickNotice(posts);
  const rest = posts.filter((p) => p !== notice);

  return (
    <main>
      <SiteHeader current="news" />

      <section className="page-head">
        <p className="section-kicker">NOTICE &amp; NEWS</p>
        <h1>포럼의 새로운 움직임</h1>
        <p>가장 최근 소식이 공지로 올라가고, 지난 소식은 아래 목록에 차례로 쌓입니다.</p>
      </section>

      <section className="section">
        {notice ? (
          <Link className="notice-card" href={`/news/${notice.id}`}>
            {firstImage(notice) && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={firstImage(notice)!} alt="" loading="lazy" />
            )}
            <div className="notice-copy">
              <span className="notice-badge">공지</span>
              <h2>{notice.title}</h2>
              <p>{excerpt(notice.summary || notice.body, 140)}</p>
              <span className="notice-date">{fmtDate(notice.date)}</span>
            </div>
          </Link>
        ) : (
          <p className="empty">아직 등록된 공지가 없습니다.</p>
        )}
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">ARCHIVE</p>
            <h2>지난 소식</h2>
          </div>
        </div>
        {rest.length === 0 ? (
          <p className="empty">지난 글이 아직 없습니다.</p>
        ) : (
          <div className="post-lines">
            {rest.map((p) => (
              <Link className="post-line" href={`/news/${p.id}`} key={p.id}>
                <span className="board-tag">{p.category ?? "소식"}</span>
                <div>
                  <strong>{p.title}</strong>
                  <small>{fmtDate(p.date)}</small>
                </div>
                <ChevronRight size={18} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <NewbodaeRow limit={8} />
      <SiteFooter />
    </main>
  );
}
