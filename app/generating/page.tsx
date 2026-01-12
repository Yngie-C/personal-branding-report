"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadPageHeader from "@/components/upload/UploadPageHeader";
import type { GenerationProgress, ProgressStep } from "@/lib/progress-tracker";
import { useSessionValidation } from "@/hooks/useSessionValidation";

// 폴링 간격 (ms)
const POLL_INTERVAL = 2000;

export default function GeneratingPage() {
  const router = useRouter();
  const { sessionId, isLoading: sessionLoading, isValidated } = useSessionValidation();
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

  // 폴링 인터벌 참조
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 진행 상황 폴링
  const pollProgress = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/generate?sessionId=${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "진행 상황을 조회할 수 없습니다.");
      }

      const progressData = data.data as GenerationProgress;
      setProgress(progressData);

      // 완료 또는 실패 시 폴링 중지
      if (progressData.overallStatus === "completed") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        // 완료 후 즉시 리다이렉트
        router.push("/result");
      } else if (progressData.overallStatus === "failed") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setError(progressData.error || "리포트 생성에 실패했습니다.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      console.error("Polling error:", message);
      // 네트워크 에러는 무시하고 계속 폴링 (일시적 오류 가능)
    }
  }, [sessionId, router]);

  // 자동 생성 시작 및 폴링
  useEffect(() => {
    if (!isValidated || !sessionId) return;

    const startGenerationIfNeeded = async () => {
      try {
        // 먼저 현재 상태 확인
        const response = await fetch(`/api/generate?sessionId=${sessionId}`);
        const data = await response.json();

        // 404이거나 진행 중인 데이터가 없으면 생성 시작
        if (response.status === 404 || !data.data?.steps?.length) {
          if (!hasStartedGeneration) {
            console.log("[Generating] Starting generation...");
            setHasStartedGeneration(true);
            await fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId }),
            });
          }
        }
      } catch (error) {
        console.error("[Generating] Auto-start check failed:", error);
      }

      // 폴링 시작 (아직 시작되지 않았다면)
      if (!pollIntervalRef.current) {
        pollProgress();
        pollIntervalRef.current = setInterval(pollProgress, POLL_INTERVAL);
      }
    };

    startGenerationIfNeeded();

    // 클린업
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isValidated, sessionId, hasStartedGeneration, pollProgress]);

  // 재시도 핸들러
  const handleRetry = async () => {
    if (!sessionId) return;

    // 기존 폴링 정리
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setIsRetrying(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "재시도에 실패했습니다.");
      }

      // 폴링 재시작
      setProgress(null);
      pollIntervalRef.current = setInterval(pollProgress, POLL_INTERVAL);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "재시도에 실패했습니다.";
      setError(message);
    } finally {
      setIsRetrying(false);
    }
  };

  // 로딩 중 (세션 검증 중)
  if (sessionLoading || !isValidated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </main>
    );
  }

  // 세션 없음
  if (!sessionId) {
    return null;
  }

  // 현재 진행 단계 계산
  const currentStep = progress?.currentStep || 0;
  const totalSteps = progress?.totalSteps || 10;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);
  const currentStepInfo = progress?.steps?.find(
    (s) => s.status === "in_progress"
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 상단 진행 단계 헤더 */}
        <UploadPageHeader currentStep={3} />

        {/* 메인 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          {/* 제목 */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Sparkles className="w-12 h-12 text-indigo-600" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {progress?.overallStatus === "completed"
                ? "브랜딩 리포트 완성!"
                : progress?.overallStatus === "failed"
                ? "생성 중 오류 발생"
                : "브랜딩 리포트 생성 중..."}
            </h1>
            <p className="text-gray-600">
              {progress?.overallStatus === "completed"
                ? "잠시 후 결과 페이지로 이동합니다"
                : progress?.overallStatus === "failed"
                ? "아래 버튼을 눌러 다시 시도해주세요"
                : "AI가 당신만의 브랜딩 전략을 만들고 있습니다"}
            </p>
          </div>

          {/* 에러 상태 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">생성 실패</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full mt-4 bg-red-600 hover:bg-red-700"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    재시도 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 시도
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* 진행률 바 */}
          {!error && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  진행률
                </span>
                <span className="text-sm font-bold text-indigo-600">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              {currentStepInfo && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {currentStepInfo.name}... ({currentStep}/{totalSteps})
                </p>
              )}
            </div>
          )}

          {/* 10단계 타임라인 */}
          {!error && progress?.steps && progress.steps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                생성 단계
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {progress.steps.map((step) => (
                  <StepCard key={step.step} step={step} />
                ))}
              </div>
            </div>
          )}

          {/* 완료 상태 */}
          <AnimatePresence>
            {progress?.overallStatus === "completed" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-800 font-medium">
                  리포트 생성이 완료되었습니다!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  결과 페이지로 이동합니다...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 하단 안내 */}
        {!error && progress?.overallStatus !== "completed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-500">
              평균 소요 시간: 약 2-5분
            </p>
            <p className="text-xs text-gray-400 mt-1">
              이 페이지를 떠나도 생성은 계속됩니다
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}

// 단계 카드 컴포넌트
function StepCard({ step }: { step: ProgressStep }) {
  const getStatusStyles = () => {
    switch (step.status) {
      case "completed":
        return "bg-green-50 border-green-200 text-green-700";
      case "in_progress":
        return "bg-indigo-50 border-indigo-200 text-indigo-700";
      case "failed":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-400";
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          </motion.div>
        );
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step.step * 0.05 }}
      className={`p-3 rounded-lg border ${getStatusStyles()}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {getStatusIcon()}
        <span className="text-xs font-medium">Step {step.step}</span>
      </div>
      <p className="text-xs truncate" title={step.name}>
        {step.name}
      </p>
    </motion.div>
  );
}
