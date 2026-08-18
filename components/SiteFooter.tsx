import Link from "next/link";
import { CONTACT, INSTAGRAM } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer>
      <div className="footer-main">
        <Link className="brand footer-brand" href="/">
          {/* 어두운 바닥에서는 남색 심벌이 묻히므로 흰 판 위에 올린다 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-mark on-dark" src="/logo-mark.png" alt="" width={38} height={38} />
          <span>
            <strong>한대포</strong>
            <small>한국 대학생 포럼</small>
          </span>
        </Link>
        <div className="footer-links">
          <div>
            <strong>서비스</strong>
            <Link href="/#clubs">동아리</Link>
            <Link href="/#community">커뮤니티</Link>
            <Link href="/#events">행사</Link>
          </div>
          <div>
            <strong>안내</strong>
            <Link href="/#about">한대포 소개</Link>
            <Link href="/news">소식</Link>
            <a href={`mailto:${CONTACT.email}`}>문의하기</a>
          </div>
          <div>
            <strong>채널</strong>
            <a href={`https://www.instagram.com/${INSTAGRAM.kuf}/`} target="_blank" rel="noreferrer">
              한대포 인스타그램
            </a>
            <a href={`https://www.instagram.com/${INSTAGRAM.newbodae}/`} target="_blank" rel="noreferrer">
              뉴스 보는 대학생
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Korea University Forum. All rights reserved.</span>
        <span>{CONTACT.email}</span>
      </div>
    </footer>
  );
}
