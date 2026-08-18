import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.univforum.kr"),
  title: { default: "한대포 | 한국 대학생 포럼", template: "%s | 한대포" },
  description: "학교의 경계를 넘어 대학생의 경험과 기회를 연결하는 한국 대학생 포럼입니다.",
  icons: { icon: "/logo-mark.png", apple: "/logo-mark.png" },
  openGraph: {
    title: "한대포 | 한국 대학생 포럼",
    description: "대학생의 연결이 더 큰 가능성이 되도록.",
    url: "https://www.univforum.kr",
    siteName: "한대포",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/og.png", width: 1728, height: 907, alt: "한대포 - 대학생의 연결이 더 큰 가능성이 되도록" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "한대포 | 한국 대학생 포럼",
    description: "대학생의 연결이 더 큰 가능성이 되도록.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
