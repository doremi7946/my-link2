import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "링크 클릭 통계 | MyLink",
  description: "내가 등록한 링크의 누적 클릭 수와 상세 분석 통계를 실시간으로 확인하세요.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
