'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Sparkles, Share2, Globe, CheckCircle, Award, Lightbulb, MessageSquare } from 'lucide-react';
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
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900"
      style={topCategories[0] ? getCategoryBackgroundStyle(topCategories[0]) : undefined}
    >
      {/* Hero Section - Persona Card */}
      <section className="pt-20 pb-12 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-purple-100 text-sm border border-white/10">
              <Sparkles className="w-4 h-4" />
              <span>PSA 강점 진단 프로필</span>
            </div>

            {profileData?.completionTimeSeconds && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-purple-100 text-sm border border-white/10">
                <Clock className="w-4 h-4" />
                <span>{formatCompletionTime(profileData.completionTimeSeconds)}</span>
                {profileData.completionTimeSeconds < 300 && <span className="ml-2">⚡</span>}
                {profileData.completionTimeSeconds > 600 && <span className="ml-2">🤔</span>}
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {profileData?.hero?.headline || '페르소나'}
          </h1>

          <p className="text-lg md:text-2xl text-purple-100 mb-8 font-light">
            {profileData?.hero?.tagline || ''}
          </p>

          {/* Branding Keywords */}
          {profileData?.hero?.keywords && Array.isArray(profileData.hero.keywords) && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {profileData.hero.keywords.map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-medium border border-white/20"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          )}

          {/* Score Overview */}
          {topCategories.length >= 2 && sortedCategoryScores.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {/* Top Category 1 */}
              <motion.div
                className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className={`w-5 h-5 mr-2 ${theme?.textClass || 'text-green-300'}`} />
                  <span className="text-purple-100 text-sm">1위 강점</span>
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {CategoryLabels[topCategories[0]] || sortedCategoryScores[0].category}
                </div>
                <div className={`text-2xl font-bold ${theme?.textClass || 'text-green-300'}`}>
                  {sortedCategoryScores[0].score}점
                </div>
              </motion.div>

              {/* Top Category 2 */}
              <motion.div
                className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-300 mr-2" />
                  <span className="text-purple-100 text-sm">2위 강점</span>
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {CategoryLabels[topCategories[1]] || sortedCategoryScores[1].category}
                </div>
                <div className="text-2xl font-bold text-blue-300">
                  {sortedCategoryScores[1].score}점
                </div>
              </motion.div>

              {/* Response Pattern */}
              <motion.div
                className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-amber-300 mr-2" />
                  <span className="text-purple-100 text-sm">응답 패턴</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {profileData?.completionTimeSeconds && profileData.completionTimeSeconds < 300
                    ? "직관형"
                    : profileData?.completionTimeSeconds && profileData.completionTimeSeconds > 600
                    ? "숙고형"
                    : "균형형"}
                </div>
                <div className="text-sm text-amber-200 mt-2">
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
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">
          {/* Hybrid Chart Layout: Radar + Progress Bars */}
          {profileData?.radarData && Array.isArray(profileData.radarData) && (
            <motion.div
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${theme ? `from-${theme.primary} to-${theme.secondary}` : 'from-purple-900 to-indigo-900'} mb-6 text-center`}>
                5차원 강점 프로필
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Radar Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">전체 프로필</h3>

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
                        <PolarGrid stroke="#e5e7eb" strokeWidth={1.5} />
                        <PolarAngleAxis
                          dataKey="category"
                          tick={{ fill: '#334e68', fontSize: 12, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                        <Radar
                          name="점수"
                          dataKey="score"
                          stroke={theme?.chartStart || "#8b5cf6"}
                          fill="url(#colorScore)"
                          strokeWidth={3}
                          dot={{ fill: theme?.chartStart || '#8b5cf6', r: 5 }}
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
                        <PolarGrid stroke="#e5e7eb" strokeWidth={1.5} />
                        <PolarAngleAxis
                          dataKey="category"
                          tick={{ fill: '#334e68', fontSize: 12, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                        <Radar
                          name="점수"
                          dataKey="score"
                          stroke={theme?.chartStart || "#8b5cf6"}
                          fill="url(#colorScoreDesktop)"
                          strokeWidth={3}
                          dot={{ fill: theme?.chartStart || '#8b5cf6', r: 5 }}
                          isAnimationActive={true}
                          animationDuration={1000}
                          animationEasing="ease-out"
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right: Progress Bars */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">카테고리별 순위</h3>
                  <div className="space-y-4">
                    {sortedCategoryScores.map((cat, i) => {
                      const badgeColor = getRankBadgeColor(i, topCategories[0]);
                      const barColor = getProgressBarColor(i, topCategories[0]);

                      return (
                        <div key={cat.category}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${badgeColor}`}>
                                {i + 1}
                              </span>
                              <span className="font-medium text-gray-900">
                                {CategoryLabels[cat.category as SurveyCategory] || cat.category}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              {cat.score}
                            </span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
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
            </motion.div>
          )}

          {/* Persona Description */}
          {profileData?.persona && (
            <motion.div
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${theme ? `from-${theme.primary} to-${theme.secondary}` : 'from-purple-900 to-indigo-900'} mb-4`}>
                페르소나 특성
              </h2>
              <p className="text-gray-800 leading-relaxed text-lg">
                {profileData.persona.description}
              </p>
            </motion.div>
          )}

          {/* Strengths Summary */}
          {profileData?.strengthsSummary && (
            <motion.div
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Award className={`w-6 h-6 ${theme?.textClass || 'text-purple-600'}`} />
                <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${theme ? `from-${theme.primary} to-${theme.secondary}` : 'from-purple-900 to-indigo-900'}`}>
                  강점 분석
                </h2>
              </div>
              <div className="space-y-4">
                {profileData.strengthsSummary.split('\n\n').map((paragraph, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-gray-800 leading-relaxed">{paragraph}</p>
                  </div>
                ))}
              </div>

              {/* Core Strengths */}
              {profileData.persona?.strengths && profileData.persona.strengths.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">핵심 강점</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.persona.strengths.map((strength, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-navy-50 text-navy-700 rounded-lg text-sm font-medium"
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
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-900 to-orange-900">
                  이런 상황에서 강점이 빛납니다
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.strengthsScenarios.map((scenario, i) => (
                  <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{scenario.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Strength Tips */}
          {profileData?.strengthTips && profileData.strengthTips.length > 0 && (
            <motion.div
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-amber-600" />
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-900 to-orange-900">
                  강점 활용 팁
                </h2>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                당신의 핵심 강점을 실무에서 더욱 빛나게 활용하는 방법입니다.
              </p>

              <div className="space-y-4">
                {profileData.strengthTips.map((tip, index) => (
                  <div key={index} className="bg-white rounded-xl p-5 shadow-md border-l-4 border-amber-400">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                        {tip.strength}
                      </span>
                    </div>
                    <p className="text-gray-800 leading-relaxed mb-2">{tip.tip}</p>
                    <p className="text-sm text-gray-500 italic">📌 {tip.scenario}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Branding Messages Guide */}
          {profileData?.brandingMessages && (
            <motion.div
              className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-200"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-rose-600" />
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-900 to-pink-900">
                  브랜딩 메시지 가이드
                </h2>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                자기소개, LinkedIn 프로필, 면접 등에서 활용할 수 있는 문구입니다.
              </p>

              <div className="space-y-6">
                {/* Self Intro */}
                <div className="bg-white rounded-xl p-5 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">한 줄 자기소개</h3>
                  <p className="text-lg font-medium text-gray-900">&ldquo;{profileData.brandingMessages.selfIntro}&rdquo;</p>
                </div>

                {/* LinkedIn Headline */}
                <div className="bg-white rounded-xl p-5 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">LinkedIn 헤드라인</h3>
                  <p className="text-gray-800">{profileData.brandingMessages.linkedinHeadline}</p>
                </div>

                {/* Elevator Pitch */}
                <div className="bg-white rounded-xl p-5 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">엘리베이터 피치</h3>
                  <p className="text-gray-700 italic leading-relaxed">&ldquo;{profileData.brandingMessages.elevatorPitch}&rdquo;</p>
                </div>

                {/* Hashtags */}
                <div className="bg-white rounded-xl p-5 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">추천 해시태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.brandingMessages.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA Section - Adjusted for Public View */}
          <motion.div
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {/* Section Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                나도 PSA 강점 진단 받아보기
              </h2>
              <p className="text-gray-600 text-sm">
                60개 문항으로 나만의 직업 강점 페르소나를 발견하세요
              </p>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Share This Profile */}
              <Button
                onClick={handleShareProfileUrl}
                className="min-h-[88px] sm:min-h-[96px] h-auto py-4 sm:py-5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all hover:scale-105"
              >
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base font-semibold text-center leading-tight">이 프로필 공유하기</span>
                <span className="text-[10px] sm:text-xs opacity-90 text-center leading-tight px-2">
                  프로필 링크 복사
                </span>
              </Button>

              {/* Take Your Own Assessment */}
              <Button
                onClick={handleShareLandingUrl}
                className="min-h-[88px] sm:min-h-[96px] h-auto py-4 sm:py-5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transition-all hover:scale-105"
              >
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base font-semibold text-center leading-tight">진단 테스트 공유하기</span>
                <span className="text-[10px] sm:text-xs opacity-90 text-center leading-tight px-2">
                  PSA 설문 링크 복사
                </span>
              </Button>

              {/* Start My Own Assessment */}
              <Button
                asChild
                className={`min-h-[88px] sm:min-h-[96px] h-auto py-4 sm:py-5 md:col-span-2 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br ${theme?.gradient || 'from-amber-600 to-orange-600'} hover:opacity-90 text-white transition-all hover:scale-105 ${theme?.shadowClass ? `shadow-lg ${theme.shadowClass}` : 'shadow-lg'}`}
              >
                <a href="/">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-base sm:text-lg font-bold text-center leading-tight">나도 진단받기</span>
                  <span className="text-[10px] sm:text-xs opacity-90 text-center leading-tight px-2">
                    무료로 나의 직업 강점 페르소나 발견하기
                  </span>
                </a>
              </Button>
            </div>

            {/* Inline Feedback Message */}
            {copiedMessage && (
              <div className={`p-3 border rounded-lg text-center text-sm ${
                copiedMessage.startsWith('✅')
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {copiedMessage}
              </div>
            )}
          </motion.div>

          {/* Contact */}
          {profileData?.contact?.email && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <p className="text-purple-100 text-sm">Contact</p>
              <p className="text-white font-medium mt-2">{profileData.contact.email}</p>
            </div>
          )}
        </div>
      </section>
    </motion.main>
  );
}
