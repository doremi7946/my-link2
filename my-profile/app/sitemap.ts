import type { MetadataRoute } from "next";
import { fetchAllUserHandles } from "@/lib/firestore-service";

export const revalidate = 3600; // 1시간마다 사이트맵 갱신

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mylink-dev.vercel.app";

  // 기본 홈 페이지
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
  ];

  // 모든 유저의 핸들을 가져와서 프로필 페이지 목록 생성
  const handles = await fetchAllUserHandles();
  const profileRoutes = handles.map((handle) => ({
    url: `${baseUrl}/${handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...routes, ...profileRoutes];
}
