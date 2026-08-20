import { ArrowUpRight } from "lucide-react";
import { getCards, fmtDate, excerpt, firstImage } from "@/lib/posts";
import { INSTAGRAM } from "@/lib/site";

/**
 * 뉴보대(@news_univ) 카드뉴스 줄.
 * 홈페이지에 상세 글을 따로 두지 않고, 누르면 인스타 게시물로 보낸다.
 */
export default function NewbodaeRow({ limit = 6 }: { limit?: number }) {
  const cards = getCards().slice(0, limit);
  const accountUrl = `https://www.instagram.com/${INSTAGRAM.newbodae}/`;

  return (
    <section className="newbodae" id="newbodae">
      <div className="section nb-inner">
        <div className="nb-intro">
          <h2>뉴스 보는 대학생</h2>
          <p>
            한대포가 운영하는 대학생 뉴스 계정입니다. 시사·경제·정치에서 오늘 챙길 몇 건을 골라
            카드로 정리합니다.
          </p>
          <a className="white-button" href={accountUrl} target="_blank" rel="noreferrer">
            @{INSTAGRAM.newbodae} <ArrowUpRight size={17} />
          </a>
        </div>

        <div className="nb-list">
          {cards.length === 0 ? (
            <p className="empty light">카드뉴스가 곧 올라옵니다.</p>
          ) : (
            cards.map((c) => (
              <a
                className="nb-card"
                key={c.id}
                href={c.permalink || accountUrl}
                target="_blank"
                rel="noreferrer"
              >
                {firstImage(c) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={firstImage(c)!} alt="" loading="lazy" />
                ) : (
                  <span className="nb-noimg">카드 준비 중</span>
                )}
                <div className="nb-body">
                  <span className="nb-date">{fmtDate(c.date)}</span>
                  <p>{excerpt(c.title || c.caption, 46)}</p>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
