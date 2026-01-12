"use client";

import { useState, useCallback } from "react";
import { ResumeFormInput } from "@/types/resume-form";
import FileDropZone from "@/components/upload/FileDropZone";
import UploadProgress, { UploadStatus } from "@/components/upload/UploadProgress";

interface Props {
  sessionId: string;
  onComplete: () => void;
  onError: (message: string) => void;
  onParsedData?: (formData: ResumeFormInput) => void;
  onParseFailed?: () => void; // 파싱 실패 시 호출 (폼 탭 전환용)
}

/**
 * 빈 폼 데이터 생성 (파싱 실패 시 폴백)
 */
function getEmptyFormData(): ResumeFormInput {
  return {
    personalInfo: { name: '' },
    experiences: [],
    skills: [],
    projects: [],
  };
}

export default function ResumeFileUpload({ sessionId, onComplete, onError, onParsedData, onParseFailed }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * XMLHttpRequest를 사용한 파일 업로드 (진행률 추적)
   */
  const uploadWithProgress = useCallback((file: File): Promise<{ upload: { id: string } }> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('fileType', 'resume');

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error('응답 파싱 오류'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || '파일 업로드에 실패했습니다.'));
          } catch {
            reject(new Error('파일 업로드에 실패했습니다.'));
          }
        }
      };

      xhr.onerror = () => reject(new Error('네트워크 오류가 발생했습니다.'));
      xhr.ontimeout = () => reject(new Error('업로드 시간이 초과되었습니다.'));

      xhr.open('POST', '/api/upload');
      xhr.timeout = 120000; // 2분 타임아웃
      xhr.send(formData);
    });
  }, [sessionId]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setUploadStatus('idle');
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      onError('이력서 파일을 선택해주세요.');
      return;
    }

    try {
      // Step 1: 파일 업로드
      setUploadStatus('uploading');
      setUploadProgress(0);
      setErrorMessage(null);

      const uploadData = await uploadWithProgress(selectedFile);
      console.log('[ResumeFileUpload] File uploaded, starting parsing...', uploadData.upload.id);

      // Step 2: LLM 파싱 (10-20초 소요)
      setUploadStatus('parsing');

      const parseResponse = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          uploadId: uploadData.upload.id,
        }),
      });

      const parseData = await parseResponse.json();

      // Step 3: 결과 처리
      if (parseData.success && parseData.formData) {
        console.log('[ResumeFileUpload] Parsing successful');
        setUploadStatus('completed');
        onParsedData?.(parseData.formData);
        onComplete();
      } else {
        // 파싱 실패: 빈 폼으로 폴백, 폼 탭으로 전환
        console.warn('[ResumeFileUpload] Parsing failed:', parseData.error);
        setUploadStatus('error');
        setErrorMessage('이력서 분석에 실패했습니다. 수동으로 입력해주세요.');
        onError('이력서 분석에 실패했습니다. 수동으로 입력해주세요.');
        onParsedData?.(getEmptyFormData());
        onParseFailed?.(); // 폼 탭으로 전환
      }
    } catch (err: unknown) {
      console.error('[ResumeFileUpload] Error:', err);
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setUploadStatus('error');
      setErrorMessage(message);
      onError(message);
      onParsedData?.(getEmptyFormData());
      onParseFailed?.(); // 폼 탭으로 전환
    }
  };

  const isLoading = uploadStatus === 'uploading' || uploadStatus === 'parsing';

  return (
    <div className="space-y-4">
      {/* 파일 드롭 영역 */}
      <FileDropZone
        onFileSelect={handleFileSelect}
        acceptedTypes={[".pdf", ".docx"]}
        maxSizeMB={10}
        disabled={isLoading}
        selectedFile={selectedFile}
      />

      {/* 업로드 진행률 표시 */}
      {uploadStatus !== 'idle' && (
        <UploadProgress
          status={uploadStatus}
          uploadProgress={uploadProgress}
          errorMessage={errorMessage || undefined}
        />
      )}

      {/* 업로드 버튼 */}
      {selectedFile && uploadStatus === 'idle' && (
        <button
          type="button"
          onClick={handleUpload}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          이력서 업로드 및 분석
        </button>
      )}

      {/* 에러 상태에서 재시도 버튼 */}
      {uploadStatus === 'error' && (
        <button
          type="button"
          onClick={() => {
            setUploadStatus('idle');
            setErrorMessage(null);
          }}
          className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
