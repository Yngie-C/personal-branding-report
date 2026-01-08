"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SurveyQuestion } from "@/types/survey";
import CircularLikertScale from "@/components/survey/CircularLikertScale";
import { seededShuffle } from "@/lib/utils/shuffle";
import { useSwipeable } from "react-swipeable";

interface Answers {
  [questionId: string]: number;
}

export default function SurveyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Questions (shuffled)
  const [shuffledQuestions, setShuffledQuestions] = useState<SurveyQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<SurveyQuestion[]>([]);

  // User answers
  const [answers, setAnswers] = useState<Answers>({});

  // Pagination (6 questions per page × 10 pages = 60 questions)
  const [currentPage, setCurrentPage] = useState(0);
  const QUESTIONS_PER_PAGE = 6;

  // Start time for completion tracking
  const [startTime] = useState(new Date());

  // Track if user just answered the last question
  const [showCompletionHint, setShowCompletionHint] = useState(false);

  // Refs for each question element (for auto-scroll)
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Get first unanswered question index in the shuffled order
  const getFirstUnansweredIndex = useCallback((): number => {
    for (let i = 0; i < shuffledQuestions.length; i++) {
      if (answers[shuffledQuestions[i].id] === undefined) {
        return i;
      }
    }
    return shuffledQuestions.length; // All answered
  }, [shuffledQuestions, answers]);

  // Swipe gesture configuration
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      // Swipe left = next page
      const totalPages = Math.ceil(shuffledQuestions.length / QUESTIONS_PER_PAGE);
      if (currentPage < totalPages - 1) {
        handlePageChange(currentPage + 1);
      }
    },
    onSwipedRight: () => {
      // Swipe right = previous page
      if (currentPage > 0) {
        handlePageChange(currentPage - 1);
      }
    },
    preventScrollOnSwipe: false,      // CRITICAL: 세로 스크롤 허용
    trackMouse: true,                  // 데스크톱 trackpad 지원
    trackTouch: true,                  // 모바일 터치 지원
    delta: 50,                         // 최소 swipe 거리 (px)
    swipeDuration: 500,                // 최대 swipe 시간 (ms)
    touchEventOptions: { passive: true }, // 스크롤 성능 개선
  });

  // Load questions on mount (no sessionId required)
  useEffect(() => {
    loadQuestions();
  }, [router]);

  // Load saved answers after questions are loaded
  useEffect(() => {
    if (allQuestions.length > 0) {
      loadSavedAnswers();
    }
  }, [allQuestions]);

  // Auto-save to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("survey-answers", JSON.stringify(answers));
    }
  }, [answers]);

  // Detect when user answers the last question (60th question)
  useEffect(() => {
    if (shuffledQuestions.length === 0) return;

    const totalPages = Math.ceil(shuffledQuestions.length / QUESTIONS_PER_PAGE);
    const lastQuestion = shuffledQuestions[shuffledQuestions.length - 1];
    const isOnLastPage = currentPage === totalPages - 1;
    const answeredLastQuestion = answers[lastQuestion.id] !== undefined;
    const notFullyComplete = Object.keys(answers).length < shuffledQuestions.length;

    // Show hint only when user just answered the last question but hasn't completed all
    if (isOnLastPage && answeredLastQuestion && notFullyComplete) {
      setShowCompletionHint(true);

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowCompletionHint(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowCompletionHint(false);
    }
  }, [answers, currentPage, shuffledQuestions]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/survey/questions");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "질문을 불러오는데 실패했습니다.");
      }

      const questions: SurveyQuestion[] = result.data.questions;
      setAllQuestions(questions);

      // Check if we have a saved question order in localStorage
      const savedOrder = localStorage.getItem("survey-question-order");
      let shuffled: SurveyQuestion[];

      if (savedOrder) {
        // Use saved order (for page refresh consistency)
        try {
          const orderIds: string[] = JSON.parse(savedOrder);
          shuffled = orderIds
            .map(id => questions.find(q => q.id === id))
            .filter((q): q is SurveyQuestion => q !== undefined);

          // If saved order doesn't match current questions, reshuffle
          if (shuffled.length !== questions.length) {
            console.warn("Saved question order mismatch, reshuffling...");
            // Generate new seed based on timestamp
            const seed = Date.now().toString();
            localStorage.setItem("survey-seed", seed);
            shuffled = seededShuffle(questions, seed);
            localStorage.setItem(
              "survey-question-order",
              JSON.stringify(shuffled.map(q => q.id))
            );
          }
        } catch (err) {
          console.error("Failed to parse saved question order:", err);
          // If parsing fails, reshuffle
          const seed = Date.now().toString();
          localStorage.setItem("survey-seed", seed);
          shuffled = seededShuffle(questions, seed);
          localStorage.setItem(
            "survey-question-order",
            JSON.stringify(shuffled.map(q => q.id))
          );
        }
      } else {
        // First time: generate seed and shuffle
        const seed = Date.now().toString();
        localStorage.setItem("survey-seed", seed);
        shuffled = seededShuffle(questions, seed);
        localStorage.setItem(
          "survey-question-order",
          JSON.stringify(shuffled.map(q => q.id))
        );
      }

      setShuffledQuestions(shuffled);
      setLoading(false);
    } catch (err: any) {
      console.error("Failed to load questions:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const loadSavedAnswers = () => {
    const saved = localStorage.getItem("survey-answers");
    if (saved) {
      try {
        const savedAnswers = JSON.parse(saved);

        // 현재 질문 ID와 매칭되는 답변만 필터링
        const validQuestionIds = new Set(allQuestions.map(q => q.id));
        const filteredAnswers: Answers = {};

        Object.keys(savedAnswers).forEach(questionId => {
          if (validQuestionIds.has(questionId)) {
            filteredAnswers[questionId] = savedAnswers[questionId];
          }
        });

        setAnswers(filteredAnswers);

        // 유효하지 않은 답변이 있었다면 localStorage 업데이트
        if (Object.keys(filteredAnswers).length !== Object.keys(savedAnswers).length) {
          console.log(
            `Filtered out ${Object.keys(savedAnswers).length - Object.keys(filteredAnswers).length} invalid answers from localStorage`
          );
          localStorage.setItem("survey-answers", JSON.stringify(filteredAnswers));
        }
      } catch (err) {
        console.error("Failed to parse saved answers:", err);
        // 잘못된 데이터는 삭제
        localStorage.removeItem("survey-answers");
      }
    }
  };

  const handleAnswerChange = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));

    // Find the index of the current question in shuffled order
    const currentIndex = shuffledQuestions.findIndex(q => q.id === questionId);
    const nextIndex = currentIndex + 1;

    // If there's a next question
    if (nextIndex < shuffledQuestions.length) {
      const nextQuestion = shuffledQuestions[nextIndex];
      const nextQuestionPage = Math.floor(nextIndex / QUESTIONS_PER_PAGE);

      // If next question is on a different page, navigate to that page
      if (nextQuestionPage !== currentPage) {
        setCurrentPage(nextQuestionPage);
        // Scroll to top after page change
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        // Same page: scroll to next question
        setTimeout(() => {
          const nextRef = questionRefs.current.get(nextQuestion.id);
          if (nextRef) {
            nextRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  };

  const calculateProgress = () => {
    const totalQuestions = allQuestions.length;
    const answeredQuestions = Object.keys(answers).length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  };

  const canSubmit = () => {
    return calculateProgress() === 100;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setSubmitting(true);
    setError("");

    try {
      // Calculate completion time
      const completionTimeSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Format answers for API
      const formattedAnswers = allQuestions.map(q => ({
        questionId: q.id,
        questionNumber: q.questionNumber,
        category: q.category,
        score: answers[q.id] || 0
      }));

      // Call analysis API
      const analyzeResponse = await fetch("/api/survey/analyze-temp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: formattedAnswers,
          completionTimeSeconds
        })
      });

      const analyzeResult = await analyzeResponse.json();
      if (!analyzeResponse.ok) {
        throw new Error(analyzeResult.error || "분석 생성에 실패했습니다.");
      }

      // Store analysis in localStorage
      localStorage.setItem("survey-analysis", JSON.stringify(analyzeResult.data));
      localStorage.setItem("survey-answers", JSON.stringify(formattedAnswers));

      // Navigate to results
      router.push("/survey-result");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg text-slate-300 font-medium">설문지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Pagination calculation
  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentPageQuestions = shuffledQuestions.slice(startIndex, endIndex);
  const totalPages = Math.ceil(shuffledQuestions.length / QUESTIONS_PER_PAGE);
  const progress = calculateProgress();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-white mb-3">
            PSA 강점 진단
          </h1>
          <p className="text-lg text-slate-300 mb-6">
            Professional Strength Assessment • 60문항 • 약 6-12분 소요
          </p>

          {/* Overall Progress Bar */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="flex justify-between text-sm text-slate-300 mb-2">
              <span>전체 진행률</span>
              <span className="font-semibold text-white">
                {Object.keys(answers).length} / {shuffledQuestions.length} 문제 완료 ({Math.round(progress)}%)
              </span>
            </div>
            <div className="h-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 transition-all duration-300 shadow-lg shadow-indigo-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Page Questions */}
        <div
          {...swipeHandlers}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 mb-6 max-w-2xl mx-auto"
        >
          <div className="mb-6 text-center">
            <span className="text-slate-600 text-sm font-medium">
              페이지 {currentPage + 1} / {totalPages} • 질문 {startIndex + 1}-{Math.min(endIndex, shuffledQuestions.length)}
            </span>
          </div>

          <div className="space-y-8">
            {currentPageQuestions.map((question, index) => {
              // Calculate global index for this question
              const globalIndex = shuffledQuestions.findIndex(q => q.id === question.id);
              const firstUnansweredIndex = getFirstUnansweredIndex();
              // Only allow answering up to and including the first unanswered question
              const isDisabled = globalIndex > firstUnansweredIndex;

              return (
                <div
                  key={question.id}
                  ref={(el) => {
                    if (el) {
                      questionRefs.current.set(question.id, el);
                    }
                  }}
                  className={`border-b border-slate-200 pb-6 last:border-b-0 transition-opacity duration-300 ${
                    isDisabled ? 'opacity-40' : 'opacity-100'
                  }`}
                  data-question-id={question.id}
                >
                  <div className="mb-4">
                    <p className={`font-medium leading-relaxed ${
                      isDisabled ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {question.questionText}
                    </p>
                  </div>

                  {/* Likert Scale - Circular Design */}
                  <div>
                    <CircularLikertScale
                      value={answers[question.id]}
                      onChange={(score) => handleAnswerChange(question.id, score)}
                      disabled={isDisabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Navigation */}
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
            {/* Previous Button */}
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              variant="outline"
              className="h-11 px-3 sm:px-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">이전</span>
            </Button>

            {/* Page Dots Indicator */}
            {[...Array(totalPages)].map((_, i) => {
              const isActive = currentPage === i;

              return (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`group relative transition-all duration-300 ${
                    isActive ? 'p-2' : 'p-1.5'
                  }`}
                  aria-label={isActive ? `페이지 ${i + 1}, 현재 페이지` : `페이지 ${i + 1}로 이동`}
                  aria-current={isActive ? "page" : undefined}
                  data-page-number={i + 1}
                >
                  {/* Touch target overlay (44x44px minimum) */}
                  <span className="absolute inset-0 min-w-[44px] min-h-[44px]" />

                  {/* Visible dot */}
                  <span
                    className={`relative block rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50 scale-110'
                        : 'w-2 h-2 bg-white/30 group-hover:bg-white/50 group-hover:scale-125'
                    }`}
                  />

                  {/* Hover tooltip with page number */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {i + 1}
                  </span>
                </button>
              );
            })}

            {/* Next Button or Submit */}
            {currentPage < totalPages - 1 ? (
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-11 px-3 sm:px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-white/20 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/40 backdrop-blur-sm"
              >
                <span className="hidden sm:inline">다음</span>
                <ChevronRight className="w-4 h-4 sm:ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit() || submitting}
                className="h-11 px-6 sm:px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-white/20 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-800 disabled:border-slate-600 shadow-lg shadow-indigo-500/50 backdrop-blur-sm"
              >
                {submitting ? "분석 중..." : "결과 확인하기"}
              </Button>
            )}
          </div>

          {/* Completion Hint - Shows only when user answers the last question */}
          {showCompletionHint && (
            <div className="p-4 bg-yellow-900/20 backdrop-blur-sm border border-yellow-500/40 rounded-lg text-center animate-fade-in shadow-lg">
              <p className="text-sm text-yellow-200 font-medium">
                모든 질문에 답변해야 결과를 확인할 수 있습니다.
                ({Object.keys(answers).length}/{shuffledQuestions.length} 완료)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 backdrop-blur-sm border border-red-500/40 rounded-lg shadow-lg">
            <p className="text-sm text-red-200 font-medium">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
