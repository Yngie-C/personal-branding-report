'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

type Grade = 'basic' | 'good' | 'excellent' | 'outstanding';
type Size = 'sm' | 'md' | 'lg';

interface CompletionScoreProps {
  /** Score value from 0 to 100 */
  score: number;
  /** Grade level based on score */
  grade: Grade;
  /** Size of the component */
  size?: Size;
  /** Whether to show the grade badge */
  showBadge?: boolean;
  /** Whether to animate the score on change */
  animated?: boolean;
  /** Optional className for the container */
  className?: string;
}

/**
 * CompletionScore Component
 *
 * Displays a circular gauge showing answer completion score.
 * Includes a grade badge (optional) indicating quality level.
 *
 * Grade levels:
 * - basic: 0-50 (red)
 * - good: 51-70 (yellow)
 * - excellent: 71-90 (blue)
 * - outstanding: 91-100 (green)
 *
 * @example
 * <CompletionScore score={75} grade="excellent" size="md" showBadge />
 */
export function CompletionScore({
  score,
  grade,
  size = 'md',
  showBadge = true,
  animated = true,
  className = '',
}: CompletionScoreProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      containerSize: 48,
      strokeWidth: 3,
      fontSize: 'text-xs',
      badgeSize: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      containerSize: 64,
      strokeWidth: 4,
      fontSize: 'text-sm',
      badgeSize: 'text-xs px-2 py-0.5',
    },
    lg: {
      containerSize: 80,
      strokeWidth: 5,
      fontSize: 'text-base',
      badgeSize: 'text-sm px-2.5 py-1',
    },
  };

  const config = sizeConfig[size];
  const radius = (config.containerSize - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash offset for the progress
  const strokeDashoffset = useMemo(() => {
    const clampedScore = Math.max(0, Math.min(100, score));
    return circumference - (clampedScore / 100) * circumference;
  }, [score, circumference]);

  // Color configuration based on grade
  const gradeColors = {
    basic: {
      stroke: '#ef4444', // red-500
      bg: 'bg-red-50',
      text: 'text-red-600',
      badge: 'bg-red-100 text-red-700 border-red-200',
    },
    good: {
      stroke: '#ca8a04', // yellow-600
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    excellent: {
      stroke: '#2563eb', // blue-600
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    outstanding: {
      stroke: '#16a34a', // green-600
      bg: 'bg-green-50',
      text: 'text-green-600',
      badge: 'bg-green-100 text-green-700 border-green-200',
    },
  };

  const colors = gradeColors[grade];

  // Grade display text in Korean
  const gradeText = {
    basic: '기초',
    good: '양호',
    excellent: '우수',
    outstanding: '탁월',
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Circular Gauge */}
      <div
        className="relative"
        style={{
          width: config.containerSize,
          height: config.containerSize,
        }}
      >
        <svg
          className="transform -rotate-90"
          width={config.containerSize}
          height={config.containerSize}
        >
          {/* Background circle */}
          <circle
            cx={config.containerSize / 2}
            cy={config.containerSize / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={config.containerSize / 2}
            cy={config.containerSize / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animated ? { strokeDashoffset: circumference } : false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Score text in center */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${config.fontSize} font-bold ${colors.text}`}
        >
          {animated ? (
            <motion.span
              key={score}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {Math.round(score)}
            </motion.span>
          ) : (
            <span>{Math.round(score)}</span>
          )}
        </div>
      </div>

      {/* Grade Badge */}
      {showBadge && (
        <motion.span
          key={grade}
          initial={animated ? { opacity: 0, y: -5 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`${config.badgeSize} ${colors.badge} border rounded-full font-medium`}
        >
          {gradeText[grade]}
        </motion.span>
      )}
    </div>
  );
}

/**
 * CompletionScoreInline Component
 *
 * A more compact inline version of the score display.
 * Shows score and grade in a horizontal layout.
 *
 * @example
 * <CompletionScoreInline score={85} grade="excellent" />
 */
interface CompletionScoreInlineProps {
  score: number;
  grade: Grade;
  className?: string;
}

export function CompletionScoreInline({
  score,
  grade,
  className = '',
}: CompletionScoreInlineProps) {
  const gradeColors = {
    basic: 'text-red-600 bg-red-50 border-red-200',
    good: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    excellent: 'text-blue-600 bg-blue-50 border-blue-200',
    outstanding: 'text-green-600 bg-green-50 border-green-200',
  };

  const gradeText = {
    basic: '기초',
    good: '양호',
    excellent: '우수',
    outstanding: '탁월',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${gradeColors[grade]} ${className}`}
    >
      <span className="font-bold">{Math.round(score)}점</span>
      <span className="text-sm font-medium">{gradeText[grade]}</span>
    </div>
  );
}

/**
 * ScoreProgressBar Component
 *
 * A horizontal progress bar alternative to the circular gauge.
 *
 * @example
 * <ScoreProgressBar score={75} grade="excellent" />
 */
interface ScoreProgressBarProps {
  score: number;
  grade: Grade;
  showLabel?: boolean;
  className?: string;
}

export function ScoreProgressBar({
  score,
  grade,
  showLabel = true,
  className = '',
}: ScoreProgressBarProps) {
  const gradeColors = {
    basic: 'bg-red-500',
    good: 'bg-yellow-500',
    excellent: 'bg-blue-500',
    outstanding: 'bg-green-500',
  };

  const gradeText = {
    basic: '기초',
    good: '양호',
    excellent: '우수',
    outstanding: '탁월',
  };

  const gradeTextColors = {
    basic: 'text-red-600',
    good: 'text-yellow-600',
    excellent: 'text-blue-600',
    outstanding: 'text-green-600',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className={`text-xs font-medium ${gradeTextColors[grade]}`}>
            {gradeText[grade]}
          </span>
          <span className={`text-xs font-bold ${gradeTextColors[grade]}`}>
            {Math.round(score)}점
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${gradeColors[grade]}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, score)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
