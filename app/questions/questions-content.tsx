"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FocusModeQuestion } from "@/components/questions/FocusModeQuestion";
import type { BrandingQuestions, QuestionPhaseMetadata } from "@/types/brand";
import { useSessionValidation } from "@/hooks/useSessionValidation";

// 로컬 스토리지 키
const STORAGE_KEYS = {
  QUESTIONS: "questions-data",
  ANSWERS: "questions-answers",
  CURRENT_INDEX: "questions-current-index",
};

// Phase별 메타데이터 설정
const PHASE_CONFIG: Record<string, Omit<QuestionPhaseMetadata, "completionPercentage">> = {
  philosophy: {
    phase: "philosophy",
    phaseTitle: "Philosophy",
    phaseDescription: "당신의 본질과 가치관을 탐색합니다",
  },
  expertise: {
    phase: "expertise",
    phaseTitle: "Expertise",
    phaseDescription: "당신의 전문성과 경험을 증명합니다",
  },
  edge: {
    phase: "edge",
    phaseTitle: "Edge",
    phaseDescription: "당신만의 차별화 포인트를 발견합니다",
  },
};

// Dev mode mock questions (9 questions: 3 philosophy + 4 expertise + 2 edge)
const DEV_MODE_QUESTIONS: BrandingQuestions[] = [
  {
    category: "philosophy",
    questions: [
      {
        id: "dev-phil-1",
        question: "당신이 일을 하는 근본적인 이유는 무엇인가요?",
        hint: "돈이나 성공 외에, 당신을 움직이게 하는 더 깊은 동기를 생각해보세요.",
        required: true,
        questionType: "soul",
      },
      {
        id: "dev-phil-2",
        question: "10년 후, 어떤 사람으로 기억되고 싶나요?",
        hint: "직함이나 업적보다는 당신의 본질적인 가치와 영향력을 생각해보세요.",
        required: true,
        questionType: "soul",
      },
      {
        id: "dev-phil-3",
        question: "당신이 절대 타협하지 않는 가치는 무엇인가요?",
        hint: "어떤 상황에서도 지키고 싶은 원칙을 떠올려보세요.",
        required: true,
        questionType: "soul",
      },
    ],
  },
  {
    category: "expertise",
    questions: [
      {
        id: "dev-exp-1",
        question: "당신의 전문 분야에서 가장 자신 있는 영역은 무엇인가요?",
        hint: "구체적인 기술, 방법론, 또는 문제 해결 영역을 설명해주세요.",
        required: true,
        questionType: "expertise",
      },
      {
        id: "dev-exp-2",
        question: "최근 가장 큰 성과를 낸 프로젝트나 경험은 무엇인가요?",
        hint: "정량적 결과와 당신의 구체적 기여를 포함해주세요.",
        required: true,
        questionType: "expertise",
      },
      {
        id: "dev-exp-3",
        question: "당신만의 독특한 업무 방식이나 접근법이 있나요?",
        hint: "다른 사람과 다르게 일하는 방식이 있다면 설명해주세요.",
        required: false,
        questionType: "expertise",
      },
      {
        id: "dev-exp-4",
        question: "앞으로 더 발전시키고 싶은 역량은 무엇인가요?",
        hint: "현재 역량을 기반으로 확장하고 싶은 영역을 생각해보세요.",
        required: false,
        questionType: "expertise",
      },
    ],
  },
  {
    category: "edge",
    questions: [
      {
        id: "dev-edge-1",
        question: "같은 일을 하는 다른 사람들과 당신을 구별짓는 특별한 점은 무엇인가요?",
        hint: "경쟁자와 비교했을 때 당신만의 강점을 생각해보세요.",
        required: true,
        questionType: "edge",
      },
      {
        id: "dev-edge-2",
        question: "당신에게만 의뢰하고 싶은 일이 있다면 어떤 종류의 일일까요?",
        hint: "당신의 독보적인 강점이 빛나는 상황을 상상해보세요.",
        required: true,
        questionType: "edge",
      },
    ],
  },
];

// BrandingQuestions[]를 평탄화된 질문 배열로 변환
interface FlatQuestion {
  id: string;
  question: string;
  hint: string;
  required: boolean;
  questionType?: "soul" | "expertise" | "edge" | "legacy";
  aiGuidance?: string;
  category: string;
}

