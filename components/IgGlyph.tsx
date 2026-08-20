/**
 * 인스타그램 표시용 글리프.
 *
 * 🔴 lucide 1.31 에서 브랜드 아이콘이 통째로 빠졌다(`Instagram` 이 없다).
 *    그래서 같은 획 문법(굵기 2 · 둥근 끝 · 24 격자)으로 직접 그렸다.
 *    공식 로고의 색 그라데이션을 흉내 내지 않고 선으로만 둔 것은,
 *    옆 글자와 같은 색으로 따라가야 아이콘이 라벨의 보조로 남기 때문이다.
 */
export default function IgGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
