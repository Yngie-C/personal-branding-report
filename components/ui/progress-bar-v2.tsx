"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Progress Bar V2 Component
 * 단계 마커와 그라데이션을 지원하는 진행률 바
 */

const progressBarVariants = cva(
  "w-full overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-1",
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
        xl: "h-5",
      },
      variant: {
        default: "bg-gray-200",
        subtle: "bg-gray-100",
        dark: "bg-gray-700",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export type ColorScheme =
  | "indigo"
  | "purple"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "gradient"
  | "gradient-purple"
  | "gradient-green"
  | "gradient-amber";

const colorSchemeMap: Record<ColorScheme, string> = {
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  gradient: "bg-gradient-to-r from-indigo-500 to-purple-500",
  "gradient-purple": "bg-gradient-to-r from-purple-500 to-pink-500",
  "gradient-green": "bg-gradient-to-r from-green-500 to-emerald-500",
  "gradient-amber": "bg-gradient-to-r from-amber-500 to-orange-500",
};

export interface ProgressBarV2Props
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof progressBarVariants> {
  /** 현재 값 */
  value: number;
  /** 최대 값 (기본: 100) */
  max?: number;
  /** 단계 마커 표시 여부 */
  showSteps?: boolean;
  /** 단계 개수 (showSteps가 true일 때 사용) */
  stepCount?: number;
  /** 퍼센트 표시 여부 */
  showPercent?: boolean;
  /** 색상 스킴 */
  colorScheme?: ColorScheme;
  /** 애니메이션 활성화 */
  animated?: boolean;
  /** 애니메이션 지속 시간 (초) */
  animationDuration?: number;
  /** 라벨 (진행률 바 위에 표시) */
  label?: string;
  /** 현재 단계 라벨 (진행률 바 아래에 표시) */
  stepLabel?: string;
}

const ProgressBarV2 = React.forwardRef<HTMLDivElement, ProgressBarV2Props>(
  (
    {
      className,
      value,
      max = 100,
      size = "md",
      variant = "default",
      showSteps = false,
      stepCount = 5,
      showPercent = false,
      colorScheme = "gradient",
      animated = true,
      animationDuration = 0.5,
      label,
      stepLabel,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const progressColorClass = colorSchemeMap[colorScheme];

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* 상단 라벨/퍼센트 */}
        {(label || showPercent) && (
          <div className="flex justify-between items-center mb-1.5">
            {label && (
              <span className="text-sm font-medium text-gray-700">{label}</span>
            )}
            {showPercent && (
              <span className="text-sm font-bold text-indigo-600">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        {/* 진행률 바 컨테이너 */}
        <div className="relative">
          {/* 배경 바 */}
          <div className={cn(progressBarVariants({ size, variant }))}>
            {/* 진행률 바 */}
            {animated ? (
              <motion.div
                className={cn("h-full rounded-full", progressColorClass)}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{
                  duration: animationDuration,
                  ease: "easeOut",
                }}
              />
            ) : (
              <div
                className={cn("h-full rounded-full", progressColorClass)}
                style={{ width: `${percentage}%` }}
              />
            )}
          </div>

          {/* 단계 마커 */}
          {showSteps && stepCount > 1 && (
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
              {Array.from({ length: stepCount + 1 }).map((_, index) => {
                const stepPercentage = (index / stepCount) * 100;
                const isCompleted = percentage >= stepPercentage;
                const isCurrent =
                  percentage >= stepPercentage &&
                  percentage < ((index + 1) / stepCount) * 100;

                // 첫 번째와 마지막 마커는 표시하지 않음
                if (index === 0 || index === stepCount) return null;

                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{ left: `${stepPercentage}%` }}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full transform -translate-x-1/2 transition-colors duration-300",
                        isCompleted
                          ? "bg-white shadow-sm"
                          : isCurrent
                          ? "bg-white/80"
                          : "bg-gray-400/50"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 하단 단계 라벨 */}
        {stepLabel && (
          <p className="text-sm text-gray-500 mt-1.5 text-center">{stepLabel}</p>
        )}
      </div>
    );
  }
);

ProgressBarV2.displayName = "ProgressBarV2";

/**
 * 단계가 있는 진행률 바
 * 각 단계별 상태를 표시
 */
export interface SteppedProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 단계 정보 배열 */
  steps: Array<{
    label: string;
    status: "pending" | "in_progress" | "completed";
  }>;
  /** 현재 단계 (0-indexed) */
  currentStep: number;
  /** 크기 */
  size?: "sm" | "md" | "lg";
  /** 색상 스킴 */
  colorScheme?: ColorScheme;
  /** 애니메이션 활성화 */
  animated?: boolean;
  /** 단계 번호 표시 여부 */
  showStepNumbers?: boolean;
}

const steppedSizeMap = {
  sm: {
    bar: "h-1",
    dot: "w-4 h-4 text-[10px]",
    label: "text-xs",
  },
  md: {
    bar: "h-1.5",
    dot: "w-6 h-6 text-xs",
    label: "text-sm",
  },
  lg: {
    bar: "h-2",
    dot: "w-8 h-8 text-sm",
    label: "text-base",
  },
};

const SteppedProgressBar = React.forwardRef<HTMLDivElement, SteppedProgressBarProps>(
  (
    {
      className,
      steps,
      currentStep,
      size = "md",
      colorScheme = "indigo",
      animated = true,
      showStepNumbers = true,
      ...props
    },
    ref
  ) => {
    const sizeClasses = steppedSizeMap[size];
    const solidColorClass = colorSchemeMap[colorScheme].startsWith("bg-gradient")
      ? "bg-indigo-500"
      : colorSchemeMap[colorScheme];

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="relative flex items-center justify-between">
          {/* 연결선 (배경) */}
          <div
            className={cn(
              "absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-gray-200",
              sizeClasses.bar
            )}
            style={{ zIndex: 0 }}
          />

          {/* 연결선 (진행) */}
          <motion.div
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2",
              sizeClasses.bar,
              solidColorClass
            )}
            initial={{ width: 0 }}
            animate={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
            transition={{
              duration: animated ? 0.5 : 0,
              ease: "easeOut",
            }}
            style={{ zIndex: 1 }}
          />

          {/* 단계 점들 */}
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={index}
                className="relative flex flex-col items-center"
                style={{ zIndex: 2 }}
              >
                {/* 단계 점 */}
                <motion.div
                  className={cn(
                    "rounded-full flex items-center justify-center font-medium transition-colors duration-300",
                    sizeClasses.dot,
                    isCompleted
                      ? `${solidColorClass} text-white`
                      : isCurrent
                      ? `${solidColorClass} text-white ring-4 ring-indigo-100`
                      : "bg-gray-200 text-gray-500"
                  )}
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {showStepNumbers && index + 1}
                </motion.div>

                {/* 단계 라벨 */}
                <span
                  className={cn(
                    "absolute top-full mt-2 whitespace-nowrap font-medium",
                    sizeClasses.label,
                    isCompleted
                      ? "text-indigo-600"
                      : isCurrent
                      ? "text-indigo-700"
                      : "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

SteppedProgressBar.displayName = "SteppedProgressBar";

/**
 * 원형 진행률 표시기
 */
export interface CircularProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 현재 값 */
  value: number;
  /** 최대 값 (기본: 100) */
  max?: number;
  /** 크기 (픽셀) */
  size?: number;
  /** 스트로크 두께 */
  strokeWidth?: number;
  /** 색상 스킴 */
  colorScheme?: ColorScheme;
  /** 퍼센트 표시 여부 */
  showPercent?: boolean;
  /** 애니메이션 활성화 */
  animated?: boolean;
  /** 내부 컨텐츠 */
  children?: React.ReactNode;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      size = 80,
      strokeWidth = 8,
      colorScheme = "gradient",
      showPercent = true,
      animated = true,
      children,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // 그라데이션 ID 생성
    const gradientId = React.useId();

    // 색상 결정
    const isGradient = colorScheme.startsWith("gradient");
    const gradientColors = {
      gradient: ["#6366f1", "#a855f7"],
      "gradient-purple": ["#a855f7", "#ec4899"],
      "gradient-green": ["#22c55e", "#10b981"],
      "gradient-amber": ["#f59e0b", "#f97316"],
    };

    const solidColors: Record<string, string> = {
      indigo: "#6366f1",
      purple: "#a855f7",
      blue: "#3b82f6",
      green: "#22c55e",
      amber: "#f59e0b",
      red: "#ef4444",
    };

    const strokeColor = isGradient
      ? `url(#${gradientId})`
      : solidColors[colorScheme] || "#6366f1";

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* 그라데이션 정의 */}
          {isGradient && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  offset="0%"
                  stopColor={
                    gradientColors[colorScheme as keyof typeof gradientColors]?.[0] ||
                    "#6366f1"
                  }
                />
                <stop
                  offset="100%"
                  stopColor={
                    gradientColors[colorScheme as keyof typeof gradientColors]?.[1] ||
                    "#a855f7"
                  }
                />
              </linearGradient>
            </defs>
          )}

          {/* 배경 원 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />

          {/* 진행 원 */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: animated ? 0.8 : 0,
              ease: "easeOut",
            }}
          />
        </svg>

        {/* 중앙 컨텐츠 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (showPercent && (
            <span className="text-lg font-bold text-gray-800">
              {Math.round(percentage)}%
            </span>
          ))}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

export { ProgressBarV2, SteppedProgressBar, CircularProgress, progressBarVariants };
