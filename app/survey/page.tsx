"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SurveyQuestion } from "@/types/survey";
import CircularLikertScale from "@/components/survey/CircularLikertScale";
import { seededShuffle } from "@/lib/utils/shuffle";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-navy-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">설문지를 불러오는 중...</p>
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
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-navy-50 p-6">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            PSA 강점 진단
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Professional Strength Assessment • 60문항 • 약 6-12분 소요
          </p>

          {/* Overall Progress Bar */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>전체 진행률</span>
              <span className="font-semibold">
                {Object.keys(answers).length} / {shuffledQuestions.length} 문제 완료 ({Math.round(progress)}%)
              </span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Page Questions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <span className="text-gray-600 text-sm">
              페이지 {currentPage + 1} / {totalPages} • 질문 {startIndex + 1}-{Math.min(endIndex, shuffledQuestions.length)}
            </span>
          </div>

          <div className="space-y-8">
            {currentPageQuestions.map((question, index) => (
              <div
                key={question.id}
                className="border-b border-gray-200 pb-6 last:border-b-0"
                data-question-id={question.id}
              >
                <div className="mb-4">
                  <p className="text-gray-900 font-medium leading-relaxed">
                    {question.questionText}
                  </p>
                </div>

                {/* Likert Scale - Circular Design */}
                <div>
                  <CircularLikertScale
                    value={answers[question.id]}
                    onChange={(score) => handleAnswerChange(question.id, score)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Navigation */}
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {/* Previous Button */}
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              variant="outline"
              className="px-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              이전
            </Button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                onClick={() => handlePageChange(i)}
                variant={currentPage === i ? "default" : "outline"}
                className="w-10 h-10"
                data-page-number={i + 1}
              >
                {i + 1}
              </Button>
            ))}

            {/* Next Button or Submit */}
            {currentPage < totalPages - 1 ? (
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-4"
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit() || submitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                {submitting ? "분석 중..." : "결과 확인하기"}
              </Button>
            )}
          </div>

          {/* Completion Hint - Shows only when user answers the last question */}
          {showCompletionHint && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center animate-fade-in">
              <p className="text-sm text-yellow-800">
                모든 질문에 답변해야 결과를 확인할 수 있습니다.
                ({Object.keys(answers).length}/{shuffledQuestions.length} 완료)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
