/**
 * 관리자 화면(public/admin.html)의 GitHub 중계.
 *
 * 예전에는 관리자마다 자기 GitHub 토큰을 브라우저에 넣어야 했다.
 * 이제 토큰은 Vercel 환경변수 GITHUB_TOKEN 한 곳에만 두고,
 * 게시판 관리자 계정(Supabase 로그인)으로 들어온 사람이면 누구든 이 길로 같은 일을 한다.
 *
 *   브라우저 ── Supabase access_token ──▶ 여기 ── GITHUB_TOKEN ──▶ api.github.com
 *
 * 🔴 아무 GitHub 주소나 대신 불러 주면 토큰을 통째로 빌려주는 셈이다.
 *    그래서 저장소는 여기서 정하고, 관리자 화면이 실제로 쓰는 주소만 아래 ALLOW 로 통과시킨다.
 */

import { SUPABASE_ANON, SUPABASE_URL } from "@/lib/supabase";

const OWNER = process.env.GITHUB_OWNER || "koreauniversityforum";
const REPO = process.env.GITHUB_REPO || "homepage";
const BRANCH = "main";

/** [메서드, 주소 모양] - 관리자 화면(admin.js·admin-stats.js)이 부르는 것만 */
const ALLOW: [string, RegExp][] = [
  ["GET", new RegExp(`^/git/ref/heads/${BRANCH}$`)],
  ["GET", /^\/git\/commits\/[0-9a-f]{40}$/],
  ["POST", /^\/git\/blobs$/],
  ["POST", /^\/git\/trees$/],
  ["POST", /^\/git\/commits$/],
  ["PATCH", new RegExp(`^/git/refs/heads/${BRANCH}$`)],
  ["GET", new RegExp(`^/contents/public/data/[a-z-]+\\.json\\?ref=${BRANCH}$`)],
  ["POST", /^\/dispatches$/],
  ["GET", /^\/contents\/res\/[a-z0-9]+\.json\?ref=insights$/],
];

/** Supabase 에 이 토큰의 주인을 묻는다. 가입이 닫혀 있으므로 로그인된 사람 = 관리자다. */
async function whoIs(req: Request): Promise<string | null> {
  const m = /^Bearer (.+)$/.exec(req.headers.get("authorization") || "");
  if (!m) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${m[1]}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const u = (await res.json()) as { email?: string; id?: string };
  return u.email || u.id || null;
}

function fail(status: number, message: string) {
  return Response.json({ message }, { status });
}

async function relay(req: Request): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return fail(503, "서버에 GITHUB_TOKEN 이 아직 없습니다. Vercel 환경변수를 넣어 주세요.");

  const who = await whoIs(req);
  if (!who) return fail(401, "로그인이 필요합니다.");

  const path = new URL(req.url).searchParams.get("p") || "";
  const method = req.method.toUpperCase();
  if (!ALLOW.some(([m, re]) => m === method && re.test(path))) {
    return fail(403, `허용되지 않은 요청입니다: ${method} ${path}`);
  }

  let body: string | undefined;
  if (method !== "GET") {
    body = await req.text();
    /* 누가 고쳤는지 커밋 기록에 남긴다 - 관리자가 여럿이 되면 이것밖에 단서가 없다. */
    if (path === "/git/commits") {
      const j = JSON.parse(body) as { message?: string };
      j.message = `${j.message || "소식 갱신"}\n\n편집: ${who}`;
      body = JSON.stringify(j);
    }
  }

  const accept = req.headers.get("accept") === "application/vnd.github.raw"
    ? "application/vnd.github.raw"
    : "application/vnd.github+json";

  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    method,
    body,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });

  return new Response(res.status === 204 ? null : await res.text(), {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
  });
}

export const GET = relay;
export const POST = relay;
export const PATCH = relay;
