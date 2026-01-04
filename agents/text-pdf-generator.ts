import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { TextPdfInput, TextPdfOutput } from '@/types/pdf';

/**
 * TextPdfGeneratorAgent
 *
 * pdf-lib을 사용하여 텍스트 중심의 상세한 개인 브랜딩 보고서를 생성합니다.
 *
 * 출력 구조 (8-12 페이지):
 * 1. 커버 페이지
 * 2. Executive Summary
 * 3-4. Brand Strategy
 * 5-8. Professional Experience
 * 9. Skills & Education
 * 10. Achievements
 * 11. Future Vision
 * 12. Contact Information
 */
export class TextPdfGeneratorAgent extends BaseAgent<TextPdfInput, TextPdfOutput> {
  // A4 크기 (pt 단위)
  private readonly PAGE_WIDTH = 595;
  private readonly PAGE_HEIGHT = 842;
  private readonly MARGIN = 50;
  private readonly LINE_HEIGHT = 20;

  constructor() {
    super(
      'TextPdfGenerator',
      `당신은 개인 브랜딩 보고서를 상세한 PDF 문서로 변환하는 전문가입니다.
가독성 높은 레이아웃과 명확한 섹션 구분을 제공하세요.

출력 요구사항:
- A4 크기 (595 x 842 pt)
- 명확한 섹션 구분
- 가독성 높은 폰트 크기와 행간
- 8-12 페이지 분량`
    );
  }

  /**
   * 한글 폰트 다운로드 및 임베딩
   * 로컬 Noto Sans KR 사용
   */
  private async embedKoreanFont(doc: PDFDocument): Promise<PDFFont> {
    try {
      console.log('[TextPdfGenerator] Loading Korean font (Noto Sans KR)...');

      // 로컬 폰트 파일 읽기
      const fs = require('fs');
      const path = require('path');
      const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansKR-Regular.ttf');

      const fontBytes = fs.readFileSync(fontPath);

      // fontkit 등록
      doc.registerFontkit(fontkit);

      // 폰트 임베딩
      const customFont = await doc.embedFont(fontBytes);
      console.log('[TextPdfGenerator] Korean font embedded successfully');

      return customFont;
    } catch (error) {
      console.error('[TextPdfGenerator] Failed to embed Korean font:', error);
      // Fallback to Helvetica (will fail on Korean characters)
      console.warn('[TextPdfGenerator] Falling back to Helvetica (Korean text may not render)');
      return await doc.embedFont(StandardFonts.Helvetica);
    }
  }

  /**
   * Bold 한글 폰트 다운로드 및 임베딩
   * Regular 폰트 재사용 (Bold 별도 파일 없음)
   */
  private async embedKoreanFontBold(doc: PDFDocument): Promise<PDFFont> {
    // Regular 폰트를 재사용 (별도 Bold 폰트 파일이 없으므로)
    console.log('[TextPdfGenerator] Using Regular font for bold (no separate Bold font)');
    return await this.embedKoreanFont(doc);
  }

