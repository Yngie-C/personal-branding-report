import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  ResumeFormInput,
  formInputToParsedResume,
  validateResumeForm,
} from '@/types/resume-form';

/**
 * POST /api/resume-form
 *
 * 폼으로 입력받은 이력서 데이터를 저장합니다.
 *
 * Request Body:
 * {
 *   sessionId: string;
 *   formData: ResumeFormInput;
 * }
 *
 * Response (성공):
 * {
 *   data: Upload;
 *   message: string;
 * }
 *
 * Response (실패):
 * {
 *   error: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, formData } = await request.json() as {
      sessionId: string;
      formData: ResumeFormInput;
    };

    // 기본 입력 검증
    if (!sessionId || !formData) {
      return NextResponse.json(
        { error: '세션 ID와 폼 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 폼 데이터 검증
    const validation = validateResumeForm(formData);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // ParsedResume 형식으로 변환
    const parsedResume = formInputToParsedResume(formData);

    // 메타데이터 생성
    const metadata = {
      source: 'form',
      experienceCount: formData.experiences.length,
      skillCount: formData.skills.filter(s => s && s.trim() !== '').length,
      projectCount: formData.projects.length,
      hasName: !!formData.personalInfo.name,
      timestamp: new Date().toISOString(),
    };

    // 검색 가능한 텍스트 생성
    const searchableText = JSON.stringify(parsedResume, null, 2);

    console.log(`[ResumeForm] Saving form input for session: ${sessionId}`);
    console.log(`[ResumeForm] Metadata:`, metadata);

    // uploads 테이블에 저장
    const { data: upload, error: dbError } = await supabaseAdmin
      .from('uploads')
      .insert({
        session_id: sessionId,
        file_type: 'resume',
        file_url: '', // 파일이 없으므로 빈 문자열
        parsed_data: {
          text: searchableText, // 검색 가능한 텍스트
          metadata,
          source: 'form',
          formData: formData, // 원본 폼 데이터 저장
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('[ResumeForm] Database insert error:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log(`[ResumeForm] Successfully saved form input with ID: ${upload.id}`);

    return NextResponse.json({
      data: upload,
      message: '이력서 정보가 성공적으로 저장되었습니다.',
    });
  } catch (error: any) {
    console.error('[ResumeForm] API error:', error);
    return NextResponse.json(
      { error: `서버 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }
}
