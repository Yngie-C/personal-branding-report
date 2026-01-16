"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type Transition } from "framer-motion";
import { Circle, Loader2, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Status Badge Component
 * 4가지 상태를 표시하는 재사용 가능한 배지 컴포넌트
 */

export type StatusType = "pending" | "in_progress" | "completed" | "failed";

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 font-medium rounded-full transition-all",
  {
    variants: {
      status: {
        pending: "bg-gray-100 text-gray-600 border border-gray-200",
        in_progress: "bg-indigo-100 text-indigo-700 border border-indigo-200",
        completed: "bg-green-100 text-green-700 border border-green-200",
        failed: "bg-red-100 text-red-700 border border-red-200",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1",
        lg: "text-base px-3 py-1.5",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "md",
    },
  }
);

const iconSizeMap = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof statusBadgeVariants> {
  /** 상태 타입 */
  status: StatusType;
  /** 배지 크기 */
  size?: "sm" | "md" | "lg";
  /** 애니메이션 활성화 (in_progress 상태에서 펄스) */
  animated?: boolean;
  /** 아이콘 표시 여부 */
  showIcon?: boolean;
  /** 커스텀 라벨 (미지정시 기본 한글 라벨 사용) */
  label?: string;
}

const statusLabels: Record<StatusType, string> = {
  pending: "대기 중",
  in_progress: "진행 중",
  completed: "완료",
  failed: "실패",
};

const StatusIcon: React.FC<{
  status: StatusType;
  size: "sm" | "md" | "lg";
  animated: boolean;
}> = ({ status, size, animated }) => {
  const iconClass = iconSizeMap[size];

  switch (status) {
    case "pending":
      return <Clock className={cn(iconClass, "text-gray-500")} />;

    case "in_progress":
      if (animated) {
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className={cn(iconClass, "text-indigo-600")} />
          </motion.div>
        );
      }
      return (
        <Loader2 className={cn(iconClass, "text-indigo-600 animate-spin")} />
      );

    case "completed":
      return <Check className={cn(iconClass, "text-green-600")} />;

    case "failed":
      return <X className={cn(iconClass, "text-red-600")} />;

    default:
      return <Circle className={cn(iconClass, "text-gray-400")} />;
  }
};

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      className,
      status,
      size = "md",
      animated = true,
      showIcon = true,
      label,
      ...props
    },
    ref
  ) => {
    const displayLabel = label || statusLabels[status];
    const badgeClassName = cn(statusBadgeVariants({ status, size }), className);

    const content = (
      <>
        {showIcon && (
          <StatusIcon status={status} size={size} animated={animated} />
        )}
        <span>{displayLabel}</span>
      </>
    );

    // in_progress 상태에서 펄스 애니메이션
    if (animated && status === "in_progress") {
      const pulseTransition: Transition = {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      };
      return (
        <motion.span
          ref={ref}
          className={badgeClassName}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={pulseTransition}
        >
          {content}
        </motion.span>
      );
    }

    return (
      <span ref={ref} className={badgeClassName} {...props}>
        {content}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

/**
 * 간단한 상태 점 표시기
 * 아이콘 없이 점만 표시
 */
export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const dotSizeMap = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

const dotColorMap: Record<StatusType, string> = {
  pending: "bg-gray-400",
  in_progress: "bg-indigo-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, status, size = "md", animated = true, ...props }, ref) => {
    const dotClass = cn(
      "rounded-full inline-block",
      dotSizeMap[size],
      dotColorMap[status],
      className
    );

    if (animated && status === "in_progress") {
      const dotTransition: Transition = {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      };
      return (
        <motion.span
          ref={ref}
          className={dotClass}
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={dotTransition}
        />
      );
    }

    return <span ref={ref} className={dotClass} {...props} />;
  }
);

StatusDot.displayName = "StatusDot";

/**
 * 아이콘만 표시하는 상태 표시기
 */
export interface StatusIconOnlyProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const iconOnlySizeMap = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const iconOnlyColorMap: Record<StatusType, string> = {
  pending: "text-gray-400 bg-gray-100",
  in_progress: "text-indigo-600 bg-indigo-100",
  completed: "text-green-600 bg-green-100",
  failed: "text-red-600 bg-red-100",
};

const StatusIconOnly = React.forwardRef<HTMLDivElement, StatusIconOnlyProps>(
  ({ className, status, size = "md", animated = true, ...props }, ref) => {
    const containerClass = cn(
      "rounded-full flex items-center justify-center",
      iconOnlySizeMap[size],
      iconOnlyColorMap[status],
      className
    );

    const iconSizeClass =
      size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5";

    const getIcon = () => {
      switch (status) {
        case "pending":
          return <Clock className={iconSizeClass} />;
        case "in_progress":
          return (
            <Loader2 className={cn(iconSizeClass, animated && "animate-spin")} />
          );
        case "completed":
          return <Check className={iconSizeClass} />;
        case "failed":
          return <X className={iconSizeClass} />;
        default:
          return <Circle className={iconSizeClass} />;
      }
    };

    if (animated && status === "in_progress") {
      const iconTransition: Transition = {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      };
      return (
        <motion.div
          ref={ref}
          className={containerClass}
          animate={{ scale: [1, 1.05, 1] }}
          transition={iconTransition}
        >
          {getIcon()}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={containerClass} {...props}>
        {getIcon()}
      </div>
    );
  }
);

StatusIconOnly.displayName = "StatusIconOnly";

export { StatusBadge, StatusDot, StatusIconOnly, statusBadgeVariants };
