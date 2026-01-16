"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, Loader2, Check, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Step Timeline Component
 * 단계 간 연결선 애니메이션이 있는 타임라인 컴포넌트
 */

export type StepStatus = "pending" | "in_progress" | "completed" | "failed";

export interface TimelineStep {
  /** 단계 라벨 */
  label: string;
  /** 단계 상태 */
  status: StepStatus;
  /** 부가 설명 (선택) */
  description?: string;
  /** 아이콘 (선택, 커스텀) */
  icon?: React.ReactNode;
}

const timelineVariants = cva("", {
  variants: {
    orientation: {
      vertical: "flex flex-col",
      horizontal: "flex flex-row items-start",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    orientation: "vertical",
    size: "md",
  },
});

export interface StepTimelineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof timelineVariants> {
  /** 단계 배열 */
  steps: TimelineStep[];
  /** 현재 단계 인덱스 (0-indexed) */
  currentStep: number;
  /** 방향 */
  orientation?: "vertical" | "horizontal";
  /** 크기 */
  size?: "sm" | "md" | "lg";
  /** 애니메이션 활성화 */
  animated?: boolean;
  /** 연결선 표시 여부 */
  showConnector?: boolean;
  /** 설명 표시 여부 */
  showDescription?: boolean;
}

const sizeConfig = {
  sm: {
    iconSize: "w-6 h-6",
    iconInnerSize: "w-3 h-3",
    labelSize: "text-xs",
    descSize: "text-[10px]",
    connectorWidth: "w-0.5",
    connectorHeight: "h-0.5",
    gap: "gap-2",
    stepGap: "gap-3",
  },
  md: {
    iconSize: "w-8 h-8",
    iconInnerSize: "w-4 h-4",
    labelSize: "text-sm",
    descSize: "text-xs",
    connectorWidth: "w-0.5",
    connectorHeight: "h-0.5",
    gap: "gap-3",
    stepGap: "gap-4",
  },
  lg: {
    iconSize: "w-10 h-10",
    iconInnerSize: "w-5 h-5",
    labelSize: "text-base",
    descSize: "text-sm",
    connectorWidth: "w-1",
    connectorHeight: "h-1",
    gap: "gap-4",
    stepGap: "gap-5",
  },
};

const statusColorConfig: Record<StepStatus, { bg: string; text: string; ring: string }> = {
  pending: {
    bg: "bg-gray-200",
    text: "text-gray-400",
    ring: "",
  },
  in_progress: {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
    ring: "ring-4 ring-indigo-100",
  },
  completed: {
    bg: "bg-green-500",
    text: "text-white",
    ring: "",
  },
  failed: {
    bg: "bg-red-500",
    text: "text-white",
    ring: "",
  },
};

const StepIcon: React.FC<{
  status: StepStatus;
  size: "sm" | "md" | "lg";
  animated: boolean;
  customIcon?: React.ReactNode;
}> = ({ status, size, animated, customIcon }) => {
  const config = sizeConfig[size];
  const colorConfig = statusColorConfig[status];

  const iconClass = cn(
    "rounded-full flex items-center justify-center transition-all duration-300",
    config.iconSize,
    colorConfig.bg,
    colorConfig.ring
  );

  const renderIcon = () => {
    if (customIcon) return customIcon;

    const innerIconClass = cn(config.iconInnerSize, colorConfig.text);

    switch (status) {
      case "pending":
        return <Circle className={innerIconClass} />;

      case "in_progress":
        if (animated) {
          return (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className={innerIconClass} />
            </motion.div>
          );
        }
        return <Loader2 className={cn(innerIconClass, "animate-spin")} />;

      case "completed":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <Check className={innerIconClass} />
          </motion.div>
        );

      case "failed":
        return <X className={innerIconClass} />;

      default:
        return <Circle className={innerIconClass} />;
    }
  };

  if (animated && status === "in_progress") {
    return (
      <motion.div
        className={iconClass}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {renderIcon()}
      </motion.div>
    );
  }

  return <div className={iconClass}>{renderIcon()}</div>;
};

const Connector: React.FC<{
  orientation: "vertical" | "horizontal";
  size: "sm" | "md" | "lg";
  isCompleted: boolean;
  animated: boolean;
}> = ({ orientation, size, isCompleted, animated }) => {
  const config = sizeConfig[size];

  if (orientation === "vertical") {
    return (
      <div
        className={cn(
          "relative flex-shrink-0 mx-auto",
          config.connectorWidth,
          "h-6 bg-gray-200"
        )}
      >
        <motion.div
          className={cn(
            "absolute top-0 left-0 right-0",
            config.connectorWidth,
            isCompleted ? "bg-green-500" : "bg-gray-200"
          )}
          initial={{ height: 0 }}
          animate={{ height: isCompleted ? "100%" : 0 }}
          transition={{ duration: animated ? 0.3 : 0 }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex-shrink-0 my-auto",
        config.connectorHeight,
        "w-8 bg-gray-200"
      )}
    >
      <motion.div
        className={cn(
          "absolute top-0 left-0 bottom-0",
          config.connectorHeight,
          isCompleted ? "bg-green-500" : "bg-gray-200"
        )}
        initial={{ width: 0 }}
        animate={{ width: isCompleted ? "100%" : 0 }}
        transition={{ duration: animated ? 0.3 : 0 }}
      />
    </div>
  );
};

