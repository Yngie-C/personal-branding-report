"use client";

import { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { ResumeFormInput } from "@/types/resume-form";

interface Props {
  sessionId: string;
  onComplete: () => void;
  onError: (message: string) => void;
  onParsedData?: (formData: ResumeFormInput) => void; // 파싱된 데이터 콜백
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

export default function ResumeFileUpload({ sessionId, onComplete, onError, onParsedData }: Props) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'parsing' | 'completed' | 'error'>('idle');

  const handleFileUpload = async () => {
    if (!resumeFile) {
      onError('이력서 파일을 선택해주세요.');
      return;
    }

    try {
      // Step 1: 파일 업로드
      setUploadStatus('uploading');

      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('sessionId', sessionId);
      formData.append('fileType', 'resume');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || '파일 업로드에 실패했습니다.');
      }

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
        console.log('[ResumeFileUpload] Parsing successful, switching to form tab');
        setUploadStatus('completed');
        onParsedData?.(parseData.formData); // 부모로 파싱 데이터 전달
        onComplete(); // 완료 처리
      } else {
        // 파싱 실패: 빈 폼으로 폴백
        console.warn('[ResumeFileUpload] Parsing failed, falling back to empty form:', parseData.error);
        setUploadStatus('error');
        onError('이력서 분석에 실패했습니다. 수동으로 입력해주세요.');
        onParsedData?.(getEmptyFormData()); // 빈 폼 데이터
        onComplete(); // 여전히 다음 단계 진행 가능
      }
    } catch (err: any) {
      console.error('[ResumeFileUpload] Error:', err);
      setUploadStatus('error');
      onError(err.message);
      // 에러 발생 시에도 빈 폼으로 폴백
      onParsedData?.(getEmptyFormData());
      onComplete();
    }
  };

  const isLoading = uploadStatus === 'uploading' || uploadStatus === 'parsing';
  const isCompleted = uploadStatus === 'completed';

  return (
    <div className="space-y-4">
      <label className="block">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          className="hidden"
          disabled={isLoading}
        />
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
          {resumeFile ? (
            <div>
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">{resumeFile.name}</p>
              <p className="text-sm text-gray-500">
                {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {isCompleted && (
                <p className="text-green-600 text-sm mt-2">✓ 분석 완료</p>
              )}
            </div>
          ) : (
            <div>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">클릭하여 파일 선택</p>
              <p className="text-xs text-gray-500 mt-1">PDF 또는 DOCX (최대 10MB)</p>
            </div>
          )}
        </div>
      </label>

      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 bg-blue-50 rounded-lg">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-3" />
          <div className="text-sm">
            {uploadStatus === 'uploading' && (
              <p className="text-gray-700 font-medium">파일 업로드 중...</p>
            )}
            {uploadStatus === 'parsing' && (
              <div>
                <p className="text-gray-700 font-medium">이력서 분석 중...</p>
                <p className="text-gray-500 text-xs mt-1">약 10-20초 소요됩니다</p>
              </div>
            )}
          </div>
        </div>
      )}

      {resumeFile && !isLoading && (
        <button
          type="button"
          onClick={handleFileUpload}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          이력서 업로드 및 분석
        </button>
      )}
    </div>
  );
}
