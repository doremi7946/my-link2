"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fcf9f2] text-black font-sans font-medium flex flex-col items-center justify-center p-6 select-none">
      
      {/* Decorative background grids/shapes (optional, high-end feel) */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-pink-300 border-4 border-black rounded-full -rotate-12 opacity-80 hidden md:block animate-bounce" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-10 right-10 w-28 h-28 bg-lime-300 border-4 border-black rounded-xl rotate-12 opacity-80 hidden md:block animate-pulse" style={{ animationDuration: '3s' }}></div>
      
      {/* Main Container */}
      <div className="bg-white border-4 border-black rounded-[32px] p-8 md:p-12 max-w-lg w-full text-center shadow-[8px_8px_0_0_#000] relative z-10 hover:-translate-y-1 transition-transform duration-300">
        
        {/* Warning Icon with Neo-brutalism Style */}
        <div className="w-20 h-20 bg-amber-300 border-4 border-black rounded-2xl mx-auto flex items-center justify-center mb-8 rotate-3 shadow-[4px_4px_0_0_#000]">
          <FileQuestion className="w-10 h-10 text-black stroke-[2.5]" />
        </div>

        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">
          Page Not Found
        </h1>
        
        <p className="text-lg md:text-xl font-bold text-slate-700 mb-8 border-l-4 border-black pl-4 bg-[#fcf9f2] p-4 text-left shadow-[2px_2px_0_0_#000] border-2 border-slate-900 rounded-lg">
          요청하신 프로필을 찾을 수 없습니다.
          <span className="block text-sm font-semibold text-slate-500 mt-1">
            잘못된 주소이거나, 변경 및 삭제된 사용자일 수 있습니다. 입력한 주소를 다시 한번 확인해 주세요.
          </span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex-1 relative inline-flex items-center justify-center gap-2 bg-[#a855f7] border-4 border-black px-6 py-3.5 text-base font-black uppercase text-white transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0_0_#000] rounded-xl"
          >
            <Home className="w-5 h-5 stroke-[2.5]" />
            메인 페이지로
          </Link>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
            className="flex-1 relative inline-flex items-center justify-center gap-2 bg-white border-4 border-black px-6 py-3.5 text-base font-black uppercase transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0_0_#000] rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            이전 페이지로
          </button>
        </div>

      </div>
      
      {/* Footer Watermark */}
      <div className="mt-8 text-xs font-bold tracking-wider uppercase opacity-40">
        MyLink<span className="text-pink-500">.</span>
      </div>

    </div>
  );
}
