-- Migration 012: Add dual PDF output support (Text PDF + Slide Deck)
-- Created: 2025-12-30
-- Purpose: Add columns for text PDF, slides PDF, and PPTX file URLs

-- Add new columns to reports table for dual PDF outputs
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS text_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS slides_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS pptx_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN reports.text_pdf_url IS '상세 텍스트 보고서 PDF URL (8-12 페이지)';
COMMENT ON COLUMN reports.slides_pdf_url IS '슬라이드 덱 PDF URL (20+ 슬라이드, PPTX에서 변환)';
COMMENT ON COLUMN reports.pptx_url IS '원본 PPTX 파일 URL (PowerPoint 형식)';
COMMENT ON COLUMN reports.pdf_generated_at IS 'PDF 파일들이 생성된 시각';

-- Note: pdf_url column remains for backward compatibility
-- It will store slides_pdf_url or text_pdf_url as fallback
COMMENT ON COLUMN reports.pdf_url IS '(Deprecated) 기존 PDF URL - backward compatibility용, slides_pdf_url 또는 text_pdf_url 값 저장';
