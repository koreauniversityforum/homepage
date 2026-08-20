import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import IgGlyph from "@/components/IgGlyph";
import { ACTIVITIES, CONTACT, INSTAGRAM, JOIN_FORM } from "@/lib/site";

export const metadata: Metadata = {
  title: "한대포 소개",
  description:
    "2009년 연세대학교에서 시작된 대학생 경제·시사 연합 동아리. 월말 포럼·전문가 초청 강연·정책 산업 현장 탐방을 이어갑니다.",
};


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
