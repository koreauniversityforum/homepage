"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, Loader2, PenLine, RefreshCw } from "lucide-react";
import { boardDate, fetchBoard, NOT_READY, submitPost, type BoardPost } from "@/lib/supabase";

/* 본문을 문단으로 - 승인된 글을 펼쳤을 때만 쓴다 */
function lines(body: string): string[] {
  return body.split(/\n+/).filter((l) => l.trim());
}

/**
 * 글 한 줄.
 *
 * 승인 대기 글은 열리지 않는다. 애초에 서버가 뒷부분을 보내 주지도 않는다.
 * 승인된 글만 눌러서 펼친다 - 글 하나마다 주소를 따로 두지 않은 것은,
 * 목록이 브라우저에서 그때그때 불러오는 것이라 상세 주소를 만들면
 * 새로고침했을 때 빈 화면이 되기 때문이다.
 */
function Row({ post }: { post: BoardPost }) {
  const [open, setOpen] = useState(false);

  if (post.pending) {
    return (
      <article className="bd-row is-pending">
        <div className="bd-head">
          <span className="bd-badge wait">
            <Clock3 size={12} /> 승인 대기중
          </span>
          <strong className="bd-title">{post.title}</strong>
        </div>
        <p className="bd-peek">
          {post.body}
          {post.clipped && "…"}
        </p>
        <p className="bd-meta">
          {post.author} · {boardDate(post.created_at)}
          <em>관리자가 확인하면 전체 내용이 보입니다</em>
        </p>
      </article>
    );
  }

  return (
    <article className={`bd-row${open ? " is-open" : ""}`}>
      <button className="bd-head" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="bd-badge">글</span>
        <strong className="bd-title">{post.title}</strong>
      </button>
      {open ? (
        <div className="bd-body">
          {lines(post.body).map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      ) : (
        <p className="bd-peek">{post.body}</p>
      )}
      <p className="bd-meta">
        {post.author} · {boardDate(post.created_at)}
      </p>
    </article>
  );
}

/** 글쓰기 칸 */
function Writer({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await submitPost({ author, title, body });
      setAuthor("");
      setTitle("");
      setBody("");
      setDone(true);
      setOpen(false);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "글을 올리지 못했습니다.");
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <div className="bd-writer-shut">
        <button className="primary-button compact" type="button" onClick={() => { setOpen(true); setDone(false); }}>
          <PenLine size={16} /> 글쓰기
        </button>
        {done && <span className="bd-done">올렸습니다. 관리자 승인 뒤에 전체 내용이 보입니다.</span>}
      </div>
    );
  }

  return (
    <form className="bd-writer" onSubmit={send}>
      <div className="bd-w-row">
        <label>
          이름
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={20}
            required
            placeholder="닉네임도 괜찮습니다"
          />
        </label>
        <label className="grow">
          제목
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={2}
            maxLength={80}
            required
            placeholder="무엇에 대한 이야기인가요?"
          />
        </label>
      </div>
      <label>
        내용
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={7}
          minLength={5}
          maxLength={4000}
          required
          placeholder="편하게 쓰셔도 됩니다."
        />
      </label>
      <p className="bd-note">
        올린 글은 <b>바로 공개되지 않습니다.</b> 목록에는 「승인 대기중」으로 제목과 앞 한두 줄만
        보이고, 관리자가 확인하면 전체가 열립니다.
      </p>
      {error && <p className="bd-error">{error}</p>}
      <div className="bd-w-actions">
        <button className="primary-button compact" type="submit" disabled={sending}>
          {sending ? <Loader2 className="spin" size={16} /> : <PenLine size={16} />}
          {sending ? "올리는 중" : "올리기"}
        </button>
        <button className="secondary-button compact" type="button" onClick={() => setOpen(false)}>
          그만두기
        </button>
      </div>
    </form>
  );
}

export default function Board({ limit = 50, compact = false }: { limit?: number; compact?: boolean }) {
  const [posts, setPosts] = useState<BoardPost[] | null>(null);
  const [error, setError] = useState("");
  /* 저장소 설정이 아직 안 돌아간 상태 - 오류처럼 보이면 안 된다 */
  const [notReady, setNotReady] = useState(false);

  const load = useCallback(() => {
    fetchBoard(limit)
      .then((rows) => { setPosts(rows); setError(""); setNotReady(false); })
      .catch((e: unknown) => {
        setPosts([]);
        if (e instanceof Error && e.message === NOT_READY) {
          setNotReady(true);
          setError("");
        } else {
          setError("글 목록을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
        }
      });
  }, [limit]);

  useEffect(load, [load]);

  if (notReady) {
    return (
      <div className="bd">
        <p className="empty">게시판을 준비하고 있습니다. 곧 열립니다.</p>
      </div>
    );
  }

  const waiting = posts?.filter((p) => p.pending).length ?? 0;

  return (
    <div className="bd">
      {!compact && <Writer onDone={load} />}

      <div className="bd-list-head">
        <strong>
          {posts === null ? "불러오는 중" : `글 ${posts.length}건`}
          {waiting > 0 && <span className="bd-waiting">승인 대기 {waiting}</span>}
        </strong>
        <button className="bd-refresh" type="button" onClick={load} aria-label="새로 고침">
          <RefreshCw size={14} />
        </button>
      </div>

      {posts === null ? (
        <p className="empty">불러오는 중…</p>
      ) : error ? (
        <p className="empty">{error}</p>
      ) : posts.length === 0 ? (
        <p className="empty">아직 올라온 글이 없습니다. 첫 글을 남겨 보세요.</p>
      ) : (
        <div className="bd-rows">
          {posts.map((p) => (
            <Row post={p} key={p.id} />
          ))}
        </div>
      )}
    </div>
  );
}
