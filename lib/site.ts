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

export const INSTAGRAM = {
  /* 🔴 자료마다 두 갈래로 적혀 있었다(forum / fourm).
     2026-08-20 사용자가 직접 준 주소가 forum 쪽이라 그것으로 통일했다.
     실제 계정이 다르면 이 줄만 고치면 화면 전체가 따라온다. */
  kuf: "universityforum_korea",
  newbodae: "news_univ",
};

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
