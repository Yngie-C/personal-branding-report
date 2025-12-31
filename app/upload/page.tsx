"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ResumeFormInput from "@/components/forms/ResumeFormInput";
import ResumeFileUpload from "@/components/forms/ResumeFileUpload";
import PortfolioFileUpload from "@/components/forms/PortfolioFileUpload";
import { Image, Upload } from "lucide-react";
import { ResumeFormInput as ResumeFormData } from "@/types/resume-form";

export default function UploadPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [resumeCompleted, setResumeCompleted] = useState(false);
  const [portfolioCompleted, setPortfolioCompleted] = useState(false);
  const [error, setError] = useState("");
  const [parsedFormData, setParsedFormData] = useState<ResumeFormData | null>(null); // 파일 파싱 결과

  useEffect(() => {
    const id = localStorage.getItem("sessionId");
    if (!id) {
      router.push("/start");
      return;
    }

    setSessionId(id);
    checkSurveyCompletion(id);
  }, [router]);

  const checkSurveyCompletion = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/session?id=${sessionId}`);
      const data = await response.json();

      if (!data.session?.survey_completed) {
        setError("PSA 설문을 먼저 완료해주세요.");
        setTimeout(() => router.push("/survey"), 2000);
      }
    } catch (err) {
      console.error("Failed to check survey completion:", err);
    }
  };

  const handleNext = () => {
    if (!resumeCompleted) {
      setError("이력서 정보를 먼저 입력해주세요.");
      return;
    }
    router.push('/questions');
  };

  if (!sessionId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            정보 입력
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            이력서 정보를 입력하고, 선택적으로 포트폴리오를 업로드해주세요
          </p>

          {/* PSA 완료 안내 */}
          <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-6 py-3 text-sm text-green-800 mb-4">
            ✓ PSA 강점 분석이 완료되었습니다. 이력서를 바탕으로 맞춤형 질문을 생성합니다.
          </div>

          {/* 파일 요구사항 안내 */}
          <div className="inline-block bg-indigo-50 border border-indigo-200 rounded-lg px-6 py-3 text-sm text-indigo-800">
            <strong>파일 업로드 시:</strong> PDF 또는 DOCX • 최대 10MB • 암호화되지 않은 파일
          </div>
        </div>

        <div className="space-y-8">
          {/* 이력서 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-2">이력서 정보 *</h2>
            <p className="text-sm text-gray-600 mb-4">
              아래 폼에 직접 입력하거나, 파일에서 정보를 가져올 수 있습니다
            </p>

            {/* 파일에서 가져오기 버튼 */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFileDialogOpen(true)}
                className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                파일에서 정보 가져오기 (PDF/DOCX)
              </Button>
            </div>

            {/* 이력서 폼 */}
            <ResumeFormInput
              sessionId={sessionId}
              onComplete={() => setResumeCompleted(true)}
              onError={(msg) => setError(msg)}
              initialData={parsedFormData || undefined} // 파일 파싱 결과 자동 완성
            />
          </div>

          {/* 파일 업로드 모달 */}
          <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>이력서 파일 업로드</DialogTitle>
                <DialogDescription>
                  PDF 또는 DOCX 파일을 업로드하면 자동으로 정보를 분석하여 폼에 입력합니다
                </DialogDescription>
              </DialogHeader>
              <ResumeFileUpload
                sessionId={sessionId}
                onComplete={() => {
                  setResumeCompleted(true);
                  setIsFileDialogOpen(false); // 모달 닫기
                }}
                onError={(msg) => setError(msg)}
                onParsedData={(data) => setParsedFormData(data)} // 파싱 결과 저장
              />
            </DialogContent>
          </Dialog>

          {/* 포트폴리오 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-2">
              <Image className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-semibold">포트폴리오 (선택)</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              대표 프로젝트가 포함된 포트폴리오 파일이나 URL을 제공해주세요
            </p>

            <PortfolioFileUpload
              sessionId={sessionId}
              onComplete={() => setPortfolioCompleted(true)}
              onError={(msg) => setError(msg)}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {resumeCompleted && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">✓ 이력서 정보가 저장되었습니다</p>
            </div>
          )}

          <Button
            onClick={handleNext}
            disabled={!resumeCompleted}
            className="w-full py-4 text-lg"
          >
            다음 단계로 (맞춤형 질문)
          </Button>
        </div>
      </div>
    </main>
  );
}
