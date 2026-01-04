import type { AssembledReport, ReportContent } from './report';
import type { BrandStrategy } from './brand';
import type { ParsedResume } from './resume';
import type { PortfolioAnalysis } from './portfolio';
import type { BriefAnalysis } from './survey';

// ==========================================
// PDF Generator Input/Output Types
// ==========================================

/**
 * Text PDF Generator 입력
 */
export interface TextPdfInput {
  report: AssembledReport;
  brandStrategy: BrandStrategy;
  resume: ParsedResume;
}

/**
 * Text PDF Generator 출력
 */
export interface TextPdfOutput {
  pdfBuffer: Buffer;
  metadata: {
    pageCount: number;
    fileSize: number;
  };
}

/**
 * Slide Deck Generator 입력
 */
export interface SlideInput {
  report: AssembledReport;
  content: ReportContent;  // Added: executiveSummary, strengthsSection, achievementsSection, etc.
  brandStrategy: BrandStrategy;
  resume: ParsedResume;
  portfolioAnalysis?: PortfolioAnalysis;
  briefAnalysis: BriefAnalysis;
}

/**
 * Slide Deck Generator 출력
 */
export interface SlideOutput {
  pptxBuffer: Buffer;
  pdfBuffer: Buffer;
  slideMetadata: {
    totalSlides: number;
    method: 'skills' | 'pptxgenjs';
  };
}

/**
 * 디자인 스펙 (LLM이 생성)
 */
export interface DesignSpec {
  primaryColor: string;      // Hex color (e.g., "#2E5BFF")
  secondaryColor: string;    // Hex color
  accentColor: string;       // Hex color
  fontFamily: string;        // Font name (e.g., "Noto Sans KR")
  layoutStyle: 'modern' | 'classic' | 'minimal';
}

/**
 * 슬라이드 데이터 구조
 */
export interface SlideData {
  slideNumber: number;
  type: 'cover' | 'toc' | 'content' | 'timeline' | 'chart' | 'closing';
  title: string;
  content: string | string[];
  design?: {
    backgroundColor?: string;
    titleColor?: string;
    contentColor?: string;
  };
}

// ==========================================
// Storage Types
// ==========================================

/**
 * Storage Uploader에서 사용하는 파일 타입
 */
export type FileType = 'text' | 'slides' | 'pptx';

/**
 * PDF 업로드 결과
 */
export interface UploadResult {
  publicUrl: string;
  fileName: string;
  fileSize: number;
}
