import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import type { SlideInput, SlideOutput, DesignSpec } from '@/types/pdf';
import PptxGenJS from 'pptxgenjs';

/**
 * SlideDeckGeneratorAgent
 *
 * 개인 브랜딩 프레젠테이션 슬라이드 덱을 생성합니다.
 *
 * 워크플로우:
 * 1. LLM으로 디자인 스펙 생성 (색상, 레이아웃 스타일)
 * 2. Claude Code Skills로 PPTX 생성 시도 (primary method)
 * 3. Skills 실패 시 pptxgenjs fallback (secondary method)
 * 4. PPTX를 PDF로 변환 (libreoffice-convert 또는 CloudConvert)
 *
 * 출력: 22장의 슬라이드 (Cover ~ Thank You)
 */
export class SlideDeckGeneratorAgent extends BaseAgent<SlideInput, SlideOutput> {
  constructor() {
    super(
      'SlideDeckGenerator',
      `당신은 개인 브랜딩 프레젠테이션 디자이너입니다.
제공된 데이터를 20장 이상의 전문적인 슬라이드로 변환하세요.

디자인 원칙:
- 모던하고 미니멀한 레이아웃
- 슬라이드당 3-5개 bullet points
- 시각적 요소 포함 (차트, 타임라인, 아이콘)
- 일관된 브랜드 컬러

슬라이드 구조:
1. Cover
2-3. Opening (ToC, Summary)
4-7. Who Am I (Brand, Persona, Value Prop)
8-14. Professional Journey (Timeline, Experiences, Skills)
15-18. Achievements (Strengths, Projects, Differentiators)
19-21. Future Vision (Audience, Vision, CTA)
22. Thank You`
    );
  }

  async process(
    input: SlideInput,
    context: AgentContext
  ): Promise<AgentResult<SlideOutput>> {
    try {
      console.log('[SlideDeckGenerator] Starting slide deck generation...');

      // Step 1: LLM으로 디자인 스펙 생성
      const designSpec = await this.getDesignSpec(input);
      console.log('[SlideDeckGenerator] Design spec generated:', designSpec);

      // Step 2: PPTX 생성 (Skills 시도 → pptxgenjs fallback)
      const pptxBuffer = await this.generatePptx(input, designSpec);
      console.log(`[SlideDeckGenerator] PPTX generated (${pptxBuffer.length} bytes)`);

      // Step 3: PPTX→PDF 변환
      const pdfBuffer = await this.convertPptxToPdf(pptxBuffer);
      console.log(`[SlideDeckGenerator] PDF converted (${pdfBuffer.length} bytes)`);

      return this.success({
        pptxBuffer,
        pdfBuffer,
        slideMetadata: {
          totalSlides: 22,
          method: 'pptxgenjs', // Skills는 아직 미구현이므로 항상 pptxgenjs
        },
      });
    } catch (error) {
      console.error('[SlideDeckGenerator] Error:', error);
      return this.failure((error as Error).message);
    }
  }

