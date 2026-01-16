/**
 * Report Styles - PDF 전용 스타일 시스템
 * PDF 생성 및 리포트 렌더링에 사용되는 색상, 스타일 프리셋
 */

import { DesignTokens } from "@/lib/design-tokens";

/**
 * PDF 전용 색상 팔레트
 * RGB 값으로 정의 (PDF 라이브러리 호환용)
 */
export const pdfColors = {
  // 프라이머리 색상
  primary: {
    50: { r: 238, g: 242, b: 255 },   // indigo-50
    100: { r: 224, g: 231, b: 255 },  // indigo-100
    200: { r: 199, g: 210, b: 254 },  // indigo-200
    300: { r: 165, g: 180, b: 252 },  // indigo-300
    400: { r: 129, g: 140, b: 248 },  // indigo-400
    500: { r: 99, g: 102, b: 241 },   // indigo-500
    600: { r: 79, g: 70, b: 229 },    // indigo-600
    700: { r: 67, g: 56, b: 202 },    // indigo-700
    800: { r: 55, g: 48, b: 163 },    // indigo-800
    900: { r: 49, g: 46, b: 129 },    // indigo-900
  },

  // 상태 색상
  status: {
    pending: { r: 156, g: 163, b: 175 },    // gray-400
    inProgress: { r: 99, g: 102, b: 241 },  // indigo-500
    completed: { r: 34, g: 197, b: 94 },    // green-500
    failed: { r: 239, g: 68, b: 68 },       // red-500
  },

  // 텍스트 색상
  text: {
    primary: { r: 17, g: 24, b: 39 },      // gray-900
    secondary: { r: 75, g: 85, b: 99 },    // gray-600
    muted: { r: 156, g: 163, b: 175 },     // gray-400
    inverse: { r: 255, g: 255, b: 255 },   // white
  },

  // 배경 색상
  background: {
    white: { r: 255, g: 255, b: 255 },
    light: { r: 249, g: 250, b: 251 },     // gray-50
    subtle: { r: 243, g: 244, b: 246 },    // gray-100
    muted: { r: 229, g: 231, b: 235 },     // gray-200
  },

  // 카테고리별 색상 (PSA 5개 카테고리)
  category: {
    innovation: { r: 234, g: 88, b: 12 },     // orange-600
    execution: { r: 220, g: 38, b: 38 },      // red-600
    influence: { r: 245, g: 158, b: 11 },     // amber-500
    collaboration: { r: 5, g: 150, b: 105 },  // emerald-600
    resilience: { r: 37, g: 99, b: 235 },     // blue-600
  },

  // 그라데이션 색상
  gradient: {
    primary: {
      start: { r: 99, g: 102, b: 241 },   // indigo-500
      end: { r: 168, g: 85, b: 247 },     // purple-500
    },
    success: {
      start: { r: 34, g: 197, b: 94 },    // green-500
      end: { r: 16, g: 185, b: 129 },     // emerald-500
    },
    warning: {
      start: { r: 245, g: 158, b: 11 },   // amber-500
      end: { r: 249, g: 115, b: 22 },     // orange-500
    },
  },
} as const;

export type PDFColorKey = keyof typeof pdfColors;
export type RGBColor = { r: number; g: number; b: number };

/**
 * Tailwind 색상 클래스를 RGB 값으로 변환
 * @param tailwindColor - Tailwind 색상 클래스 (예: 'indigo-600', 'red-500')
 * @returns RGB 객체 또는 null
 */
