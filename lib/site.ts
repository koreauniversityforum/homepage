/**
 * 화면 여기저기에 흩어지기 쉬운 값들을 한 곳에 모았다.
 * 문구를 고칠 때 컴포넌트를 뒤지지 않아도 되도록.
 */

export const CONTACT = {
  email: "koreauniversityforum@gmail.com",
};

/**
 * 「한대포 시작하기」 단추가 여는 곳 — 가입 신청 구글 폼.
 * 폼을 새로 만들면 이 한 줄만 고치면 화면이 따라온다.
 */
export const JOIN_FORM = "https://forms.gle/2UkdBcGhrdZiSGde7";

export const INSTAGRAM = {
  /* 🔴 자료마다 두 갈래로 적혀 있었다(forum / fourm).
     뉴보대 워터마크·설명서에 쓰인 fourm 쪽을 따랐다. 실제 계정이 다르면 이 줄만 고치면 된다. */
  kuf: "universityfourm_korea",
  newbodae: "news_univ",
};

/**
 * 🔴 히어로 아래 줄에 들어가는 숫자.
 *
 * 지금 값은 근거가 확인되지 않은 것이다(처음 시안에 들어 있던 값을 그대로 둔 상태).
 * 실제 값을 알게 되면 여기만 고치면 화면이 따라온다.
 * 근거를 못 찾겠으면 이 배열을 빈 배열 `[]` 로 두면 그 줄이 통째로 사라진다.
 */
export const STATS: { value: string; label: string }[] = [
  { value: "42", label: "참여 대학" },
  { value: "128", label: "활동 모임" },
  { value: "3,200+", label: "연결된 대학생" },
];

/** 소개 영역의 큰 숫자. STATS 와 같은 이유로 여기 모아 둔다. */
export const ABOUT_NUMBER = "42";

/**
 * 후원 계좌 — 머리말 오른쪽(옛 로그인 단추 자리)에 뜬다.
 *
 * 누르면 계좌번호가 클립보드에 복사된다. 숫자만 고치면 화면이 따라온다.
 * `holder` 를 빈 문자열로 두면 예금주 줄이 통째로 사라진다.
 * `mark` 는 `public/` 안의 은행 심벌 파일 경로. 파일이 없으면 은행 이름이 글자 배지로 대신 나온다.
 */
export const DONATION = {
  /** 배지에 보이는 짧은 이름. */
  bank: "신한",
  /** 눌렀을 때 복사되는 문구는 `bankFull + 공백 + account` 다 — 「신한은행 140-012-402064」. */
  bankFull: "신한은행",
  account: "140-012-402064",
  holder: "",
  /* 신한은행 공식 심벌(구 모양). shinhan.com CI 자료에서 심벌만 잘라 온 것으로,
     원 바깥은 투명해 어떤 바닥색에도 얹힌다.
     평면판을 쓰고 싶으면 "/shinhan-mark-flat.png" 로 바꾼다. 비우면 민무늬 원. */
  mark: "/shinhan-mark.png",
  markColor: "#0046ff",
};
