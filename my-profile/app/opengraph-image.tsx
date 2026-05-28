import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "MyLink - 나만의 프로필 링크 서비스";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
    console.error("Font load error:", error);
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
          backgroundColor: "#030712", // bg-slate-950
          backgroundImage: "radial-gradient(circle at 50% 50%, #1e1b4b 0%, #030712 70%)", // 은은한 indigo 그라데이션
          fontFamily: fontData ? "Pretendard" : "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 데코용 은은한 격자 무늬 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* 데코용 네온 광원 원형 */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
            top: "-100px",
            right: "-100px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            bottom: "-150px",
            left: "-100px",
          }}
        />

        {/* 중앙 프리미엄 카드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 80px",
            borderRadius: "32px",
            backgroundColor: "rgba(17, 24, 39, 0.7)", // bg-slate-900/70
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)",
            width: "80%",
            maxWidth: "960px",
          }}
        >
          {/* 서비스 브랜드 로고 */}
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-0.05em",
              color: "#ffffff",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
            }}
          >
            MyLink<span style={{ color: "#3b82f6" }}>.</span>
          </div>

          {/* 메인 타이틀 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: "48px",
              fontWeight: 800,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              marginBottom: "20px",
              wordBreak: "keep-all",
            }}
          >
            <span>흩어져 있는 나만의 링크들을</span>
            <span>하나의 아름다운 페이지로 연결하세요.</span>
          </div>

          {/* 서브 설명 */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: 500,
              color: "#9ca3af", // text-slate-400
              textAlign: "center",
              letterSpacing: "-0.01em",
            }}
          >
            포트폴리오, SNS, 채널 등을 감각적인 네오브루탈리즘 스타일로 공유해 보세요.
          </div>
        </div>

        {/* 푸터 영역 */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#4b5563", // text-slate-600
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Powered by MyLink
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontOptions,
    }
  );
}
