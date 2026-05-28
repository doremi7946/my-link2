import { ImageResponse } from "next/og";
import { fetchProfileByDisplayName, fetchLinks } from "@/lib/firestore-service";

export const runtime = "nodejs";

export const alt = "MyLink - 프로필 카드";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface PageProps {
  params: Promise<{
    displayName: string;
  }>;
}

export default async function Image({ params }: PageProps) {
  const { displayName } = await params;

  // @ 기호 제거 및 URL 디코딩 처리
  const decodedName = decodeURIComponent(displayName);
  const targetName = decodedName.startsWith("@")
    ? decodedName.slice(1)
    : decodedName;

  // 서버에서 유저 프로필 조회
  const userProfile = await fetchProfileByDisplayName(targetName);

  // 한글 폰트 로드 (Pretendard-SemiBold)
  let fontData: ArrayBuffer | null = null;
  try {
    const fontResponse = await fetch(
      new URL(
        "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-SemiBold.woff"
      )
    );
    if (fontResponse.ok) {
      fontData = await fontResponse.arrayBuffer();
    }
  } catch (error) {
    console.error("Font load error in dynamic OG:", error);
  }

  const fontOptions = fontData
    ? [
        {
          name: "Pretendard",
          data: fontData,
          style: "normal" as const,
        },
      ]
    : [];

  const fontStyle = fontData ? "Pretendard" : "sans-serif";

  // 만약 유저를 찾지 못했다면 기본 에러/대체 OG를 렌더링합니다.
  if (!userProfile) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#030712",
            fontFamily: fontStyle,
          }}
        >
          <div style={{ fontSize: "40px", fontWeight: 800, color: "#ffffff", marginBottom: "16px" }}>
            사용자를 찾을 수 없습니다.
          </div>
          <div style={{ fontSize: "20px", color: "#6b7280" }}>
            MyLink에서 나만의 링크를 등록하고 프로필을 완성해 보세요!
          </div>
        </div>
      ),
      { ...size, fonts: fontOptions }
    );
  }

  // 등록된 링크 목록 조회하여 링크 개수 확인
  let linksCount = 0;
  try {
    const links = await fetchLinks(userProfile.uid);
    linksCount = links?.length || 0;
  } catch (err) {
    console.error("Error fetching links for OG:", err);
  }

  // 프로필 이미지 URL (기본값 설정)
  // satori에서 http가 아닌 로컬 경로(예: /avatar.png)는 처리하지 못하므로, 절대 경로를 제공하거나 기본 SVG/원을 렌더링해야 함.
  const photoURL = userProfile.photoURL && userProfile.photoURL.startsWith("http")
    ? userProfile.photoURL
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#090d16", // 매우 깊고 프리미엄한 다크 네이비 배경
          backgroundImage: "radial-gradient(circle at 30% 30%, #172554 0%, #090d16 80%)",
          fontFamily: fontStyle,
          padding: "60px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 데코 그리드 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.04,
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* 은은한 네온 광원 포인트 */}
        <div
          style={{
            position: "absolute",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)",
            top: "50px",
            left: "-50px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)",
            bottom: "-50px",
            right: "100px",
          }}
        />

        {/* 메인 프로필 플레이트 카드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            height: "100%",
            borderRadius: "32px",
            backgroundColor: "rgba(15, 23, 42, 0.75)", // bg-slate-900/75
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "50px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* 좌측: 아바타 이미지 영역 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              marginRight: "60px",
            }}
          >
            {/* 아바타 테두리 그라데이션 빛 효과 */}
            <div
              style={{
                position: "absolute",
                width: "232px",
                height: "232px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                opacity: 0.8,
              }}
            />
            {/* 실제 프로필 이미지 */}
            {photoURL ? (
              <img
                src={photoURL}
                alt="Avatar"
                style={{
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "6px solid #0f172a",
                  position: "relative",
                  zIndex: 2,
                }}
              />
            ) : (
              // 프로필 이미지가 없을 때의 고급스러운 원형 기본 이니셜 렌더링
              <div
                style={{
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  backgroundColor: "#1e293b",
                  border: "6px solid #0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "72px",
                  fontWeight: 800,
                  color: "#3b82f6",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {userProfile.displayname
                  ? userProfile.displayname.charAt(0).toUpperCase()
                  : targetName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* 우측: 유저 정보 콘텐츠 영역 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* 디스플레이 네임 */}
            <div
              style={{
                fontSize: "48px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                marginBottom: "8px",
              }}
            >
              {userProfile.displayname || "User"}
            </div>

            {/* 핸들 (@username) */}
            {userProfile.handle && (
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  alignItems: "center",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#93c5fd", // text-blue-300
                  backgroundColor: "rgba(30, 41, 59, 0.8)", // bg-slate-800/80
                  padding: "6px 16px",
                  borderRadius: "9999px",
                  marginBottom: "20px",
                  border: "1px solid rgba(147, 197, 253, 0.15)",
                }}
              >
                @{userProfile.handle}
              </div>
            )}

            {/* 소개글(Bio) */}
            {userProfile.bio ? (
              <div
                style={{
                  fontSize: "22px",
                  color: "#cbd5e1", // text-slate-300
                  lineHeight: 1.4,
                  marginBottom: "28px",
                  fontWeight: 500,
                  display: "flex",
                  maxHeight: "64px",
                  overflow: "hidden",
                }}
              >
                {userProfile.bio}
              </div>
            ) : (
              <div style={{ height: "16px" }} />
            )}

            {/* 하단 배지 및 워터마크 그룹 */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                paddingTop: "20px",
                marginTop: "10px",
              }}
            >
              {/* 링크 개수 상태 배지 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#34d399", // text-emerald-400
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#34d399",
                    marginRight: "8px",
                  }}
                />
                {linksCount}개의 링크 연결됨
              </div>

              {/* MyLink 브랜딩 워터마크 */}
              <div
                style={{
                  display: "flex",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "rgba(255, 255, 255, 0.4)",
                  letterSpacing: "-0.03em",
                }}
              >
                MyLink<span style={{ color: "#3b82f6" }}>.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontOptions,
    }
  );
}
