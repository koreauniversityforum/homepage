# 한대포 | 한국 대학생 포럼

학교의 경계를 넘어 대학생의 경험과 기회를 연결하는 한대포 공식 홈페이지입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 환경 변수

`.env.example`을 `.env.local`로 복사한 뒤 Supabase 프로젝트 정보를 입력합니다.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## 배포

GitHub 저장소를 Vercel 프로젝트로 가져오면 자동으로 Next.js를 인식합니다. Vercel 환경 변수에 위 두 값을 등록한 후 `www.univforum.kr`과 `univforum.kr`을 프로젝트 도메인으로 추가합니다.
