'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Sparkles, Share2, Globe, CheckCircle, Lightbulb, MessageSquare } from 'lucide-react';
import { CategoryLabels, SurveyCategory } from '@/types/survey';
import { BriefWebProfile } from '@/types/report';
import { getCategoryTheme, getCategoryBackgroundStyle, getProgressBarColor, getRankBadgeColor } from '@/lib/theme/category-colors';

interface BriefProfileLayoutProps {
  profileData: BriefWebProfile;
}

export default function BriefProfileLayout({ profileData }: BriefProfileLayoutProps) {
  const [copiedMessage, setCopiedMessage] = useState<string>("");

  // Get category theme based on top category
  const theme = useMemo(() => {
    if (!profileData?.topCategories?.[0]) return null;
    return getCategoryTheme(profileData.topCategories[0]);
  }, [profileData]);

  // Format completion time
  const formatCompletionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초 소요`;
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      innovation: '💡',
      execution: '⚡',
      influence: '📣',
      collaboration: '🤝',
      resilience: '🌱',
    };
    return icons[category] || '✨';
  };

  // Handle share profile URL
  const handleShareProfileUrl = async () => {
    const fullUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedMessage("✅ 프로필 링크가 복사되었습니다!");
      setTimeout(() => setCopiedMessage(""), 3000);
    } catch {
      setCopiedMessage("❌ 링크 복사에 실패했습니다.");
      setTimeout(() => setCopiedMessage(""), 5000);
    }
  };

  // Handle share landing URL
  const handleShareLandingUrl = async () => {
    const landingUrl = `${window.location.origin}/?utm_source=psa_profile&utm_medium=share_button&utm_campaign=user_referral`;
    try {
      await navigator.clipboard.writeText(landingUrl);
      setCopiedMessage("✅ PSA 설문 링크가 복사되었습니다!");
      setTimeout(() => setCopiedMessage(""), 3000);
    } catch {
      setCopiedMessage("❌ 링크 복사에 실패했습니다.");
      setTimeout(() => setCopiedMessage(""), 5000);
    }
  };

  // Get sorted category scores
  const sortedCategoryScores = useMemo(() => {
    if (!profileData?.categoryScores) return [];
    return [...profileData.categoryScores].sort((a, b) => b.score - a.score);
  }, [profileData]);

  // Get top categories from sorted scores if not available
  const topCategories = useMemo(() => {
    if (profileData?.topCategories && profileData.topCategories.length >= 2) {
      return profileData.topCategories;
    }
    // Fallback: derive from sorted category scores
    if (sortedCategoryScores.length >= 2) {
      return [
        sortedCategoryScores[0].category as SurveyCategory,
        sortedCategoryScores[1].category as SurveyCategory,
      ];
    }
    return [];
  }, [profileData, sortedCategoryScores]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1e1b4b] to-slate-950"
      style={topCategories[0] ? getCategoryBackgroundStyle(topCategories[0]) : undefined}
    >
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section - Persona Card */}
      <section className="relative pt-24 pb-16 px-6 z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-purple-100 text-sm border border-white/20 shadow-lg shadow-purple-900/10">
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span className="font-medium tracking-wide">PSA 강점 진단 프로필</span>
            </div>

            {profileData?.completionTimeSeconds && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-purple-100 text-sm border border-white/20 shadow-lg shadow-purple-900/10">
                <Clock className="w-4 h-4 text-purple-200" />
                <span className="font-medium">{formatCompletionTime(profileData.completionTimeSeconds)}</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white mb-6 drop-shadow-sm">
            {profileData?.hero?.headline || '페르소나'}
          </h1>

          <p className="text-lg md:text-2xl text-purple-100/90 mb-10 font-light leading-relaxed max-w-2xl mx-auto">
            {profileData?.hero?.tagline || ''}
          </p>

          {/* Branding Keywords */}
          {profileData?.hero?.keywords && Array.isArray(profileData.hero.keywords) && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {profileData.hero.keywords.map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-full text-white font-medium border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          )}

          {/* Score Overview - Dark Glass Cards for Hero */}
          {topCategories.length >= 2 && sortedCategoryScores.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {/* Top Category 1 */}
              <motion.div
                className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-black/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <TrendingUp className={`w-5 h-5 mr-2 ${theme?.textClass || 'text-green-300'}`} />
                  <span className="text-gray-300 text-sm font-medium">1위 강점</span>
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {CategoryLabels[topCategories[0]] || sortedCategoryScores[0].category}
                </div>
                <div className={`text-3xl font-bold ${theme?.textClass || 'text-green-300'}`}>
                  {sortedCategoryScores[0].score}
                  <span className="text-lg ml-1 opacity-70">점</span>
                </div>
              </motion.div>

              {/* Top Category 2 */}
              <motion.div
                className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-black/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-300 mr-2" />
                  <span className="text-gray-300 text-sm font-medium">2위 강점</span>
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {CategoryLabels[topCategories[1]] || sortedCategoryScores[1].category}
                </div>
                <div className="text-3xl font-bold text-blue-300">
                  {sortedCategoryScores[1].score}
                  <span className="text-lg ml-1 opacity-70">점</span>
                </div>
              </motion.div>

              {/* Response Pattern */}
              <motion.div
                className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-black/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-amber-300 mr-2" />
                  <span className="text-gray-300 text-sm font-medium">응답 패턴</span>
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {profileData?.completionTimeSeconds && profileData.completionTimeSeconds < 300
                    ? "직관형"
                    : profileData?.completionTimeSeconds && profileData.completionTimeSeconds > 600
                    ? "숙고형"
                    : "균형형"}
                </div>
                <div className="text-sm text-amber-200 mt-1 font-medium">
                  {profileData?.completionTimeSeconds && profileData.completionTimeSeconds < 300
                    ? "빠른 판단력"
                    : profileData?.completionTimeSeconds && profileData.completionTimeSeconds > 600
                    ? "신중한 분석"
                    : "적절한 속도"}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="relative pb-24 px-6 z-10">
        <div className="max-w-4xl mx-auto space-y-10 md:space-y-12">
          {/* Chart Section - Frosted Glass (High Readability) */}
          {profileData?.radarData && Array.isArray(profileData.radarData) && (
            <motion.div
              className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 p-8 md:p-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${theme?.gradient || 'from-purple-900 to-indigo-900'} mb-8 text-center`}>
                5차원 강점 프로필
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Left: Radar Chart */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-blue-100/30 rounded-full blur-3xl -z-10" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center lg:text-left flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span>
                    전체 프로필
                  </h3>

                  {/* Mobile Chart (280px) */}
                  <div className="block sm:hidden">
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={profileData.radarData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme?.chartStart || "#8b5cf6"} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={theme?.chartEnd || "#6366f1"} stopOpacity={0.3} />
                          </linearGradient>
                        </defs>
                        <PolarGrid stroke="#cbd5e1" strokeWidth={1} />
                        <PolarAngleAxis
                          dataKey="category"
                          tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                        />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                        <Radar
                          name="내 점수"
                          dataKey="score"
                          stroke={theme?.chartStart || "#8b5cf6"}
                          fill="url(#colorScore)"
                          strokeWidth={3}
                          dot={{ fill: theme?.chartStart || '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                          isAnimationActive={true}
                          animationDuration={1000}
                          animationEasing="ease-out"
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Desktop Chart (350px) */}
                  <div className="hidden sm:block">
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={profileData.radarData}>
                        <defs>
                          <linearGradient id="colorScoreDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme?.chartStart || "#8b5cf6"} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={theme?.chartEnd || "#6366f1"} stopOpacity={0.3} />
                          </linearGradient>
                        </defs>
                        <PolarGrid stroke="#cbd5e1" strokeWidth={1} />
                        <PolarAngleAxis
                          dataKey="category"
                          tick={{ fill: '#334155', fontSize: 13, fontWeight: 700 }}
                        />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                        <Radar
                          name="내 점수"
                          dataKey="score"
                          stroke={theme?.chartStart || "#8b5cf6"}
                          fill="url(#colorScoreDesktop)"
                          strokeWidth={3}
                          dot={{ fill: theme?.chartStart || '#8b5cf6', r: 6, strokeWidth: 2, stroke: '#fff' }}
                          isAnimationActive={true}
                          animationDuration={1000}
                          animationEasing="ease-out"
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm bg-white/50 py-3 rounded-xl border border-white/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: theme?.chartStart || '#8b5cf6' }} />
                      <span className="text-slate-700 font-medium">내 점수</span>
                    </div>
                  </div>
                </div>

                {/* Right: Progress Bars */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span>
                    상세 순위
                  </h3>
                  <div className="space-y-5">
                    {sortedCategoryScores.map((cat, i) => {
                      const badgeColor = getRankBadgeColor(i, topCategories[0]);
                      const barColor = getProgressBarColor(i, topCategories[0]);

                      return (
                        <div key={cat.category} className="group">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md transition-transform group-hover:scale-110 ${badgeColor}`}>
                                {i + 1}
                              </span>
                              <span className="font-semibold text-slate-700">
                                {CategoryLabels[cat.category as SurveyCategory] || cat.category}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-slate-800 tabular-nums">
                              {cat.score}
                            </span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <motion.div
                              className={`h-full ${barColor}`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${cat.score}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Score Interpretation Guide */}
              <div className="mt-8 p-5 bg-gradient-to-r from-slate-50/80 to-indigo-50/80 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  점수 해석 가이드
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="flex items-center gap-2 bg-white/60 p-2 rounded-lg border border-white/50">
                     <span className="font-bold text-slate-800 bg-slate-200 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">1</span>
                     <span className="text-slate-600">80+ 최상위 강점</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 p-2 rounded-lg border border-white/50">
                     <span className="font-bold text-slate-800 bg-slate-200 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">2</span>
                     <span className="text-slate-600">70-79 상위권</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 p-2 rounded-lg border border-white/50">
                     <span className="font-bold text-slate-800 bg-slate-200 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">3</span>
                     <span className="text-slate-600">60-69 평균</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 p-2 rounded-lg border border-white/50">
                     <span className="font-bold text-slate-800 bg-slate-200 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">4</span>
                     <span className="text-slate-600">~59 성장 잠재력</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 pl-1">
                  * 낮은 점수는 부족함이 아닌 <strong className="text-slate-700">다른 영역에 에너지를 집중하는 스타일</strong>을 의미합니다.
                </p>
              </div>
            </motion.div>
          )}

          {/* Persona Description */}
          {profileData?.persona && (
            <motion.div
              className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 p-8 md:p-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${theme?.gradient || 'from-purple-900 to-indigo-900'} mb-6`}>
                페르소나 특성
              </h2>
              <p className="text-slate-800 leading-relaxed text-lg font-medium">
                {profileData.persona.description}
              </p>
            </motion.div>
          )}

          {/* Strengths Summary */}
          {profileData?.strengthsSummary && (
            <motion.div
              className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 p-8 md:p-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${theme?.gradient || 'from-purple-900 to-indigo-900'} mb-6`}>
                강점 분석
              </h2>
              <div className="space-y-6">
                {profileData.strengthsSummary.split('\n\n').map((paragraph, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-white/60">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5 shadow-sm rounded-full bg-white" />
                    <p className="text-slate-700 leading-relaxed text-base md:text-lg">{paragraph}</p>
                  </div>
                ))}
              </div>

              {/* Core Strengths */}
              {profileData.persona?.strengths && profileData.persona.strengths.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 ml-1">핵심 강점 키워드</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {profileData.persona.strengths.map((strength, index) => (
                      <span
                        key={index}
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold border border-slate-200 shadow-sm"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Strengths Scenarios */}
          {profileData?.strengthsScenarios && profileData.strengthsScenarios.length > 0 && (
            <motion.div
              className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 p-8 md:p-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${theme?.gradient || 'from-purple-900 to-indigo-900'} mb-8`}>
                이런 상황에서 강점이 빛납니다
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData.strengthsScenarios.map((scenario, i) => (
                  <div key={i} className="bg-white/90 rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 ${getProgressBarColor(0, topCategories[0])} text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md`}>
                        {i + 1}
                      </div>
                      <h3 className="font-bold text-slate-800">{scenario.title}</h3>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{scenario.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Strength Tips */}
          {profileData?.strengthTips && profileData.strengthTips.length > 0 && (
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-white/20 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-white/10 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-white" />
                 </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  강점 활용 팁
                </h2>
              </div>
              <p className="text-white/70 mb-8 leading-relaxed font-medium">
                당신의 핵심 강점을 실무에서 더욱 빛나게 활용하는 방법입니다.
              </p>

              <div className="space-y-4">
                {profileData.strengthTips.map((tip, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-white/20 text-white/90 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/30">
                        {tip.strength}
                      </span>
                    </div>
                    <p className="text-white/90 leading-relaxed mb-3 font-medium">{tip.tip}</p>
                    <div className="flex items-center gap-2 text-sm text-white/70 bg-white/10 p-3 rounded-xl border border-white/10">
                        <span className="text-amber-300">📌</span>
                        <span className="italic">{tip.scenario}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Branding Messages Guide */}
          {profileData?.brandingMessages && (
            <motion.div
              className="bg-gradient-to-br from-rose-50/90 to-pink-50/90 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-rose-200/50 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/50 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-rose-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-rose-950">
                  브랜딩 메시지 가이드
                </h2>
              </div>
              <p className="text-rose-900/80 mb-8 leading-relaxed font-medium">
                자기소개, LinkedIn 프로필, 면접 등에서 활용할 수 있는 문구입니다.
              </p>

              <div className="space-y-6">
                {/* Self Intro */}
                <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-rose-100/50">
                  <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3">한 줄 자기소개</h3>
                  <p className="text-xl font-medium text-slate-900 leading-relaxed">&ldquo;{profileData.brandingMessages.selfIntro}&rdquo;</p>
                </div>

                {/* LinkedIn Headline */}
                <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-rose-100/50">
                  <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3">LinkedIn 헤드라인</h3>
                  <p className="text-slate-800 text-lg">{profileData.brandingMessages.linkedinHeadline}</p>
                </div>

                {/* Elevator Pitch */}
                <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-rose-100/50">
                  <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3">엘리베이터 피치</h3>
                  <p className="text-slate-700 italic leading-relaxed text-lg">&ldquo;{profileData.brandingMessages.elevatorPitch}&rdquo;</p>
                </div>

                {/* Hashtags */}
                <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-rose-100/50">
                  <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-4">추천 해시태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.brandingMessages.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-sm font-bold border border-rose-100"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2X2 CTA GRID - Always visible */}
          <motion.div
            className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border-2 border-white/30"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                이 분석 결과를 활용하세요
              </h2>
              <p className="text-white/70 text-sm font-medium">
                웹 프로필을 공유하거나 나만의 강점 진단을 받아보세요
              </p>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Row 1, Col 1: Share Profile URL */}
              <Button
                onClick={handleShareProfileUrl}
                className="min-h-[100px] h-auto py-5 flex flex-col items-center justify-center gap-2 bg-white/10 backdrop-blur-xl text-white transition-all hover:scale-[1.02] hover:bg-white/15 shadow-lg rounded-2xl border border-purple-400/30 hover:border-purple-400/50"
              >
                <Share2 className="w-6 h-6 mb-1" />
                <span className="text-base font-bold text-center leading-tight">이 프로필 공유하기</span>
                <span className="text-xs text-white/60 text-center leading-tight font-normal">
                  프로필 링크 복사
                </span>
              </Button>

              {/* Row 1, Col 2: Share Landing Page */}
              <Button
                onClick={handleShareLandingUrl}
                className="min-h-[100px] h-auto py-5 flex flex-col items-center justify-center gap-2 bg-white/10 backdrop-blur-xl text-white transition-all hover:scale-[1.02] hover:bg-white/15 shadow-lg rounded-2xl border border-blue-400/30 hover:border-blue-400/50"
              >
                <Globe className="w-6 h-6 mb-1" />
                <span className="text-base font-bold text-center leading-tight">진단 테스트 공유하기</span>
                <span className="text-xs text-white/60 text-center leading-tight font-normal">PSA 설문 링크 복사</span>
              </Button>

              {/* Row 2, Full Width: Start My Own Assessment */}
              <Button
                asChild
                className="min-h-[100px] h-auto py-5 md:col-span-2 flex flex-col items-center justify-center gap-2 bg-white/10 backdrop-blur-xl text-white transition-all hover:scale-[1.02] hover:bg-white/15 shadow-lg rounded-2xl border border-amber-400/30 hover:border-amber-400/50"
              >
                <a href="/">
                  <Sparkles className="w-6 h-6 mb-1" />
                  <span className="text-lg font-bold text-center leading-tight">나도 진단받기</span>
                  <span className="text-xs text-white/60 text-center leading-tight font-normal">
                    무료로 나의 직업 강점 페르소나 발견하기
                  </span>
                </a>
              </Button>
            </div>

            {/* Inline Feedback Message */}
            {copiedMessage && (
              <div className={`p-4 border rounded-xl text-center text-sm font-medium shadow-sm animate-in fade-in slide-in-from-bottom-2 backdrop-blur-xl ${
                copiedMessage.startsWith('✅')
                  ? 'bg-green-500/20 border-green-400/30 text-green-300'
                  : 'bg-red-500/20 border-red-400/30 text-red-300'
              }`}>
                {copiedMessage}
              </div>
            )}
          </motion.div>

        </div>
      </section>
    </motion.main>
  );
}
