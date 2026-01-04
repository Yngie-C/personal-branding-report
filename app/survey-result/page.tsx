"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, Award, AlertCircle, ArrowRight, Sparkles, Share2, Globe, Mail, CheckCircle, Clock, Palette, Users, Lightbulb } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg text-white font-medium">분석 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900"
      style={theme ? getCategoryBackgroundStyle(analysis.topCategories[0]) : undefined}
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
              <span>PSA 강점 진단 완료</span>
            </div>

            {analysis.completionTimeSeconds && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-purple-100 text-sm border border-white/10">
                <Clock className="w-4 h-4" />
                <span>{formatCompletionTime(analysis.completionTimeSeconds)}</span>
                {analysis.completionTimeSeconds < 300 && <span className="ml-2">⚡</span>}
                {analysis.completionTimeSeconds > 600 && <span className="ml-2">🤔</span>}
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {analysis.persona.title}
          </h1>

          <p className="text-lg md:text-2xl text-purple-100 mb-8 font-light">
            {analysis.persona.tagline}
          </p>

          {/* Branding Keywords */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {analysis.brandingKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-medium border border-white/20"
              >
                #{keyword}
              </span>
            ))}
          </div>

          {/* Score Overview */}
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
                {CategoryLabels[analysis.topCategories[0]]}
              </div>
              <div className={`text-2xl font-bold ${theme?.textClass || 'text-green-300'}`}>
                {Math.round(analysis.categoryScores.find(s => s.category === analysis.topCategories[0])?.normalizedScore || 0)}점
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
                {CategoryLabels[analysis.topCategories[1]]}
              </div>
              <div className="text-2xl font-bold text-blue-300">
                {Math.round(analysis.categoryScores.find(s => s.category === analysis.topCategories[1])?.normalizedScore || 0)}점
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
                {analysis.completionTimeSeconds && analysis.completionTimeSeconds < 300
                  ? "직관형"
                  : analysis.completionTimeSeconds && analysis.completionTimeSeconds > 600
                  ? "숙고형"
                  : "균형형"}
              </div>
              <div className="text-sm text-amber-200 mt-2">
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
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">
          {/* Hybrid Chart Layout: Radar + Progress Bars */}
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
                    <RadarChart data={analysis.radarData}>
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
                    <RadarChart data={analysis.radarData}>
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
              </div>

              {/* Right: Progress Bars */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">카테고리별 순위</h3>
                <div className="space-y-4">
                  {analysis.categoryScores
                    .sort((a, b) => b.normalizedScore - a.normalizedScore)
                    .map((cat, i) => {
                      const badgeColor = getRankBadgeColor(i, analysis.topCategories[0]);
                      const barColor = getProgressBarColor(i, analysis.topCategories[0]);

                      return (
                        <div key={cat.category}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${badgeColor}`}>
                                {i + 1}
                              </span>
                              <span className="font-medium text-gray-900">
                                {CategoryLabels[cat.category]}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              {Math.round(cat.normalizedScore)}
                            </span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
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
          </motion.div>

          {/* Persona Description */}
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
              {analysis.persona.description}
            </p>
          </motion.div>

          {/* Strengths Summary */}
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
              {analysis.strengthsSummary.split('\n\n').map((paragraph, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-800 leading-relaxed">{paragraph}</p>
                </div>
              ))}
            </div>

            {/* Core Strengths */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">핵심 강점</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.persona.strengths.map((strength, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-navy-50 text-navy-700 rounded-lg text-sm font-medium"
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
                {analysis.strengthsScenarios.map((scenario, i) => (
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

          {/* Working Styles - Always visible */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-cyan-900">
                나만의 일하는 스타일
              </h2>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              낮은 점수는 결핍이 아니라 당신만의 독특한 스타일입니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.lowScoreCategories?.map((item) => (
                <div key={item.category} className="bg-white rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{getCategoryIcon(item.category)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{item.reframedLabel}</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.reframedDescription}
                  </p>
                </div>
              )) || (
                <p className="text-gray-600 col-span-2">모든 카테고리에서 균형잡힌 점수를 보이고 있습니다.</p>
              )}
            </div>
          </div>

          {/* Complementary Style */}
          {analysis.shadowSides && (
            <motion.div
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-purple-900">
                  함께 일하면 시너지 나는 파트너
                </h2>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {analysis.shadowSides || '이런 동료와 협업하면 당신의 강점이 더욱 빛납니다.'}
              </p>

              {analysis.persona.shadowSides.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">특성 보완 영역</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.persona.shadowSides.map((shadow, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                      >
                        {shadow}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 2X2 CTA GRID - Always visible */}
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
                이 분석 결과를 활용하세요
              </h2>
              <p className="text-gray-600 text-sm">
                웹 프로필을 공유하거나 정식 서비스 출시 알림을 받으세요
              </p>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Row 1, Col 1: Share Result URL */}
              <Button
                onClick={handleShareResultUrl}
                className="min-h-[88px] sm:min-h-[96px] h-auto py-4 sm:py-5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all hover:scale-105"
              >
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base font-semibold text-center leading-tight">내 결과 공유하기</span>
                <span className="text-[10px] sm:text-xs opacity-90 text-center leading-tight px-2">
                  {webProfileUrl ? '웹 프로필 링크 복사' : '클릭하여 링크 생성'}
                </span>
              </Button>

              {/* Row 1, Col 2: Share Landing Page */}
              <Button
                onClick={handleShareLandingUrl}
                className="min-h-[88px] sm:min-h-[96px] h-auto py-4 sm:py-5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transition-all hover:scale-105"
              >
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base font-semibold text-center leading-tight">진단 테스트 공유하기</span>
                <span className="text-[10px] sm:text-xs opacity-90 text-center leading-tight px-2">PSA 설문 링크 복사</span>
              </Button>

              {/* Row 2, Full Width: Waitlist Registration */}
              <Button
                onClick={() => setShowWaitlistForm(true)}
                className={`min-h-[88px] sm:min-h-[96px] h-auto py-4 sm:py-5 md:col-span-2 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br ${theme?.gradient || 'from-amber-600 to-orange-600'} hover:opacity-90 text-white transition-all hover:scale-105 ${theme?.shadowClass ? `shadow-lg ${theme.shadowClass}` : 'shadow-lg'}`}
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-base sm:text-lg font-bold text-center leading-tight">대기자 명단 등록하기</span>
                <span className="text-[10px] sm:text-xs opacity-90 text-center leading-tight px-2">
                  이력서 기반 심층 분석 정식 출시 시 우선 연락
                </span>
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

          {/* WAITLIST FORM MODAL - Show when user clicks "대기자 명단 등록하기" */}
          {showWaitlistForm && (
            <Dialog open={showWaitlistForm} onOpenChange={setShowWaitlistForm}>
              <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl text-white">
                    대기자 명단 등록
                  </DialogTitle>
                  <DialogDescription className="text-center text-gray-300">
                    정식 서비스 출시 시 우선적으로 연락드리겠습니다
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleWaitlistSubmit} className="space-y-4 py-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      이메일 {!email && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={email}
                      readOnly={!!email}
                      required={!email}
                      className={`w-full px-4 py-3 border rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 ${
                        email
                          ? 'border-white/20'
                          : 'border-white/30 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      }`}
                      placeholder={!email ? "your@email.com" : ""}
                    />
                    {!email && (
                      <p className="text-xs text-gray-400 mt-1">
                        분석 결과 저장 및 연락을 위해 필요합니다
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      휴대폰 번호 (선택사항)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-3 border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      SMS로 빠른 알림을 받으실 수 있습니다
                    </p>
                  </div>

                  {waitlistError && (
                    <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
                      <p className="text-sm text-red-200">{waitlistError}</p>
                    </div>
                  )}

                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowWaitlistForm(false);
                        setWaitlistError("");
                        setPhone("");
                      }}
                      variant="outline"
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      disabled={waitlistSubmitting}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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
              <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl mb-2 text-white">
                    🎉 대기자 명단 등록 완료!
                  </DialogTitle>
                  <DialogDescription className="text-center text-base text-gray-300">
                    정식 서비스 출시 시 우선적으로 연락드리겠습니다
                  </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                  <div className={`bg-gradient-to-br ${theme?.gradient || 'from-purple-600 to-indigo-600'} rounded-xl p-6 text-center mb-4 shadow-lg ${theme?.shadowClass || 'shadow-purple-600/30'}`}>
                    <p className="text-sm text-white/80 mb-2">대기 순번</p>
                    <p className="text-5xl font-bold text-white mb-2">
                      {waitlistPosition}
                    </p>
                    <p className="text-sm text-white/70">번째 고객님</p>
                  </div>

                  <div className="space-y-3 text-sm text-gray-200">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-green-400/30">
                        <span className="text-green-400 text-xs">✓</span>
                      </div>
                      <p>PSA 분석 결과가 저장되었습니다</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-green-400/30">
                        <span className="text-green-400 text-xs">✓</span>
                      </div>
                      <p>웹 프로필이 생성되었습니다</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-400/30">
                        <span className="text-blue-400 text-xs">📧</span>
                      </div>
                      <p>정식 출시 시 <strong className="text-white">{email}</strong>로 연락드립니다</p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="sm:justify-center">
                  <Button
                    onClick={() => setShowWaitlistModal(false)}
                    className={`w-full bg-gradient-to-r ${theme?.gradient || 'from-purple-600 to-indigo-600'} hover:opacity-90`}
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