  /**
   * Step 1: LLM으로 디자인 스펙 생성
   */
  private async getDesignSpec(input: SlideInput): Promise<DesignSpec> {
    const prompt = `
다음 브랜드 페르소나에 맞는 슬라이드 디자인 스펙을 JSON으로 추천하세요:

**Persona:** ${input.briefAnalysis.persona.title}
**Brand Personality:** ${input.brandStrategy.brandPersonality.join(', ')}
**Brand Essence:** ${input.brandStrategy.brandEssence}

출력 형식 (JSON만):
{
  "primaryColor": "#RRGGBB",
  "secondaryColor": "#RRGGBB",
  "accentColor": "#RRGGBB",
  "fontFamily": "font name",
  "layoutStyle": "modern"
}

색상 가이드:
- 전략적/분석적 페르소나 → 파랑 계열 (#2E5BFF, #1E40AF)
- 혁신적/창의적 페르소나 → 보라 계열 (#8B5CF6, #6D28D9)
- 실행/완결 페르소나 → 녹색 계열 (#10B981, #059669)
- 영향력/리더십 페르소나 → 빨강/주황 계열 (#EF4444, #F59E0B)
`;

    const response = await this.callLLM(prompt);

    try {
      // JSON 파싱 (LLM이 추가 텍스트를 포함할 수 있으므로 정리)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const designSpec: DesignSpec = JSON.parse(jsonMatch[0]);

      // Fallback defaults
      return {
        primaryColor: designSpec.primaryColor || '#2E5BFF',
        secondaryColor: designSpec.secondaryColor || '#8B5CF6',
        accentColor: designSpec.accentColor || '#F59E0B',
        fontFamily: designSpec.fontFamily || 'Arial',
        layoutStyle: designSpec.layoutStyle || 'modern',
      };
    } catch (error) {
      console.warn('[SlideDeckGenerator] Failed to parse design spec, using defaults:', error);
      return {
        primaryColor: '#2E5BFF',
        secondaryColor: '#8B5CF6',
        accentColor: '#F59E0B',
        fontFamily: 'Arial',
        layoutStyle: 'modern',
      };
    }
  }

  /**
   * Step 2: PPTX 생성 (Skills 시도 → pptxgenjs fallback)
   */
  private async generatePptx(input: SlideInput, design: DesignSpec): Promise<Buffer> {
    // Try Skills first (will fail with current placeholder implementation)
    try {
      console.log('[SlideDeckGenerator] Attempting Skills PPTX generation...');
      const pptxBuffer = await this.generatePptxWithSkills(input, design);
      console.log('[SlideDeckGenerator] Skills PPTX generation succeeded');
      return pptxBuffer;
    } catch (error) {
      console.warn('[SlideDeckGenerator] Skills failed, falling back to pptxgenjs:', (error as Error).message);
    }

    // Fallback to pptxgenjs
    console.log('[SlideDeckGenerator] Generating PPTX with pptxgenjs...');
    return await this.generatePptxWithLibrary(input, design);
  }

  /**
   * Primary Method: Claude Code Skills로 PPTX 생성
   */
  private async generatePptxWithSkills(input: SlideInput, design: DesignSpec): Promise<Buffer> {
    // callSkill()은 현재 placeholder이므로 항상 에러 발생
    const slideData = this.prepareSlideData(input, design);

    const pptxBuffer = await this.callSkill('document-skills:pptx', {
      slides: slideData,
      design,
    });

    return pptxBuffer;
  }

  /**
   * Fallback Method: pptxgenjs 라이브러리로 PPTX 생성
   */
  private async generatePptxWithLibrary(input: SlideInput, design: DesignSpec): Promise<Buffer> {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 16:9

    pptx.defineLayout({ name: 'A4', width: 10, height: 5.63 });
    pptx.layout = 'A4';

    // 색상 준비 (# 제거)
    const primaryColor = design.primaryColor.replace('#', '');
    const secondaryColor = design.secondaryColor.replace('#', '');
    const accentColor = design.accentColor.replace('#', '');

    // Slide 1: Cover
    this.addCoverSlide(pptx, input, primaryColor);

    // Slide 2: Table of Contents
    this.addTocSlide(pptx, input, primaryColor);

    // Slide 3: Executive Summary
    this.addExecutiveSummarySlide(pptx, input, primaryColor);

    // Slides 4-7: Who Am I
    this.addBrandEssenceSlide(pptx, input, primaryColor, accentColor);
    this.addPersonalitySlide(pptx, input, secondaryColor);
    this.addPersonaSlide(pptx, input, primaryColor);
    this.addValuePropSlide(pptx, input, accentColor);

    // Slides 8-14: Professional Journey
    this.addTimelineSlide(pptx, input, primaryColor);
    this.addExperienceSlides(pptx, input, secondaryColor);
    this.addSkillsSlide(pptx, input, accentColor);

    // Slides 15-18: Achievements
    this.addStrengthsSlide(pptx, input, primaryColor);
    this.addAchievementsSlide(pptx, input, secondaryColor);
    this.addDifferentiatorsSlide(pptx, input, accentColor);

    // Slides 19-21: Future Vision
    this.addTargetAudienceSlide(pptx, input, primaryColor);
    this.addFutureVisionSlide(pptx, input, secondaryColor);
    this.addCallToActionSlide(pptx, input, accentColor);

    // Slide 22: Thank You
    this.addThankYouSlide(pptx, input, primaryColor);

    // Generate buffer
    const pptxData = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
    return pptxData;
  }

