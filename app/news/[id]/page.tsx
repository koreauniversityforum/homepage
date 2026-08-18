import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getPosts, pickNotice, fmtDate, excerpt, paragraphs } from "@/lib/posts";

type Params = { params: Promise<{ id: string }> };

/**
 * 글 주소를 빌드 때 미리 만들어 둔다.
 * 관리 화면이 글을 올리면 커밋 → Vercel 재빌드 → 새 주소가 생기는 흐름이라 이걸로 충분하다.
 */
export function generateStaticParams() {
  return getPosts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const post = getPosts().find((p) => p.id === id);
  if (!post) return { title: "글을 찾지 못했습니다" };
  const image = post.images?.[0];
  return {
    title: post.title,
    description: excerpt(post.summary || post.body, 120),
    openGraph: {
      title: post.title,
      description: excerpt(post.summary || post.body, 120),
      type: "article",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { id } = await params;
  const posts = getPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) notFound();

  const isNotice = post === pickNotice(posts);

  return (
    <main>
      <SiteHeader current="news" />

      <article className="post">
        <Link className="post-back" href="/news">
          <ArrowLeft size={16} /> 소식 목록
        </Link>

        <span className="board-tag solo">{isNotice ? "공지" : post.category ?? "소식"}</span>
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>{fmtDate(post.date)}</span>
          {post.account && (
            <a href={`https://www.instagram.com/${post.account}/`} target="_blank" rel="noreferrer">
              @{post.account}
            </a>
          )}
        </div>

        {(post.images ?? []).map((src) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className="post-img" src={src} alt="" key={src} loading="lazy" />
        ))}

        <div className="post-body">
          {paragraphs(post.body || post.summary).map((lines, i) => (
            <p key={i}>
              {lines.map((line, j) => (
                <span key={j}>
                  {j > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          ))}
        </div>

        {post.permalink && (
          <a className="primary-button" href={post.permalink} target="_blank" rel="noreferrer">
            인스타그램에서 보기 <ArrowUpRight size={17} />
          </a>
        )}
      </article>

      <SiteFooter />
    </main>
  );
}
