import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HistoryList from "@/components/HistoryList";
import { getHistory } from "@/lib/history";

export const metadata: Metadata = {
  title: "과거 활동 이력",
  description: "2009년부터 지금까지 한국대학생포럼을 다룬 기사·칼럼·인터뷰·블로그 글·논문 목록입니다.",
};

export default function HistoryPage() {
  const items = getHistory();
  const first = items.length ? items[items.length - 1].date.slice(0, 4) : "2009";
  const last = items.length ? items[0].date.slice(0, 4) : "";

  return (
    <main>
      <SiteHeader current="about" />

      <section className="page-head">
        <h1>과거 활동 이력</h1>
        <p>
          {first}년부터 {last}년까지 한국대학생포럼을 다룬 기사·칼럼·인터뷰·블로그 글·논문 {items.length}건입니다.
          제목을 누르면 원문이 새 창으로 열립니다. 제목·출처·날짜·링크만 싣고 본문은 싣지 않습니다.
        </p>
      </section>

      <section className="section history-section">
        <HistoryList items={items} />
        <p className="about-back">
          <Link className="text-link" href="/about">
            <ArrowLeft size={15} /> 한대포 소개로
          </Link>
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
