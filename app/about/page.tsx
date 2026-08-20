import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import IgGlyph from "@/components/IgGlyph";
import { CONTACT, INSTAGRAM, JOIN_FORM } from "@/lib/site";

export const metadata: Metadata = {
  title: "한대포 소개",
  description:
    "2009년 연세대학교에서 시작된 대학생 경제·시사 연합 동아리. 월말 포럼·전문가 초청 강연·정책 산업 현장 탐방을 이어갑니다.",
};

/**
 * 소개 페이지.
 *
 * 🔴 여기 적힌 것은 전부 실제 자료(공지 글 · 모집 안내)에서 나온 문장이다.
 *    없는 사실을 지어 넣지 않았다. 연혁·규모·수상 같은 숫자를 넣고 싶으면
 *    확인된 값을 받아서 채워야 한다.
 */
const ACTIVITIES = [
  {
    title: "월말 포럼",
    body:
      "매월 회원이 돌아가며 의제를 발제합니다. 발제자가 자료와 근거를 정리해 먼저 관점을 내놓으면, 참석자들이 그 근거를 함께 따져 봅니다. 결론을 미리 정해 두지 않기 때문에 같은 자료를 놓고도 다른 답이 나오고, 그 차이를 확인하는 것이 포럼의 목적입니다.",
  },
  {
    title: "전문가 초청 강연",
    body:
      "현업에 계신 분들을 모셔 이야기를 듣습니다. 책상에서 정리한 질문을 그 자리에서 직접 물어볼 수 있는 자리입니다.",
  },
  {
    title: "정책·산업 현장 탐방",
    body:
      "정책과 산업의 현장을 직접 방문해, 자료로만 읽던 쟁점을 눈으로 확인합니다. 토론에서 나온 질문을 현장에서 다시 묻고, 돌아와 그 답을 함께 정리합니다.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader current="about" />

      <section className="page-head">
        <h1>
          2009년 연세대학교에서 시작된
          <br />
          대학생 경제·시사 연합 동아리
        </h1>
        <p>
          한국대학생포럼은 자유민주주의와 시장경제의 가치를 바탕으로 사회·정치·경제를 연구하고
          토론하는 대학생 시민 네트워크입니다. 대학생들이 서로의 경험과 정보를 나누며 더 넓은
          선택지를 발견하도록 열린 네트워크를 만들고, 현업에 계신 분들과 꾸준히 만남을 이어 갑니다.
        </p>
      </section>

      <section className="section about-page">
        <h2>이런 활동을 합니다</h2>
        <div className="about-cards">
          {ACTIVITIES.map((a) => (
            <article className="about-card" key={a.title}>
              <h3>{a.title}</h3>
              <p>{a.body}</p>
            </article>
          ))}
        </div>

        <h2 className="about-h2">대학생 뉴스도 만듭니다</h2>
        <p className="about-lead">
          한대포는 대학생을 위한 뉴스 계정 <b>뉴보대</b>를 운영합니다. 그날의 뉴스를 대학생이 읽기
          좋게 정리해 카드뉴스로 올립니다.
        </p>
        <a
          className="text-link"
          href={`https://www.instagram.com/${INSTAGRAM.newbodae}/`}
          target="_blank"
          rel="noreferrer"
        >
          @{INSTAGRAM.newbodae} 보러 가기 <ArrowRight size={15} />
        </a>

        <h2 className="about-h2">함께하시려면</h2>
        <div className="about-links">
          <a className="about-link" href={JOIN_FORM} target="_blank" rel="noreferrer">
            <strong>가입 신청하기</strong>
            <small>구글 폼으로 받습니다</small>
            <ArrowRight size={17} />
          </a>
          <a
            className="about-link"
            href={`https://www.instagram.com/${INSTAGRAM.kuf}/`}
            target="_blank"
            rel="noreferrer"
          >
            <strong>
              <IgGlyph size={16} /> {INSTAGRAM.kuf}
            </strong>
            <small>활동 소식은 인스타그램에서</small>
            <ArrowRight size={17} />
          </a>
          <a className="about-link" href={`mailto:${CONTACT.email}`}>
            <strong>
              <Mail size={16} /> {CONTACT.email}
            </strong>
            <small>문의는 메일로</small>
            <ArrowRight size={17} />
          </a>
        </div>

        <p className="about-back">
          <Link className="text-link" href="/news">
            지난 소식 보기 <ArrowRight size={15} />
          </Link>
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
