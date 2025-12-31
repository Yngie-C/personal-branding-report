"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FocusModeQuestion } from "@/components/questions/FocusModeQuestion";
import type { BrandingQuestions, QuestionPhaseMetadata } from "@/types/brand";

/**
 * Questions Page - Focus Mode
 *
 * Displays one question at a time with:
 * - Philosophy (3 questions): Soul Questions
 * - Expertise (4 questions): PSA-based skill proof
 * - Edge (2 questions): Future differentiation
 *
 * Features:
 * - Auto-save to localStorage
 * - Phase-based progress tracking
 * - AI guidance after answering
 * - Previous/Next navigation
 */

interface FlatQuestion {
  id: string;
  question: string;
  hint: string;
  required: boolean;
  questionType?: 'soul' | 'expertise' | 'edge' | 'legacy';
  aiGuidance?: string;
  category: string;
  phaseMetadata: QuestionPhaseMetadata;
}

export default function QuestionsPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Question data
  const [allQuestions, setAllQuestions] = useState<FlatQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Original category structure (for submission)
  const [originalCategories, setOriginalCategories] = useState<BrandingQuestions[]>([]);

  useEffect(() => {
    const id = localStorage.getItem("sessionId");
    if (!id) {
      router.push("/start");
    } else {
      setSessionId(id);
      loadQuestions(id);
      loadSavedAnswers(id);
    }
  }, [router]);

  // Auto-save answers to localStorage
  useEffect(() => {
    if (sessionId && Object.keys(answers).length > 0) {
      localStorage.setItem(`question-answers-${sessionId}`, JSON.stringify(answers));
    }
  }, [answers, sessionId]);

  const loadSavedAnswers = (sessionId: string) => {
    const saved = localStorage.getItem(`question-answers-${sessionId}`);
    if (saved) {
      try {
        const parsedAnswers = JSON.parse(saved);
        setAnswers(parsedAnswers);
      } catch (err) {
        console.error("[Questions] Failed to load saved answers:", err);
      }
    }
  };

  const loadQuestions = async (sessionId: string) => {
    try {
      console.log("[Questions] Loading questions...");
      setLoading(true);
      setError("");

      // Generate questions via API
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "질문 생성에 실패했습니다.");
      }

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error("잘못된 응답 형식입니다.");
      }

      const categories: BrandingQuestions[] = result.data;
      setOriginalCategories(categories);

      // Flatten questions and add phase metadata
      const flattened = flattenQuestions(categories);
      setAllQuestions(flattened);

      console.log(`[Questions] Loaded ${flattened.length} questions`);
      setLoading(false);
    } catch (err: any) {
      console.error("[Questions] Failed to load questions:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Flatten questions and add phase metadata
   */
  const flattenQuestions = (categories: BrandingQuestions[]): FlatQuestion[] => {
    const flattened: FlatQuestion[] = [];
    const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);

    let questionIndex = 0;

    categories.forEach((category) => {
      category.questions.forEach((question) => {
        const phaseMetadata = getPhaseMetadata(
          category.category as any,
          questionIndex,
          totalQuestions
        );

        flattened.push({
          ...question,
          category: category.category,
          phaseMetadata,
        });

        questionIndex++;
      });
    });

    return flattened;
  };

  /**
   * Get phase metadata for a question
   */
  const getPhaseMetadata = (
    category: string,
    currentIndex: number,
    totalQuestions: number
  ): QuestionPhaseMetadata => {
    // Default metadata
    const defaultMetadata: QuestionPhaseMetadata = {
      phase: 'expertise',
      phaseTitle: '전문성 증명',
      phaseDescription: '당신의 강점을 구체적인 경험으로 증명합니다',
      completionPercentage: Math.round(((currentIndex + 1) / totalQuestions) * 100),
    };

    // Phase-specific metadata
    if (category === 'philosophy') {
      return {
        phase: 'philosophy',
        phaseTitle: '철학과 본질',
        phaseDescription: '당신의 가치관과 일하는 철학을 탐구합니다',
        completionPercentage: Math.round(((currentIndex + 1) / totalQuestions) * 100),
      };
    } else if (category === 'expertise') {
      return {
        phase: 'expertise',
        phaseTitle: '전문성 증명',
        phaseDescription: 'PSA 강점을 구체적인 경험과 연결합니다',
        completionPercentage: Math.round(((currentIndex + 1) / totalQuestions) * 100),
      };
    } else if (category === 'edge') {
      return {
        phase: 'edge',
        phaseTitle: '차별화와 비전',
        phaseDescription: '시장에서 당신만의 포지션을 정의합니다',
        completionPercentage: Math.round(((currentIndex + 1) / totalQuestions) * 100),
      };
    }

    return defaultMetadata;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Last question - submit
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    try {
      // Validate required questions
      const requiredQuestions = allQuestions.filter((q) => q.required);

      for (const q of requiredQuestions) {
        if (!answers[q.id]?.trim()) {
          throw new Error(`"${q.question}" 질문에 답변해주세요.`);
        }
      }

      // Submit answers
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questions: originalCategories,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "답변 저장에 실패했습니다.");
      }

      // Clear saved answers from localStorage
      localStorage.removeItem(`question-answers-${sessionId}`);

      // Navigate to generating page
      router.push("/generating");
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">AI가 맞춤형 질문을 생성하는 중...</p>
          <p className="text-sm text-gray-500 mt-2">PSA 분석과 이력서를 바탕으로 질문을 설계합니다</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/upload")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            이전 단계로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // No questions
  if (allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-lg text-gray-700">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;
  const canGoNext = answers[currentQuestion.id]?.trim().length > 0 || !currentQuestion.required;
  const canGoPrevious = currentQuestionIndex > 0;

  return (
    <>
      <FocusModeQuestion
        question={currentQuestion}
        phaseMetadata={currentQuestion.phaseMetadata}
        currentIndex={currentQuestionIndex}
        totalQuestions={allQuestions.length}
        answer={answers[currentQuestion.id] || ""}
        onAnswerChange={(value) => handleAnswerChange(currentQuestion.id, value)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        isLastQuestion={isLastQuestion}
      />

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submitting Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700 font-medium">답변을 저장하는 중...</p>
          </div>
        </div>
      )}
    </>
  );
}
