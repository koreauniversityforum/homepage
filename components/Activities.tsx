import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ACTIVITIES } from "@/lib/site";

/**
 * 한대포가 실제로 하는 활동 카드.
 *
 * 🔴 옛 ClubFilter 를 대신한다. 그 자리에는 지어낸 동아리 세 건이
 *    「모집 중 D-8」 같은 없는 마감일을 달고 떠 있었다.
 *    분야 거르개도 함께 걷어냈다 - 활동이 세 건인데 거를 것이 없다.
 */
export default function Activities() {
  return (
    <div className="club-grid">
      {ACTIVITIES.map((a) => (
        <article className={`club-card${a.post ? " has-link" : ""}`} key={a.title}>
          <div className={`club-cover ${a.accent}`}>
            <span>{a.label}</span>
            <div className="abstract-shape" />
          </div>
          <div className="club-body">
            <h3>{a.title}</h3>
            <p>{a.body}</p>
            {a.post && (
              <Link className="club-more" href={`/news/${a.post}`}>
                이 활동 소식 보기 <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
