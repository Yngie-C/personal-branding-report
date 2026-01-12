import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { parseFile } from '@/lib/file-parser';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;
    const fileType = formData.get('fileType') as string; // 'resume' or 'portfolio'

    if (!file || !sessionId || !fileType) {
      return NextResponse.json(
        { error: '파일, 세션 ID, 파일 타입이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 허용된 파일 형식 확인
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'PDF, DOCX, PNG, JPG 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 파싱 (PDF, DOCX인 경우)
    let parsedData: any = null;
    if (file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const parsed = await parseFile(buffer, file.type);
        parsedData = {
          text: parsed.text,
          metadata: parsed.metadata,
        };
        console.log(`[Upload] Parsed ${fileType}: ${parsed.metadata?.wordCount} words`);
      } catch (parseError: any) {
        console.warn(`[Upload] Failed to parse file: ${parseError.message}`);
        // 파싱 실패해도 업로드는 계속 진행
      }
    }

    // 파일명 생성
    const fileExt = file.name.split('.').pop();
    const fileName = `${sessionId}/${fileType}_${Date.now()}.${fileExt}`;
    const bucket = fileType === 'resume' ? 'resumes' : 'portfolios';

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return NextResponse.json(
        { error: '파일 업로드에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 파일 URL 생성
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // 데이터베이스에 기록 (파싱된 데이터 포함)
    const { data: upload, error: dbError } = await supabaseAdmin
      .from('uploads')
      .insert({
        session_id: sessionId,
        file_type: fileType,
        file_url: publicUrl,
        parsed_data: parsedData,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // Update session status: upload_completed = true (for resume uploads)
    if (fileType === 'resume') {
      await supabaseAdmin
        .from('report_sessions')
        .update({
          upload_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
      console.log(`[Upload] Session ${sessionId} marked as upload_completed`);
    }

    return NextResponse.json({
      upload,
      message: '파일이 성공적으로 업로드되었습니다.',
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