  async process(
    input: TextPdfInput,
    context: AgentContext
  ): Promise<AgentResult<TextPdfOutput>> {
    try {
      console.log('[TextPdfGenerator] Starting PDF generation...');

      const pdfDoc = await PDFDocument.create();

      // 한글 폰트 임베딩
      const koreanFont = await this.embedKoreanFont(pdfDoc);
      const koreanFontBold = await this.embedKoreanFontBold(pdfDoc);

      // 페이지 생성 (한글 폰트 사용)
      await this.addCoverPage(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addExecutiveSummary(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addBrandStrategy(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addProfessionalExperience(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addSkillsAndEducation(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addAchievements(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addFutureVision(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addContactInformation(pdfDoc, input, koreanFont, koreanFontBold);

      // PDF 저장
      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);

      console.log(`[TextPdfGenerator] PDF generated successfully (${pdfDoc.getPageCount()} pages, ${pdfBuffer.length} bytes)`);

      return this.success({
        pdfBuffer,
        metadata: {
          pageCount: pdfDoc.getPageCount(),
          fileSize: pdfBuffer.length,
        },
      });
    } catch (error) {
      console.error('[TextPdfGenerator] Error:', error);
      return this.failure((error as Error).message);
    }
  }

  /**
   * 1. 커버 페이지
   */
  private async addCoverPage(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    const { name, email } = input.resume.personalInfo;

    // 타이틀
    page.drawText(name || 'Personal Branding Report', {
      x: this.MARGIN,
      y: this.PAGE_HEIGHT - 150,
      size: 36,
      font: boldFont,
      color: rgb(0.2, 0.3, 0.8),
    });

    // 서브타이틀
    page.drawText('개인 브랜딩 보고서', {
      x: this.MARGIN,
      y: this.PAGE_HEIGHT - 200,
      size: 24,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // 이메일
    if (email) {
      page.drawText(email, {
        x: this.MARGIN,
        y: this.PAGE_HEIGHT - 250,
        size: 14,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // 생성일
    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    page.drawText(`생성일: ${today}`, {
      x: this.MARGIN,
      y: 100,
      size: 12,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  /**
   * 2. Executive Summary
   */
  private async addExecutiveSummary(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN;

    // 섹션 타이틀
    yOffset = this.drawSectionTitle(page, 'Executive Summary', yOffset, boldFont);

    // 내용
    const summary = input.report.metadata?.executiveSummary || input.brandStrategy.brandEssence;
    yOffset = this.drawParagraph(page, summary, yOffset, font);
  }

  /**
   * 3-4. Brand Strategy
   */
  private async addBrandStrategy(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN;

    // 섹션 타이틀
    yOffset = this.drawSectionTitle(page, 'Brand Strategy', yOffset, boldFont);

    // Brand Essence
    yOffset -= this.LINE_HEIGHT;
    page.drawText('Brand Essence', {
      x: this.MARGIN,
      y: yOffset,
      size: 16,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yOffset -= this.LINE_HEIGHT * 1.5;
    yOffset = this.drawParagraph(page, input.brandStrategy.brandEssence, yOffset, font);

    // Value Proposition
    yOffset -= this.LINE_HEIGHT * 2;
    page.drawText('Value Proposition', {
      x: this.MARGIN,
      y: yOffset,
      size: 16,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yOffset -= this.LINE_HEIGHT * 1.5;
    yOffset = this.drawParagraph(page, input.brandStrategy.uniqueValueProposition, yOffset, font);

    // Target Audience
    yOffset -= this.LINE_HEIGHT * 2;
    page.drawText('Target Audience', {
      x: this.MARGIN,
      y: yOffset,
      size: 16,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yOffset -= this.LINE_HEIGHT * 1.5;
    yOffset = this.drawParagraph(page, input.brandStrategy.targetAudience.join(', '), yOffset, font);

    // Brand Personality
    if (yOffset > 150) {
      yOffset -= this.LINE_HEIGHT * 2;
      page.drawText('Brand Personality', {
        x: this.MARGIN,
        y: yOffset,
        size: 16,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;

      input.brandStrategy.brandPersonality.forEach((trait: string) => {
        if (yOffset < 100) return;
        page.drawText(`• ${trait}`, {
          x: this.MARGIN + 20,
          y: yOffset,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        yOffset -= this.LINE_HEIGHT;
      });
    }
  }

  /**
   * 5-8. Professional Experience
   */
  private async addProfessionalExperience(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const experiences = input.resume.experiences || [];

    let page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN;

    // 섹션 타이틀
    yOffset = this.drawSectionTitle(page, 'Professional Experience', yOffset, boldFont);

    experiences.forEach((exp) => {
      // 새 페이지 필요 시
      if (yOffset < 150) {
        page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
        yOffset = this.PAGE_HEIGHT - this.MARGIN;
      }

      yOffset -= this.LINE_HEIGHT;

      // 회사명 + 직책
      page.drawText(`${exp.company} - ${exp.role}`, {
        x: this.MARGIN,
        y: yOffset,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yOffset -= this.LINE_HEIGHT;

      // 기간
      page.drawText(exp.duration, {
        x: this.MARGIN,
        y: yOffset,
        size: 11,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;

      // 설명
      if (exp.description) {
        yOffset = this.drawParagraph(page, exp.description, yOffset, font, 12);
      }

      // 성과
      if (exp.achievements && exp.achievements.length > 0) {
        yOffset -= this.LINE_HEIGHT;
        exp.achievements.forEach((achievement: string) => {
          if (yOffset < 100) return;
          page.drawText(`• ${achievement}`, {
            x: this.MARGIN + 20,
            y: yOffset,
            size: 11,
            font: font,
            color: rgb(0, 0, 0),
          });
          yOffset -= this.LINE_HEIGHT;
        });
      }

      yOffset -= this.LINE_HEIGHT;
    });
  }

  /**
   * 9. Skills & Education
   */
  private async addSkillsAndEducation(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN;

    // 섹션 타이틀
    yOffset = this.drawSectionTitle(page, 'Skills & Education', yOffset, boldFont);

    // Skills
    if (input.resume.skills && input.resume.skills.length > 0) {
      yOffset -= this.LINE_HEIGHT;
      page.drawText('Skills', {
        x: this.MARGIN,
        y: yOffset,
        size: 14,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;

      const skillsText = input.resume.skills.join(', ');
      yOffset = this.drawParagraph(page, skillsText, yOffset, font, 11);
    }

    // Education
    if (input.resume.education && input.resume.education.length > 0) {
      yOffset -= this.LINE_HEIGHT * 2;
      page.drawText('Education', {
        x: this.MARGIN,
        y: yOffset,
        size: 14,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;

      input.resume.education.forEach((edu) => {
        if (yOffset < 100) return;
        page.drawText(`${edu.degree} - ${edu.school} (${edu.year})`, {
          x: this.MARGIN + 20,
          y: yOffset,
          size: 11,
          font: font,
          color: rgb(0, 0, 0),
        });
        yOffset -= this.LINE_HEIGHT;
      });
    }

    // Certifications
    if (input.resume.certifications && input.resume.certifications.length > 0) {
      yOffset -= this.LINE_HEIGHT * 2;
      page.drawText('Certifications', {
        x: this.MARGIN,
        y: yOffset,
        size: 14,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;

      input.resume.certifications.forEach((cert: string) => {
        if (yOffset < 100) return;
        page.drawText(`• ${cert}`, {
          x: this.MARGIN + 20,
          y: yOffset,
          size: 11,
          font: font,
          color: rgb(0, 0, 0),
        });
        yOffset -= this.LINE_HEIGHT;
      });
    }
  }

  /**
   * 10. Achievements
   */
  private async addAchievements(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN;

    // 섹션 타이틀
    yOffset = this.drawSectionTitle(page, 'Key Achievements', yOffset, boldFont);

    // ReportContent에서 achievementsSection 가져오기
    const achievements = input.report.metadata?.achievementsSection || [];

    achievements.forEach((achievement) => {
      if (yOffset < 100) return;
      yOffset -= this.LINE_HEIGHT;
      page.drawText(`• ${achievement}`, {
        x: this.MARGIN + 20,
        y: yOffset,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yOffset -= this.LINE_HEIGHT;
    });
  }

  /**
   * 11. Future Vision
   */
  private async addFutureVision(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN;

    // 섹션 타이틀
    yOffset = this.drawSectionTitle(page, 'Future Vision', yOffset, boldFont);

    // 내용
    const vision = input.report.metadata?.futureVision || '';
    yOffset = this.drawParagraph(page, vision, yOffset, font);

    // Call to Action
    if (input.report.metadata?.callToAction) {
      yOffset -= this.LINE_HEIGHT * 2;
      page.drawText('Call to Action', {
        x: this.MARGIN,
        y: yOffset,
        size: 16,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;
      yOffset = this.drawParagraph(page, input.report.metadata.callToAction, yOffset, font);
    }
  }

  /**
   * 12. Contact Information
   */
  private async addContactInformation(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN;

    // 섹션 타이틀
    yOffset = this.drawSectionTitle(page, 'Contact Information', yOffset, boldFont);

    const { personalInfo } = input.resume;

    yOffset -= this.LINE_HEIGHT;

    if (personalInfo.email) {
      page.drawText(`Email: ${personalInfo.email}`, {
        x: this.MARGIN,
        y: yOffset,
        size: 14,
        font: font,
        color: rgb(0, 0, 0),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;
    }

    if (personalInfo.phone) {
      page.drawText(`Phone: ${personalInfo.phone}`, {
        x: this.MARGIN,
        y: yOffset,
        size: 14,
        font: font,
        color: rgb(0, 0, 0),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;
    }

    if (personalInfo.location) {
      page.drawText(`Location: ${personalInfo.location}`, {
        x: this.MARGIN,
        y: yOffset,
        size: 14,
        font: font,
        color: rgb(0, 0, 0),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;
    }

    // Links
    if (personalInfo.links && personalInfo.links.length > 0) {
      yOffset -= this.LINE_HEIGHT;
      page.drawText('Links:', {
        x: this.MARGIN,
        y: yOffset,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;

      personalInfo.links.forEach((link: any) => {
        if (yOffset < 100) return;
        const linkText = typeof link === 'string' ? link : `${link.label}: ${link.url}`;
        page.drawText(linkText, {
          x: this.MARGIN + 20,
          y: yOffset,
          size: 12,
          font: font,
          color: rgb(0, 0, 0.8),
        });
        yOffset -= this.LINE_HEIGHT;
      });
    }
  }

  /**
   * 유틸리티: 섹션 타이틀 그리기
   */
  private drawSectionTitle(
    page: PDFPage,
    title: string,
    yOffset: number,
    font: PDFFont
  ): number {
    page.drawText(title, {
      x: this.MARGIN,
      y: yOffset,
      size: 20,
      font: font,
      color: rgb(0.2, 0.3, 0.8),
    });

    // 구분선
    page.drawLine({
      start: { x: this.MARGIN, y: yOffset - 5 },
      end: { x: this.PAGE_WIDTH - this.MARGIN, y: yOffset - 5 },
      thickness: 2,
      color: rgb(0.8, 0.8, 0.8),
    });

    return yOffset - this.LINE_HEIGHT * 2;
  }

  /**
   * 유틸리티: 단락 텍스트 그리기 (자동 줄바꿈)
   */
  private drawParagraph(
    page: PDFPage,
    text: string,
    yOffset: number,
    font: PDFFont,
    fontSize: number = 12
  ): number {
    const maxWidth = this.PAGE_WIDTH - 2 * this.MARGIN;
    const words = text.split(' ');
    let line = '';

    words.forEach((word) => {
      const testLine = line + word + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && line !== '') {
        page.drawText(line.trim(), {
          x: this.MARGIN,
          y: yOffset,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        yOffset -= this.LINE_HEIGHT;
        line = word + ' ';
      } else {
        line = testLine;
      }
    });

    // 마지막 줄
    if (line.trim()) {
      page.drawText(line.trim(), {
        x: this.MARGIN,
        y: yOffset,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      yOffset -= this.LINE_HEIGHT;
    }

    return yOffset;
  }
}
