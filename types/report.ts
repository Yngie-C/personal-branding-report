import { SurveyCategory } from './survey';

export interface ReportContent {
  executiveSummary: string;
  brandStory: string;
  strengthsSection: string[];
  achievementsSection: string[];
  futureVision: string;
  callToAction: string;
}

export interface AssembledReport {
  pages: {
    pageNumber: number;
    sections: {
      type: 'header' | 'text' | 'list' | 'quote' | 'image' | 'chart';
      content: any;
      style: object;
    }[];
  }[];
  metadata: {
    title: string;
    author: string;
    createdAt: Date;
    executiveSummary?: string;
    achievementsSection?: string[];
    futureVision?: string;
    callToAction?: string;
  };
}

export interface WebProfile {
  slug: string;
  type?: WebProfileType;  // 'brief' | 'full' (Migration 007에서 추가)
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  sections: ProfileSection[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
  contactInfo: {
    email: string;
    phone?: string;
    location?: string;
  };
}

export interface ProfileSection {
  id: string;
  type: 'about' | 'experience' | 'skills' | 'projects' | 'contact';
  title: string;
  content: any;
}

// ==========================================
// 무료/유료 티어 관련 타입 (Migration 007)
// ==========================================

export type WebProfileType = 'brief' | 'full';

/**
 * 약식 웹 프로필 (무료 티어)
 * PSA 설문 분석 결과를 기반으로 생성되는 간단한 웹 프로필
 */
export interface BriefWebProfile {
  slug: string;
  type: 'brief';
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
  hero: {
    headline: string;        // 페르소나 제목 (e.g., "전략적 설계자")
    tagline: string;         // 페르소나 슬로건
    keywords: string[];      // 브랜딩 키워드 (3-5개)
  };
  persona: {
    title: string;           // 페르소나 제목
    description: string;     // 페르소나 설명
    strengths: string[];     // 핵심 강점 배열
    shadowSides: string[];   // 성장 포인트 배열
  };
  radarData: {
    category: string;        // 카테고리 이름
    score: number;           // 점수 (0-100)
  }[];
  categoryScores: {
    category: string;        // 카테고리 이름
    score: number;           // 정규화 점수 (0-100)
    rank: number;            // 순위 (1-5)
  }[];
  contact: {
    email?: string;
  };
  // ==========================================
  // 추가 필드 (survey-result 페이지와 동일한 UI 지원)
  // ==========================================
  topCategories?: SurveyCategory[];        // 테마 색상용 (상위 2개 카테고리)
  strengthsSummary?: string;                // 강점 분석 요약 텍스트
  strengthsScenarios?: {                    // 강점 시나리오 섹션
    title: string;
    description: string;
  }[];
  lowScoreCategories?: {                    // 일하는 스타일 (저점수 재프레이밍)
    category: SurveyCategory;
    reframedLabel: string;
    reframedDescription: string;
  }[];
  shadowSidesText?: string;                 // 시너지 파트너 섹션 텍스트
  completionTimeSeconds?: number;           // 응답 패턴 (완료 시간)
}
