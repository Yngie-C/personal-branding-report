import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { BriefWebProfile } from '@/types/report';
import { BriefAnalysis } from '@/types/survey';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * BriefWebProfileGeneratorAgent 입력 인터페이스
 */
export interface BriefWebProfileGeneratorInput {
  analysis: BriefAnalysis;  // PSA 분석 결과
  email?: string;            // 사용자 이메일 (선택)
}

/**
 * BriefWebProfileGeneratorAgent
 *
 * PSA 설문 분석 결과를 기반으로 간단한 웹 프로필을 생성합니다.
 * 무료 티어 사용자가 공유할 수 있는 가벼운 웹 프로필을 만듭니다.
 *
 * **생성 내용:**
 * - Hero 섹션 (페르소나 제목, 슬로건, 키워드)
 * - 페르소나 특성 설명
 * - 5차원 레이더 차트 데이터
 * - 카테고리별 점수 배열
 *
 * **URL 형식:** `/p/brief-{persona-slug}-{session-8char}`
 */
export class BriefWebProfileGeneratorAgent extends BaseAgent<
  BriefWebProfileGeneratorInput,
  BriefWebProfile
> {
  constructor() {
    super(
      'BriefWebProfileGeneratorAgent',
      `당신은 간단한 웹 프로필 생성 전문가입니다.

PSA 설문 분석 결과를 기반으로 사용자의 페르소나를 효과적으로 소개하는 웹 프로필을 생성합니다.

**목표:**
- 무료 티어 사용자에게 공유 가능한 간단한 웹 프로필 제공
- 페르소나의 강점과 특성을 명확하게 전달
- 유료 전환을 유도할 수 있는 가치 제공

**출력 형식:**
웹 프로필은 다음 요소로 구성됩니다:
1. SEO 메타데이터 (title, description)
2. Hero 섹션 (페르소나 제목, 슬로건, 브랜딩 키워드)
3. 페르소나 특성 (설명, 핵심 강점, 성장 포인트)
4. 5차원 레이더 차트 데이터
5. 카테고리별 점수 배열

모든 내용은 한국어로 작성되어야 합니다.`
    );
  }

  async process(
    input: BriefWebProfileGeneratorInput,
    context: AgentContext
  ): Promise<AgentResult<BriefWebProfile>> {
    try {
      const { analysis, email } = input;

      console.log(`[BriefWebProfileGenerator] Generating brief web profile for session: ${context.sessionId}`);
      console.log(`[BriefWebProfileGenerator] Persona: ${analysis.persona.title}`);

      // 1. Slug 생성 (충돌 감지 포함)
      const slug = await this.generateBriefSlug(analysis.persona.title, context.sessionId);
      console.log(`[BriefWebProfileGenerator] Generated slug: ${slug}`);

      // 2. Brief Web Profile 데이터 구성
      const profile: BriefWebProfile = {
        slug,
        type: 'brief',
        seo: {
          title: `${analysis.persona.title} - PSA 강점 분석`,
          description: analysis.strengthsSummary.substring(0, 160),
          ogImage: undefined, // TODO: OG 이미지 생성 (향후 개선)
        },
        hero: {
          headline: analysis.persona.title,
          tagline: analysis.persona.tagline,
          keywords: analysis.brandingKeywords,
        },
        persona: {
          title: analysis.persona.title,
          description: analysis.persona.description,
          strengths: analysis.persona.strengths,
          shadowSides: analysis.persona.shadowSides,
        },
        radarData: analysis.radarData,
        categoryScores: analysis.categoryScores.map((s) => ({
          category: s.category,
          score: Math.round(s.normalizedScore),
          rank: s.rank,
        })),
        contact: {
          email: email || undefined,
        },
        // 추가 필드 (survey-result 페이지와 동일한 UI 지원)
        topCategories: analysis.topCategories,
        strengthsSummary: analysis.strengthsSummary,
        strengthsScenarios: analysis.strengthsScenarios,
        // NEW: Strength-focused sections
        strengthTips: analysis.strengthTips,
        brandingMessages: analysis.brandingMessages,
        completionTimeSeconds: analysis.completionTimeSeconds,
      };

      console.log(`[BriefWebProfileGenerator] Successfully created brief profile`);

      return this.success(profile, {
        slug,
        personaType: analysis.persona.type,
      });
    } catch (error: any) {
      console.error(`[BriefWebProfileGenerator] Error:`, error);
      return this.failure(`Brief web profile generation failed: ${error.message}`);
    }
  }

  /**
   * Brief 프로필용 Slug 생성
   *
   * **형식:** `brief-{persona-slug}-{session-8char}`
   * **예시:** `brief-strategic-architect-a1b2c3d4`
   *
   * **충돌 처리:**
   * 1. 기본 slug로 중복 체크
   * 2. 중복 시 numeric suffix 추가 (-1, -2, ...)
   * 3. 10회 시도 후 실패 시 timestamp 추가
   */
  private async generateBriefSlug(personaTitle: string, sessionId: string): Promise<string> {
    // 페르소나 제목을 URL-safe slug로 변환
    const personaSlug = personaTitle
      .toLowerCase()
      .normalize('NFD')                    // 한글 분해 (초성, 중성, 종성)
      .replace(/[\u0300-\u036f]/g, '')     // 결합 문자 제거
      .replace(/[^\w\s가-힣-]/g, '')       // 영문, 숫자, 한글, 하이픈만 유지
      .trim()
      .replace(/\s+/g, '-')                // 공백을 하이픈으로
      .replace(/-+/g, '-')                 // 연속 하이픈 제거
      .substring(0, 30);                   // 최대 30자

    // 세션 ID의 처음 8자 사용
    const sessionSlug = sessionId.substring(0, 8);
    const baseSlug = `brief-${personaSlug}-${sessionSlug}`;

    let slug = baseSlug;
    let attempt = 0;
    const maxAttempts = 10;

    while (attempt < maxAttempts) {
      // Slug 중복 체크
      const { data: existing, error } = await supabaseAdmin
        .from('web_profiles')
        .select('slug')
        .eq('slug', slug)
        .limit(1);

      if (error) {
        console.error(`[BriefWebProfileGenerator] Slug collision check failed:`, error);
        throw new Error(`Slug collision check failed: ${error.message}`);
      }

      // 중복이 없으면 사용 가능
      if (!existing || existing.length === 0) {
        console.log(`[BriefWebProfileGenerator] Slug "${slug}" is available`);
        return slug;
      }

      // 중복 발견 - numeric suffix 추가
      attempt++;
      slug = `${baseSlug}-${attempt}`;
      console.log(`[BriefWebProfileGenerator] Slug collision detected, trying: ${slug}`);
    }

    // 10회 시도 실패 - timestamp 사용
    const timestamp = Date.now().toString(36).substring(0, 6);
    slug = `${baseSlug}-${timestamp}`;
    console.warn(`[BriefWebProfileGenerator] Max attempts exceeded, using timestamp: ${slug}`);

    return slug;
  }
}
