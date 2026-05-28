import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://my-link2-three.vercel.app"),
  title: {
    default: "MyLink - 나만의 링크 모음 서비스",
    template: "%s | MyLink",
  },
  description: "인스타그램, 유튜브, 블로그 등 흩어져 있는 나의 모든 프로필 링크를 한 곳에 깔끔하게 모아 공유해 보세요.",
  keywords: ["링크모음", "링크트리", "멀티링크", "바이오링크", "포트폴리오", "MyLink"],
  authors: [{ name: "MyLink" }],
  creator: "MyLink",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://my-link2-three.vercel.app",
    title: "MyLink - 나만의 링크 모음 서비스",
    description: "인스타그램, 유튜브, 블로그 등 흩어져 있는 나의 모든 프로필 링크를 한 곳에 깔끔하게 모아 공유해 보세요.",
    siteName: "MyLink",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLink - 나만의 링크 모음 서비스",
    description: "인스타그램, 유튜브, 블로그 등 흩어져 있는 나의 모든 프로필 링크를 한 곳에 깔끔하게 모아 공유해 보세요.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
