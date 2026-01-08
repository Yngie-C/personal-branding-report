"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, Award, AlertCircle, ArrowRight, Sparkles, Share2, Globe, Mail, CheckCircle, Clock, Lightbulb, MessageSquare, Copy } from "lucide-react";
import { BriefAnalysis, CategoryLabels, SurveyAnswer } from "@/types/survey";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getCategoryTheme, getCategoryBackgroundStyle, getProgressBarColor, getRankBadgeColor } from "@/lib/theme/category-colors";
import { cn } from "@/lib/utils";

export default function SurveyResultPage() {
  const router = useRouter();

  // Analysis state (loaded from localStorage)
  const [analysis, setAnalysis] = useState<BriefAnalysis | null>(null);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);

  // Email submission state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // After email submitted
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [webProfileSlug, setWebProfileSlug] = useState<string | undefined>();
  const [webProfileUrl, setWebProfileUrl] = useState<string | undefined>();

  // Waitlist state
  const [phone, setPhone] = useState("");
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");

  // Copy feedback state
  const [copiedMessage, setCopiedMessage] = useState<string>("");

  // Statistics state for average line
  const [statistics, setStatistics] = useState<{
    averages: Record<string, number>;
    overallAverage: number;
    totalUsers: number;
  } | null>(null);

  // Load analysis from localStorage on mount
  useEffect(() => {
    const savedAnalysis = localStorage.getItem("survey-analysis");
    const savedAnswers = localStorage.getItem("survey-answers");

    if (!savedAnalysis || !savedAnswers) {
      // No analysis found - redirect to survey
      router.push("/survey");
      return;
    }

    try {
      const analysisData = JSON.parse(savedAnalysis);
      const answersData = JSON.parse(savedAnswers);

      setAnalysis(analysisData);
      setAnswers(answersData);
    } catch (err) {
      console.error("Failed to parse saved data:", err);
      router.push("/survey");
    }
  }, [router]);

  // Fetch statistics for average line
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch("/api/survey/statistics");
        const result = await response.json();
        if (result.data) {
          setStatistics(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
        // Use default values on error
        setStatistics({
          averages: {
            innovation: 68,
            execution: 67,
            influence: 70,
            collaboration: 68,
            resilience: 67,
          },
          overallAverage: 68,
          totalUsers: 0,
        });
      }
    };
    fetchStatistics();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('유효한 이메일을 입력해주세요.');
      return;
    }

    if (!analysis || !answers || answers.length !== 60) {
      setError('설문 데이터가 유효하지 않습니다. 다시 설문을 진행해주세요.');
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Submit email + answers + analysis to create session and save data
      const response = await fetch("/api/survey/save-with-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          answers,
          analysis,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "저장에 실패했습니다.");
      }

      // Save sessionId to localStorage for future pages
      const newSessionId = result.data.sessionId;
      localStorage.setItem("sessionId", newSessionId);
      setSessionId(newSessionId);

      // Update web profile info
      const profileUrl = result.data.webProfileUrl;
      setWebProfileSlug(result.data.webProfileSlug);
      setWebProfileUrl(profileUrl);

      // Clear temporary data from localStorage
      localStorage.removeItem("survey-analysis");
      localStorage.removeItem("survey-answers");
      localStorage.removeItem("survey-question-order");
      localStorage.removeItem("survey-seed");

      // Hide email form
      setShowEmailForm(false);

      console.log("Session created and data saved:", newSessionId);
    } catch (err: any) {
      console.error("Email submission error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get email from form (may be newly entered or pre-filled)
    const formData = new FormData(e.target as HTMLFormElement);
    const submittedEmail = formData.get('email') as string || email;

    if (!submittedEmail || !submittedEmail.includes('@')) {
      setWaitlistError('유효한 이메일을 입력해주세요.');
      return;
    }

    setWaitlistSubmitting(true);
    setWaitlistError("");

    try {
      let currentSessionId = sessionId;

      // If no session exists, create one first
      if (!currentSessionId) {
        if (!analysis || !answers || answers.length !== 60) {
          setWaitlistError('설문 데이터가 유효하지 않습니다.');
          setWaitlistSubmitting(false);
          return;
        }

        const sessionResponse = await fetch("/api/survey/save-with-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: submittedEmail,
            answers,
            analysis,
          }),
        });

        const sessionResult = await sessionResponse.json();

        if (!sessionResponse.ok) {
          throw new Error(sessionResult.error || "세션 생성에 실패했습니다.");
        }

        currentSessionId = sessionResult.data.sessionId;
        setSessionId(currentSessionId);
        setEmail(submittedEmail);
        if (currentSessionId) {
          localStorage.setItem("sessionId", currentSessionId);
        }

        // Update web profile info
        setWebProfileSlug(sessionResult.data.webProfileSlug);
        setWebProfileUrl(sessionResult.data.webProfileUrl);

        // Clear temporary data
        localStorage.removeItem("survey-analysis");
        localStorage.removeItem("survey-answers");
        localStorage.removeItem("survey-question-order");
        localStorage.removeItem("survey-seed");
      }

      // Now register to waitlist
      const waitlistResponse = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: submittedEmail,
          phone: phone || null,
          sessionId: currentSessionId,
        }),
      });

      const waitlistResult = await waitlistResponse.json();

      if (!waitlistResponse.ok) {
        throw new Error(waitlistResult.error || "대기자 명단 등록에 실패했습니다.");
      }

      // Update email state if it was newly collected
      if (!email) {
        setEmail(submittedEmail);
      }

      // Show success modal
      setWaitlistPosition(waitlistResult.data.position);
      setShowWaitlistForm(false);
      setShowWaitlistModal(true);

      console.log("Waitlist registration successful:", waitlistResult.data);
    } catch (err: any) {
      console.error("Waitlist submission error:", err);
      setWaitlistError(err.message);
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  const handleShareResultUrl = async () => {
    // If no webProfileUrl, create anonymous session first
    if (!webProfileUrl) {
      if (!analysis || !answers || answers.length !== 60) {
        setCopiedMessage("❌ 설문 데이터를 찾을 수 없습니다.");
        setTimeout(() => setCopiedMessage(""), 3000);
        return;
      }

      setCopiedMessage("🔄 웹 프로필 링크를 생성하는 중...");

      try {
        // Create anonymous session with temporary email
        const anonymousEmail = `anonymous-${Date.now()}@temp.local`;

        const response = await fetch("/api/survey/save-with-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: anonymousEmail,
            answers,
            analysis,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "세션 생성에 실패했습니다.");
        }

        // Save session data
        const newSessionId = result.data.sessionId;
        const profileUrl = result.data.webProfileUrl;

        localStorage.setItem("sessionId", newSessionId);
        setSessionId(newSessionId);
        setWebProfileSlug(result.data.webProfileSlug);
        setWebProfileUrl(profileUrl);

        // Clear temporary data
        localStorage.removeItem("survey-analysis");
        localStorage.removeItem("survey-answers");
        localStorage.removeItem("survey-question-order");
        localStorage.removeItem("survey-seed");

        // Copy the generated link
        const fullUrl = `${window.location.origin}${profileUrl}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopiedMessage("✅ 내 결과 링크가 생성되고 복사되었습니다!");
        setTimeout(() => setCopiedMessage(""), 3000);

      } catch (error: any) {
        console.error("Anonymous session creation error:", error);
        setCopiedMessage("❌ 링크 생성에 실패했습니다. 다시 시도해주세요.");
        setTimeout(() => setCopiedMessage(""), 5000);
      }
      return;
    }

    // If webProfileUrl already exists, just copy it
    const fullUrl = `${window.location.origin}${webProfileUrl}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedMessage("✅ 내 결과 링크가 복사되었습니다!");
      setTimeout(() => setCopiedMessage(""), 3000);
    } catch (error) {
      setCopiedMessage("❌ 링크 복사에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => setCopiedMessage(""), 5000);
    }
  };

  const handleShareLandingUrl = async () => {
    const landingUrl = `${window.location.origin}/?utm_source=psa_result&utm_medium=share_button&utm_campaign=user_referral`;

    try {
      await navigator.clipboard.writeText(landingUrl);
      setCopiedMessage("✅ PSA 설문 링크가 복사되었습니다!");
      setTimeout(() => setCopiedMessage(""), 3000);
    } catch (error) {
      setCopiedMessage("❌ 링크 복사에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => setCopiedMessage(""), 5000);
    }
  };

  // Format completion time
  const formatCompletionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초 소요`;
  };

  // Get category theme based on top category
  const theme = useMemo(() => {
    if (!analysis) return null;
    return getCategoryTheme(analysis.topCategories[0]);
  }, [analysis]);

  // Category name mapping (Korean to English)
  const categoryKeyMap: Record<string, string> = {
    "혁신 사고": "innovation",
    "철저 실행": "execution",
    "대인 영향": "influence",
    "협업 공감": "collaboration",
    "상황 회복": "resilience",
  };

  // Extended radar data with max (100) and average lines
  const extendedRadarData = useMemo(() => {
    if (!analysis?.radarData) return [];

    return analysis.radarData.map((item) => {
      const categoryKey = categoryKeyMap[item.category] || "";
      const avgScore = statistics?.averages?.[categoryKey] || 68;

      return {
        category: item.category,
        score: item.score,
        max: 100,
        average: Math.round(avgScore),
      };
    });
  }, [analysis?.radarData, statistics]);

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

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1e1b4b] to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white/50 mx-auto mb-4"></div>
          <p className="text-lg text-white/80 font-medium tracking-wide">분석 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1e1b4b] to-slate-950"
      )}
      style={theme ? getCategoryBackgroundStyle(analysis.topCategories[0]) : undefined}
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
              <span className="font-medium tracking-wide">PSA 강점 진단 완료</span>
            </div>

            {analysis.completionTimeSeconds && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-purple-100 text-sm border border-white/20 shadow-lg shadow-purple-900/10">
                <Clock className="w-4 h-4 text-purple-200" />
                <span className="font-medium">{formatCompletionTime(analysis.completionTimeSeconds)}</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white mb-6 drop-shadow-sm">
            {analysis.persona.title}
          </h1>

          <p className="text-lg md:text-2xl text-purple-100/90 mb-10 font-light leading-relaxed max-w-2xl mx-auto">
            {analysis.persona.tagline}
          </p>

          {/* Branding Keywords */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {analysis.brandingKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-full text-white font-medium border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
              >
                #{keyword}
              </span>
            ))}
          </div>

          {/* Score Overview - Dark Glass Cards for Hero */}
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
                {CategoryLabels[analysis.topCategories[0]]}
              </div>
              <div className={`text-3xl font-bold ${theme?.textClass || 'text-green-300'}`}>
                {Math.round(analysis.categoryScores.find(s => s.category === analysis.topCategories[0])?.normalizedScore || 0)}
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
                {CategoryLabels[analysis.topCategories[1]]}
              </div>
              <div className="text-3xl font-bold text-blue-300">
                {Math.round(analysis.categoryScores.find(s => s.category === analysis.topCategories[1])?.normalizedScore || 0)}
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
                {analysis.completionTimeSeconds && analysis.completionTimeSeconds < 300
                  ? "직관형"
                  : analysis.completionTimeSeconds && analysis.completionTimeSeconds > 600
                  ? "숙고형"
                  : "균형형"}
              </div>
              <div className="text-sm text-amber-200 mt-1 font-medium">
                {analysis.completionTimeSeconds && analysis.completionTimeSeconds < 300
                  ? "빠른 판단력"
                  : analysis.completionTimeSeconds && analysis.completionTimeSeconds > 600
                  ? "신중한 분석"
                  : "적절한 속도"}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="relative pb-24 px-6 z-10">
        <div className="max-w-4xl mx-auto space-y-10 md:space-y-12">
          {/* Chart Section - Frosted Glass (High Readability) */}
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
                    <RadarChart data={extendedRadarData}>
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
                        name="만점"
                        dataKey="max"
                        stroke="#94a3b8"
                        fill="none"
                        strokeWidth={1}
                        isAnimationActive={false}
                      />
                      <Radar
                        name="전체 평균"
                        dataKey="average"
                        stroke="#64748b"
                        fill="none"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        isAnimationActive={false}
                      />
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
                    <RadarChart data={extendedRadarData}>
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
                        name="만점"
                        dataKey="max"
                        stroke="#94a3b8"
                        fill="none"
                        strokeWidth={1}
                        isAnimationActive={false}
                      />
                      <Radar
                        name="전체 평균"
                        dataKey="average"
                        stroke="#64748b"
                        fill="none"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        isAnimationActive={false}
                      />
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
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5" style={{ borderTop: '2px dashed #64748b' }} />
                    <span className="text-slate-600">전체 평균</span>
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
                  {analysis.categoryScores
                    .sort((a, b) => b.normalizedScore - a.normalizedScore)
                    .map((cat, i) => {
                      const badgeColor = getRankBadgeColor(i, analysis.topCategories[0]);
                      const barColor = getProgressBarColor(i, analysis.topCategories[0]);

                      return (
                        <div key={cat.category} className="group">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md transition-transform group-hover:scale-110 ${badgeColor}`}>
                                {i + 1}
                              </span>
                              <span className="font-semibold text-slate-700">
                                {CategoryLabels[cat.category]}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-slate-800 tabular-nums">
                              {Math.round(cat.normalizedScore)}
                            </span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <motion.div
                              className={`h-full ${barColor}`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${cat.normalizedScore}%` }}
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

          {/* Persona Description */}
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
              {analysis.persona.description}
            </p>
          </motion.div>

          {/* Strengths Summary */}
          <motion.div
            className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 p-8 md:p-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-purple-100">
                <Award className={`w-6 h-6 ${theme?.textClass || 'text-purple-600'}`} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                강점 분석
              </h2>
            </div>
            <div className="space-y-6">
              {analysis.strengthsSummary.split('\n\n').map((paragraph, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-white/60">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5 shadow-sm rounded-full bg-white" />
                  <p className="text-slate-700 leading-relaxed text-base md:text-lg">{paragraph}</p>
                </div>
              ))}
            </div>

            {/* Core Strengths */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 ml-1">핵심 강점 키워드</h3>
              <div className="flex flex-wrap gap-2.5">
                {analysis.persona.strengths.map((strength, index) => (
                  <span
                    key={index}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold border border-slate-200 shadow-sm"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Strengths Scenarios */}
          {analysis.strengthsScenarios && analysis.strengthsScenarios.length > 0 && (
            <motion.div
              className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 p-8 md:p-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-100 rounded-2xl">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  이런 상황에서 강점이 빛납니다
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.strengthsScenarios.map((scenario, i) => (
                  <div key={i} className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl p-6 border border-amber-100/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md shadow-amber-200">
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
          {analysis.strengthTips && analysis.strengthTips.length > 0 && (
            <motion.div
              className="bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-amber-200/50 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-white/50 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-amber-600" />
                 </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-amber-900">
                  강점 활용 팁
                </h2>
              </div>
              <p className="text-amber-800/80 mb-8 leading-relaxed font-medium">
                당신의 핵심 강점을 실무에서 더욱 빛나게 활용하는 방법입니다.
              </p>

              <div className="space-y-4">
                {analysis.strengthTips.map((tip, index) => (
                  <div key={index} className="bg-white/80 rounded-2xl p-6 shadow-sm border border-amber-100/50 hover:bg-white/95 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {tip.strength}
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed mb-3 font-medium">{tip.tip}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl">
                        <span className="text-amber-500">📌</span>
                        <span className="italic">{tip.scenario}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Branding Messages Guide */}
          {analysis.brandingMessages && (
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
                  <p className="text-xl font-medium text-slate-900 leading-relaxed">&ldquo;{analysis.brandingMessages.selfIntro}&rdquo;</p>
                </div>

                {/* LinkedIn Headline */}
                <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-rose-100/50">
                  <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3">LinkedIn 헤드라인</h3>
                  <p className="text-slate-800 text-lg">{analysis.brandingMessages.linkedinHeadline}</p>
                </div>

                {/* Elevator Pitch */}
                <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-rose-100/50">
                  <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3">엘리베이터 피치</h3>
                  <p className="text-slate-700 italic leading-relaxed text-lg">&ldquo;{analysis.brandingMessages.elevatorPitch}&rdquo;</p>
                </div>

                {/* Hashtags */}
                <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-rose-100/50">
                  <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-4">추천 해시태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.brandingMessages.hashtags.map((tag, index) => (
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
            className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/50"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                이 분석 결과를 활용하세요
              </h2>
              <p className="text-slate-600 text-sm font-medium">
                웹 프로필을 공유하거나 정식 서비스 출시 알림을 받으세요
              </p>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Row 1, Col 1: Share Result URL */}
              <Button
                onClick={handleShareResultUrl}
                className="min-h-[100px] h-auto py-5 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white transition-all hover:scale-[1.02] hover:shadow-lg shadow-purple-900/20 rounded-2xl border border-white/10"
              >
                <Share2 className="w-6 h-6 mb-1" />
                <span className="text-base font-bold text-center leading-tight">내 결과 공유하기</span>
                <span className="text-xs opacity-80 text-center leading-tight font-normal">
                  {webProfileUrl ? '웹 프로필 링크 복사' : '클릭하여 링크 생성'}
                </span>
              </Button>

              {/* Row 1, Col 2: Share Landing Page */}
              <Button
                onClick={handleShareLandingUrl}
                className="min-h-[100px] h-auto py-5 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600 text-white transition-all hover:scale-[1.02] hover:shadow-lg shadow-blue-900/20 rounded-2xl border border-white/10"
              >
                <Globe className="w-6 h-6 mb-1" />
                <span className="text-base font-bold text-center leading-tight">진단 테스트 공유하기</span>
                <span className="text-xs opacity-80 text-center leading-tight font-normal">PSA 설문 링크 복사</span>
              </Button>

              {/* Row 2, Full Width: Waitlist Registration */}
              <Button
                onClick={() => setShowWaitlistForm(true)}
                className={`min-h-[100px] h-auto py-5 md:col-span-2 flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${theme?.gradient || 'from-amber-600 to-orange-600'} hover:brightness-110 text-white transition-all hover:scale-[1.02] shadow-lg rounded-2xl border border-white/10`}
              >
                <Sparkles className="w-6 h-6 mb-1" />
                <span className="text-lg font-bold text-center leading-tight">대기자 명단 등록하기</span>
                <span className="text-xs opacity-90 text-center leading-tight font-normal">
                  이력서 기반 심층 분석 정식 출시 시 우선 연락
                </span>
              </Button>
            </div>

            {/* Inline Feedback Message */}
            {copiedMessage && (
              <div className={`p-4 border rounded-xl text-center text-sm font-medium shadow-sm animate-in fade-in slide-in-from-bottom-2 ${
                copiedMessage.startsWith('✅')
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {copiedMessage}
              </div>
            )}
          </motion.div>

          {/* WAITLIST FORM MODAL - Show when user clicks "대기자 명단 등록하기" */}
          {showWaitlistForm && (
            <Dialog open={showWaitlistForm} onOpenChange={setShowWaitlistForm}>
              <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white shadow-2xl rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl text-white font-bold">
                    대기자 명단 등록
                  </DialogTitle>
                  <DialogDescription className="text-center text-gray-300">
                    정식 서비스 출시 시 우선적으로 연락드리겠습니다
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleWaitlistSubmit} className="space-y-5 py-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2 pl-1">
                      이메일 {!email && <span className="text-rose-400">*</span>}
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={email}
                      readOnly={!!email}
                      required={!email}
                      className={`w-full px-5 py-4 border rounded-xl bg-white/5 backdrop-blur-sm text-white placeholder-gray-500 transition-all ${
                        email
                          ? 'border-white/10 text-gray-400'
                          : 'border-white/20 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white/10'
                      }`}
                      placeholder={!email ? "your@email.com" : ""}
                    />
                    {!email && (
                      <p className="text-xs text-gray-400 mt-2 pl-1">
                        분석 결과 저장 및 연락을 위해 필요합니다
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2 pl-1">
                      휴대폰 번호 (선택사항)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full px-5 py-4 border border-white/20 rounded-xl bg-white/5 backdrop-blur-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white/10 transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-2 pl-1">
                      SMS로 빠른 알림을 받으실 수 있습니다
                    </p>
                  </div>

                  {waitlistError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl backdrop-blur-sm">
                      <p className="text-sm text-rose-200 text-center font-medium">{waitlistError}</p>
                    </div>
                  )}

                  <DialogFooter className="gap-3 sm:gap-2 mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowWaitlistForm(false);
                        setWaitlistError("");
                        setPhone("");
                      }}
                      variant="outline"
                      className="rounded-xl py-6 border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white"
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      disabled={waitlistSubmitting}
                      className="rounded-xl py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/30"
                    >
                      {waitlistSubmitting ? "등록 중..." : "등록하기"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* WAITLIST SUCCESS MODAL - Show after registration */}
          {showWaitlistModal && waitlistPosition && (
            <Dialog open={showWaitlistModal} onOpenChange={setShowWaitlistModal}>
              <DialogContent className="sm:max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white rounded-3xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl mb-2 text-white font-bold">
                    🎉 대기자 명단 등록 완료!
                  </DialogTitle>
                  <DialogDescription className="text-center text-base text-gray-300">
                    정식 서비스 출시 시 우선적으로 연락드리겠습니다
                  </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                  <div className={`bg-gradient-to-br ${theme?.gradient || 'from-purple-600 to-indigo-600'} rounded-2xl p-8 text-center mb-6 shadow-xl ${theme?.shadowClass || 'shadow-purple-600/20'} border border-white/10`}>
                    <p className="text-sm text-white/80 mb-2 font-medium">대기 순번</p>
                    <div className="flex items-baseline justify-center gap-1">
                        <p className="text-6xl font-bold text-white tracking-tight">
                        {waitlistPosition}
                        </p>
                        <span className="text-lg text-white/70">번째</span>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-gray-200 bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
                        <span className="text-green-400 text-xs font-bold">✓</span>
                      </div>
                      <p className="font-medium">PSA 분석 결과가 저장되었습니다</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
                        <span className="text-green-400 text-xs font-bold">✓</span>
                      </div>
                      <p className="font-medium">웹 프로필이 생성되었습니다</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                        <span className="text-blue-400 text-xs">📧</span>
                      </div>
                      <p className="font-medium">정식 출시 시 <strong className="text-white border-b border-white/30">{email}</strong>로 연락드립니다</p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="sm:justify-center px-2 pb-2">
                  <Button
                    onClick={() => setShowWaitlistModal(false)}
                    className={`w-full py-6 rounded-xl text-lg font-bold bg-gradient-to-r ${theme?.gradient || 'from-purple-600 to-indigo-600'} hover:brightness-110 shadow-lg`}
                  >
                    확인
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

        </div>
      </section>
    </motion.main>
  );
}
