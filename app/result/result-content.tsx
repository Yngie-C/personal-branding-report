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
import ShareOptions from "@/components/result/ShareOptions";
import BrandStrategySummary from "@/components/result/BrandStrategySummary";
import { useSessionValidation } from "@/hooks/useSessionValidation";

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
  // 추가: 공유 및 브랜드 전략 관련
  profileUrl?: string;
  profileSlug?: string;
  brandStrategy?: {
    brandEssence?: string;
    uniqueValueProposition?: string;
    targetAudience?: string[] | string;
  };
}

type PageStatus = 'loading' | 'success' | 'processing' | 'error';

// Dev mode mock result data
const DEV_MODE_RESULT: ResultData = {
  reportId: "dev-mock-report-001",
  textPdfUrl: "#",
  slidesPdfUrl: "#",
  pptxUrl: "#",
  pdfUrl: "#",
  socialAssets: {
    linkedinBanner: "#",
    linkedinProfile: "#",
    businessCard: "#",
    twitterHeader: "#",
    instagramHighlight: "#",
  },
  profileUrl: "https://example.com/p/dev-user-profile",
  profileSlug: "dev-user-profile",
  brandStrategy: {
    brandEssence: "혁신적 문제 해결과 데이터 기반 의사결정을 통해 팀의 성과를 극대화하는 전략적 리더",
    uniqueValueProposition: "복잡한 비즈니스 문제를 구조화하고, 실행 가능한 솔루션으로 전환하는 능력",
    targetAudience: ["테크 스타트업 C-Level", "디지털 트랜스포메이션 리더", "성장 단계 기업 의사결정자"],
  },
};

export default function ResultContent() {
  const router = useRouter();
  const { sessionId, isLoading: sessionLoading, isValidated, status: sessionStatus, isDevMode } = useSessionValidation();
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading');
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Dev mode: load mock data immediately
  useEffect(() => {
    if (isDevMode) {
      console.log('[Dev Mode] Loading mock result data');
      setResultData(DEV_MODE_RESULT);
      setPageStatus('success');
    }
  }, [isDevMode]);

  // 결과 데이터 가져오기
  const fetchResults = useCallback(async () => {
    if (!sessionId) return;

    try {
      setPageStatus('loading');
      setError(null);

      const response = await fetch(`/api/results?sessionId=${sessionId}`);
      const data = await response.json();

      if (response.status === 202) {
        // 아직 생성 중 - /generating으로 즉시 리다이렉트
        setPageStatus('processing');
        router.push("/generating");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || '결과를 불러오는데 실패했습니다.');
      }

      setResultData(data.data);
      setPageStatus('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(message);
      setPageStatus('error');
    }
  }, [sessionId, router]);

  // 세션 검증 완료 후 결과 가져오기 (dev mode에서는 skip)
  useEffect(() => {
    if (isDevMode) return; // Dev mode uses mock data
    if (isValidated && sessionId) {
      // processing 상태면 generating으로 리다이렉트 (hook이 이미 처리함)
      if (sessionStatus?.phase2.generationStatus === 'processing') {
        return;
      }
      fetchResults();
    }
  }, [isValidated, sessionId, sessionStatus, fetchResults, isDevMode]);

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

  // 로딩 상태 (세션 검증 중 또는 결과 로딩 중) - dev mode는 skip
  if (!isDevMode && (sessionLoading || !isValidated || pageStatus === 'loading' || !sessionId)) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center">
        {/* Decorative blurred shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
        <div className="text-center relative z-10">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">결과를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  // 아직 생성 중 상태
  if (pageStatus === 'processing') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center">
        {/* Decorative blurred shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
        <div className="text-center relative z-10">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-900 font-medium">리포트가 아직 생성 중입니다</p>
          <p className="text-gray-600 text-sm mt-1">진행 상황 페이지로 이동합니다...</p>
        </div>
      </main>
    );
  }

  // 에러 상태
  if (pageStatus === 'error') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden px-4 py-8">
        {/* Decorative blurred shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
        <div className="max-w-2xl mx-auto relative z-10">
          <UploadPageHeader currentStep={4} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/10 border border-white/40 p-6 sm:p-8 text-center"
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden px-4 py-8">
      {/* Decorative blurred shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Dev Mode Banner */}
        {isDevMode && (
          <div className="mb-4 p-3 bg-yellow-100/80 backdrop-blur-sm border border-yellow-400 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              [Dev Mode] Mock 결과 데이터를 표시합니다. 다운로드 링크는 작동하지 않습니다.
            </p>
          </div>
        )}

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

            {/* 프로필 공유 섹션 */}
            {resultData.profileUrl && (
              <ShareOptions
                profileUrl={resultData.profileUrl}
                title="나의 브랜딩 프로필"
              />
            )}

            {/* 브랜드 전략 요약 섹션 */}
            {resultData.brandStrategy && (
              <BrandStrategySummary brandStrategy={resultData.brandStrategy} />
            )}
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
