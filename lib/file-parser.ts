import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParsedFile {
  text: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
  };
}

/**
 * PDF 파일을 텍스트로 변환
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedFile> {
  try {
    const data = await pdf(buffer);

    return {
      text: data.text,
      metadata: {
        pageCount: data.numpages,
        wordCount: data.text.split(/\s+/).length,
      },
    };
  } catch (error: any) {
    throw new Error(`PDF 파싱 실패: ${error.message}`);
  }
}

/**
 * DOCX 파일을 텍스트로 변환
 */
export async function parseDOCX(buffer: Buffer): Promise<ParsedFile> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value,
      metadata: {
        wordCount: result.value.split(/\s+/).length,
      },
    };
  } catch (error: any) {
    throw new Error(`DOCX 파싱 실패: ${error.message}`);
  }
}

/**
 * 파일 타입에 따라 자동으로 파싱
 */
export async function parseFile(
  buffer: Buffer,
  mimeType: string
): Promise<ParsedFile> {
  if (mimeType === 'application/pdf') {
    return parsePDF(buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return parseDOCX(buffer);
  } else {
    throw new Error(`지원하지 않는 파일 형식: ${mimeType}`);
  }
}

/**
 * URL에서 파일을 다운로드하고 파싱
 */
export async function parseFileFromUrl(
  url: string,
  mimeType: string
): Promise<ParsedFile> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`파일 다운로드 실패: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return parseFile(buffer, mimeType);
  } catch (error: any) {
    throw new Error(`파일 파싱 실패: ${error.message}`);
  }
}
