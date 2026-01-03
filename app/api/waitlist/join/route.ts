import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/waitlist/join
 * Register user to waitlist after completing PSA survey
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, sessionId, utmSource, utmCampaign } = body;

    // 1. Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '유효한 이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`[Waitlist Join API] Processing registration: ${email}`);

    // 2. Check if email already in waitlist
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('waitlist')
      .select('id, position, status')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('[Waitlist Join API] Check error:', checkError);
      return NextResponse.json(
        { error: '대기자 명단 확인에 실패했습니다.' },
        { status: 500 }
      );
    }

    if (existing) {
      // Already registered - return existing position
      console.log(`[Waitlist Join API] Email already registered at position ${existing.position}`);
      return NextResponse.json({
        data: {
          position: existing.position,
          status: existing.status,
          alreadyRegistered: true,
          message: '이미 대기자 명단에 등록되어 있습니다.',
        },
      });
    }

    // 3. Verify session exists and has brief report
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('report_sessions')
      .select('id, email, brief_report_generated')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('[Waitlist Join API] Session not found:', sessionError);
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!session.brief_report_generated) {
      return NextResponse.json(
        { error: 'PSA 분석을 먼저 완료해주세요.' },
        { status: 400 }
      );
    }

    // 4. Insert into waitlist (position auto-assigned by trigger)
    const { data: waitlistEntry, error: insertError } = await supabaseAdmin
      .from('waitlist')
      .insert({
        session_id: sessionId,
        email,
        phone: phone || null,
        utm_source: utmSource || null,
        utm_campaign: utmCampaign || null,
        status: 'active',
      })
      .select('id, position, created_at')
      .single();

    if (insertError) {
      console.error('[Waitlist Join API] Insert error:', insertError);
      return NextResponse.json(
        { error: '대기자 명단 등록에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log(`[Waitlist Join API] Registered at position: ${waitlistEntry.position}`);

    // 5. Update session email if not already set
    if (!session.email || session.email !== email) {
      await supabaseAdmin
        .from('report_sessions')
        .update({ email, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    // 6. Return success with position
    return NextResponse.json({
      data: {
        position: waitlistEntry.position,
        status: 'active',
        alreadyRegistered: false,
        message: '대기자 명단에 성공적으로 등록되었습니다.',
        registeredAt: waitlistEntry.created_at,
      },
    });
  } catch (error: any) {
    console.error('[Waitlist Join API] Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
