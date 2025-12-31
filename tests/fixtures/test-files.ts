/**
 * Test Files Fixtures
 *
 * Provides mock files for upload testing:
 * - Resume (PDF, DOCX)
 * - Portfolio (PDF, images)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * File fixture interface
 */
export interface TestFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

/**
 * Create a mock PDF resume
 * For testing purposes, we create a minimal valid PDF
 */
export function createMockResumePDF(): TestFile {
  // Minimal PDF structure (valid but minimal)
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 85 >>
stream
BT
/F1 12 Tf
50 750 Td
(김철수 - Product Manager) Tj
0 -20 Td
(5년 경력 / PM) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000226 00000 n
0000000328 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
462
%%EOF`;

  return {
    name: 'test-resume.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(pdfContent, 'utf-8'),
  };
}

/**
 * Create a mock DOCX resume
 * Simple plain text file for testing
 */
export function createMockResumeDOCX(): TestFile {
  // For simplicity, use plain text
  // In a real scenario, you'd create a proper DOCX structure
  const content = `
김철수
Product Manager
Email: chulsoo@example.com

[경력]
- ABC 회사, Product Manager, 2020-현재
- XYZ 스타트업, PM, 2018-2020

[스킬]
- 제품 기획, 데이터 분석, 프로젝트 관리
- SQL, Figma, Notion

[프로젝트]
- 사용자 증가 2배 달성 (MAU 10만 → 20만)
- AI 기반 추천 시스템 구축
`;

  return {
    name: 'test-resume.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: Buffer.from(content, 'utf-8'),
  };
}

/**
 * Create mock portfolio PDF
 */
export function createMockPortfolioPDF(): TestFile {
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 120 >>
stream
BT
/F1 14 Tf
50 750 Td
(Portfolio: AI Recommendation System) Tj
0 -25 Td
/F1 10 Tf
(Project: User engagement increased 2x) Tj
0 -20 Td
(Tech: Python, TensorFlow, AWS) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000226 00000 n
0000000328 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
500
%%EOF`;

  return {
    name: 'test-portfolio.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(pdfContent, 'utf-8'),
  };
}

/**
 * Create mock portfolio image (PNG)
 */
export function createMockPortfolioImage(): TestFile {
  // Minimal valid PNG (1x1 transparent pixel)
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  return {
    name: 'test-portfolio.png',
    mimeType: 'image/png',
    buffer: pngBuffer,
  };
}

/**
 * Mock resume form data (alternative to file upload)
 */
export interface MockResumeFormData {
  name: string;
  email: string;
  phone?: string;
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    achievements: string[];
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    impact: string;
    technologies: string[];
  }>;
}

/**
 * Get mock resume form data
 */
export function getMockResumeFormData(): MockResumeFormData {
  return {
    name: '김철수',
    email: 'chulsoo@example.com',
    phone: '010-1234-5678',
    experience: [
      {
        company: 'ABC Tech',
        role: 'Product Manager',
        startDate: '2020-01',
        current: true,
        achievements: [
          '사용자 증가 2배 달성 (MAU 10만 → 20만)',
          'AI 기반 추천 시스템 구축으로 전환율 30% 개선',
          '크로스 펑셔널 팀 리드 (개발 5명, 디자인 2명)',
        ],
      },
      {
        company: 'XYZ Startup',
        role: 'Associate PM',
        startDate: '2018-06',
        endDate: '2019-12',
        current: false,
        achievements: [
          '신규 기능 3개 런칭 (A/B 테스트 기반 의사결정)',
          '데이터 분석 자동화로 리포팅 시간 50% 단축',
        ],
      },
    ],
    skills: [
      'Product Management',
      'Data Analysis (SQL, Python)',
      'UX/UI Design (Figma)',
      'Agile/Scrum',
      'A/B Testing',
      'Stakeholder Communication',
    ],
    projects: [
      {
        name: 'AI 기반 개인화 추천 시스템',
        description: '사용자 행동 데이터를 분석하여 맞춤형 콘텐츠를 추천하는 시스템 구축',
        impact: '클릭률 40% 증가, 체류 시간 2배 증가',
        technologies: ['TensorFlow', 'Python', 'AWS SageMaker', 'Redis'],
      },
      {
        name: '온보딩 플로우 개선',
        description: '신규 사용자 온보딩 과정을 재설계하여 완료율 향상',
        impact: '온보딩 완료율 60% → 85% 증가',
        technologies: ['Figma', 'Mixpanel', 'Optimizely'],
      },
      {
        name: '대시보드 리뉴얼 프로젝트',
        description: '데이터 시각화 및 UX 개선을 통한 관리자 대시보드 리뉴얼',
        impact: '관리자 만족도 4.2/5.0 → 4.8/5.0',
        technologies: ['React', 'D3.js', 'Material-UI'],
      },
    ],
  };
}

/**
 * Get a more compact version for quick tests
 */
export function getMockResumeFormDataCompact(): Partial<MockResumeFormData> {
  return {
    name: '테스트 사용자',
    email: 'test@example.com',
    experience: [
      {
        company: 'Test Company',
        role: 'Product Manager',
        startDate: '2020-01',
        current: true,
        achievements: ['성과 1', '성과 2'],
      },
    ],
    skills: ['PM', 'Data Analysis', 'Figma'],
    projects: [
      {
        name: 'Test Project',
        description: '테스트 프로젝트 설명',
        impact: '성과 달성',
        technologies: ['Tech1', 'Tech2'],
      },
    ],
  };
}
