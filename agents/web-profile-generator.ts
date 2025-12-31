import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { WebProfile, ReportContent } from '@/types/report';
import { BrandStrategy, VisualElements } from '@/types/brand';
import { ParsedResume } from '@/types/resume';
import { supabaseAdmin } from '@/lib/supabase/server';

export interface WebProfileGeneratorInput {
  brandStrategy: BrandStrategy;
  content: ReportContent;
  visualElements: VisualElements;
  resume: ParsedResume;
}

export class WebProfileGeneratorAgent extends BaseAgent<WebProfileGeneratorInput, WebProfile> {
  constructor() {
    super('WebProfileGeneratorAgent', 'Web profile generator');
  }

  async process(
    input: WebProfileGeneratorInput,
    context: AgentContext
  ): Promise<AgentResult<WebProfile>> {
    try {
      const { brandStrategy, content, resume } = input;

      const slug = await this.generateUniqueSlug(resume.personalInfo.name, context.sessionId);

      const profile: WebProfile = {
        slug,
        seo: {
          title: `${resume.personalInfo.name} - ${brandStrategy.brandEssence}`,
          description: content.executiveSummary,
          ogImage: '', // TODO: 생성된 이미지 URL
        },
        hero: {
          headline: brandStrategy.brandEssence,
          subheadline: content.executiveSummary,
          cta: content.callToAction,
        },
        sections: [
          {
            id: 'about',
            type: 'about',
            title: '소개',
            content: content.brandStory,
          },
          {
            id: 'experience',
            type: 'experience',
            title: '경력',
            content: resume.experiences,
          },
          {
            id: 'skills',
            type: 'skills',
            title: '스킬',
            content: resume.skills,
          },
        ],
        socialLinks: [],
        contactInfo: {
          email: resume.personalInfo.email,
          phone: resume.personalInfo.phone,
          location: resume.personalInfo.location,
        },
      };

      return this.success(profile);
    } catch (error: any) {
      return this.failure(`웹 프로필 생성 실패: ${error.message}`);
    }
  }

  private generateSlug(name: string, sessionId: string): string {
    const nameSlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const sessionSlug = sessionId.substring(0, 8);
    return `${nameSlug}-${sessionSlug}`;
  }

  /**
   * 고유한 slug 생성 (중복 확인 포함)
   */
  private async generateUniqueSlug(name: string, sessionId: string): Promise<string> {
    const baseSlug = this.generateSlug(name, sessionId);
    let slug = baseSlug;
    let attempt = 0;
    const maxAttempts = 10;

    while (attempt < maxAttempts) {
      // 중복 확인 - .single() 대신 .limit(1) 사용
      const { data: existing, error } = await supabaseAdmin
        .from('web_profiles')
        .select('slug')
        .eq('slug', slug)
        .limit(1);

      // 에러 체크
      if (error) {
        console.error('[WebProfileGenerator] Error checking slug:', error);
        throw new Error(`슬러그 중복 확인 실패: ${error.message}`);
      }

      // 중복이 없으면 (빈 배열) 사용 가능
      if (!existing || existing.length === 0) {
        console.log(`[WebProfileGenerator] Generated unique slug: ${slug}`);
        return slug;
      }

      // 중복 있음 - suffix 추가
      attempt++;
      slug = `${baseSlug}-${attempt}`;
      console.log(`[WebProfileGenerator] Slug collision detected, trying: ${slug}`);
    }

    // 최대 시도 횟수 초과 - 타임스탬프 추가
    const timestamp = Date.now().toString(36).substring(0, 6);
    slug = `${baseSlug}-${timestamp}`;
    console.log(`[WebProfileGenerator] Max attempts reached, using timestamp: ${slug}`);
    return slug;
  }
}
