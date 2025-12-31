import { supabaseAdmin } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // 1. 세션 상태 확인
    const { data: session, error: sessionError } = await supabase
      .from('report_sessions')
      .select('status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // 2. 아직 생성 중이면 202 반환
    if (session.status === 'processing') {
      return NextResponse.json(
        { message: 'Report generation in progress' },
        { status: 202 }
      );
    }

    // 3. 실패했으면 에러 반환
    if (session.status === 'failed') {
      return NextResponse.json(
        { error: 'Report generation failed' },
        { status: 500 }
      );
    }

    // 4. 리포트 데이터 조회
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (reportError) {
      console.error('[API /results] Report not found:', reportError);
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // 5. 웹 프로필 조회 제거 (정식 리포트는 PDF + 소셜 에셋만)
    // 웹 프로필은 약식 리포트에서만 생성됨 (survey/analyze)

    // 6. 소셜 에셋 조회 (타입별로 그룹화)
    const { data: socialAssets } = await supabase
      .from('social_assets')
      .select('asset_type, asset_url, canva_design_id')
      .eq('session_id', sessionId);

    // 소셜 에셋을 타입별로 매핑
    const socialAssetsMap: Record<string, string> = {};
    socialAssets?.forEach((asset: { asset_type: string; asset_url: string; canva_design_id: string | null }) => {
      socialAssetsMap[asset.asset_type] = asset.asset_url;
    });

    // 7. 통합 결과 반환 (Text PDF + Slide Deck PDF + PPTX + 소셜 에셋)
    return NextResponse.json({
      data: {
        reportId: report.id,
        // 새로운 PDF URL들
        textPdfUrl: report.text_pdf_url || null,
        slidesPdfUrl: report.slides_pdf_url || null,
        pptxUrl: report.pptx_url || null,
        // Backward compatibility
        pdfUrl: report.pdf_url || report.slides_pdf_url || report.text_pdf_url,
        // webProfileSlug, webProfileUrl 제거 - 정식 리포트는 웹 프로필 생성 안 함
        socialAssets: {
          linkedinBanner: socialAssetsMap['linkedin_banner'] || '',
          linkedinProfile: socialAssetsMap['linkedin_profile'] || '',
          businessCard: socialAssetsMap['business_card'] || '',
          twitterHeader: socialAssetsMap['twitter_header'] || '',
          instagramHighlight: socialAssetsMap['instagram_highlight'] || '',
        },
      },
    });
  } catch (error: any) {
    console.error('[API /results] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
