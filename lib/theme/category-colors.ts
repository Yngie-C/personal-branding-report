import { SurveyCategory } from "@/types/survey";

/**
 * 카테고리별 색상 테마
 * 각 카테고리의 특성을 반영한 색상 시스템
 */
export interface CategoryTheme {
  primary: string; // Primary color class (e.g., 'red-600')
  secondary: string; // Secondary color class
  accent: string; // Accent color class
  bgVia: string; // Background via color (e.g., 'rgb(76 5 25)')
  gradient: string; // Gradient classes (e.g., 'from-red-600 to-rose-600')
  chartStart: string; // Chart gradient start color (hex)
  chartEnd: string; // Chart gradient end color (hex)
  textClass: string; // Text color class
  borderClass: string; // Border color class
  shadowClass: string; // Shadow color class
}

export const CategoryColorTheme: Record<SurveyCategory, CategoryTheme> = {
  [SurveyCategory.EXECUTION]: {
    primary: "red-600",
    secondary: "rose-700",
    accent: "pink-500",
    bgVia: "rgb(76 5 25)", // red-950
    gradient: "from-red-600 to-rose-600",
    chartStart: "#dc2626", // red-600
    chartEnd: "#e11d48", // rose-600
    textClass: "text-red-600",
    borderClass: "border-red-600",
    shadowClass: "shadow-red-600/30",
  },
  [SurveyCategory.INNOVATION]: {
    primary: "orange-600",
    secondary: "amber-600",
    accent: "yellow-500",
    bgVia: "rgb(67 20 7)", // orange-950
    gradient: "from-orange-600 to-amber-600",
    chartStart: "#ea580c", // orange-600
    chartEnd: "#d97706", // amber-600
    textClass: "text-orange-600",
    borderClass: "border-orange-600",
    shadowClass: "shadow-orange-600/30",
  },
  [SurveyCategory.INFLUENCE]: {
    primary: "amber-500",
    secondary: "yellow-600",
    accent: "orange-400",
    bgVia: "rgb(69 26 3)", // amber-950
    gradient: "from-amber-500 to-yellow-600",
    chartStart: "#f59e0b", // amber-500
    chartEnd: "#ca8a04", // yellow-600
    textClass: "text-amber-500",
    borderClass: "border-amber-500",
    shadowClass: "shadow-amber-500/30",
  },
  [SurveyCategory.COLLABORATION]: {
    primary: "emerald-600",
    secondary: "teal-600",
    accent: "green-500",
    bgVia: "rgb(2 44 34)", // emerald-950
    gradient: "from-emerald-600 to-teal-600",
    chartStart: "#059669", // emerald-600
    chartEnd: "#0d9488", // teal-600
    textClass: "text-emerald-600",
    borderClass: "border-emerald-600",
    shadowClass: "shadow-emerald-600/30",
  },
  [SurveyCategory.RESILIENCE]: {
    primary: "blue-600",
    secondary: "indigo-600",
    accent: "sky-500",
    bgVia: "rgb(23 37 84)", // blue-950
    gradient: "from-blue-600 to-indigo-600",
    chartStart: "#2563eb", // blue-600
    chartEnd: "#4f46e5", // indigo-600
    textClass: "text-blue-600",
    borderClass: "border-blue-600",
    shadowClass: "shadow-blue-600/30",
  },
};

/**
 * 카테고리에 맞는 테마 가져오기
 * @param category - SurveyCategory enum
 * @returns CategoryTheme object
 */
export function getCategoryTheme(category: SurveyCategory): CategoryTheme {
  return CategoryColorTheme[category];
}

/**
 * 배경 그라데이션 스타일 생성
 * @param category - SurveyCategory enum
 * @returns CSS style object for background gradient
 */
export function getCategoryBackgroundStyle(
  category: SurveyCategory
): React.CSSProperties {
  const theme = getCategoryTheme(category);
  return {
    backgroundImage: `linear-gradient(to bottom right, rgb(15 23 42), ${theme.bgVia}, rgb(15 23 42))`,
  };
}

/**
 * Progress bar 색상 가져오기
 * @param index - 순위 (0-based: 0=1위, 1=2위, ...)
 * @param topCategory - 1위 카테고리
 * @returns Tailwind color class
 *
 * NOTE: Tailwind requires static class strings for proper detection.
 * Do NOT use dynamic class composition like `bg-${variable}`.
 */
export function getProgressBarColor(
  index: number,
  topCategory: SurveyCategory
): string {
  if (index === 0) {
    // 1위: 카테고리별 정적 색상
    const categoryColors: Record<SurveyCategory, string> = {
      [SurveyCategory.EXECUTION]: "bg-red-600",
      [SurveyCategory.INNOVATION]: "bg-orange-600",
      [SurveyCategory.INFLUENCE]: "bg-amber-500",
      [SurveyCategory.COLLABORATION]: "bg-emerald-600",
      [SurveyCategory.RESILIENCE]: "bg-blue-600",
    };
    return categoryColors[topCategory];
  } else if (index === 1) {
    // 2위: 인디고
    return "bg-indigo-500";
  } else if (index === 2) {
    // 3위: 보라
    return "bg-purple-500";
  } else if (index === 3) {
    // 4위: 슬레이트
    return "bg-slate-500";
  } else {
    // 5위: 그레이
    return "bg-gray-400";
  }
}

/**
 * Rank badge 색상 가져오기
 * @param index - 순위 (0-based: 0=1위, 1=2위, ...)
 * @param topCategory - 1위 카테고리
 * @returns Tailwind color class
 *
 * NOTE: Tailwind requires static class strings for proper detection.
 * Do NOT use dynamic class composition like `bg-${variable}`.
 */
export function getRankBadgeColor(
  index: number,
  topCategory: SurveyCategory
): string {
  if (index === 0) {
    // 1위: 카테고리별 정적 색상
    const categoryColors: Record<SurveyCategory, string> = {
      [SurveyCategory.EXECUTION]: "bg-red-600",
      [SurveyCategory.INNOVATION]: "bg-orange-600",
      [SurveyCategory.INFLUENCE]: "bg-amber-500",
      [SurveyCategory.COLLABORATION]: "bg-emerald-600",
      [SurveyCategory.RESILIENCE]: "bg-blue-600",
    };
    return categoryColors[topCategory];
  } else if (index === 1) {
    // 2위: 인디고
    return "bg-indigo-500";
  } else if (index === 2) {
    // 3위: 보라
    return "bg-purple-500";
  } else if (index === 3) {
    // 4위: 슬레이트
    return "bg-slate-500";
  } else {
    // 5위: 그레이
    return "bg-gray-400";
  }
}
