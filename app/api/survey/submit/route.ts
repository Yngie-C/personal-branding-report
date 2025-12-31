import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { SurveyAnswer } from '@/types/survey';

/**
 * POST /api/survey/submit
 * 사용자의 60개 설문 응답을 저장하고 세션 상태를 업데이트
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, answers, completionTimeSeconds } = body;

    // 1. 입력 검증
    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers) || answers.length !== 60) {
      return NextResponse.json(
        { error: '60개의 응답이 필요합니다.' },
        { status: 400 }
      );
    }

    // 2. 세션 존재 확인
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('report_sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('[Survey Submit API] Session not found:', sessionError);
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 3. 각 응답 검증
    const invalidAnswers: string[] = [];
    for (const answer of answers as SurveyAnswer[]) {
      if (!answer.questionId || !answer.category || !answer.questionNumber) {
        invalidAnswers.push(`Invalid answer structure: ${JSON.stringify(answer)}`);
        continue;
      }

      // 점수 범위 검증 (1-7)
      if (answer.score < 1 || answer.score > 7) {
        invalidAnswers.push(
          `Question ${answer.questionNumber}: score ${answer.score} out of range`
        );
      }
    }

    if (invalidAnswers.length > 0) {
      console.error('[Survey Submit API] Invalid answers:', invalidAnswers);
      return NextResponse.json(
        { error: '일부 응답이 유효하지 않습니다.', details: invalidAnswers },
        { status: 400 }
      );
    }

    // 4. 기존 응답 삭제 (재제출 가능하도록)
    const { error: deleteError } = await supabaseAdmin
      .from('survey_responses')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) {
      console.warn('[Survey Submit API] Failed to delete existing responses:', deleteError);
      // 계속 진행 (첫 제출일 수도 있음)
    }

    // 5. Bulk insert 준비
    const responsesToInsert = (answers as SurveyAnswer[]).map((answer) => ({
      session_id: sessionId,
      question_id: answer.questionId,
      question_number: answer.questionNumber,
      category: answer.category,
      score: answer.score,
    }));

    // 6. Bulk insert
    const { error: insertError } = await supabaseAdmin
      .from('survey_responses')
      .insert(responsesToInsert);

    if (insertError) {
      console.error('[Survey Submit API] Insert error:', insertError);
      return NextResponse.json(
        { error: '응답 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 7. 세션 상태 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('report_sessions')
      .update({
        survey_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('[Survey Submit API] Session update error:', updateError);
      // 응답은 저장되었으므로 경고만 표시
      console.warn('[Survey Submit API] Responses saved but session update failed');
    }

    console.log(
      `[Survey Submit API] Successfully saved 50 responses for session ${sessionId}`
    );

    return NextResponse.json({
      data: {
        sessionId,
        responseCount: answers.length,
        completionTimeSeconds,
        message: '설문 응답이 저장되었습니다.',
      },
    });
  } catch (error) {
    console.error('[Survey Submit API] Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
