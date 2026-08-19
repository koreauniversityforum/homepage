"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Menu, X } from "lucide-react";
import { DONATION } from "@/lib/site";

const NAV = [
  { label: "동아리", href: "/#clubs", key: "clubs" },
  { label: "커뮤니티", href: "/#community", key: "community" },
  { label: "행사", href: "/#events", key: "events" },
  { label: "소식", href: "/news", key: "news" },
  { label: "한대포 소개", href: "/#about", key: "about" },
];

/**
 * 후원 계좌 배지 — 옛 로그인 단추가 있던 자리.
 * 누르면 계좌번호만 클립보드로 복사된다(은행 이름은 빼고 숫자만 — 붙여넣어 쓰기 좋게).
 */
function DonateBadge() {
  const [copied, setCopied] = useState(false);

  /* 복사됨 표시를 2초 뒤에 되돌린다. 컴포넌트가 사라지면 타이머도 치운다. */
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(DONATION.account);
      setCopied(true);
    } catch {
      /* 클립보드를 막아 둔 환경(구형 브라우저·http)에서는 조용히 넘긴다.
         숫자가 화면에 그대로 보이므로 눈으로 옮겨 적을 수 있다. */
    }
  }

  return (
    <button
      className="donate-badge"
      type="button"
      onClick={copy}
      title="계좌번호 복사"
      aria-label={`후원 계좌 ${DONATION.bank} ${DONATION.account} 복사`}
    >
      {DONATION.mark ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className="donate-mark-img" src={DONATION.mark} alt={`${DONATION.bank}은행`} />
      ) : (
        <span className="donate-mark" style={{ background: DONATION.markColor }}>
          {DONATION.bank}
        </span>
      )}
      <span className="donate-text">
        <small>{copied ? "복사했어요" : "후원 계좌"}</small>
        <strong>{DONATION.account}</strong>
        {DONATION.holder && <em>예금주 {DONATION.holder}</em>}
      </span>
      {copied && <Check className="donate-check" size={15} />}
    </button>
  );
}

export default function SiteHeader({ current }: { current?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="한대포 홈">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="brand-mark" src="/logo-mark.png" alt="" width={38} height={38} />
        <span>
          <strong>한대포</strong>
          <small>한국 대학생 포럼</small>
        </span>
      </Link>

      <nav className="desktop-nav" aria-label="주요 메뉴">
        {NAV.map((n) => (
          <Link key={n.key} href={n.href} aria-current={current === n.key ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <DonateBadge />
        <button
          className="icon-button menu-button"
          type="button"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="모바일 메뉴">
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} onClick={() => setMenuOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
