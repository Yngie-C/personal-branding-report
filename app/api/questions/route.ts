import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { sessionId, questions, answers } = await request.json();

    if (!sessionId || !questions || !answers) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Calculate metadata
    const totalQuestions = questions.reduce(
      (sum: number, cat: any) => sum + (cat.questions?.length || 0),
      0
    );

    // Determine structure type
    const categories = questions.map((cat: any) => cat.category);
    const hasSoulStructure =
      categories.includes('philosophy') &&
      categories.includes('expertise') &&
      categories.includes('edge');

    const structure = hasSoulStructure ? 'soul-expertise-edge' : 'fallback';

    const metadata = {
      totalQuestions,
      structure,
      completedAt: new Date().toISOString(),
      categories: categories,
    };

    console.log('[Questions API] Saving metadata:', metadata);

    // 답변 저장 (with metadata)
    const { data, error } = await supabaseAdmin
      .from('question_answers')
      .insert({
        session_id: sessionId,
        questions,
        answers,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Question answers save error:', error);
      return NextResponse.json(
        { error: '답변 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 세션 상태 업데이트
    await supabaseAdmin
      .from('report_sessions')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    return NextResponse.json({
      success: true,
      message: '답변이 저장되었습니다.',
    });
  } catch (error) {
    console.error('Questions API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
