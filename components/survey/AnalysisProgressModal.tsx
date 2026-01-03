"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisProgressModalProps {
  open: boolean;
  currentStep: number; // 0-3 (4 steps)
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export default function AnalysisProgressModal({
  open,
  currentStep,
  error,
  onRetry,
  onCancel,
}: AnalysisProgressModalProps) {
  const steps = [
    { name: "응답 검증", duration: "1-2초" },
    { name: "점수 계산", duration: "2-3초" },
    { name: "AI 분석", duration: "8-20초" },
    { name: "결과 처리", duration: "2-3초" },
  ];

  const getStepIcon = (index: number) => {
    if (error && index === currentStep) {
      return <X className="w-5 h-5 text-red-500" />;
    }
    if (index < currentStep) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (index === currentStep) {
      return <Loader2 className="w-5 h-5 animate-spin text-purple-600" />;
    }
    return <Circle className="w-5 h-5 text-gray-300" />;
  };

  const progressPercentage = error ? currentStep * 25 : (currentStep + 1) * 25;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => !error && e.preventDefault()}
        onPointerDownOutside={(e) => !error && e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {error ? "⚠️ 분석 오류" : "🧠 PSA 분석 중..."}
          </DialogTitle>
          <DialogDescription className="text-center">
            {error ? "분석 중 문제가 발생했습니다" : "잠시만 기다려 주세요"}
          </DialogDescription>
        </DialogHeader>

        {/* Steps */}
        <div className="space-y-3 py-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                index === currentStep &&
                  !error &&
                  "bg-purple-50 border border-purple-200",
                index < currentStep && "opacity-60"
              )}
            >
              {getStepIcon(index)}
              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium",
                    index === currentStep && !error && "text-purple-700",
                    index < currentStep && "text-gray-600"
                  )}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.duration}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {!error && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>진행률</span>
              <span className="font-semibold">{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-center text-gray-500">
              예상 소요 시간: 약 15-30초
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Error Actions */}
        {error && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button
              onClick={onRetry}
              className="bg-purple-600 hover:bg-purple-700"
            >
              다시 시도
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