  /**
   * Slide 1: Cover
   */
  private addCoverSlide(pptx: PptxGenJS, input: SlideInput, bgColor: string): void {
    const slide = pptx.addSlide();
    slide.background = { color: bgColor };

    // 이름
    slide.addText(input.resume.personalInfo.name || 'Personal Branding', {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 1,
      fontSize: 44,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    });

    // 페르소나 타이틀
    slide.addText(input.briefAnalysis.persona.title, {
      x: 0.5,
      y: 2.7,
      w: 9,
      h: 0.6,
      fontSize: 28,
      color: 'FFFFFF',
      align: 'center',
    });

    // 브랜드 본질
    slide.addText(input.brandStrategy.brandEssence, {
      x: 0.5,
      y: 3.8,
      w: 9,
      h: 0.5,
      fontSize: 18,
      italic: true,
      color: 'EEEEEE',
      align: 'center',
    });
  }

  /**
   * Slide 2: Table of Contents
   */
  private addTocSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Table of Contents', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    const sections = [
      '1. Opening',
      '2. Who Am I',
      '3. Professional Journey',
      '4. Achievements & Strengths',
      '5. Future Vision',
      '6. Contact',
    ];

    sections.forEach((section, idx) => {
      slide.addText(section, {
        x: 1,
        y: 1.5 + idx * 0.5,
        w: 8,
        h: 0.4,
        fontSize: 18,
        color: '333333',
      });
    });
  }

  /**
   * Slide 3: Executive Summary
   */
  private addExecutiveSummarySlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Executive Summary', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    const summary = input.content.executiveSummary || input.brandStrategy.brandEssence;
    slide.addText(summary, {
      x: 0.7,
      y: 1.5,
      w: 8.6,
      h: 3,
      fontSize: 16,
      color: '000000',
      valign: 'top',
    });
  }

  /**
   * Slide 4: Brand Essence
   */
  private addBrandEssenceSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string, accentColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Brand Essence', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    slide.addText(input.brandStrategy.brandEssence, {
      x: 0.7,
      y: 1.8,
      w: 8.6,
      h: 2.5,
      fontSize: 20,
      color: '000000',
      italic: true,
      valign: 'middle',
      align: 'center',
    });
  }

  /**
   * Slide 5: Brand Personality
   */
  private addPersonalitySlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Brand Personality', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    const bullets = input.brandStrategy.brandPersonality.map((trait) => ({
      text: trait,
      options: { bullet: true, fontSize: 18, color: '000000' },
    }));

    slide.addText(bullets, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 3,
    });
  }

  /**
   * Slide 6: Persona Analysis
   */
  private addPersonaSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Persona: ' + input.briefAnalysis.persona.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    slide.addText(input.briefAnalysis.persona.description, {
      x: 0.7,
      y: 1.5,
      w: 8.6,
      h: 1.5,
      fontSize: 16,
      color: '000000',
    });

    // 강점 (간단히 3개만)
    const strengths = input.briefAnalysis.persona.strengths.slice(0, 3);
    slide.addText('Core Strengths:', {
      x: 0.7,
      y: 3.2,
      w: 8.6,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: '333333',
    });

    strengths.forEach((strength, idx) => {
      slide.addText(`• ${strength}`, {
        x: 1,
        y: 3.7 + idx * 0.4,
        w: 8,
        h: 0.35,
        fontSize: 14,
        color: '000000',
      });
    });
  }

  /**
   * Slide 7: Value Proposition
   */
  private addValuePropSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Value Proposition', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    slide.addText(input.brandStrategy.uniqueValueProposition, {
      x: 0.7,
      y: 1.8,
      w: 8.6,
      h: 2.5,
      fontSize: 18,
      color: '000000',
      valign: 'middle',
    });
  }

  /**
   * Slide 8: Career Timeline (간단 버전)
   */
  private addTimelineSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Career Timeline', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    const experiences = input.resume.experiences?.slice(0, 4) || [];
    experiences.forEach((exp, idx) => {
      slide.addText(`${exp.duration} | ${exp.company} - ${exp.role}`, {
        x: 1,
        y: 1.5 + idx * 0.6,
        w: 8,
        h: 0.5,
        fontSize: 14,
        color: '000000',
      });
    });
  }

  /**
   * Slides 9-11: Top 3 Experiences (각 경력 1 슬라이드)
   */
  private addExperienceSlides(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const topExperiences = input.resume.experiences?.slice(0, 3) || [];

    topExperiences.forEach((exp) => {
      const slide = pptx.addSlide();

      slide.addText(`${exp.company}`, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.6,
        fontSize: 28,
        bold: true,
        color: titleColor,
      });

      slide.addText(`${exp.role} | ${exp.duration}`, {
        x: 0.5,
        y: 1.1,
        w: 9,
        h: 0.4,
        fontSize: 16,
        color: '666666',
      });

      if (exp.description) {
        slide.addText(exp.description, {
          x: 0.7,
          y: 1.8,
          w: 8.6,
          h: 1,
          fontSize: 14,
          color: '000000',
        });
      }

      if (exp.achievements && exp.achievements.length > 0) {
        slide.addText('Key Achievements:', {
          x: 0.7,
          y: 3,
          w: 8.6,
          h: 0.4,
          fontSize: 16,
          bold: true,
          color: '333333',
        });

        exp.achievements.slice(0, 3).forEach((achievement, idx) => {
          slide.addText(`• ${achievement}`, {
            x: 1,
            y: 3.5 + idx * 0.4,
            w: 8,
            h: 0.35,
            fontSize: 13,
            color: '000000',
          });
        });
      }
    });
  }

  /**
   * Slide 12: Technical Skills
   */
  private addSkillsSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Technical Skills', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    const skills = input.resume.skills || [];
    const skillsText = skills.slice(0, 15).join(', ');

    slide.addText(skillsText, {
      x: 0.7,
      y: 1.5,
      w: 8.6,
      h: 3,
      fontSize: 16,
      color: '000000',
      valign: 'top',
    });
  }

  /**
   * Slide 13: Core Strengths
   */
  private addStrengthsSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Core Strengths', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    const strengths = input.content.strengthsSection || [];
    const bullets = strengths.slice(0, 5).map((strength: string) => ({
      text: strength,
      options: { bullet: true, fontSize: 16, color: '000000' },
    }));

    slide.addText(bullets, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 3,
    });
  }

  /**
   * Slide 14: Key Achievements
   */
  private addAchievementsSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Key Achievements', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    const achievements = input.content.achievementsSection || [];
    const bullets = achievements.slice(0, 5).map((achievement: string) => ({
      text: achievement,
      options: { bullet: true, fontSize: 16, color: '000000' },
    }));

    slide.addText(bullets, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 3,
    });
  }

  /**
   * Slide 15: Differentiators (using keyMessages)
   */
  private addDifferentiatorsSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('What Makes Me Different', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    const differentiators = input.brandStrategy.keyMessages || [];
    const bullets = differentiators.map((diff: string) => ({
      text: diff,
      options: { bullet: true, fontSize: 18, color: '000000' },
    }));

    slide.addText(bullets, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 3,
    });
  }

  /**
   * Slide 16: Target Audience
   */
  private addTargetAudienceSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Target Audience', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    // targetAudience is an array, convert to bullets
    const audiences = Array.isArray(input.brandStrategy.targetAudience)
      ? input.brandStrategy.targetAudience
      : [input.brandStrategy.targetAudience];

    let yOffset = 1.8;
    audiences.forEach((audience) => {
      if (yOffset < 5) {
        slide.addText(`• ${audience}`, {
          x: 0.7,
          y: yOffset,
          w: 8.6,
          h: 0.4,
          fontSize: 16,
          color: '000000',
        });
        yOffset += 0.5;
      }
    });
  }

  /**
   * Slide 17: Future Vision
   */
  private addFutureVisionSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Future Vision', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    const vision = input.content.futureVision || '';
    slide.addText(vision, {
      x: 0.7,
      y: 1.5,
      w: 8.6,
      h: 3,
      fontSize: 16,
      color: '000000',
      valign: 'top',
    });
  }

  /**
   * Slide 18: Call to Action
   */
  private addCallToActionSlide(pptx: PptxGenJS, input: SlideInput, titleColor: string): void {
    const slide = pptx.addSlide();

    slide.addText('Let\'s Work Together', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: titleColor,
    });

    const cta = input.content.callToAction || 'Contact me to discuss collaboration opportunities.';
    slide.addText(cta, {
      x: 0.7,
      y: 2,
      w: 8.6,
      h: 2,
      fontSize: 20,
      color: '000000',
      valign: 'middle',
      align: 'center',
    });
  }

  /**
   * Slide 19: Thank You
   */
  private addThankYouSlide(pptx: PptxGenJS, input: SlideInput, bgColor: string): void {
    const slide = pptx.addSlide();
    slide.background = { color: bgColor };

    slide.addText('Thank You', {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 1,
      fontSize: 48,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    });

    const email = input.resume.personalInfo.email || '';
    if (email) {
      slide.addText(email, {
        x: 0.5,
        y: 3,
        w: 9,
        h: 0.6,
        fontSize: 24,
        color: 'FFFFFF',
        align: 'center',
      });
    }
  }

  /**
   * 슬라이드 데이터 준비 (Skills용)
   */
  private prepareSlideData(input: SlideInput, design: DesignSpec): any[] {
    return [
      {
        title: input.resume.personalInfo.name,
        subtitle: input.briefAnalysis.persona.title,
        type: 'cover',
      },
      // ... 나머지 슬라이드 데이터 (Skills API 스펙에 맞게 구성)
    ];
  }

  /**
   * Step 3: PPTX→PDF 변환
   */
  private async convertPptxToPdf(pptxBuffer: Buffer): Promise<Buffer> {
    // Development: LibreOffice
    if (process.env.NODE_ENV === 'development' || !process.env.CLOUDCONVERT_API_KEY) {
      console.log('[SlideDeckGenerator] Using LibreOffice for PPTX→PDF conversion...');

      try {
        // @ts-ignore
        const libre = require('libreoffice-convert');
        const { promisify } = require('util');
        const convertAsync = promisify(libre.convert);

        const pdfBuffer = await convertAsync(pptxBuffer, '.pdf', undefined);
        return pdfBuffer as Buffer;
      } catch (error) {
        console.error('[SlideDeckGenerator] LibreOffice conversion failed:', error);
        throw new Error(
          'LibreOffice conversion failed. ' +
          'Please install LibreOffice: brew install libreoffice (macOS) or apt-get install libreoffice (Ubuntu)'
        );
      }
    }

    // Production: CloudConvert API (placeholder)
    console.log('[SlideDeckGenerator] Using CloudConvert for PPTX→PDF conversion...');
    throw new Error(
      'CloudConvert integration not yet implemented. ' +
      'Please run in development mode with LibreOffice installed, ' +
      'or add CLOUDCONVERT_API_KEY to environment variables.'
    );

    // TODO: CloudConvert 구현
    // const FormData = require('form-data');
    // const axios = require('axios');
    //
    // const formData = new FormData();
    // formData.append('file', pptxBuffer, 'slide-deck.pptx');
    //
    // const response = await axios.post(...);
    // return Buffer.from(response.data);
  }
}
