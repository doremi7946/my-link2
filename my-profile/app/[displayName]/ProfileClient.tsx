"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLinks, incrementLinkClick } from "@/lib/firestore-service";
import { Loader2, Sun, Moon, Share2, ExternalLink, MousePointerClick } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  uid: string;
  displayname?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  handle?: string | null;
}

interface ProfileClientProps {
  userProfile: UserProfile;
}

export default function ProfileClient({ userProfile }: ProfileClientProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [imgError, setImgError] = useState(false);

  // 유저 UID로 링크 목록 조회
  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ["userLinks", userProfile.uid],
    queryFn: () => fetchLinks(userProfile.uid),
  });

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success("링크가 복사되었습니다!", {
      description: shareUrl,
    });
  };

  const themeBgColor = isDarkMode
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-50 text-slate-900";

  return (
    <div
      className={`min-h-screen flex flex-col items-center ${themeBgColor} transition-colors duration-300 font-sans relative overflow-x-hidden pb-16`}
    >
      {/* 상단 컨트롤 바 */}
      <div className="w-full max-w-xl flex justify-between items-center p-4 mt-2 z-10">
        <div className="text-sm font-bold tracking-tight opacity-75">
          MyLink<span className="text-blue-500">.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={`p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
              isDarkMode
                ? "border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300"
                : "border-slate-200 bg-white/50 hover:bg-slate-100 text-slate-600"
            }`}
            title="공유하기"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
              isDarkMode
                ? "border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-yellow-400"
                : "border-slate-200 bg-white/50 hover:bg-slate-100 text-slate-600"
            }`}
            title={isDarkMode ? "라이트 모드" : "다크 모드"}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="w-full max-w-xl flex flex-col items-center px-6 mt-6">
        {/* 프로필 이미지 */}
        <div className="relative mb-4 group">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
          <div
            className={`w-28 h-28 rounded-full overflow-hidden border-4 shadow-md relative z-10 ${
              isDarkMode
                ? "border-slate-800 bg-slate-800"
                : "border-white bg-white"
            } transition-transform duration-300 group-hover:scale-105`}
          >
            <img
              src={imgError || !userProfile.photoURL ? "/avatar.png" : userProfile.photoURL}
              alt={`${userProfile.displayname ?? "유저"}의 프로필 사진`}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        </div>

        {/* 이름 & 핸들 */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-center">
          {userProfile.displayname}
        </h1>
        {userProfile.handle && (
          <p
            className={`text-sm font-semibold mb-4 px-3 py-1 rounded-full ${
              isDarkMode
                ? "bg-slate-900 text-slate-400"
                : "bg-slate-200/50 text-slate-500"
            }`}
          >
            @{userProfile.handle}
          </p>
        )}

        {/* Bio */}
        {userProfile.bio ? (
          <p
            className={`text-[15px] leading-relaxed text-center max-w-sm mb-8 font-medium ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {userProfile.bio}
          </p>
        ) : (
          <div className="h-4 mb-4"></div>
        )}

        {/* 링크 목록 */}
        <div className="w-full flex flex-col gap-3.5">
          {isLinksLoading ? (
            <div className="flex flex-col gap-3 w-full animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-16 rounded-2xl border ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-800"
                      : "bg-white border-slate-200"
                  }`}
                />
              ))}
            </div>
          ) : links.length > 0 ? (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  incrementLinkClick(userProfile.uid, link.id).catch(console.error);
                }}
                className={`group relative w-full h-16 rounded-2xl border flex items-center justify-between px-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden ${
                  isDarkMode
                    ? "bg-slate-900 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/80"
                    : "bg-white border-slate-200/80 hover:border-slate-300/85 hover:bg-slate-50/50"
                }`}
              >
                {/* 파비콘 및 타이틀 */}
                <div className="flex items-center gap-4 min-w-0 pr-6">
                  {link.icon ? (
                    <div
                      className={`w-10 h-10 shrink-0 flex items-center justify-center border rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
                        isDarkMode
                          ? "bg-slate-950 border-slate-800"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <img
                        src={link.icon}
                        alt=""
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 shrink-0 border rounded-xl ${
                        isDarkMode
                          ? "bg-slate-950 border-slate-800"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    />
                  )}
                  <span
                    className={`font-semibold text-[15px] truncate ${
                      isDarkMode
                        ? "text-slate-100 group-hover:text-white"
                        : "text-slate-800 group-hover:text-slate-950"
                    }`}
                  >
                    {link.title}
                  </span>
                </div>

                {/* 우측 아이콘 */}
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      isDarkMode
                        ? "bg-slate-950/40 text-slate-500 group-hover:text-slate-300"
                        : "bg-slate-50/60 text-slate-400 group-hover:text-slate-600"
                    }`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div
              className={`text-center py-16 border rounded-2xl ${
                isDarkMode
                  ? "bg-slate-900/50 border-slate-800 text-slate-400"
                  : "bg-white border-slate-200 text-slate-500"
              }`}
            >
              <p className="font-semibold text-sm">
                아직 등록된 링크가 없습니다.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 하단 푸터 (워터마크) */}
      <footer className="absolute bottom-4 left-0 right-0 flex justify-center opacity-40 hover:opacity-70 transition-opacity">
        <a
          href="/"
          className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5"
        >
          Powered by <span className="text-blue-500 font-extrabold">MyLink</span>
        </a>
      </footer>
    </div>
  );
}
