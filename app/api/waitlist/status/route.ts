import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/waitlist/status?sessionId=xxx
 * Check if user is registered in waitlist
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Query waitlist by session_id
    const { data: waitlistEntry, error } = await supabaseAdmin
      .from('waitlist')
      .select('id, email, phone, position, status, created_at')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('[Waitlist Status API] Query error:', error);
      return NextResponse.json(
        { error: '대기자 명단 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!waitlistEntry) {
      // Not registered
      return NextResponse.json({
        data: {
          registered: false,
          message: '대기자 명단에 등록되어 있지 않습니다.',
        },
      });
    }

    // Registered - return details
    return NextResponse.json({
      data: {
        registered: true,
        position: waitlistEntry.position,
        status: waitlistEntry.status,
        email: waitlistEntry.email,
        registeredAt: waitlistEntry.created_at,
      },
    });
  } catch (error: any) {
    console.error('[Waitlist Status API] Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
