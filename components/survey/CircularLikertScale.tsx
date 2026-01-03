"use client";

import React, { useState, useEffect } from "react";

interface CircularLikertScaleProps {
  value: number | undefined;
  onChange: (score: number) => void;
  disabled?: boolean;
}

/**
 * 7점 척도 원형 버튼 컴포넌트
 *
 * 디자인 특징:
 * - 7개의 원형 버튼 (1-7점)
 * - 크기: 양끝이 크고, 가운데로 갈수록 작아짐
 * - 색상: 왼쪽(그렇다) 초록색 → 가운데 회색 → 오른쪽(그렇지 않다) 보라색
 * - 양 끝에만 텍스트 라벨 표시
 */
export default function CircularLikertScale({
  value,
  onChange,
  disabled = false,
}: CircularLikertScaleProps) {
  const scores = [1, 2, 3, 4, 5, 6, 7];
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's sm breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 각 점수별 원의 크기 (픽셀)
  // 모바일과 데스크톱에서 다른 크기 반환
  const getCircleSize = (score: number, isMobile: boolean = false): number => {
    const desktopSizes: Record<number, number> = {
      1: 64,  // 가장 큼 (그렇다)
      2: 52,
      3: 44,
      4: 40,  // 가운데 (보통이다)
      5: 44,
      6: 52,
      7: 64,  // 가장 큼 (그렇지 않다)
    };

    const mobileSizes: Record<number, number> = {
      1: 48,  // 모바일에서는 작게
      2: 40,
      3: 34,
      4: 32,
      5: 34,
      6: 40,
      7: 48,
    };

    return isMobile ? (mobileSizes[score] || 32) : (desktopSizes[score] || 40);
  };

  // 각 점수별 색상 (테두리 & 선택 시 배경)
  const getCircleColor = (score: number): { border: string; bg: string; hover: string; ring: string } => {
    if (score <= 2) {
      // 왼쪽: 붉은색 계열 (그렇다)
      return {
        border: "border-red-400",
        bg: "bg-red-400",
        hover: "hover:border-red-500",
        ring: "ring-red-300",
      };
    } else if (score === 3) {
      // 약간 그렇다: 연한 붉은색
      return {
        border: "border-red-300",
        bg: "bg-red-300",
        hover: "hover:border-red-400",
        ring: "ring-red-200",
      };
    } else if (score === 4) {
      // 가운데: 회색 (보통이다)
      return {
        border: "border-gray-300",
        bg: "bg-gray-300",
        hover: "hover:border-gray-400",
        ring: "ring-gray-200",
      };
    } else if (score === 5) {
      // 약간 그렇지 않다: 연한 푸른색
      return {
        border: "border-blue-300",
        bg: "bg-blue-300",
        hover: "hover:border-blue-400",
        ring: "ring-blue-200",
      };
    } else {
      // 오른쪽: 푸른색 계열 (그렇지 않다)
      return {
        border: "border-blue-400",
        bg: "bg-blue-400",
        hover: "hover:border-blue-500",
        ring: "ring-blue-300",
      };
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 원형 버튼들 */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
        {scores.map((score) => {
          const size = getCircleSize(score, isMobile);
          const colors = getCircleColor(score);
          const isSelected = value === score;

          return (
            <button
              key={score}
              type="button"
              onClick={() => !disabled && onChange(score)}
              disabled={disabled}
              className={`
                rounded-full border-4 sm:border-[5px] transition-all duration-200 flex-shrink-0
                ${colors.border}
                ${isSelected ? `${colors.bg} scale-110 shadow-2xl ring-2 ring-offset-2 ${colors.ring}` : "bg-white hover:scale-105 hover:shadow-md"}
                ${!disabled && colors.hover}
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              style={{
                width: `${size}px`,
                height: `${size}px`,
              }}
              aria-label={`${score}점`}
              aria-pressed={isSelected}
            >
            </button>
          );
        })}
      </div>

      {/* 양 끝 라벨 */}
      <div className="flex justify-between items-center px-1 sm:px-2 text-xs sm:text-sm">
        <span className="text-red-600 font-medium">그렇지 않다</span>
        <span className="text-blue-600 font-medium">그렇다</span>
      </div>
    </div>
  );
}
