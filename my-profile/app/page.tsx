import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcf9f2] text-black font-sans font-medium selection:bg-lime-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="w-full border-b-4 border-black bg-white flex justify-between items-center p-4 lg:px-8 z-20 sticky top-0">
        <div className="text-2xl font-black tracking-tighter uppercase">Jeongwoo<span className="text-pink-500">.</span></div>
        <div className="hidden sm:flex gap-6 font-bold text-lg">
          <a href="#about" className="hover:underline underline-offset-4 decoration-4 decoration-lime-400">#About</a>
          <a href="#skills" className="hover:underline underline-offset-4 decoration-4 decoration-cyan-400">#Skills</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 w-full max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-center p-6 lg:p-16 gap-12 lg:gap-20 overflow-hidden">
        
        {/* Text Content */}
        <div className="flex-1 flex flex-col items-start gap-8 z-10 relative">
          <div className="inline-block bg-lime-300 border-4 border-black px-4 py-2 font-bold text-lg sm:text-xl uppercase shadow-[4px_4px_0_0_#000] -rotate-2">
            🚀 Vibe Coding Student
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-[1.1] tracking-tighter">
            Hi, I'm
            <br />
            <span className="bg-cyan-300 px-2 lg:px-4 box-decoration-clone relative inline-block mt-2">
               Park{' '}
               <br className="hidden sm:block lg:hidden"/>
               Jeongwoo
               <span className="absolute bottom-1 lg:bottom-2 left-2 w-full h-1 lg:h-3 bg-black -z-10"></span>
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium leading-relaxed max-w-xl border-l-4 border-black pl-6 bg-white shrink-0 shadow-[4px_4px_0_0_#000] p-4">
            끊임없이 <span className="font-bold underline decoration-pink-500 decoration-4 underline-offset-4">도전</span>하며 
            <span className="font-bold underline decoration-lime-500 decoration-4 underline-offset-4">성장</span>하는 
            바이브 코딩을 배우고 있는 대학생입니다.
            <br className="hidden sm:block" />
            새로운 기술을 탐구하고 즐겁게 코딩합니다.
          </p>

          <div className="flex flex-wrap gap-3 w-full">
             <span className="bg-[#facc15] border-2 border-black px-4 py-1.5 font-bold shadow-[2px_2px_0_0_#000]">#열정</span>
             <span className="bg-[#f472b6] border-2 border-black px-4 py-1.5 font-bold shadow-[2px_2px_0_0_#000] text-white">#문제해결</span>
             <span className="bg-[#a855f7] border-2 border-black px-4 py-1.5 font-bold shadow-[2px_2px_0_0_#000] text-white">#창의력</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full mt-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center gap-2 bg-white border-4 border-black px-8 py-4 text-xl font-black uppercase transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0_0_#000]"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
              GitHub
            </a>
            <a
              href="mailto:contact@example.com"
              className="relative inline-flex items-center justify-center gap-2 bg-[#a855f7] border-4 border-black px-8 py-4 text-xl font-black uppercase text-white transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0_0_#000]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              Contact Me
            </a>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="flex-1 flex justify-center w-full max-w-sm sm:max-w-md lg:max-w-none relative z-10 group mt-10 lg:mt-0">
          {/* Decorative shapes behind */}
          <div className="absolute top-4 left-4 w-full h-[95%] bg-pink-400 border-4 border-black rounded-[40px] -z-20 transition-transform group-hover:translate-x-2 group-hover:translate-y-2 duration-300 hidden sm:block"></div>
          <div className="absolute top-8 left-8 w-full h-[95%] bg-cyan-400 border-4 border-black rounded-[40px] -z-30 transition-transform group-hover:translate-x-4 group-hover:translate-y-4 duration-300 hidden sm:block"></div>
          
          {/* Main Avatar Container */}
          <div className="bg-white border-4 border-black rounded-[40px] w-full aspect-square relative z-10 shadow-[8px_8px_0_0_#000] flex items-end justify-center pt-8 overflow-hidden group-hover:-translate-y-2 transition-transform duration-300">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-[85%] h-[85%] drop-shadow-[5px_5px_0_rgba(0,0,0,0.15)] overflow-visible">
              
              {/* Head */}
              <circle cx="50" cy="40" r="30" fill="#fcd34d" stroke="black" strokeWidth="4" />
              
              {/* Cap Base */}
              <path d="M 18 25 L 50 8 L 82 25 L 50 42 Z" fill="#222" stroke="black" strokeWidth="4" strokeLinejoin="round"/>
              <path d="M 82 25 L 82 40" stroke="black" strokeWidth="4" strokeLinecap="round" />
              
              {/* Tassel */}
              <path d="M 50 25 L 75 35 L 75 48" fill="none" stroke="#facc15" strokeWidth="3" strokeLinejoin="round"/>
              <circle cx="75" cy="48" r="3" fill="#facc15" stroke="black" strokeWidth="2" />
              
              {/* Glasses */}
              <path d="M 39 42 m -9 0 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0" fill="white" stroke="black" strokeWidth="4" />
              <path d="M 61 42 m -9 0 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0" fill="white" stroke="black" strokeWidth="4" />
              <line x1="48" y1="42" x2="52" y2="42" stroke="black" strokeWidth="4" />
              <line x1="26" y1="40" x2="18" y2="35" stroke="black" strokeWidth="4" strokeLinecap="round" />
              <line x1="74" y1="40" x2="82" y2="35" stroke="black" strokeWidth="4" strokeLinecap="round" />
              
              {/* Eyes */}
              <circle cx="39" cy="42" r="3.5" fill="black" />
              <circle cx="61" cy="42" r="3.5" fill="black" />
              
              {/* Smile / Smart smirk */}
              <path d="M 44 55 Q 50 63 56 53" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
              
              {/* Body */}
              <path d="M 22 100 C 22 70, 78 70, 78 100" fill="#a78bfa" stroke="black" strokeWidth="4" />
              
              {/* V-Neck */}
              <path d="M 40 76 L 50 92 L 60 76 Z" fill="white" stroke="black" strokeWidth="4" strokeLinejoin="round" />
              
              {/* Tie */}
              <path d="M 46 92 L 54 92 L 51 100 L 49 100 Z" fill="#ef4444" stroke="black" strokeWidth="3" strokeLinejoin="round" />
              
              {/* Thought Bubble (optional, but shows "smart") */}
              <g className="animate-pulse origin-bottom-left" style={{animationDuration: '2s'}}>
                <path d="M 12 20 C 0 20, 0 5, 18 5 C 30 5, 30 18, 25 22 C 35 28, 25 38, 12 30 Z" fill="white" stroke="black" strokeWidth="3" />
                <text x="11" y="21" fontSize="12" fontWeight="black" fill="black" fontFamily="monospace">{'</>'}</text>
                <circle cx="10" cy="35" r="3" fill="white" stroke="black" strokeWidth="3" />
                <circle cx="15" cy="42" r="2" fill="white" stroke="black" strokeWidth="3" />
              </g>
            </svg>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="w-full border-t-4 border-black bg-lime-300 p-6 flex items-center justify-center font-bold text-base sm:text-lg z-20">
        <p className="border-2 border-black bg-white px-6 py-2 shadow-[2px_2px_0_0_#000]">
          © {new Date().getFullYear()} 박정우. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
