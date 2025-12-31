"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { id: 1, name: "이력서 분석", description: "경력과 스킬을 분석하고 있습니다" },
  { id: 2, name: "브랜드 전략 수립", description: "당신만의 브랜드를 정의하고 있습니다" },
  { id: 3, name: "콘텐츠 작성", description: "맞춤 콘텐츠를 생성하고 있습니다" },
  { id: 4, name: "PDF 보고서 생성", description: "상세 텍스트 보고서를 작성하고 있습니다" },
  { id: 5, name: "슬라이드 덱 생성", description: "프레젠테이션 슬라이드를 디자인하고 있습니다" },
];

export default function GeneratingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const generationStartedRef = useRef<boolean>(false);  // Prevent duplicate generation starts

  useEffect(() => {
    const id = localStorage.getItem("sessionId");
    if (!id) {
      router.push("/start");
      return;
    }
    setSessionId(id);

    // 실제 생성 시작 (중복 방지)
    if (!generationStartedRef.current) {
      generationStartedRef.current = true;
      startGeneration(id);
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [router]);

  const startGeneration = async (sessionId: string) => {
    try {
      console.log('[GeneratingPage] Starting generation for session:', sessionId);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '생성 시작 실패');
      }

      console.log('[GeneratingPage] Generation started successfully');

      // 생성 시작 후 폴링 시작
      startPolling(sessionId);
    } catch (error: any) {
      console.error('[GeneratingPage] Generation error:', error);
      setError(error.message || '리포트 생성 중 오류가 발생했습니다.');
    }
  };

  const startPolling = (sessionId: string) => {
    console.log('[GeneratingPage] Starting progress polling');

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate?sessionId=${sessionId}`);

        if (!response.ok) {
          console.error('[GeneratingPage] Polling failed:', response.statusText);
          return;
        }

        const data = await response.json();
        console.log('[GeneratingPage] Progress update:', data);

        // API returns { success: true, data: progress }
        const progress = data.data;

        // progress.steps 배열에서 완료된 단계 수 계산
        if (progress && progress.steps) {
          const completedSteps = progress.steps.filter(
            (s: any) => s.status === 'completed'
          ).length;

          // 10개 DB 단계를 5개 UI 단계로 매핑 (2:1 비율)
          const uiStep = Math.min(Math.floor(completedSteps / 2), steps.length - 1);
          setCurrentStep(uiStep);
        }

        // 완료 또는 실패 시 폴링 중지 (check progress.overallStatus)
        if (progress && progress.overallStatus === 'completed') {
          console.log('[GeneratingPage] Generation completed');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setTimeout(() => router.push('/result'), 1000);
        } else if (progress && progress.overallStatus === 'failed') {
          console.error('[GeneratingPage] Generation failed');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setError('리포트 생성에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error: any) {
        console.error('[GeneratingPage] Polling error:', error);
      }
    }, 2000); // 2초마다 확인
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-12">
        <div className="text-center mb-12">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            리포트 생성 중
          </h1>
          <p className="text-gray-600">
            AI가 당신만의 브랜딩 리포트를 제작하고 있습니다
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg transition-all ${
                index < currentStep
                  ? "bg-green-50 border border-green-200"
                  : index === currentStep
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    index < currentStep
                      ? "bg-green-600 text-white"
                      : index === currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {index < currentStep ? "✓" : step.id}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.name}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {index === currentStep && (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={() => router.push('/questions')} variant="outline" size="sm">
              다시 시도
            </Button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>예상 소요 시간: 2-3분</p>
        </div>
      </div>
    </main>
  );
}
