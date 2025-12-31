import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ResumeParserAgent } from '@/agents/resume-parser';
import { parsedResumeToFormInput } from '@/types/resume-form';

// Vercel 함수 타임아웃 60초 설정 (LLM 파싱에 10-20초 소요)
export const maxDuration = 60;

/**
 * POST /api/parse-resume
 *
 * 업로드된 이력서 파일을 LLM으로 파싱하여 폼에 채울 수 있는 데이터로 변환합니다.
 *
 * Request Body:
 * {
 *   sessionId: string;
 *   uploadId: string; // uploads 테이블의 ID
 * }
 *
 * Response (성공):
 * {
 *   success: true;
 *   formData: ResumeFormInput;
 * }
 *
 * Response (실패):
 * {
 *   success: false;
 *   error: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, uploadId } = await request.json() as {
      sessionId: string;
      uploadId: string;
    };

    // 기본 입력 검증
    if (!sessionId || !uploadId) {
      return NextResponse.json(
        { success: false, error: '세션 ID와 업로드 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`[ParseResume] Parsing resume for session: ${sessionId}, upload: ${uploadId}`);

    // uploads 테이블에서 파일 정보 조회
    const { data: upload, error: fetchError } = await supabaseAdmin
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('session_id', sessionId)
      .eq('file_type', 'resume')
      .single();

    if (fetchError || !upload) {
      console.error('[ParseResume] Upload not found:', fetchError);
      return NextResponse.json(
        { success: false, error: '업로드된 파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // parsed_data에서 텍스트 추출
    const parsedData = upload.parsed_data as any;
    const fileContent = parsedData?.text;

    if (!fileContent) {
      console.error('[ParseResume] No text content in parsed_data');
      return NextResponse.json(
        { success: false, error: '파일에서 텍스트를 추출할 수 없습니다.' },
        { status: 400 }
      );
    }

    console.log(`[ParseResume] File content extracted, length: ${fileContent.length} chars`);

    // ResumeParserAgent로 LLM 파싱
    const parserAgent = new ResumeParserAgent();
    const result = await parserAgent.process(
      {
        fileUrl: upload.file_url,
        fileContent,
        source: 'file',
      },
      {
        sessionId,
        data: {},
      }
    );

    if (!result.success || !result.data) {
      console.error('[ParseResume] Agent parsing failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'LLM 파싱에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    console.log(`[ParseResume] LLM parsing successful for: ${result.data.personalInfo?.name || '(이름 없음)'}`);

    // ParsedResume → ResumeFormInput 변환
    const formData = parsedResumeToFormInput(result.data);

    console.log(`[ParseResume] Converted to form data:`, {
      name: formData.personalInfo.name,
      experienceCount: formData.experiences.length,
      skillCount: formData.skills.length,
      projectCount: formData.projects.length,
    });

    return NextResponse.json({
      success: true,
      formData,
    });
  } catch (error: any) {
    console.error('[ParseResume] API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `서버 오류가 발생했습니다: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
