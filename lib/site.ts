/**
 * 화면 여기저기에 흩어지기 쉬운 값들을 한 곳에 모았다.
 * 문구를 고칠 때 컴포넌트를 뒤지지 않아도 되도록.
 */

export const CONTACT = {
  email: "koreauniversityforum@gmail.com",
};

/**
 * 「한대포 시작하기」 단추가 여는 곳 - 가입 신청 구글 폼.
 * 폼을 새로 만들면 이 한 줄만 고치면 화면이 따라온다.
 */
export const JOIN_FORM = "https://forms.gle/2UkdBcGhrdZiSGde7";

/**
 * 활동별 지원 폼 - 「함께할 사람들」 카드가 여는 곳.
 *
 * 2026-08-20 한대포 계정(koreauniversityforum@gmail.com)으로 만든 구글 폼이다.
 * 폼을 새로 만들면 여기 주소만 갈아 끼우면 카드가 따라온다.
 * 주소가 없는 활동은 여기 넣지 않는다 - 카드가 안 눌리는 편이 죽은 링크보다 낫다.
 */
export const CLUB_FORMS = {
  /** 현재를 기록하는 대학생 에디터 클럽 */
  editor: "https://forms.gle/qm2jD4o62xEdS3yt6",
  /** 아이디어를 서비스로! 브랜드를 직접 만드는 사이드 프로젝트 팀 */
  sideProject: "https://forms.gle/4VHRHdD26Y9DA4RD7",
};

export const INSTAGRAM = {
  /* 🔴 자료마다 두 갈래로 적혀 있었다(forum / fourm).
     2026-08-20 사용자가 직접 준 주소가 forum 쪽이라 그것으로 통일했다.
     실제 계정이 다르면 이 줄만 고치면 화면 전체가 따라온다. */
  kuf: "universityforum_korea",
  newbodae: "news_univ",
};

/**
 * 한대포가 실제로 하는 활동.
 *
 * 🔴 여기 문장은 전부 기존 공지·모집 글에서 나온 것이다. 지어낸 것이 없다.
 *    예전에는 이 자리에 「브랜드를 직접 만드는 대학생 기획단 · 모집 중 D-8」 같은
 *    가짜 모집 공고 세 건이 떠 있었다. 없는 마감일을 띄우는 것이 제일 나쁘다.
 *
 * `post` 는 그 활동을 다룬 실제 소식 글이 있을 때만 채운다(없으면 링크가 안 나온다).
 */
export const ACTIVITIES: {
  label: string;
  title: string;
  body: string;
  accent: "coral" | "blue" | "green";
  post?: string;
}[] = [
  {
    label: "매월",
    title: "월말 포럼",
    body:
      "회원이 돌아가며 의제를 발제합니다. 발제자가 자료와 근거를 정리해 먼저 관점을 내놓으면, 참석자들이 그 근거를 함께 따져 봅니다. 결론을 미리 정해 두지 않습니다.",
    accent: "blue",
    post: "2026-08-01-monthly-forum",
  },
  {
    label: "수시",
    title: "전문가 초청 강연",
    body:
      "현업에 계신 분들을 모셔 이야기를 듣습니다. 책상에서 정리한 질문을 그 자리에서 직접 물어볼 수 있는 자리입니다.",
    accent: "coral",
  },
  {
    label: "연수",
    title: "정책·산업 현장 탐방",
    body:
      "정책과 산업의 현장을 직접 방문해, 자료로만 읽던 쟁점을 눈으로 확인합니다. 토론에서 나온 질문을 현장에서 다시 묻고, 돌아와 함께 정리합니다.",
    accent: "green",
    post: "2026-08-13-industry-tour",
  },
];

/**
 * 「더 자세히 보기」가 여는 곳.
 *
 * 지금은 이 사이트 안의 소개 페이지(/about)다.
 * 노션·브런치 같은 바깥 글로 바꾸고 싶으면 이 한 줄만 주소로 갈아 끼우면 된다
 * (바깥 주소면 새 탭으로 열리게 아래 EXTERNAL 판정이 알아서 처리한다).
 */
export const ABOUT_MORE = "/about";


/**
 * 후원 계좌 - 머리말 오른쪽(옛 로그인 단추 자리)에 뜬다.
 *
 * 누르면 계좌번호가 클립보드에 복사된다. 숫자만 고치면 화면이 따라온다.
 * `holder` 를 빈 문자열로 두면 예금주 줄이 통째로 사라진다.
 * `mark` 는 `public/` 안의 은행 심벌 파일 경로. 파일이 없으면 은행 이름이 글자 배지로 대신 나온다.
 */
export const DONATION = {
  /** 배지에 보이는 짧은 이름. */
  bank: "신한",
  /** 눌렀을 때 복사되는 문구는 `bankFull + 공백 + account` 다 - 「신한은행 140-012-402064」. */
  bankFull: "신한은행",
  account: "140-012-402064",
  holder: "",
  /* 신한은행 공식 심벌(구 모양). shinhan.com CI 자료에서 심벌만 잘라 온 것으로,
     원 바깥은 투명해 어떤 바닥색에도 얹힌다.
     평면판을 쓰고 싶으면 "/shinhan-mark-flat.png" 로 바꾼다. 비우면 민무늬 원. */
  mark: "/shinhan-mark.png",
  markColor: "#0046ff",
};
