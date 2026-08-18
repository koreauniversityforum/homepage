/**
 * 소식 데이터 읽기.
 *
 * 글은 public/data/*.json 에 있고, 관리 화면(admin.html)이 그 파일을 고쳐 GitHub 에 커밋한다.
 * 커밋이 들어오면 Vercel 이 다시 빌드하므로, 여기서는 빌드 시점에 파일을 읽어 두면 된다.
 * 같은 파일을 브라우저에서도 /data/posts.json 으로 그대로 받을 수 있다.
 */
import fs from "node:fs";
import path from "node:path";

export type Post = {
  id: string;
  title: string;
  category?: string;
  date: string;
  pinned?: boolean;
  hidden?: boolean;
  source?: string;
  account?: string;
  permalink?: string;
  images?: string[];
  summary?: string;
  body?: string;
  /** 인스타에서 자동으로 들어온 글의 게시물 아이디 (중복 방지용) */
  ig?: string;
};

export type Card = {
  id: string;
  title: string;
  date: string;
  permalink?: string;
  images?: string[];
  caption?: string;
  ig?: string;
};

const DATA = path.join(process.cwd(), "public", "data");

function read<T>(file: string, key: string): T[] {
  try {
    const raw = fs.readFileSync(path.join(DATA, file), "utf8");
    const json = JSON.parse(raw) as Record<string, unknown>;
    const list = json[key];
    return Array.isArray(list) ? (list as T[]) : [];
  } catch {
    // 파일이 없거나 깨져도 화면은 살려 둔다 — 소식만 비어 보인다.
    return [];
  }
}

const byNewest = (a: { date?: string }, b: { date?: string }) =>
  String(b.date ?? "").localeCompare(String(a.date ?? ""));

export function getPosts(): Post[] {
  return read<Post>("posts.json", "posts")
    .filter((p) => p && p.id && !p.hidden)
    .sort(byNewest);
}

export function getCards(): Card[] {
  return read<Card>("newbodae.json", "items")
    .filter((c) => c && c.id)
    .sort(byNewest);
}

/**
 * 공지 한 건을 고른다.
 *
 * 새 글을 공지로 등록하면 관리 화면이 이전 공지의 pinned 를 내려 준다.
 * 그래도 pinned 가 여러 개 남는 사고를 대비해, 여기서는 가장 최신 것 하나만 공지로 본다.
 */
export function pickNotice(posts: Post[]): Post | null {
  return posts.find((p) => p.pinned) ?? posts[0] ?? null;
}

export function firstImage(x: { images?: string[] }): string | null {
  return x.images?.[0] ?? null;
}

/** 2026-08-18 → 2026.08.18 */
export function fmtDate(s?: string): string {
  const p = String(s ?? "").slice(0, 10).split("-");
  return p.length === 3 ? `${p[0]}.${p[1]}.${p[2]}` : String(s ?? "");
}

/** 목록에 보일 한 줄 */
export function excerpt(text: string | undefined, max = 90): string {
  const flat = String(text ?? "").replace(/\s+/g, " ").trim();
  return flat.length > max ? flat.slice(0, max - 1) + "…" : flat;
}

/** 본문을 빈 줄 기준으로 문단으로 나눈다 */
export function paragraphs(body?: string): string[][] {
  return String(body ?? "")
    .split(/\n{2,}/)
    .map((chunk) => chunk.split("\n"))
    .filter((lines) => lines.some((l) => l.trim()));
}
