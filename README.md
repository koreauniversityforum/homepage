# 한대포 홈페이지

`univforum.kr` - Next.js 16 (App Router). GitHub 에 커밋하면 Vercel 이 자동으로 다시 띄운다.

## 폴더

```
app/page.tsx          첫 화면 (공지 + 활동 + 커뮤니티 + 행사 + 뉴보대)
app/news/             소식 목록 · 글 상세(/news/[id])
components/           머리·바닥·뉴보대 줄·활동 필터
lib/posts.ts          소식 데이터 읽기 · 공지 고르기
lib/site.ts           연락처·인스타 핸들·히어로 숫자  ← 문구 고칠 때 여기부터
public/data/*.json    소식 글과 뉴보대 카드 (관리 화면이 고치는 파일)
public/media/         글에 쓰이는 사진
public/admin.html     소식 등록 화면  ← 평소 쓰는 곳
scripts/              인스타 자동 수집 (토큰 넣기 전에는 잠들어 있음)
```

## 자주 하는 일

- **새 소식 올리기** → `https://univforum.kr/admin.html` (→ [docs/운영안내.md](docs/운영안내.md))
- **인스타 자동 등록 켜기** → [docs/인스타_자동수집_켜기.md](docs/인스타_자동수집_켜기.md)

## 손으로 돌려볼 때

```bash
npm install
npm run dev     # http://localhost:3000
```

## Vercel 설정

Framework Preset 은 **Next.js**. Build/Output 은 기본값 그대로 두면 된다.

## 아직 정리 안 된 것

- 히어로의 `42 / 128 / 3,200+` 와 소개 영역의 큰 숫자 `42` 는 **근거가 확인되지 않은 값**이다.
  실제 값을 알게 되면 `lib/site.ts` 의 `STATS`·`ABOUT_NUMBER` 만 고치면 된다.
  빈 배열 `[]` 로 두면 그 줄이 통째로 사라진다.
- 동아리 3종·커뮤니티 글 4건·행사 3건도 아직 예시 내용이다. (`components/ClubFilter.tsx`, `app/page.tsx`)
- 인스타 핸들이 자료마다 두 갈래였다(`universityforum_korea` / `universityforum_korea`).
  지금은 앞쪽을 쓰며, 바꾸려면 `lib/site.ts` 의 `INSTAGRAM.kuf` 한 줄만 고치면 된다.
