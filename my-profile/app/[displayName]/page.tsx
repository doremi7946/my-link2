import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProfileByDisplayName } from "@/lib/firestore-service";
import ProfileClient from "./ProfileClient";

interface PageProps {
  params: Promise<{
    displayName: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { displayName } = await params;
  
  // @ 기호 제거 및 URL 디코딩 처리
  const decodedName = decodeURIComponent(displayName);
  const targetName = decodedName.startsWith("@")
    ? decodedName.slice(1)
    : decodedName;

  const userProfile = await fetchProfileByDisplayName(targetName);

  if (!userProfile) {
    return {
      title: "사용자를 찾을 수 없습니다 | MyLink",
    };
  }

  const title = `${userProfile.displayname ?? targetName} (@${userProfile.handle ?? targetName}) | MyLink`;
  const description = userProfile.bio || `${userProfile.displayname ?? targetName}님의 모든 소셜 미디어 및 링크 정보입니다.`;
  const photoURL = userProfile.photoURL || "/avatar.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      username: userProfile.handle ?? targetName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}


export default async function UserProfilePage({ params }: PageProps) {
  const { displayName } = await params;

  // @ 기호 제거 및 URL 디코딩 처리
  const decodedName = decodeURIComponent(displayName);
  const targetName = decodedName.startsWith("@")
    ? decodedName.slice(1)
    : decodedName;

  // 서버에서 유저 프로필 조회 — 없으면 바로 404
  const userProfile = await fetchProfileByDisplayName(targetName);

  if (!userProfile) {
    notFound();
  }

  // Firestore Timestamp 등 직렬화 불가 객체를 제거하고 순수 객체로 변환
  const serializedProfile = {
    uid: userProfile.uid,
    displayname: userProfile.displayname ?? null,
    photoURL: userProfile.photoURL ?? null,
    bio: userProfile.bio ?? null,
    handle: userProfile.handle ?? null,
  };

  // 클라이언트 컴포넌트에 데이터 전달
  return <ProfileClient userProfile={serializedProfile} />;
}