function flattenQuestions(brandingQuestions: BrandingQuestions[]): FlatQuestion[] {
  const flattened: FlatQuestion[] = [];

  // philosophy → expertise → edge 순서로 정렬
  const order = ["philosophy", "expertise", "edge"];
  const sorted = [...brandingQuestions].sort((a, b) => {
    const aIndex = order.indexOf(a.category);
    const bIndex = order.indexOf(b.category);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  for (const category of sorted) {
    for (const q of category.questions) {
      flattened.push({
        ...q,
        category: category.category,
      });
    }
  }

  return flattened;
}

// 현재 질문의 Phase 메타데이터 계산
function getPhaseMetadata(
  questions: FlatQuestion[],
  currentIndex: number
): QuestionPhaseMetadata {
  const currentQuestion = questions[currentIndex];
  const category = currentQuestion?.category || "philosophy";

  const baseConfig = PHASE_CONFIG[category] || PHASE_CONFIG.philosophy;

  // 완성도 계산: 각 phase의 시작점 기준
  // philosophy: 0-33%, expertise: 33-66%, edge: 66-100%
  const totalQuestions = questions.length;
  const answeredCount = currentIndex + 1;
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);

  return {
    ...baseConfig,
    completionPercentage,
  };
}

export default function QuestionsContent() {
  const router = useRouter();
  const { sessionId, isLoading: sessionLoading, isValidated, isDevMode } = useSessionValidation();
  const [questions, setQuestions] = useState<BrandingQuestions[]>([]);
  const [flatQuestions, setFlatQuestions] = useState<FlatQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // debounce를 위한 ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dev mode: load mock questions immediately
  useEffect(() => {
    if (isDevMode && questions.length === 0) {
      console.log('[Dev Mode] Loading mock questions');
      setQuestions(DEV_MODE_QUESTIONS);
      setFlatQuestions(flattenQuestions(DEV_MODE_QUESTIONS));
      setIsLoading(false);
    }
  }, [isDevMode, questions.length]);

  // 세션 검증 완료 후 데이터 복원
  useEffect(() => {
    if (!isValidated || !sessionId) return;

    // 저장된 데이터 복원
    const storedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const storedAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    const storedIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX);

    if (storedQuestions) {
      try {
        const parsedQuestions = JSON.parse(storedQuestions) as BrandingQuestions[];
        setQuestions(parsedQuestions);
        setFlatQuestions(flattenQuestions(parsedQuestions));
      } catch {
        console.warn("Failed to parse stored questions");
      }
    }

    if (storedAnswers) {
      try {
        setAnswers(JSON.parse(storedAnswers));
      } catch {
        console.warn("Failed to parse stored answers");
      }
    }

    if (storedIndex) {
      setCurrentIndex(parseInt(storedIndex, 10) || 0);
    }

    setIsLoading(false);
  }, [isValidated, sessionId]);

  // 질문 생성 API 호출
  const generateQuestions = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "질문 생성에 실패했습니다.");
      }

      const generatedQuestions = data.data as BrandingQuestions[];
      setQuestions(generatedQuestions);
      setFlatQuestions(flattenQuestions(generatedQuestions));

      // localStorage에 저장
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(generatedQuestions));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // 질문이 없으면 생성 (dev mode에서는 skip)
  useEffect(() => {
    if (isDevMode) return; // Dev mode uses mock data
    if (sessionId && questions.length === 0 && !isLoading && !error) {
      generateQuestions();
    }
  }, [sessionId, questions.length, isLoading, error, generateQuestions, isDevMode]);

  // 답변 변경 핸들러 (debounced localStorage 저장)
  const handleAnswerChange = useCallback((value: string) => {
    const currentQuestion = flatQuestions[currentIndex];
    if (!currentQuestion) return;

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };
    setAnswers(newAnswers);

    // debounced 저장 (300ms)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(newAnswers));
    }, 300);
  }, [currentIndex, flatQuestions, answers]);

  // 현재 인덱스 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, currentIndex.toString());
  }, [currentIndex]);

  // 답변 제출
  const handleSubmit = useCallback(async () => {
    if (!sessionId) return;

    // Dev mode: just redirect without API call
    if (isDevMode) {
      console.log('[Dev Mode] Skipping API call, redirecting to /generating');
      router.push("/generating?dev=true");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questions,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "답변 저장에 실패했습니다.");
      }

      // 성공 시 localStorage 정리 및 리다이렉트
      localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
      localStorage.removeItem(STORAGE_KEYS.ANSWERS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_INDEX);

      router.push("/generating");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, questions, answers, router, isDevMode]);

  // 다음 버튼 핸들러
  const handleNext = useCallback(async () => {
    const isLastQuestion = currentIndex === flatQuestions.length - 1;

    if (isLastQuestion) {
      // 마지막 질문 - 제출
      await handleSubmit();
    } else {
      // 다음 질문으로 이동
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, flatQuestions.length, handleSubmit]);

  // 이전 버튼 핸들러
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // 로딩 상태 (세션 검증 중 또는 질문 로딩 중)
  if (sessionLoading || !isValidated || isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center">
        {/* Decorative blurred shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative z-10"
        >
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">맞춤형 질문을 준비하고 있습니다...</p>
        </motion.div>
      </main>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center p-4">
        {/* Decorative blurred shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/10 border border-white/40 p-8 max-w-md w-full text-center relative z-10"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            질문을 불러올 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={generateQuestions} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/upload")}
              className="w-full"
            >
              이력서 업로드로 돌아가기
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  // 세션 없음
  if (!sessionId) {
    return null;
  }

  // 질문 없음
  if (flatQuestions.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center">
        {/* Decorative blurred shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative z-10"
        >
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">질문을 생성하고 있습니다...</p>
        </motion.div>
      </main>
    );
  }

  const currentQuestion = flatQuestions[currentIndex];
  const currentAnswer = answers[currentQuestion.id] || "";
  const phaseMetadata = getPhaseMetadata(flatQuestions, currentIndex);

  // 다음으로 넘어갈 수 있는 조건: 필수 질문의 경우 최소 10자 이상
  const canGoNext = currentQuestion.required
    ? currentAnswer.trim().length >= 10
    : true;

  return (
    <AnimatePresence mode="wait">
      {isSaving ? (
        <motion.main
          key="saving"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center"
        >
          {/* Decorative blurred shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
          <div className="text-center relative z-10">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">답변을 저장하고 있습니다...</p>
          </div>
        </motion.main>
      ) : (
        <motion.div
          key={`question-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <FocusModeQuestion
            question={currentQuestion}
            phaseMetadata={phaseMetadata}
            currentIndex={currentIndex}
            totalQuestions={flatQuestions.length}
            answer={currentAnswer}
            onAnswerChange={handleAnswerChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={canGoNext}
            canGoPrevious={currentIndex > 0}
            isLastQuestion={currentIndex === flatQuestions.length - 1}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