export function tailwindToRgb(tailwindColor: string): RGBColor | null {
  const colorMap: Record<string, RGBColor> = {
    // Gray
    "gray-50": { r: 249, g: 250, b: 251 },
    "gray-100": { r: 243, g: 244, b: 246 },
    "gray-200": { r: 229, g: 231, b: 235 },
    "gray-300": { r: 209, g: 213, b: 219 },
    "gray-400": { r: 156, g: 163, b: 175 },
    "gray-500": { r: 107, g: 114, b: 128 },
    "gray-600": { r: 75, g: 85, b: 99 },
    "gray-700": { r: 55, g: 65, b: 81 },
    "gray-800": { r: 31, g: 41, b: 55 },
    "gray-900": { r: 17, g: 24, b: 39 },

    // Slate
    "slate-50": { r: 248, g: 250, b: 252 },
    "slate-100": { r: 241, g: 245, b: 249 },
    "slate-200": { r: 226, g: 232, b: 240 },
    "slate-300": { r: 203, g: 213, b: 225 },
    "slate-400": { r: 148, g: 163, b: 184 },
    "slate-500": { r: 100, g: 116, b: 139 },
    "slate-600": { r: 71, g: 85, b: 105 },
    "slate-700": { r: 51, g: 65, b: 85 },
    "slate-800": { r: 30, g: 41, b: 59 },
    "slate-900": { r: 15, g: 23, b: 42 },

    // Indigo
    "indigo-50": { r: 238, g: 242, b: 255 },
    "indigo-100": { r: 224, g: 231, b: 255 },
    "indigo-200": { r: 199, g: 210, b: 254 },
    "indigo-300": { r: 165, g: 180, b: 252 },
    "indigo-400": { r: 129, g: 140, b: 248 },
    "indigo-500": { r: 99, g: 102, b: 241 },
    "indigo-600": { r: 79, g: 70, b: 229 },
    "indigo-700": { r: 67, g: 56, b: 202 },
    "indigo-800": { r: 55, g: 48, b: 163 },
    "indigo-900": { r: 49, g: 46, b: 129 },

    // Purple
    "purple-50": { r: 250, g: 245, b: 255 },
    "purple-100": { r: 243, g: 232, b: 255 },
    "purple-200": { r: 233, g: 213, b: 255 },
    "purple-300": { r: 216, g: 180, b: 254 },
    "purple-400": { r: 192, g: 132, b: 252 },
    "purple-500": { r: 168, g: 85, b: 247 },
    "purple-600": { r: 147, g: 51, b: 234 },
    "purple-700": { r: 126, g: 34, b: 206 },
    "purple-800": { r: 107, g: 33, b: 168 },
    "purple-900": { r: 88, g: 28, b: 135 },

    // Blue
    "blue-50": { r: 239, g: 246, b: 255 },
    "blue-100": { r: 219, g: 234, b: 254 },
    "blue-200": { r: 191, g: 219, b: 254 },
    "blue-300": { r: 147, g: 197, b: 253 },
    "blue-400": { r: 96, g: 165, b: 250 },
    "blue-500": { r: 59, g: 130, b: 246 },
    "blue-600": { r: 37, g: 99, b: 235 },
    "blue-700": { r: 29, g: 78, b: 216 },
    "blue-800": { r: 30, g: 64, b: 175 },
    "blue-900": { r: 30, g: 58, b: 138 },

    // Green
    "green-50": { r: 240, g: 253, b: 244 },
    "green-100": { r: 220, g: 252, b: 231 },
    "green-200": { r: 187, g: 247, b: 208 },
    "green-300": { r: 134, g: 239, b: 172 },
    "green-400": { r: 74, g: 222, b: 128 },
    "green-500": { r: 34, g: 197, b: 94 },
    "green-600": { r: 22, g: 163, b: 74 },
    "green-700": { r: 21, g: 128, b: 61 },
    "green-800": { r: 22, g: 101, b: 52 },
    "green-900": { r: 20, g: 83, b: 45 },

    // Emerald
    "emerald-50": { r: 236, g: 253, b: 245 },
    "emerald-100": { r: 209, g: 250, b: 229 },
    "emerald-200": { r: 167, g: 243, b: 208 },
    "emerald-300": { r: 110, g: 231, b: 183 },
    "emerald-400": { r: 52, g: 211, b: 153 },
    "emerald-500": { r: 16, g: 185, b: 129 },
    "emerald-600": { r: 5, g: 150, b: 105 },
    "emerald-700": { r: 4, g: 120, b: 87 },
    "emerald-800": { r: 6, g: 95, b: 70 },
    "emerald-900": { r: 6, g: 78, b: 59 },

    // Red
    "red-50": { r: 254, g: 242, b: 242 },
    "red-100": { r: 254, g: 226, b: 226 },
    "red-200": { r: 254, g: 202, b: 202 },
    "red-300": { r: 252, g: 165, b: 165 },
    "red-400": { r: 248, g: 113, b: 113 },
    "red-500": { r: 239, g: 68, b: 68 },
    "red-600": { r: 220, g: 38, b: 38 },
    "red-700": { r: 185, g: 28, b: 28 },
    "red-800": { r: 153, g: 27, b: 27 },
    "red-900": { r: 127, g: 29, b: 29 },

    // Orange
    "orange-50": { r: 255, g: 247, b: 237 },
    "orange-100": { r: 255, g: 237, b: 213 },
    "orange-200": { r: 254, g: 215, b: 170 },
    "orange-300": { r: 253, g: 186, b: 116 },
    "orange-400": { r: 251, g: 146, b: 60 },
    "orange-500": { r: 249, g: 115, b: 22 },
    "orange-600": { r: 234, g: 88, b: 12 },
    "orange-700": { r: 194, g: 65, b: 12 },
    "orange-800": { r: 154, g: 52, b: 18 },
    "orange-900": { r: 124, g: 45, b: 18 },

    // Amber
    "amber-50": { r: 255, g: 251, b: 235 },
    "amber-100": { r: 254, g: 243, b: 199 },
    "amber-200": { r: 253, g: 230, b: 138 },
    "amber-300": { r: 252, g: 211, b: 77 },
    "amber-400": { r: 251, g: 191, b: 36 },
    "amber-500": { r: 245, g: 158, b: 11 },
    "amber-600": { r: 217, g: 119, b: 6 },
    "amber-700": { r: 180, g: 83, b: 9 },
    "amber-800": { r: 146, g: 64, b: 14 },
    "amber-900": { r: 120, g: 53, b: 15 },

    // Yellow
    "yellow-50": { r: 254, g: 252, b: 232 },
    "yellow-100": { r: 254, g: 249, b: 195 },
    "yellow-200": { r: 254, g: 240, b: 138 },
    "yellow-300": { r: 253, g: 224, b: 71 },
    "yellow-400": { r: 250, g: 204, b: 21 },
    "yellow-500": { r: 234, g: 179, b: 8 },
    "yellow-600": { r: 202, g: 138, b: 4 },
    "yellow-700": { r: 161, g: 98, b: 7 },
    "yellow-800": { r: 133, g: 77, b: 14 },
    "yellow-900": { r: 113, g: 63, b: 18 },
  };

  return colorMap[tailwindColor] || null;
}

