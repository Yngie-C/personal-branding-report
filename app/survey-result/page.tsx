"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, Award, AlertCircle, ArrowRight, Sparkles, Share2, Globe, Mail } from "lucide-react";
import { BriefAnalysis, CategoryLabels, SurveyAnswer } from "@/types/survey";

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
      setWebProfileSlug(result.data.webProfileSlug);
      setWebProfileUrl(result.data.webProfileUrl);

      // Clear temporary data from localStorage
      localStorage.removeItem("survey-analysis");
      localStorage.removeItem("survey-answers");
      localStorage.removeItem("survey-question-order");
      localStorage.removeItem("survey-seed");

      // Hide email form (show success state)
      setShowEmailForm(false);

      console.log("Session created and data saved:", newSessionId);
    } catch (err: any) {
      console.error("Email submission error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg text-white font-medium">분석 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-navy-900 via-slate-800 to-slate-900">
      {/* Hero Section - Persona Card */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-purple-100 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>PSA 강점 진단 완료</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {analysis.persona.title}
          </h1>

          <p className="text-xl md:text-2xl text-purple-100 mb-8 font-light">
            {analysis.persona.tagline}
          </p>

          {/* Branding Keywords */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {analysis.brandingKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium"
              >
                #{keyword}
              </span>
            ))}
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {/* Total Score */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-yellow-300 mr-2" />
                <span className="text-purple-100 text-sm">종합 점수</span>
              </div>
              <div className="text-4xl font-bold text-white">
                {Math.round(analysis.totalScore)}
              </div>
              <div className="text-xs text-purple-200 mt-1">/ 100점</div>
            </div>

            {/* Top Category 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-300 mr-2" />
                <span className="text-purple-100 text-sm">1위 강점</span>
              </div>
              <div className="text-xl font-bold text-white mb-1">
                {CategoryLabels[analysis.topCategories[0]]}
              </div>
              <div className="text-2xl font-bold text-green-300">
                {Math.round(analysis.categoryScores.find(s => s.category === analysis.topCategories[0])?.normalizedScore || 0)}점
              </div>
            </div>

            {/* Top Category 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
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
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Radar Chart */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              5차원 강점 프로필
            </h2>

            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={analysis.radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: '#334e68', fontSize: 14, fontWeight: 500 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                <Radar
                  name="점수"
                  dataKey="score"
                  stroke="#486581"
                  fill="#486581"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-5 gap-3 mt-6">
              {analysis.categoryScores
                .sort((a, b) => b.normalizedScore - a.normalizedScore)
                .map((score) => (
                  <div key={score.category} className="text-center">
                    <div className="text-xs text-gray-600 mb-1">
                      {CategoryLabels[score.category]}
                    </div>
                    <div className="text-lg font-bold text-navy-600">
                      {Math.round(score.normalizedScore)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Persona Description */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              페르소나 특성
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {analysis.persona.description}
            </p>
          </div>

          {/* Strengths Summary */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6 text-navy-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                강점 분석
              </h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {analysis.strengthsSummary}
              </p>
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
          </div>

          {/* Working Styles */}
          {analysis.lowScoreCategories && analysis.lowScoreCategories.length > 0 && (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  일하는 스타일
                </h2>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                모든 역량이 높을 필요는 없습니다. 낮은 점수는 "결핍"이 아닌 "당신만의 독특한 일하는 방식"을 나타냅니다.
              </p>

              <div className="space-y-4">
                {analysis.lowScoreCategories.map((item, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500 mt-2" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.reframedLabel}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {item.reframedDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complementary Style */}
          {analysis.shadowSides && (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-slate-500" />
                <h2 className="text-2xl font-bold text-gray-900">
                  보완적 스타일
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {analysis.shadowSides}
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
            </div>
          )}

          {/* EMAIL FORM SECTION - Show if no sessionId yet */}
          {!sessionId && (
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <Mail className="w-16 h-16 text-white mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-3">
                  이 분석 결과를 저장하고 공유하세요
                </h2>
                <p className="text-purple-100 mb-6 text-lg">
                  이메일을 입력하면 웹 프로필 링크가 생성되어
                  <br />
                  언제든지 결과를 확인하고 공유할 수 있습니다.
                </p>

                {!showEmailForm ? (
                  <Button
                    onClick={() => setShowEmailForm(true)}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-slate-50 px-8 py-6 text-lg font-semibold"
                  >
                    이메일 입력하기
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full max-w-md px-6 py-4 border-2 border-white rounded-lg focus:ring-4 focus:ring-white/30 focus:border-white text-lg mx-auto block text-gray-900"
                    />

                    {error && (
                      <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3 justify-center">
                      <Button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        variant="outline"
                        className="bg-white/20 text-white border-white hover:bg-white/30"
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting || !email}
                        className="bg-white text-purple-600 hover:bg-slate-50 px-8"
                      >
                        {submitting ? "저장 중..." : "저장하고 계속하기"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* WEB PROFILE SHARE SECTION - Show after email submitted */}
          {sessionId && webProfileSlug && webProfileUrl && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-navy-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  이 분석 결과를 공유하세요
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                웹 프로필로 당신의 강점을 세상에 알리세요
              </p>

              <div className="flex items-center gap-3 justify-center mb-4">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}${webProfileUrl}` : webProfileUrl}
                  className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
                <Button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(`${window.location.origin}${webProfileUrl}`);
                      alert('링크가 복사되었습니다!');
                    }
                  }}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  링크 복사
                </Button>
              </div>

              <Button
                onClick={() => window.open(webProfileUrl, '_blank')}
                className="bg-navy-600 hover:bg-navy-700"
              >
                <Globe className="w-4 h-4 mr-2" />
                웹 프로필 보기
              </Button>
            </div>
          )}

          {/* CTA Section - Continue to Upload */}
          {sessionId && (
            <div className="bg-navy-600 hover:bg-navy-700 transition-colors rounded-2xl shadow-2xl p-8 text-center cursor-pointer" onClick={() => router.push('/upload')}>
              <h2 className="text-3xl font-bold text-white mb-3">
                이제 이력서와 포트폴리오를 업로드하세요
              </h2>
              <p className="text-slate-100 mb-6 text-lg">
                PSA 분석 결과를 바탕으로 AI가 이력서를 분석하여
                <br />
                당신만의 맞춤형 질문을 생성합니다.
              </p>
              <Button
                size="lg"
                className="bg-white text-navy-600 hover:bg-slate-50 px-8 py-6 text-lg font-semibold"
              >
                이력서 업로드하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
