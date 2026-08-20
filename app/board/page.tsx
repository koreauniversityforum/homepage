import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Board from "@/components/Board";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "학교가 달라도 고민은 닮아 있습니다. 대학생들이 남기는 이야기.",
};

export default function BoardPage() {
  return (
    <main>
      <SiteHeader current="community" />

      <section className="page-head">
        <h1>대학생의 진짜 이야기</h1>
        <p>
          누구나 글을 남길 수 있습니다. 광고와 도배를 막으려고 <b>승인제</b>로 두었습니다 — 올린 글은
          목록에 「승인 대기중」으로 제목과 앞 한두 줄만 먼저 보이고, 관리자가 확인하면 전체가
          열립니다.
        </p>
      </section>

      <section className="section board-section">
        <Board limit={50} />
      </section>

      <SiteFooter />
    </main>
  );
}