/**
 * RGB 값을 HEX 색상으로 변환
 * @param rgb - RGB 객체
 * @returns HEX 색상 문자열 (예: '#6366f1')
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * HEX 색상을 RGB로 변환
 * @param hex - HEX 색상 문자열 (예: '#6366f1' 또는 '6366f1')
 * @returns RGB 객체 또는 null
 */
export function hexToRgb(hex: string): RGBColor | null {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  return { r, g, b };
}

/**
 * 섹션별 스타일 프리셋
 * PDF 및 리포트의 각 섹션에 적용할 기본 스타일
 */
export const sectionStyles = {
  // 헤더 섹션
  header: {
    background: pdfColors.primary[600],
    text: pdfColors.text.inverse,
    padding: { top: 40, right: 40, bottom: 40, left: 40 },
    borderRadius: 0,
  },

  // 메인 콘텐츠 섹션
  content: {
    background: pdfColors.background.white,
    text: pdfColors.text.primary,
    padding: { top: 32, right: 40, bottom: 32, left: 40 },
    borderRadius: 0,
  },

  // 강조 섹션 (예: 주요 강점)
  highlight: {
    background: pdfColors.primary[50],
    text: pdfColors.primary[900],
    padding: { top: 24, right: 24, bottom: 24, left: 24 },
    borderRadius: 12,
  },

  // 카드 섹션
  card: {
    background: pdfColors.background.white,
    text: pdfColors.text.primary,
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
    borderRadius: 16,
    border: { width: 1, color: pdfColors.background.muted },
    shadow: true,
  },

  // 푸터 섹션
  footer: {
    background: pdfColors.background.light,
    text: pdfColors.text.secondary,
    padding: { top: 24, right: 40, bottom: 24, left: 40 },
    borderRadius: 0,
  },

  // 사이드바 섹션
  sidebar: {
    background: pdfColors.background.subtle,
    text: pdfColors.text.primary,
    padding: { top: 24, right: 24, bottom: 24, left: 24 },
    borderRadius: 8,
  },
} as const;

export type SectionStyleKey = keyof typeof sectionStyles;

/**
 * 상태에 따른 색상 가져오기
 * @param status - 상태 ('pending' | 'in_progress' | 'completed' | 'failed')
 * @returns RGB 색상 객체
 */
export function getStatusColor(
  status: "pending" | "in_progress" | "completed" | "failed"
): RGBColor {
  const statusMap: Record<string, RGBColor> = {
    pending: pdfColors.status.pending,
    in_progress: pdfColors.status.inProgress,
    completed: pdfColors.status.completed,
    failed: pdfColors.status.failed,
  };
  return statusMap[status] || pdfColors.status.pending;
}

/**
 * 카테고리에 따른 색상 가져오기
 * @param category - PSA 카테고리
 * @returns RGB 색상 객체
 */
export function getCategoryColor(
  category: "innovation" | "execution" | "influence" | "collaboration" | "resilience"
): RGBColor {
  return pdfColors.category[category] || pdfColors.primary[500];
}

/**
 * 그라데이션 CSS 문자열 생성
 * @param startColor - 시작 색상 (RGB)
 * @param endColor - 종료 색상 (RGB)
 * @param direction - 방향 (기본: 'to right')
 * @returns CSS linear-gradient 문자열
 */
export function createGradientCSS(
  startColor: RGBColor,
  endColor: RGBColor,
  direction: string = "to right"
): string {
  return `linear-gradient(${direction}, rgb(${startColor.r}, ${startColor.g}, ${startColor.b}), rgb(${endColor.r}, ${endColor.g}, ${endColor.b}))`;
}

/**
 * 색상에 투명도 적용
 * @param color - RGB 색상
 * @param opacity - 투명도 (0-1)
 * @returns RGBA 문자열
 */
export function withOpacity(color: RGBColor, opacity: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
}
