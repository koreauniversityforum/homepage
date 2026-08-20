-- ═══════════════════════════════════════════════════════════════════════
--  한국대학생포럼 게시판 — Supabase 한 번만 실행하는 설정
--
--  실행하는 곳: Supabase 대시보드 → 왼쪽 SQL Editor → 통째로 붙여넣고 Run
--  두 번 실행해도 안전하도록 짰다(있으면 지우고 다시 만든다).
--
--  ▸ 방문자(anon 키)는 이 표를 "쓰기만" 할 수 있다. 읽지 못한다.
--  ▸ 방문자가 보는 것은 아래 board_public 이라는 창구 하나뿐이고,
--    그 창구가 승인 안 된 글의 본문을 1~2줄로 잘라서 내보낸다.
--    ⇒ 자르는 일을 브라우저에서 하면 안 된다. 그러면 불법 광고 전문이
--      화면 소스에 그대로 실려 나간다. 그래서 DB 쪽에서 자른다.
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. 표 ────────────────────────────────────────────────────────────
create table if not exists public.board_posts (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  author      text        not null check (char_length(author) between 1 and 20),
  title       text        not null check (char_length(title)  between 2 and 80),
  body        text        not null check (char_length(body)   between 5 and 4000),
  -- pending  = 승인 대기 (제목 + 본문 1~2줄만 공개)
  -- approved = 승인됨   (전문 공개)
  -- rejected = 반려됨   (아예 안 보임)
  status      text        not null default 'pending'
                          check (status in ('pending', 'approved', 'rejected')),
  -- 링크·연락처가 섞인 글에 자동으로 켜지는 표시. 관리 화면에서만 보인다.
  flagged     boolean     not null default false,
  -- 도배 막기용. 방문자에게는 절대 안 나간다(창구에서 뺐다).
  ip          text
);

create index if not exists board_posts_recent on public.board_posts (created_at desc);
create index if not exists board_posts_ip_time on public.board_posts (ip, created_at desc);

-- ── 2. 넣을 때 지키게 할 것 ──────────────────────────────────────────
-- 상태를 강제로 pending 으로 되돌리고, IP 를 붙이고, 도배를 막는다.
-- 🔴 이 검사를 브라우저 코드에 두면 아무 의미가 없다. 남이 안 거치고
--    바로 REST 주소를 두드리면 그만이기 때문이다. 그래서 DB 안에 둔다.
create or replace function public.board_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent int;
begin
  new.status  := 'pending';
  new.ip      := split_part(
                   coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''),
                   ',', 1);
  if new.ip = '' then new.ip := 'unknown'; end if;

  -- 링크·연락처가 보이면 표시만 해 둔다(막지는 않는다 — 정상 글도 링크를 쓴다)
  new.flagged := (new.body || ' ' || new.title)
                 ~* '(https?://|www\.|\.com|\.net|\.kr/|텔레그램|카톡|오픈채팅|010[-. ]?[0-9]{3,4})';

  -- 3분에 2건까지
  select count(*) into recent
    from public.board_posts
   where ip = new.ip
     and created_at > now() - interval '3 minutes';

  if recent >= 2 then
    raise exception '조금 전에 글을 올리셨습니다. 3분 뒤에 다시 시도해 주세요.';
  end if;

  return new;
end;
$$;

drop trigger if exists board_guard_ins on public.board_posts;
create trigger board_guard_ins
  before insert on public.board_posts
  for each row execute function public.board_guard();

-- ── 3. 방문자가 보는 창구 ────────────────────────────────────────────
-- 승인 대기 글은 본문을 110자까지만 내보낸다(화면에서 두 줄쯤 된다).
-- 반려된 글은 아예 나가지 않는다. ip 도 나가지 않는다.
--
-- 🔴 security_invoker = false 는 일부러 그렇게 둔 것이다.
--    이 창구는 표 주인 권한으로 돌아야 위의 "방문자는 표를 못 읽는다" 를
--    지키면서도 잘라낸 미리보기를 내보낼 수 있다.
--    (Supabase 검사기가 security_definer_view 라고 경고하는데, 여기서는 의도한 것이다.)
drop view if exists public.board_public;
create view public.board_public
with (security_invoker = false)
as
select
  p.id,
  p.created_at,
  p.author,
  p.title,
  p.status,
  case
    when p.status = 'approved' then p.body
    else left(regexp_replace(p.body, '\s+', ' ', 'g'), 110)
  end                       as body,
  (p.status <> 'approved')  as pending,
  -- 잘렸는지 여부. 잘렸으면 화면에 「…」 를 붙인다.
  (p.status <> 'approved' and char_length(regexp_replace(p.body, '\s+', ' ', 'g')) > 110) as clipped
from public.board_posts p
where p.status in ('pending', 'approved');

-- ── 4. 권한 ──────────────────────────────────────────────────────────
alter table public.board_posts enable row level security;

-- 방문자: 표에는 넣기만, 그것도 세 칸만. 읽기는 창구로만.
revoke all on public.board_posts from anon;
grant insert (author, title, body) on public.board_posts to anon;
grant select on public.board_public to anon;

-- 관리자(로그인한 사람): 전부
grant all on public.board_posts to authenticated;
grant select on public.board_public to authenticated;

drop policy if exists "방문자 글쓰기"   on public.board_posts;
drop policy if exists "관리자 열람"     on public.board_posts;
drop policy if exists "관리자 상태변경" on public.board_posts;
drop policy if exists "관리자 삭제"     on public.board_posts;

create policy "방문자 글쓰기"   on public.board_posts for insert to anon          with check (status = 'pending');
create policy "관리자 열람"     on public.board_posts for select to authenticated using (true);
create policy "관리자 상태변경" on public.board_posts for update to authenticated using (true) with check (true);
create policy "관리자 삭제"     on public.board_posts for delete to authenticated using (true);

-- ── 5. 확인 ──────────────────────────────────────────────────────────
-- 여기까지 오면 아래 한 줄이 0건을 돌려주면 정상이다(아직 글이 없으니).
select count(*) as 지금_보이는_글 from public.board_public;
