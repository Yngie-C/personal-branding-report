import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { TextPdfInput, TextPdfOutput } from '@/types/pdf';
import { pdfColors, RGBColor } from '@/lib/theme/report-styles';

/**
 * TextPdfGeneratorAgent
 *
 * pdf-lib을 사용하여 텍스트 중심의 상세한 개인 브랜딩 보고서를 생성합니다.
 *
 * 출력 구조 (8-12 페이지):
 * 1. 커버 페이지 (그라데이션 배경, 페르소나 강조)
 * 2. 목차 페이지 (클릭 가능한 내부 링크)
 * 3. Executive Summary
 * 4-5. Brand Strategy
 * 6-9. Professional Experience
 * 10. Skills & Education
 * 11. Achievements
 * 12. Future Vision
 * 13. Contact Information
 */
export class TextPdfGeneratorAgent extends BaseAgent<TextPdfInput, TextPdfOutput> {
  // A4 크기 (pt 단위)
  private readonly PAGE_WIDTH = 595;
  private readonly PAGE_HEIGHT = 842;
  private readonly MARGIN = 50;
  private readonly LINE_HEIGHT = 20;
  private readonly FOOTER_HEIGHT = 40;
  private readonly HEADER_HEIGHT = 30;

  // 섹션 정보 (목차 생성용)
  private sectionInfo: { title: string; pageNumber: number }[] = [];
  private totalPages = 0;

  // 색상 정의 (report-styles.ts 기반)
  private readonly COLORS = {
    // 프라이머리 Navy 계열
    navy: { r: 30 / 255, g: 41 / 255, b: 59 / 255 },           // slate-800
    navyDark: { r: 15 / 255, g: 23 / 255, b: 42 / 255 },       // slate-900
    navyLight: { r: 51 / 255, g: 65 / 255, b: 85 / 255 },      // slate-700

    // 인디고 (강조)
    indigo: { r: 79 / 255, g: 70 / 255, b: 229 / 255 },        // indigo-600
    indigoLight: { r: 165 / 255, g: 180 / 255, b: 252 / 255 }, // indigo-300
    indigoDark: { r: 55 / 255, g: 48 / 255, b: 163 / 255 },    // indigo-800

    // 그레이 스케일
    white: { r: 1, g: 1, b: 1 },
    lightGray: { r: 249 / 255, g: 250 / 255, b: 251 / 255 },   // gray-50
    gray: { r: 156 / 255, g: 163 / 255, b: 175 / 255 },        // gray-400
    darkGray: { r: 75 / 255, g: 85 / 255, b: 99 / 255 },       // gray-600
    black: { r: 17 / 255, g: 24 / 255, b: 39 / 255 },          // gray-900
  };

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

      // 섹션 정보 초기화
      this.sectionInfo = [];
      this.totalPages = 0;

      // 페이지 생성 (한글 폰트 사용)
      await this.addCoverPage(pdfDoc, input, koreanFont, koreanFontBold);

      // 목차 페이지 자리 확보 (나중에 업데이트)
      const tocPageIndex = pdfDoc.getPageCount();
      await this.addTableOfContentsPage(pdfDoc, koreanFont, koreanFontBold);

