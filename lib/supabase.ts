/**
 * 게시판 저장소(Supabase) 연결.
 *
 * 라이브러리를 새로 깔지 않는다 — 그냥 fetch 로 REST 주소를 두드린다.
 * 관리 화면(public/js/board-admin.js)도 같은 주소·같은 키를 쓴다.
 * 🔴 키를 바꾸면 그쪽 파일 맨 위도 같이 고쳐야 한다(두 곳이다).
 *
 * 아래 anon 키가 코드에 그대로 박혀 있는 것은 실수가 아니다.
 * 이 키는 "누구나 봐도 되는" 키이고, 실제 방어는 DB 쪽 규칙(RLS)이 한다.
 * 설정은 docs/게시판_supabase.sql 에 있다.
 */

export const SUPABASE_URL = "https://nevitsamefsohuuaokdi.supabase.co";
export const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldml0c2FtZWZzb2h1dWFva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNzIwOTQsImV4cCI6MjEwMjc0ODA5NH0.tV7qRQ--7t3ZI6vUU6dYLgOJwCRnnKZV5HxFGHFYaHo";

/** 방문자가 보는 글 한 건. 승인 전이면 body 가 이미 잘려서 온다. */
export type BoardPost = {
  id: string;
  created_at: string;
  author: string;
  title: string;
  status: "pending" | "approved";
  body: string;
  /** 아직 승인 안 된 글 */
  pending: boolean;
  /** 본문이 잘려서 왔다 — 뒤에 「…」 를 붙인다 */
  clipped: boolean;
};

const REST = `${SUPABASE_URL}/rest/v1`;

const HEAD = {
  apikey: SUPABASE_ANON,
  Authorization: `Bearer ${SUPABASE_ANON}`,
};

/**
 * Supabase 가 돌려주는 오류를 사람이 읽을 문장으로 바꾼다.
 * 도배 제한처럼 우리가 직접 띄운 문장은 그대로 쓰고, 나머지는 뭉뚱그린다.
 */
async function fail(res: Response): Promise<never> {
  let message = "";
  try {
    const j = (await res.json()) as { message?: string };
    message = String(j.message ?? "");
  } catch {
    /* 본문이 JSON 이 아닐 수도 있다 — 그때는 상태 코드만 가지고 간다 */
  }
  if (/3분|다시 시도/.test(message)) throw new Error(message);
  if (/violates check constraint|char_length/.test(message))
    throw new Error("글자 수가 맞지 않습니다. 제목 2~80자, 내용 5~4000자로 써 주세요.");
  throw new Error(`글을 올리지 못했습니다. (${res.status}) 잠시 뒤 다시 시도해 주세요.`);
}

/**
 * 아직 DB 설정(docs/게시판_supabase.sql)을 돌리지 않은 상태.
 * 오류가 아니라 "아직 안 열림" 으로 다루려고 따로 둔다 —
 * 코드가 먼저 배포되고 SQL 이 나중에 실행돼도 화면이 깨지지 않게.
 */
export const NOT_READY = "NOT_READY";

/** 목록 — 승인된 글은 전문, 대기 중인 글은 앞 1~2줄만 들어 있다. */
export async function fetchBoard(limit = 50): Promise<BoardPost[]> {
  const res = await fetch(
    `${REST}/board_public?select=*&order=created_at.desc&limit=${limit}`,
    { headers: HEAD, cache: "no-store" },
  );
  if (!res.ok) {
    /* PGRST205 = 그런 표가 없다. 404 로 온다. */
    if (res.status === 404) throw new Error(NOT_READY);
    await fail(res);
  }
  return (await res.json()) as BoardPost[];
}

/** 글 올리기. 상태는 DB 가 무조건 「승인 대기」로 만든다 — 여기서 정하지 않는다. */
export async function submitPost(input: {
  author: string;
  title: string;
  body: string;
}): Promise<void> {
  const res = await fetch(`${REST}/board_posts`, {
    method: "POST",
    headers: {
      ...HEAD,
      "Content-Type": "application/json",
      /* 돌려받을 것이 없다. 방문자에게는 이 표를 읽을 권한이 아예 없으므로
         return=minimal 이 아니면 넣기는 되고 응답에서 401 이 난다. */
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      author: input.author.trim(),
      title: input.title.trim(),
      body: input.body.trim(),
    }),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error(NOT_READY);
    await fail(res);
  }
}

/** 2026-08-20T05:12:00Z → 08.20 */
export function boardDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const two = (n: number) => String(n).padStart(2, "0");
  return `${two(d.getMonth() + 1)}.${two(d.getDate())}`;
}
