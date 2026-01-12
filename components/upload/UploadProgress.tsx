"use client";

import { CheckCircle, Loader2, AlertCircle, Upload, FileSearch, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'completed' | 'error';

interface UploadProgressProps {
  status: UploadStatus;
  uploadProgress?: number;  // 0-100 (uploading 상태일 때)
  errorMessage?: string;
  className?: string;
}

const steps = [
  { key: 'uploading', label: '업로드', icon: Upload },
  { key: 'parsing', label: '분석', icon: FileSearch },
  { key: 'completed', label: '완료', icon: FileCheck },
];

export default function UploadProgress({
  status,
  uploadProgress = 0,
  errorMessage,
  className,
}: UploadProgressProps) {
  if (status === 'idle') return null;

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'uploading': return 0;
      case 'parsing': return 1;
      case 'completed': return 2;
      case 'error': return -1;
      default: return -1;
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  if (status === 'error') {
    return (
      <div className={cn("p-4 bg-red-50 border border-red-200 rounded-xl", className)}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">오류 발생</p>
            <p className="text-sm text-red-600">{errorMessage || '알 수 없는 오류가 발생했습니다.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl", className)}>
      {/* 단계 표시 */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center">
              {/* 단계 아이콘 */}
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                isCompleted && "bg-green-500 text-white",
                isCurrent && "bg-blue-500 text-white",
                !isCompleted && !isCurrent && "bg-gray-200 text-gray-400"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* 단계 라벨 */}
              <span className={cn(
                "ml-2 text-sm font-medium",
                isCompleted && "text-green-700",
                isCurrent && "text-blue-700",
                !isCompleted && !isCurrent && "text-gray-400"
              )}>
                {step.label}
              </span>

              {/* 연결선 */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-3",
                  index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* 진행률 바 (업로드 중일 때만) */}
      {status === 'uploading' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>파일 업로드 중...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* 상태 메시지 */}
      <div className="text-center">
        {status === 'uploading' && (
          <p className="text-sm text-gray-600">파일을 업로드하고 있습니다...</p>
        )}
        {status === 'parsing' && (
          <div>
            <p className="text-sm text-gray-700 font-medium">AI가 이력서를 분석하고 있습니다</p>
            <p className="text-xs text-gray-500 mt-1">약 10-20초 정도 소요됩니다</p>
          </div>
        )}
        {status === 'completed' && (
          <p className="text-sm text-green-700 font-medium">분석이 완료되었습니다!</p>
        )}
      </div>
    </div>
  );
}
