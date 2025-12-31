import { createClient } from '@supabase/supabase-js';
import type { FileType, UploadResult } from '@/types/pdf';

/**
 * Supabase Storage에 PDF 파일을 업로드하는 유틸리티 클래스
 *
 * - Text PDF: {sessionId}/text-report.pdf
 * - Slides PDF: {sessionId}/slide-deck.pdf
 * - PPTX: {sessionId}/slide-deck.pptx
 */
export class StorageUploader {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * PDF 또는 PPTX 파일을 Supabase Storage에 업로드
   *
   * @param sessionId - 세션 ID (폴더명으로 사용)
   * @param buffer - 파일 버퍼
   * @param type - 파일 타입 ('text' | 'slides' | 'pptx')
   * @returns Public URL
   */
  async uploadPdf(
    sessionId: string,
    buffer: Buffer,
    type: FileType
  ): Promise<string> {
    const fileName = this.getFileName(sessionId, type);
    const contentType = this.getContentType(type);

    console.log(`[StorageUploader] Uploading ${type} file: ${fileName} (${buffer.length} bytes)`);

    const { error } = await this.supabase.storage
      .from('reports')
      .upload(fileName, buffer, {
        contentType,
        upsert: true,  // 기존 파일 덮어쓰기
        cacheControl: '3600',  // 1시간 캐시
      });

    if (error) {
      console.error(`[StorageUploader] Upload failed:`, error);
      throw new Error(`Failed to upload ${type} PDF: ${error.message}`);
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from('reports')
      .getPublicUrl(fileName);

    console.log(`[StorageUploader] Upload successful: ${publicUrl}`);
    return publicUrl;
  }

  /**
   * 여러 파일을 한 번에 업로드 (병렬 처리)
   *
   * @param sessionId - 세션 ID
   * @param files - 업로드할 파일 배열
   * @returns 각 파일의 Public URL 매핑
   */
  async uploadMultiple(
    sessionId: string,
    files: Array<{ buffer: Buffer; type: FileType }>
  ): Promise<Record<FileType, string>> {
    const uploadPromises = files.map(({ buffer, type }) =>
      this.uploadPdf(sessionId, buffer, type).then(url => ({ type, url }))
    );

    const results = await Promise.all(uploadPromises);

    const urlMap: Record<string, string> = {};
    results.forEach(({ type, url }) => {
      urlMap[type] = url;
    });

    return urlMap as Record<FileType, string>;
  }

  /**
   * 파일 삭제
   *
   * @param sessionId - 세션 ID
   * @param type - 파일 타입
   */
  async deletePdf(sessionId: string, type: FileType): Promise<void> {
    const fileName = this.getFileName(sessionId, type);

    console.log(`[StorageUploader] Deleting ${type} file: ${fileName}`);

    const { error } = await this.supabase.storage
      .from('reports')
      .remove([fileName]);

    if (error) {
      console.error(`[StorageUploader] Delete failed:`, error);
      throw new Error(`Failed to delete ${type} PDF: ${error.message}`);
    }

    console.log(`[StorageUploader] Delete successful`);
  }

  /**
   * 세션의 모든 파일 삭제
   *
   * @param sessionId - 세션 ID
   */
  async deleteAll(sessionId: string): Promise<void> {
    const { data: files, error: listError } = await this.supabase.storage
      .from('reports')
      .list(sessionId);

    if (listError) {
      console.error(`[StorageUploader] List failed:`, listError);
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      console.log(`[StorageUploader] No files to delete for session ${sessionId}`);
      return;
    }

    const filePaths = files.map(file => `${sessionId}/${file.name}`);

    console.log(`[StorageUploader] Deleting ${filePaths.length} files for session ${sessionId}`);

    const { error: deleteError } = await this.supabase.storage
      .from('reports')
      .remove(filePaths);

    if (deleteError) {
      console.error(`[StorageUploader] Batch delete failed:`, deleteError);
      throw new Error(`Failed to delete files: ${deleteError.message}`);
    }

    console.log(`[StorageUploader] Batch delete successful`);
  }

  /**
   * 파일명 생성
   *
   * @param sessionId - 세션 ID
   * @param type - 파일 타입
   * @returns 파일 경로
   */
  private getFileName(sessionId: string, type: FileType): string {
    switch (type) {
      case 'text':
        return `${sessionId}/text-report.pdf`;
      case 'pptx':
        return `${sessionId}/slide-deck.pptx`;
      case 'slides':
        return `${sessionId}/slide-deck.pdf`;
      default:
        throw new Error(`Unknown file type: ${type}`);
    }
  }

  /**
   * Content-Type 반환
   *
   * @param type - 파일 타입
   * @returns MIME type
   */
  private getContentType(type: FileType): string {
    switch (type) {
      case 'pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'text':
      case 'slides':
        return 'application/pdf';
      default:
        throw new Error(`Unknown file type: ${type}`);
    }
  }
}
