"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Share2, FileText, Image as ImageIcon, Globe, Presentation } from "lucide-react";

export default function ResultPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("sessionId");
    if (!id) {
      router.push("/start");
      return;
    }
    setSessionId(id);
    loadResult(id);
  }, [router]);

  const loadResult = async (sessionId: string) => {
    try {
      console.log('[ResultPage] Loading result for session:', sessionId);

      const response = await fetch(`/api/results?sessionId=${sessionId}`);

      // 아직 생성 중인 경우 (202)
      if (response.status === 202) {
        console.log('[ResultPage] Generation still in progress, redirecting to /generating');
        router.push('/generating');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '결과를 불러올 수 없습니다');
      }

      const { data } = await response.json();
      console.log('[ResultPage] Result loaded:', data);

      // 데이터 검증
      if (!data.pdfUrl) {
        console.warn('[ResultPage] PDF URL이 없습니다');
      }
      if (!data.webProfileSlug) {
        console.warn('[ResultPage] 웹 프로필이 생성되지 않았습니다');
      }

      setResult(data);
      setLoading(false);
    } catch (error: any) {
      console.error('[ResultPage] Error loading result:', error);
      setError(error.message || '결과를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">결과를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              오류가 발생했습니다
            </h1>
            <p className="text-red-600">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/start')}
            >
              처음부터 다시 시작
            </Button>
            <Button
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            정식 리포트 생성 완료!
          </h1>
          <p className="text-lg text-gray-600">
            PDF 브랜딩 리포트와 소셜 에셋이 준비되었습니다
          </p>
        </div>

        {/* PDF 리포트 - 두 가지 형식 */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">보고서 다운로드</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 상세 보고서 (Text PDF) */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-indigo-400 transition-colors">
              <div className="flex items-center mb-4">
                <FileText className="w-8 h-8 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold">상세 보고서</h3>
              </div>
              <p className="text-gray-600 mb-4">
                텍스트 중심의 상세한 분석 보고서 (8-12 페이지)
              </p>
              {result?.textPdfUrl ? (
                <Button asChild className="w-full">
                  <a href={result.textPdfUrl} download target="_blank">
                    <Download className="w-4 h-4 mr-2" />
                    PDF 다운로드
                  </a>
                </Button>
              ) : (
                <div className="text-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-600">생성 실패</p>
                </div>
              )}
            </div>

            {/* 슬라이드 덱 (Slide PDF + PPTX) */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-purple-400 transition-colors">
              <div className="flex items-center mb-4">
                <Presentation className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold">슬라이드 덱</h3>
              </div>
              <p className="text-gray-600 mb-4">
                프레젠테이션용 디자인 슬라이드 (20+ 페이지)
              </p>
              <div className="space-y-2">
                {result?.slidesPdfUrl ? (
                  <Button asChild className="w-full">
                    <a href={result.slidesPdfUrl} download target="_blank">
                      <Download className="w-4 h-4 mr-2" />
                      PDF 다운로드
                    </a>
                  </Button>
                ) : (
                  <div className="text-center p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-600">PDF 생성 실패</p>
                  </div>
                )}
                {result?.pptxUrl ? (
                  <Button asChild variant="outline" className="w-full">
                    <a href={result.pptxUrl} download target="_blank">
                      <Download className="w-4 h-4 mr-2" />
                      PPTX 다운로드
                    </a>
                  </Button>
                ) : (
                  <div className="text-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-600">PPTX 생성 실패</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 소셜 에셋 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center mb-6">
            <ImageIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-semibold">소셜미디어 에셋</h2>
              <p className="text-sm text-gray-600">LinkedIn, 명함 등 다양한 디자인 에셋</p>
            </div>
          </div>

          {result?.socialAssets ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">LinkedIn 배너</h3>
                  <p className="text-sm text-gray-600 mb-3">1584 x 396px</p>
                  {result.socialAssets.linkedinBanner?.includes('example.com') ? (
                    <Button size="sm" variant="outline" disabled className="w-full">
                      개발 환경
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" asChild className="w-full">
                      <a href={result.socialAssets.linkedinBanner} download>
                        다운로드
                      </a>
                    </Button>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">프로필 이미지</h3>
                  <p className="text-sm text-gray-600 mb-3">400 x 400px</p>
                  {result.socialAssets.linkedinProfile?.includes('example.com') ? (
                    <Button size="sm" variant="outline" disabled className="w-full">
                      개발 환경
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" asChild className="w-full">
                      <a href={result.socialAssets.linkedinProfile} download>
                        다운로드
                      </a>
                    </Button>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">명함 디자인</h3>
                  <p className="text-sm text-gray-600 mb-3">앞면 + 뒷면</p>
                  {result.socialAssets.businessCard?.includes('example.com') ? (
                    <Button size="sm" variant="outline" disabled className="w-full">
                      개발 환경
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" asChild className="w-full">
                      <a href={result.socialAssets.businessCard} download>
                        다운로드
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {result.socialAssets.linkedinBanner?.includes('example.com') && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    ℹ️ 개발 환경에서는 소셜 에셋 생성이 비활성화되어 있습니다.<br />
                    프로덕션에서 사용하려면 <code className="bg-yellow-100 px-1 rounded">CANVA_API_KEY</code>를 설정해주세요.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">소셜 에셋을 생성하지 못했습니다.</p>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4 justify-center mt-12">
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("sessionId");
              router.push("/");
            }}
          >
            새로 만들기
          </Button>
          <Button onClick={() => window.print()}>
            모든 결과 인쇄
          </Button>
        </div>
      </div>
    </main>
  );
}