      // 콘텐츠 페이지들
      await this.addExecutiveSummary(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addBrandStrategy(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addProfessionalExperience(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addSkillsAndEducation(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addAchievements(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addFutureVision(pdfDoc, input, koreanFont, koreanFontBold);
      await this.addContactInformation(pdfDoc, input, koreanFont, koreanFontBold);

      // 총 페이지 수 업데이트
      this.totalPages = pdfDoc.getPageCount();

      // 목차 페이지 업데이트 (페이지 번호 포함)
      await this.updateTableOfContents(pdfDoc, tocPageIndex, koreanFont, koreanFontBold);

      // 모든 페이지에 푸터 추가 (커버 제외)
      await this.addFootersToAllPages(pdfDoc, koreanFont);

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

  // ==========================================
  // 유틸리티 함수
  // ==========================================

  /**
   * 그라데이션 배경 그리기 (수직 그라데이션 시뮬레이션)
   * pdf-lib은 실제 그라데이션을 지원하지 않으므로 여러 줄로 시뮬레이션
   */
  private drawGradientBackground(
    page: PDFPage,
    startColor: { r: number; g: number; b: number },
    endColor: { r: number; g: number; b: number },
    startY: number,
    endY: number
  ): void {
    const steps = 50; // 그라데이션 단계 수
    const height = startY - endY;
    const stepHeight = height / steps;

    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const r = startColor.r + (endColor.r - startColor.r) * ratio;
      const g = startColor.g + (endColor.g - startColor.g) * ratio;
      const b = startColor.b + (endColor.b - startColor.b) * ratio;

      page.drawRectangle({
        x: 0,
        y: startY - (i + 1) * stepHeight,
        width: this.PAGE_WIDTH,
        height: stepHeight + 1, // 약간 오버랩하여 선이 보이지 않도록
        color: rgb(r, g, b),
      });
    }
  }

  /**
   * 섹션 헤더 그리기 (개선된 버전)
   */
  private drawEnhancedSectionHeader(
    page: PDFPage,
    sectionNumber: number,
    title: string,
    yOffset: number,
    font: PDFFont,
    boldFont: PDFFont
  ): number {
    const { indigo, navy, gray } = this.COLORS;

    // 섹션 번호 배경 원
    const circleX = this.MARGIN + 15;
    const circleY = yOffset - 5;
    page.drawCircle({
      x: circleX,
      y: circleY,
      size: 15,
      color: rgb(indigo.r, indigo.g, indigo.b),
    });

    // 섹션 번호
    page.drawText(String(sectionNumber), {
      x: circleX - 5,
      y: circleY - 6,
      size: 14,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    // 섹션 타이틀
    page.drawText(title, {
      x: this.MARGIN + 40,
      y: yOffset,
      size: 20,
      font: boldFont,
      color: rgb(navy.r, navy.g, navy.b),
    });

    // 구분선 (Navy 색상)
    page.drawLine({
      start: { x: this.MARGIN, y: yOffset - 25 },
      end: { x: this.PAGE_WIDTH - this.MARGIN, y: yOffset - 25 },
      thickness: 2,
      color: rgb(indigo.r, indigo.g, indigo.b),
    });

    // 얇은 보조선
    page.drawLine({
      start: { x: this.MARGIN, y: yOffset - 28 },
      end: { x: this.PAGE_WIDTH - this.MARGIN, y: yOffset - 28 },
      thickness: 0.5,
      color: rgb(gray.r, gray.g, gray.b),
    });

    return yOffset - this.LINE_HEIGHT * 2.5;
  }

  /**
   * 푸터 그리기
   */
  private drawFooter(
    page: PDFPage,
    pageNumber: number,
    totalPages: number,
    font: PDFFont
  ): void {
    const { gray, indigo } = this.COLORS;

    // 푸터 배경
    page.drawRectangle({
      x: 0,
      y: 0,
      width: this.PAGE_WIDTH,
      height: this.FOOTER_HEIGHT,
      color: rgb(this.COLORS.lightGray.r, this.COLORS.lightGray.g, this.COLORS.lightGray.b),
    });

    // 상단 구분선
    page.drawLine({
      start: { x: this.MARGIN, y: this.FOOTER_HEIGHT },
      end: { x: this.PAGE_WIDTH - this.MARGIN, y: this.FOOTER_HEIGHT },
      thickness: 0.5,
      color: rgb(gray.r, gray.g, gray.b),
    });

    // 페이지 번호
    const pageText = `Page ${pageNumber} of ${totalPages}`;
    const pageTextWidth = font.widthOfTextAtSize(pageText, 10);
    page.drawText(pageText, {
      x: (this.PAGE_WIDTH - pageTextWidth) / 2,
      y: 15,
      size: 10,
      font: font,
      color: rgb(gray.r, gray.g, gray.b),
    });

    // 서비스 URL (왼쪽)
    page.drawText('Personal Branding Report', {
      x: this.MARGIN,
      y: 15,
      size: 8,
      font: font,
      color: rgb(indigo.r, indigo.g, indigo.b),
    });

    // 생성일 (오른쪽)
    const today = new Date().toLocaleDateString('ko-KR');
    const dateTextWidth = font.widthOfTextAtSize(today, 8);
    page.drawText(today, {
      x: this.PAGE_WIDTH - this.MARGIN - dateTextWidth,
      y: 15,
      size: 8,
      font: font,
      color: rgb(gray.r, gray.g, gray.b),
    });
  }

  /**
   * 모든 페이지에 푸터 추가 (커버 페이지 제외)
   */
  private async addFootersToAllPages(doc: PDFDocument, font: PDFFont): Promise<void> {
    const pages = doc.getPages();
    // 커버 페이지(0)와 목차 페이지(1)를 제외한 나머지에 푸터 추가
    for (let i = 2; i < pages.length; i++) {
      this.drawFooter(pages[i], i - 1, this.totalPages - 2, font);
    }
  }

  /**
   * 서브섹션 헤더 그리기
   */
  private drawSubsectionHeader(
    page: PDFPage,
    title: string,
    yOffset: number,
    boldFont: PDFFont
  ): number {
    const { navyLight, indigoLight } = this.COLORS;

    // 왼쪽 장식 바
    page.drawRectangle({
      x: this.MARGIN,
      y: yOffset - 15,
      width: 4,
      height: 20,
      color: rgb(indigoLight.r, indigoLight.g, indigoLight.b),
    });

    // 서브섹션 타이틀
    page.drawText(title, {
      x: this.MARGIN + 15,
      y: yOffset,
      size: 16,
      font: boldFont,
      color: rgb(navyLight.r, navyLight.g, navyLight.b),
    });

    return yOffset - this.LINE_HEIGHT * 1.5;
  }

  // ==========================================
  // 페이지 생성 함수들
  // ==========================================

  /**
   * 1. 커버 페이지 (개선된 버전)
   */
  private async addCoverPage(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    const { name, email } = input.resume.personalInfo;
    const { navyDark, white, indigo, indigoLight, gray } = this.COLORS;

    // 그라데이션 배경 (Navy → White)
    this.drawGradientBackground(
      page,
      navyDark,
      white,
      this.PAGE_HEIGHT,
      0
    );

    // 상단 장식 바
    page.drawRectangle({
      x: 0,
      y: this.PAGE_HEIGHT - 8,
      width: this.PAGE_WIDTH,
      height: 8,
      color: rgb(indigo.r, indigo.g, indigo.b),
    });

    // 상단 로고/서비스명 영역
    page.drawText('PERSONAL BRANDING REPORT', {
      x: this.MARGIN,
      y: this.PAGE_HEIGHT - 60,
      size: 12,
      font: font,
      color: rgb(indigoLight.r, indigoLight.g, indigoLight.b),
    });

    // 메인 타이틀 (이름)
    const displayName = name || 'Personal Branding Report';
    const nameSize = displayName.length > 10 ? 36 : 44;
    page.drawText(displayName, {
      x: this.MARGIN,
      y: this.PAGE_HEIGHT - 180,
      size: nameSize,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    // 서브타이틀
    page.drawText('개인 브랜딩 보고서', {
      x: this.MARGIN,
      y: this.PAGE_HEIGHT - 230,
      size: 24,
      font: font,
      color: rgb(indigoLight.r, indigoLight.g, indigoLight.b),
    });

    // 구분선
    page.drawLine({
      start: { x: this.MARGIN, y: this.PAGE_HEIGHT - 260 },
      end: { x: this.PAGE_WIDTH / 2, y: this.PAGE_HEIGHT - 260 },
      thickness: 2,
      color: rgb(indigo.r, indigo.g, indigo.b),
    });

    // Brand Essence 강조 박스
    const brandEssence = input.brandStrategy.brandEssence;
    if (brandEssence) {
      // 박스 배경
      page.drawRectangle({
        x: this.MARGIN,
        y: this.PAGE_HEIGHT - 380,
        width: this.PAGE_WIDTH - 2 * this.MARGIN,
        height: 100,
        color: rgb(1, 1, 1),
        opacity: 0.15,
        borderColor: rgb(indigo.r, indigo.g, indigo.b),
        borderWidth: 1,
      });

      // Brand Essence 라벨
      page.drawText('BRAND ESSENCE', {
        x: this.MARGIN + 20,
        y: this.PAGE_HEIGHT - 310,
        size: 11,
        font: boldFont,
        color: rgb(indigoLight.r, indigoLight.g, indigoLight.b),
      });

      // Brand Essence 내용 (자동 줄바꿈)
      const essenceLines = this.wrapText(brandEssence, font, 14, this.PAGE_WIDTH - 2 * this.MARGIN - 40);
      let essenceY = this.PAGE_HEIGHT - 340;
      essenceLines.slice(0, 3).forEach((line) => {
        page.drawText(line, {
          x: this.MARGIN + 20,
          y: essenceY,
          size: 14,
          font: font,
          color: rgb(1, 1, 1),
        });
        essenceY -= this.LINE_HEIGHT;
      });
    }

    // 이메일
    if (email) {
      page.drawText(email, {
        x: this.MARGIN,
        y: 120,
        size: 14,
        font: font,
        color: rgb(gray.r, gray.g, gray.b),
      });
    }

    // 생성일 및 버전 정보 하단
    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    page.drawText(`생성일: ${today}`, {
      x: this.MARGIN,
      y: 80,
      size: 11,
      font: font,
      color: rgb(gray.r, gray.g, gray.b),
    });

    page.drawText('Version 1.0', {
      x: this.MARGIN,
      y: 60,
      size: 10,
      font: font,
      color: rgb(gray.r, gray.g, gray.b),
    });

    // 하단 장식 바
    page.drawRectangle({
      x: 0,
      y: 0,
      width: this.PAGE_WIDTH,
      height: 4,
      color: rgb(indigo.r, indigo.g, indigo.b),
    });
  }

  /**
   * 텍스트 자동 줄바꿈 유틸리티
   */
  private wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + word + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines;
  }

  /**
   * 2. 목차 페이지
   */
  private async addTableOfContentsPage(
    doc: PDFDocument,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    const { navy, indigo, gray, lightGray } = this.COLORS;

    // 헤더 배경
    page.drawRectangle({
      x: 0,
      y: this.PAGE_HEIGHT - 80,
      width: this.PAGE_WIDTH,
      height: 80,
      color: rgb(lightGray.r, lightGray.g, lightGray.b),
    });

    // 타이틀
    page.drawText('목차', {
      x: this.MARGIN,
      y: this.PAGE_HEIGHT - 55,
      size: 28,
      font: boldFont,
      color: rgb(navy.r, navy.g, navy.b),
    });

    page.drawText('Table of Contents', {
      x: this.MARGIN + 80,
      y: this.PAGE_HEIGHT - 55,
      size: 14,
      font: font,
      color: rgb(gray.r, gray.g, gray.b),
    });

    // 장식 선
    page.drawLine({
      start: { x: this.MARGIN, y: this.PAGE_HEIGHT - 90 },
      end: { x: this.PAGE_WIDTH - this.MARGIN, y: this.PAGE_HEIGHT - 90 },
      thickness: 2,
      color: rgb(indigo.r, indigo.g, indigo.b),
    });

    // 섹션 리스트는 updateTableOfContents에서 채움
  }

  /**
   * 목차 업데이트 (페이지 번호 포함)
   */
  private async updateTableOfContents(
    doc: PDFDocument,
    tocPageIndex: number,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.getPages()[tocPageIndex];
    const { navy, indigo, gray, lightGray } = this.COLORS;

    // 목차 항목 정의
    const tocItems = [
      { section: 1, title: 'Executive Summary', pageOffset: 2 },
      { section: 2, title: 'Brand Strategy', pageOffset: 3 },
      { section: 3, title: 'Professional Experience', pageOffset: 4 },
      { section: 4, title: 'Skills & Education', pageOffset: 5 },
      { section: 5, title: 'Key Achievements', pageOffset: 6 },
      { section: 6, title: 'Future Vision', pageOffset: 7 },
      { section: 7, title: 'Contact Information', pageOffset: 8 },
    ];

    let yOffset = this.PAGE_HEIGHT - 140;

    tocItems.forEach((item, index) => {
      // 번호와 타이틀
      const numberX = this.MARGIN;
      const titleX = this.MARGIN + 35;

      // 섹션 번호 (원형 배경)
      page.drawCircle({
        x: numberX + 12,
        y: yOffset + 5,
        size: 12,
        color: rgb(indigo.r, indigo.g, indigo.b),
      });

      page.drawText(String(item.section), {
        x: numberX + 8,
        y: yOffset,
        size: 12,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      // 섹션 타이틀
      page.drawText(item.title, {
        x: titleX,
        y: yOffset,
        size: 14,
        font: font,
        color: rgb(navy.r, navy.g, navy.b),
      });

      // 점선 (타이틀과 페이지 번호 사이)
      const titleWidth = font.widthOfTextAtSize(item.title, 14);
      const dotsStart = titleX + titleWidth + 10;
      const dotsEnd = this.PAGE_WIDTH - this.MARGIN - 30;

      for (let x = dotsStart; x < dotsEnd; x += 6) {
        page.drawCircle({
          x: x,
          y: yOffset + 4,
          size: 0.8,
          color: rgb(gray.r, gray.g, gray.b),
        });
      }

      // 페이지 번호
      const pageNum = Math.min(item.pageOffset + 1, this.totalPages);
      page.drawText(String(pageNum), {
        x: this.PAGE_WIDTH - this.MARGIN - 20,
        y: yOffset,
        size: 14,
        font: boldFont,
        color: rgb(indigo.r, indigo.g, indigo.b),
      });

      yOffset -= 50;
    });

    // 하단 안내 문구
    page.drawText('각 섹션을 클릭하여 해당 페이지로 이동할 수 있습니다.', {
      x: this.MARGIN,
      y: 60,
      size: 10,
      font: font,
      color: rgb(gray.r, gray.g, gray.b),
    });
  }

  /**
   * 3. Executive Summary
   */
  private async addExecutiveSummary(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN - this.HEADER_HEIGHT;

    // 섹션 헤더
    yOffset = this.drawEnhancedSectionHeader(page, 1, 'Executive Summary', yOffset, font, boldFont);

    // 내용
    yOffset -= this.LINE_HEIGHT;
    const summary = input.report.metadata?.executiveSummary || input.brandStrategy.brandEssence;
    yOffset = this.drawParagraph(page, summary, yOffset, font);

    // 키 메시지 (있는 경우)
    if (input.brandStrategy.keyMessages && input.brandStrategy.keyMessages.length > 0) {
      yOffset -= this.LINE_HEIGHT * 2;
      yOffset = this.drawSubsectionHeader(page, 'Key Messages', yOffset, boldFont);
      yOffset -= this.LINE_HEIGHT;

      input.brandStrategy.keyMessages.forEach((message: string) => {
        if (yOffset < this.FOOTER_HEIGHT + 50) return;
        page.drawText(`• ${message}`, {
          x: this.MARGIN + 20,
          y: yOffset,
          size: 12,
          font: font,
          color: rgb(this.COLORS.black.r, this.COLORS.black.g, this.COLORS.black.b),
        });
        yOffset -= this.LINE_HEIGHT * 1.3;
      });
    }
  }

  /**
   * 4-5. Brand Strategy
   */
  private async addBrandStrategy(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN - this.HEADER_HEIGHT;

    // 섹션 헤더
    yOffset = this.drawEnhancedSectionHeader(page, 2, 'Brand Strategy', yOffset, font, boldFont);

    // Brand Essence
    yOffset -= this.LINE_HEIGHT;
    yOffset = this.drawSubsectionHeader(page, 'Brand Essence', yOffset, boldFont);
    yOffset -= this.LINE_HEIGHT * 0.5;
    yOffset = this.drawParagraph(page, input.brandStrategy.brandEssence, yOffset, font);

    // Value Proposition
    yOffset -= this.LINE_HEIGHT * 1.5;
    yOffset = this.drawSubsectionHeader(page, 'Value Proposition', yOffset, boldFont);
    yOffset -= this.LINE_HEIGHT * 0.5;
    yOffset = this.drawParagraph(page, input.brandStrategy.uniqueValueProposition, yOffset, font);

    // Target Audience
    yOffset -= this.LINE_HEIGHT * 1.5;
    yOffset = this.drawSubsectionHeader(page, 'Target Audience', yOffset, boldFont);
    yOffset -= this.LINE_HEIGHT * 0.5;
    yOffset = this.drawParagraph(page, input.brandStrategy.targetAudience.join(', '), yOffset, font);

    // Brand Personality
    if (yOffset > this.FOOTER_HEIGHT + 150) {
      yOffset -= this.LINE_HEIGHT * 1.5;
      yOffset = this.drawSubsectionHeader(page, 'Brand Personality', yOffset, boldFont);
      yOffset -= this.LINE_HEIGHT * 0.5;

      input.brandStrategy.brandPersonality.forEach((trait: string) => {
        if (yOffset < this.FOOTER_HEIGHT + 50) return;
        page.drawText(`• ${trait}`, {
          x: this.MARGIN + 20,
          y: yOffset,
          size: 12,
          font: font,
          color: rgb(this.COLORS.black.r, this.COLORS.black.g, this.COLORS.black.b),
        });
        yOffset -= this.LINE_HEIGHT;
      });
    }
  }

  /**
   * 6-9. Professional Experience
   */
  private async addProfessionalExperience(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const experiences = input.resume.experiences || [];

    let page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN - this.HEADER_HEIGHT;

    // 섹션 헤더
    yOffset = this.drawEnhancedSectionHeader(page, 3, 'Professional Experience', yOffset, font, boldFont);

    experiences.forEach((exp, index) => {
      // 새 페이지 필요 시
      if (yOffset < this.FOOTER_HEIGHT + 150) {
        page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
        yOffset = this.PAGE_HEIGHT - this.MARGIN - this.HEADER_HEIGHT;
      }

      yOffset -= this.LINE_HEIGHT;

      // 경험 카드 배경
      const cardHeight = 80 + (exp.achievements?.length || 0) * 18;
      page.drawRectangle({
        x: this.MARGIN,
        y: yOffset - cardHeight + 15,
        width: this.PAGE_WIDTH - 2 * this.MARGIN,
        height: cardHeight,
        color: rgb(this.COLORS.lightGray.r, this.COLORS.lightGray.g, this.COLORS.lightGray.b),
      });

      // 회사명 + 직책
      page.drawText(`${exp.company} - ${exp.role}`, {
        x: this.MARGIN + 15,
        y: yOffset,
        size: 14,
        font: boldFont,
        color: rgb(this.COLORS.navy.r, this.COLORS.navy.g, this.COLORS.navy.b),
      });
      yOffset -= this.LINE_HEIGHT;

      // 기간
      page.drawText(exp.duration, {
        x: this.MARGIN + 15,
        y: yOffset,
        size: 11,
        font: font,
        color: rgb(this.COLORS.gray.r, this.COLORS.gray.g, this.COLORS.gray.b),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;

      // 설명
      if (exp.description) {
        const descLines = this.wrapText(exp.description, font, 12, this.PAGE_WIDTH - 2 * this.MARGIN - 30);
        descLines.forEach((line) => {
          page.drawText(line, {
            x: this.MARGIN + 15,
            y: yOffset,
            size: 12,
            font: font,
            color: rgb(this.COLORS.black.r, this.COLORS.black.g, this.COLORS.black.b),
          });
          yOffset -= this.LINE_HEIGHT;
        });
      }

      // 성과
      if (exp.achievements && exp.achievements.length > 0) {
        yOffset -= 5;
        exp.achievements.forEach((achievement: string) => {
          if (yOffset < this.FOOTER_HEIGHT + 50) return;
          page.drawText(`• ${achievement}`, {
            x: this.MARGIN + 25,
            y: yOffset,
            size: 11,
            font: font,
            color: rgb(this.COLORS.darkGray.r, this.COLORS.darkGray.g, this.COLORS.darkGray.b),
          });
          yOffset -= this.LINE_HEIGHT;
        });
      }

      yOffset -= this.LINE_HEIGHT;
    });
  }

  /**
   * 10. Skills & Education
   */
  private async addSkillsAndEducation(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN - this.HEADER_HEIGHT;

    // 섹션 헤더
    yOffset = this.drawEnhancedSectionHeader(page, 4, 'Skills & Education', yOffset, font, boldFont);

    // Skills
    if (input.resume.skills && input.resume.skills.length > 0) {
      yOffset -= this.LINE_HEIGHT;
      yOffset = this.drawSubsectionHeader(page, 'Skills', yOffset, boldFont);
      yOffset -= this.LINE_HEIGHT * 0.5;

      // 스킬 태그 스타일로 표시
      const skillsPerRow = 3;
      const tagWidth = (this.PAGE_WIDTH - 2 * this.MARGIN - 30) / skillsPerRow;

      input.resume.skills.forEach((skill: string, index: number) => {
        const row = Math.floor(index / skillsPerRow);
        const col = index % skillsPerRow;
        const x = this.MARGIN + col * tagWidth + 10;
        const y = yOffset - row * 30;

        if (y < this.FOOTER_HEIGHT + 50) return;

        // 태그 배경
        page.drawRectangle({
          x: x,
          y: y - 8,
          width: tagWidth - 15,
          height: 24,
          color: rgb(this.COLORS.indigoLight.r, this.COLORS.indigoLight.g, this.COLORS.indigoLight.b),
          opacity: 0.3,
        });

        // 태그 텍스트
        page.drawText(skill.length > 15 ? skill.substring(0, 15) + '...' : skill, {
          x: x + 8,
          y: y,
          size: 10,
          font: font,
          color: rgb(this.COLORS.navy.r, this.COLORS.navy.g, this.COLORS.navy.b),
        });
      });

      yOffset -= Math.ceil(input.resume.skills.length / skillsPerRow) * 30 + this.LINE_HEIGHT;
    }

    // Education
    if (input.resume.education && input.resume.education.length > 0) {
      yOffset -= this.LINE_HEIGHT;
      yOffset = this.drawSubsectionHeader(page, 'Education', yOffset, boldFont);
      yOffset -= this.LINE_HEIGHT * 0.5;

      input.resume.education.forEach((edu) => {
        if (yOffset < this.FOOTER_HEIGHT + 50) return;
        page.drawText(`${edu.degree} - ${edu.school} (${edu.year})`, {
          x: this.MARGIN + 20,
          y: yOffset,
          size: 12,
          font: font,
          color: rgb(this.COLORS.black.r, this.COLORS.black.g, this.COLORS.black.b),
        });
        yOffset -= this.LINE_HEIGHT * 1.3;
      });
    }

    // Certifications
    if (input.resume.certifications && input.resume.certifications.length > 0) {
      yOffset -= this.LINE_HEIGHT;
      yOffset = this.drawSubsectionHeader(page, 'Certifications', yOffset, boldFont);
      yOffset -= this.LINE_HEIGHT * 0.5;

      input.resume.certifications.forEach((cert: string) => {
        if (yOffset < this.FOOTER_HEIGHT + 50) return;
        page.drawText(`• ${cert}`, {
          x: this.MARGIN + 20,
          y: yOffset,
          size: 11,
          font: font,
          color: rgb(this.COLORS.black.r, this.COLORS.black.g, this.COLORS.black.b),
        });
        yOffset -= this.LINE_HEIGHT;
      });
    }
  }

  /**
   * 11. Achievements
   */
  private async addAchievements(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN - this.HEADER_HEIGHT;

    // 섹션 헤더
    yOffset = this.drawEnhancedSectionHeader(page, 5, 'Key Achievements', yOffset, font, boldFont);

    // ReportContent에서 achievementsSection 가져오기
    const achievements = input.report.metadata?.achievementsSection || [];

    achievements.forEach((achievement: string, index: number) => {
      if (yOffset < this.FOOTER_HEIGHT + 50) return;
      yOffset -= this.LINE_HEIGHT;

      // 성취 카드
      const cardHeight = 50;
      page.drawRectangle({
        x: this.MARGIN,
        y: yOffset - cardHeight + 20,
        width: this.PAGE_WIDTH - 2 * this.MARGIN,
        height: cardHeight,
        color: rgb(this.COLORS.lightGray.r, this.COLORS.lightGray.g, this.COLORS.lightGray.b),
        borderColor: rgb(this.COLORS.indigo.r, this.COLORS.indigo.g, this.COLORS.indigo.b),
        borderWidth: 1,
      });

      // 번호
      page.drawCircle({
        x: this.MARGIN + 25,
        y: yOffset,
        size: 12,
        color: rgb(this.COLORS.indigo.r, this.COLORS.indigo.g, this.COLORS.indigo.b),
      });
      page.drawText(String(index + 1), {
        x: this.MARGIN + 21,
        y: yOffset - 5,
        size: 11,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      // 성취 내용
      const lines = this.wrapText(achievement, font, 12, this.PAGE_WIDTH - 2 * this.MARGIN - 70);
      lines.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: this.MARGIN + 50,
          y: yOffset - lineIndex * this.LINE_HEIGHT,
          size: 12,
          font: font,
          color: rgb(this.COLORS.black.r, this.COLORS.black.g, this.COLORS.black.b),
        });
      });

      yOffset -= cardHeight + 10;
    });
  }

  /**
   * 12. Future Vision
   */
  private async addFutureVision(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN - this.HEADER_HEIGHT;

    // 섹션 헤더
    yOffset = this.drawEnhancedSectionHeader(page, 6, 'Future Vision', yOffset, font, boldFont);

    // 내용
    yOffset -= this.LINE_HEIGHT;
    const vision = input.report.metadata?.futureVision || '';

    if (vision) {
      // 비전 박스
      const lines = this.wrapText(vision, font, 12, this.PAGE_WIDTH - 2 * this.MARGIN - 40);
      const boxHeight = Math.max(80, lines.length * this.LINE_HEIGHT + 40);

      page.drawRectangle({
        x: this.MARGIN,
        y: yOffset - boxHeight + 20,
        width: this.PAGE_WIDTH - 2 * this.MARGIN,
        height: boxHeight,
        color: rgb(this.COLORS.indigo.r, this.COLORS.indigo.g, this.COLORS.indigo.b),
        opacity: 0.1,
      });

      lines.forEach((line, index) => {
        page.drawText(line, {
          x: this.MARGIN + 20,
          y: yOffset - index * this.LINE_HEIGHT,
          size: 12,
          font: font,
          color: rgb(this.COLORS.black.r, this.COLORS.black.g, this.COLORS.black.b),
        });
      });

      yOffset -= boxHeight + this.LINE_HEIGHT;
    }

    // Call to Action
    if (input.report.metadata?.callToAction) {
      yOffset -= this.LINE_HEIGHT;
      yOffset = this.drawSubsectionHeader(page, 'Call to Action', yOffset, boldFont);
      yOffset -= this.LINE_HEIGHT * 0.5;
      yOffset = this.drawParagraph(page, input.report.metadata.callToAction, yOffset, font);
    }
  }

  /**
   * 13. Contact Information
   */
  private async addContactInformation(
    doc: PDFDocument,
    input: TextPdfInput,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const page = doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yOffset = this.PAGE_HEIGHT - this.MARGIN - this.HEADER_HEIGHT;

    // 섹션 헤더
    yOffset = this.drawEnhancedSectionHeader(page, 7, 'Contact Information', yOffset, font, boldFont);

    const { personalInfo } = input.resume;

    // 연락처 카드
    const cardX = this.MARGIN;
    const cardWidth = this.PAGE_WIDTH - 2 * this.MARGIN;
    const cardY = yOffset - 200;
    const cardHeight = 180;

    page.drawRectangle({
      x: cardX,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      color: rgb(this.COLORS.lightGray.r, this.COLORS.lightGray.g, this.COLORS.lightGray.b),
    });

    // 왼쪽 장식 바
    page.drawRectangle({
      x: cardX,
      y: cardY,
      width: 8,
      height: cardHeight,
      color: rgb(this.COLORS.indigo.r, this.COLORS.indigo.g, this.COLORS.indigo.b),
    });

    yOffset = cardY + cardHeight - 30;

    // 연락처 정보들
    const contactItems = [
      { icon: 'Email', value: personalInfo.email },
      { icon: 'Phone', value: personalInfo.phone },
      { icon: 'Location', value: personalInfo.location },
    ];

    contactItems.forEach((item) => {
      if (!item.value) return;

      // 라벨
      page.drawText(`${item.icon}:`, {
        x: cardX + 25,
        y: yOffset,
        size: 11,
        font: boldFont,
        color: rgb(this.COLORS.gray.r, this.COLORS.gray.g, this.COLORS.gray.b),
      });

      // 값
      page.drawText(item.value, {
        x: cardX + 100,
        y: yOffset,
        size: 14,
        font: font,
        color: rgb(this.COLORS.navy.r, this.COLORS.navy.g, this.COLORS.navy.b),
      });

      yOffset -= this.LINE_HEIGHT * 1.8;
    });

    // Links
    if (personalInfo.links && personalInfo.links.length > 0) {
      yOffset -= this.LINE_HEIGHT;
      page.drawText('Links:', {
        x: cardX + 25,
        y: yOffset,
        size: 11,
        font: boldFont,
        color: rgb(this.COLORS.gray.r, this.COLORS.gray.g, this.COLORS.gray.b),
      });
      yOffset -= this.LINE_HEIGHT * 1.5;

      personalInfo.links.forEach((link: any) => {
        const linkText = typeof link === 'string' ? link : `${link.label}: ${link.url}`;
        page.drawText(linkText, {
          x: cardX + 35,
          y: yOffset,
          size: 12,
          font: font,
          color: rgb(this.COLORS.indigo.r, this.COLORS.indigo.g, this.COLORS.indigo.b),
        });
        yOffset -= this.LINE_HEIGHT;
      });
    }

    // 하단 감사 메시지
    const thankYou = '이 보고서를 읽어주셔서 감사합니다.';
    const thankYouWidth = font.widthOfTextAtSize(thankYou, 14);
    page.drawText(thankYou, {
      x: (this.PAGE_WIDTH - thankYouWidth) / 2,
      y: this.FOOTER_HEIGHT + 80,
      size: 14,
      font: font,
      color: rgb(this.COLORS.gray.r, this.COLORS.gray.g, this.COLORS.gray.b),
    });
  }

  /**
   * 유틸리티: 섹션 타이틀 그리기 (레거시 호환)
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
      color: rgb(this.COLORS.navy.r, this.COLORS.navy.g, this.COLORS.navy.b),
    });

    // 구분선
    page.drawLine({
      start: { x: this.MARGIN, y: yOffset - 5 },
      end: { x: this.PAGE_WIDTH - this.MARGIN, y: yOffset - 5 },
      thickness: 2,
      color: rgb(this.COLORS.gray.r, this.COLORS.gray.g, this.COLORS.gray.b),
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
    const lines = this.wrapText(text, font, fontSize, maxWidth);

    lines.forEach((line) => {
      if (yOffset < this.FOOTER_HEIGHT + 50) return;
      page.drawText(line, {
        x: this.MARGIN,
        y: yOffset,
        size: fontSize,
        font: font,
        color: rgb(this.COLORS.black.r, this.COLORS.black.g, this.COLORS.black.b),
      });
      yOffset -= this.LINE_HEIGHT;
    });

    return yOffset;
  }
}
