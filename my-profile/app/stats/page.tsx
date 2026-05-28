"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { fetchLinks } from "@/lib/firestore-service";
import { Loader2, ArrowLeft, MousePointerClick, Activity, TrendingUp, Link as LinkIcon, AlertCircle, PieChart as PieChartIcon, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Link from "next/link";

const chartConfig = {
  clicks: {
    label: "클릭 수",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#f97316'];

export default function StatsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push("/");
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ["links", currentUser?.uid],
    queryFn: () => fetchLinks(currentUser!.uid),
    enabled: !!currentUser,
  });

  const chartData = useMemo(() => {
    return links
      .map(link => ({
        title: link.title.length > 10 ? link.title.substring(0, 10) + '...' : link.title,
        fullTitle: link.title,
        clicks: link.clicks || 0,
        fill: "var(--color-clicks)"
      }))
      .sort((a, b) => b.clicks - a.clicks); // 내림차순 정렬
  }, [links]);

  const totalClicks = useMemo(() => {
    return links.reduce((acc, link) => acc + (link.clicks || 0), 0);
  }, [links]);

  const totalLinks = links.length;
  const avgClicks = totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : "0";
  const zeroClickLinksCount = links.filter(l => !l.clicks || l.clicks === 0).length;

  // 파이 차트용 데이터 (탑 5만 표시, 나머지는 기타)
  const pieData = useMemo(() => {
    const sorted = [...chartData].filter(d => d.clicks > 0);
    if (sorted.length > 5) {
      const top5 = sorted.slice(0, 5);
      const othersClicks = sorted.slice(5).reduce((acc, curr) => acc + curr.clicks, 0);
      return [...top5, { title: "기타", fullTitle: "그 외 링크들", clicks: othersClicks, fill: "var(--color-clicks)" }];
    }
    return sorted;
  }, [chartData]);

  if (isAuthLoading || isLinksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!currentUser) return null; // Redirecting...

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-5xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        {/* 헤더 부분 */}
        <div className="flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            대시보드로 돌아가기
          </Link>
          <div className="flex items-center justify-center flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              내 링크 통계
            </h1>
          </div>
          <div className="w-[164px]"></div> {/* 좌측 버튼 너비와 대략 맞춤 */}
        </div>

        {/* 요약 카드 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                총 누적 클릭 수
              </CardTitle>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 drop-shadow-sm mt-2">
                {totalClicks.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                등록된 모든 링크의 클릭 합산
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                등록된 총 링크 수
              </CardTitle>
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 drop-shadow-sm mt-2">
                {totalLinks.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                현재 생성되어 있는 활성 링크
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                링크당 평균 클릭 수
              </CardTitle>
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500 dark:from-purple-400 dark:to-fuchsia-300 drop-shadow-sm mt-2">
                {avgClicks}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                하나의 링크당 평균적으로 기대되는 클릭
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 인사이트 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
            <CardContent className="p-6 flex items-start gap-4">
               <div className="w-10 h-10 shrink-0 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-1">가장 반응이 좋은 링크</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {chartData.length > 0 && chartData[0].clicks > 0 ? (
                    <>
                      현재 <strong className="text-rose-600 dark:text-rose-400">{chartData[0].fullTitle}</strong> 링크가 
                      <span className="font-semibold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded ml-1 border border-rose-100 dark:border-rose-900/50">총 {chartData[0].clicks.toLocaleString()}회</span> 클릭되어 가장 인기가 높습니다. 이 링크를 상단으로 배치해보세요!
                    </>
                  ) : "아직 클릭이 발생한 링크가 없습니다. 프로필을 널리 공유해보세요!"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
            <CardContent className="p-6 flex items-start gap-4">
               <div className="w-10 h-10 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-1">개선이 필요한 링크</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {zeroClickLinksCount > 0 ? (
                    <>
                      현재 <strong className="text-amber-600 dark:text-amber-400">{zeroClickLinksCount}개</strong>의 링크가 아직 한 번도 클릭되지 않았습니다. 
                      관심을 끌 수 있는 제목이나 아이콘으로 변경해 보는 것은 어떨까요?
                    </>
                  ) : chartData.length > 0 ? "모든 링크가 골고루 클릭되고 있습니다. 훌륭합니다!" : "등록된 링크가 없습니다."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 바 차트 */}
          <Card className="lg:col-span-2 border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4 mb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">링크별 상세 클릭 통계</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                각 링크의 클릭 수를 한눈에 비교합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 || totalClicks === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-slate-400 border border-dashed rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  표시할 통계 데이터가 없습니다.
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="title"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'var(--color-slate-100)', opacity: 0.2 }}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar 
                      dataKey="clicks" 
                      radius={[6, 6, 0, 0]} 
                      fill="url(#colorClicks)"
                    />
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* 파이 차트 */}
          <Card className="lg:col-span-1 border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4 mb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-slate-500" />
                클릭 비중
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                어떤 링크가 가장 비중이 높을까요?
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 || totalClicks === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-slate-400 border border-dashed rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm">
                  데이터 부족
                </div>
              ) : (
                <div className="h-[300px] w-full flex flex-col items-center justify-center relative">
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="clicks"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    </PieChart>
                  </ChartContainer>
                  {/* 중앙 텍스트 */}
                  <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                     <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{totalClicks}</div>
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Clicks</div>
                  </div>
                  {/* 간단한 범례 */}
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-[-20px] px-2 w-full z-10 bg-white/50 dark:bg-slate-900/50 rounded-lg py-2">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="truncate max-w-[80px]">{entry.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
