"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadPageHeader from "@/components/upload/UploadPageHeader";
import ResultPageHeader from "@/components/result/ResultPageHeader";
import DownloadSection from "@/components/result/DownloadSection";
import SocialAssetsSection from "@/components/result/SocialAssetsSection";

interface ResultData {
  reportId: string;
  textPdfUrl: string | null;
  slidesPdfUrl: string | null;
  pptxUrl: string | null;
  pdfUrl: string;
  socialAssets: {
    linkedinBanner: string;
    linkedinProfile: string;
    businessCard: string;
    twitterHeader: string;
    instagramHighlight: string;
  };
}

type PageStatus = 'loading' | 'success' | 'processing' | 'error';

export default function ResultPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // 세션 로드
  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (!storedSessionId) {
      router.push("/survey-result");
      return;
    }
    setSessionId(storedSessionId);
  }, [router]);

  // 결과 데이터 가져오기
  const fetchResults = useCallback(async () => {
    if (!sessionId) return;

    try {
      setStatus('loading');
      setError(null);

      const response = await fetch(`/api/results?sessionId=${sessionId}`);
      const data = await response.json();

      if (response.status === 202) {
        // 아직 생성 중 - /generating으로 리다이렉트
        setStatus('processing');
        setTimeout(() => {
          router.push("/generating");
        }, 1500);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || '결과를 불러오는데 실패했습니다.');
      }

      setResultData(data.data);
      setStatus('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(message);
      setStatus('error');
    }
  }, [sessionId, router]);

  // sessionId가 설정되면 결과 가져오기
  useEffect(() => {
    if (sessionId) {
      fetchResults();
    }
  }, [sessionId, fetchResults]);

  // 재시도 핸들러
  const handleRetry = async () => {
    setIsRetrying(true);
    await fetchResults();
    setIsRetrying(false);
  };

  // 새 리포트 만들기
  const handleNewReport = () => {
    // 세션 데이터 클리어
    localStorage.removeItem("sessionId");
    localStorage.removeItem("survey-answers");
    localStorage.removeItem("survey-analysis");
    localStorage.removeItem("upload-tab");
    router.push("/");
  };

  // 홈으로 가기
  const handleGoHome = () => {
    router.push("/");
  };

  // 로딩 상태
  if (status === 'loading' || !sessionId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">결과를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  // 아직 생성 중 상태
  if (status === 'processing') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-900 font-medium">리포트가 아직 생성 중입니다</p>
          <p className="text-gray-600 text-sm mt-1">잠시 후 진행 상황 페이지로 이동합니다...</p>
        </div>
      </main>
    );
  }

  // 에러 상태
  if (status === 'error') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <UploadPageHeader currentStep={4} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2">
              결과를 불러올 수 없습니다
            </h1>
            <p className="text-gray-600 mb-6">
              {error || '알 수 없는 오류가 발생했습니다.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    다시 시도 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 시도
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleGoHome}
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // 성공 상태
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 진행 단계 헤더 (4/4) */}
        <UploadPageHeader currentStep={4} />

        {/* 완료 헤더 */}
        <ResultPageHeader />

        {/* 다운로드 섹션 */}
        {resultData && (
          <>
            <DownloadSection
              textPdfUrl={resultData.textPdfUrl}
              slidesPdfUrl={resultData.slidesPdfUrl}
              pptxUrl={resultData.pptxUrl}
            />

            {/* 소셜 에셋 섹션 (접힘 상태) */}
            <SocialAssetsSection assets={resultData.socialAssets} />
          </>
        )}

        {/* 액션 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <Button
            onClick={handleNewReport}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            새 리포트 만들기
          </Button>
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </motion.div>

        {/* 하단 안내 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            리포트에 대한 문의사항이 있으시면 support@example.com으로 연락해주세요
          </p>
        </div>
      </div>
    </main>
  );
}
