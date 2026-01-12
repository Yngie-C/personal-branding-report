"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileUp, PenLine, ArrowRight, AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UploadPageHeader from "@/components/upload/UploadPageHeader";
import ResumeFileUpload from "@/components/forms/ResumeFileUpload";
import ResumeFormInput from "@/components/forms/ResumeFormInput";
import ParsedPreview from "@/components/upload/ParsedPreview";
import { ResumeFormInput as ResumeFormData } from "@/types/resume-form";
import { useSessionValidation } from "@/hooks/useSessionValidation";

export default function UploadPage() {
  const router = useRouter();
  const { sessionId, isLoading, isValidated } = useSessionValidation();
  const [activeTab, setActiveTab] = useState<string>("form");
  const [parsedFormData, setParsedFormData] = useState<ResumeFormData | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [resumeCompleted, setResumeCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 탭 상태 복원 (세션 검증 완료 후)
  useEffect(() => {
    if (!isValidated) return;

    const storedTab = localStorage.getItem("upload-tab");
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, [isValidated]);

  // 탭 변경 시 저장
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("upload-tab", activeTab);
    }
  }, [activeTab]);

  // 파일 업로드 완료 시 파싱 데이터 처리
  const handleParsedData = (formData: ResumeFormData) => {
    setParsedFormData(formData);
    setShowPreviewModal(true);
  };

  // 파일 업로드 완료 (파싱 후)
  const handleFileUploadComplete = () => {
    // ParsedPreview 모달에서 처리
  };

  // 폼 입력 완료
  const handleFormComplete = () => {
    setResumeCompleted(true);
    setError(null);
  };

  // 에러 처리
  const handleError = (message: string) => {
    setError(message);
  };

  // 파싱 실패 시 폼 탭으로 전환
  const handleParseFailed = () => {
    setActiveTab("form");
    setResumeCompleted(false);
  };

  // 미리보기에서 "수정하고 진행" 클릭
  const handlePreviewEdit = () => {
    setShowPreviewModal(false);
    setActiveTab("form"); // 폼 탭으로 전환
    setResumeCompleted(false);
  };

  // 미리보기에서 "그대로 진행" 클릭
  const handlePreviewConfirm = async () => {
    setShowPreviewModal(false);
    if (parsedFormData && sessionId) {
      // 파싱된 데이터를 API에 저장
      try {
        const response = await fetch('/api/resume-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, formData: parsedFormData }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '저장에 실패했습니다.');
        }

        setResumeCompleted(true);
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        setError(message);
      }
    }
  };

  // 다음 단계로 이동
  const handleNext = () => {
    router.push("/questions");
  };

  // 뒤로 가기
  const handleBack = () => {
    router.push("/survey-result");
  };

  if (isLoading || !isValidated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">로딩 중...</div>
      </main>
    );
  }

  if (!sessionId) {
    return null; // 리다이렉트 중
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* 진행 단계 헤더 */}
        <UploadPageHeader currentStep={1} />

        {/* 메인 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          {/* 페이지 제목 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              정보 입력
            </h1>
            <p className="text-gray-600">
              더 정확한 브랜딩 분석을 위해 경력 정보를 입력해주세요
            </p>
          </div>

          {/* 탭 전환 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="form" className="flex items-center gap-2">
                <PenLine className="w-4 h-4" />
                직접 입력
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2">
                <FileUp className="w-4 h-4" />
                파일 업로드
              </TabsTrigger>
            </TabsList>

            {/* 폼 입력 탭 */}
            <TabsContent value="form" className="mt-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">팁:</span> 모든 항목은 선택사항입니다.
                  입력한 정보가 많을수록 더 정확한 브랜딩 분석이 가능합니다.
                </p>
              </div>
              <ResumeFormInput
                sessionId={sessionId}
                onComplete={handleFormComplete}
                onError={handleError}
                initialData={parsedFormData || undefined}
              />
            </TabsContent>

            {/* 파일 업로드 탭 */}
            <TabsContent value="file" className="mt-4">
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">안내:</span> 이력서를 업로드하면 AI가
                  자동으로 정보를 추출합니다. 추출된 정보를 검토하고 수정할 수 있습니다.
                </p>
              </div>
              <ResumeFileUpload
                sessionId={sessionId}
                onComplete={handleFileUploadComplete}
                onError={handleError}
                onParsedData={handleParsedData}
                onParseFailed={handleParseFailed}
              />
            </TabsContent>
          </Tabs>

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* 완료 메시지 */}
          {resumeCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4"
            >
              <p className="text-sm text-green-800 font-medium">
                정보가 저장되었습니다. 다음 단계로 진행해주세요.
              </p>
            </motion.div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </Button>
            <Button
              onClick={handleNext}
              disabled={!resumeCompleted}
              className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              다음 단계
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* 건너뛰기 옵션 */}
          {!resumeCompleted && (
            <div className="mt-4 text-center">
              <button
                onClick={handleNext}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                정보 없이 진행하기 (권장하지 않음)
              </button>
            </div>
          )}
        </motion.div>

        {/* 하단 안내 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            입력하신 정보는 브랜딩 리포트 생성에만 사용되며, 안전하게 보호됩니다.
          </p>
        </div>
      </div>

      {/* 파싱 결과 미리보기 모달 */}
      <ParsedPreview
        parsedData={parsedFormData}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onEdit={handlePreviewEdit}
        onConfirm={handlePreviewConfirm}
      />
    </main>
  );
}
