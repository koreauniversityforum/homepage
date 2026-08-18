"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleUserRound, Menu, X } from "lucide-react";

const NAV = [
  { label: "동아리", href: "/#clubs", key: "clubs" },
  { label: "커뮤니티", href: "/#community", key: "community" },
  { label: "행사", href: "/#events", key: "events" },
  { label: "소식", href: "/news", key: "news" },
  { label: "한대포 소개", href: "/#about", key: "about" },
];

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
        <button className="login-button" type="button">
          <CircleUserRound size={18} /> 로그인
        </button>
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