const StepTimeline = React.forwardRef<HTMLDivElement, StepTimelineProps>(
  (
    {
      className,
      steps,
      currentStep,
      orientation = "vertical",
      size = "md",
      animated = true,
      showConnector = true,
      showDescription = true,
      ...props
    },
    ref
  ) => {
    const config = sizeConfig[size];

    return (
      <div
        ref={ref}
        className={cn(
          timelineVariants({ orientation, size }),
          config.stepGap,
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.status === "completed";
          const isCurrent = index === currentStep;

          return (
            <React.Fragment key={index}>
              <div
                className={cn(
                  "flex",
                  orientation === "vertical" ? "flex-row items-start" : "flex-col items-center",
                  config.gap
                )}
              >
                {/* 아이콘 */}
                <StepIcon
                  status={step.status}
                  size={size}
                  animated={animated}
                  customIcon={step.icon}
                />

                {/* 라벨 및 설명 */}
                <div
                  className={cn(
                    orientation === "vertical" ? "pt-1" : "pt-2 text-center",
                    "min-w-0"
                  )}
                >
                  <p
                    className={cn(
                      "font-medium transition-colors duration-300",
                      config.labelSize,
                      step.status === "completed"
                        ? "text-green-700"
                        : step.status === "in_progress"
                        ? "text-indigo-700"
                        : step.status === "failed"
                        ? "text-red-700"
                        : "text-gray-500"
                    )}
                  >
                    {step.label}
                  </p>
                  {showDescription && step.description && (
                    <p
                      className={cn(
                        "text-gray-400 mt-0.5",
                        config.descSize,
                        orientation === "horizontal" && "max-w-[100px]"
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* 연결선 */}
              {showConnector && !isLast && (
                <Connector
                  orientation={orientation}
                  size={size}
                  isCompleted={isCompleted}
                  animated={animated}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

StepTimeline.displayName = "StepTimeline";

/**
 * 간소화된 타임라인 (라벨만)
 */
export interface SimpleTimelineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  steps: string[];
  currentStep: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const SimpleTimeline = React.forwardRef<HTMLDivElement, SimpleTimelineProps>(
  ({ className, steps, currentStep, size = "md", animated = true, ...props }, ref) => {
    const config = sizeConfig[size];

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between", className)}
        {...props}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              {/* 단계 */}
              <div className="flex items-center gap-2">
                <motion.div
                  className={cn(
                    "rounded-full flex items-center justify-center font-semibold",
                    config.iconSize,
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-indigo-500 text-white ring-4 ring-indigo-100"
                      : "bg-gray-200 text-gray-500"
                  )}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? (
                    <Check className={config.iconInnerSize} />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </motion.div>
                <span
                  className={cn(
                    "font-medium hidden sm:block",
                    config.labelSize,
                    isCompleted
                      ? "text-green-700"
                      : isCurrent
                      ? "text-indigo-700"
                      : "text-gray-400"
                  )}
                >
                  {step}
                </span>
              </div>

              {/* 연결선 */}
              {!isLast && (
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className="relative h-0.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-green-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: isCompleted ? "100%" : isCurrent ? "50%" : "0%",
                      }}
                      transition={{ duration: animated ? 0.4 : 0, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

SimpleTimeline.displayName = "SimpleTimeline";

/**
 * 컴팩트 타임라인 (그리드 레이아웃)
 */
export interface CompactTimelineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  steps: Array<{
    label: string;
    status: StepStatus;
  }>;
  columns?: 2 | 3 | 4 | 5;
  animated?: boolean;
}

const columnConfig = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-5",
};

const CompactTimeline = React.forwardRef<HTMLDivElement, CompactTimelineProps>(
  ({ className, steps, columns = 5, animated = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid gap-3", columnConfig[columns], className)}
        {...props}
      >
        {steps.map((step, index) => {
          const colorConfig = statusColorConfig[step.status];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-3 rounded-lg border transition-colors duration-300",
                step.status === "completed"
                  ? "bg-green-50 border-green-200"
                  : step.status === "in_progress"
                  ? "bg-indigo-50 border-indigo-200"
                  : step.status === "failed"
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <StepIcon
                  status={step.status}
                  size="sm"
                  animated={animated}
                />
                <span className="text-xs font-medium text-gray-600">
                  Step {index + 1}
                </span>
              </div>
              <p
                className={cn(
                  "text-xs truncate",
                  step.status === "completed"
                    ? "text-green-700"
                    : step.status === "in_progress"
                    ? "text-indigo-700"
                    : step.status === "failed"
                    ? "text-red-700"
                    : "text-gray-400"
                )}
                title={step.label}
              >
                {step.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    );
  }
);

CompactTimeline.displayName = "CompactTimeline";

export { StepTimeline, SimpleTimeline, CompactTimeline, timelineVariants };
