"use client";

import { FileUp, MessageCircleQuestion, Sparkles, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadPageHeaderProps {
  currentStep: 1 | 2 | 3 | 4;  // 1: 업로드, 2: 질문, 3: 생성, 4: 결과
  className?: string;
}

const steps = [
  { step: 1, label: "정보 입력", icon: FileUp },
  { step: 2, label: "추가 질문", icon: MessageCircleQuestion },
  { step: 3, label: "리포트 생성", icon: Sparkles },
  { step: 4, label: "결과 확인", icon: FileText },
];

export default function UploadPageHeader({
  currentStep,
  className,
}: UploadPageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {/* 진행 단계 표시 */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;

          return (
            <div key={s.step} className="flex items-center">
              {/* 단계 원형 */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-blue-600 text-white shadow-lg shadow-blue-200",
                    !isCompleted && !isCurrent && "bg-gray-200 text-gray-400"
                  )}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span
                  className={cn(
                    "text-xs sm:text-sm mt-2 font-medium hidden sm:block",
                    isCompleted && "text-green-600",
                    isCurrent && "text-blue-600",
                    !isCompleted && !isCurrent && "text-gray-400"
                  )}
                >
                  {s.label}
                </span>
              </div>

              {/* 연결선 */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-16 h-0.5 mx-2",
                    s.step < currentStep ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 모바일에서 현재 단계 표시 */}
      <div className="sm:hidden text-center mt-4">
        <p className="text-sm font-medium text-blue-600">
          {steps.find(s => s.step === currentStep)?.label}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {currentStep}/4 단계
        </p>
      </div>
    </div>
  );
}
