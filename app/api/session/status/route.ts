import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

interface SessionStatus {
  sessionId: string;
  exists: boolean;
  phase1: {
    surveyCompleted: boolean;
    briefReportGenerated: boolean;
  };
  phase2: {
    uploadCompleted: boolean;
    questionsCompleted: boolean;
    generationStatus: 'not_started' | 'processing' | 'completed' | 'failed';
  };
  allowedPages: string[];
  redirectTo: string | null;
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  const currentPage = request.nextUrl.searchParams.get('page');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId is required' },
      { status: 400 }
    );
  }

  try {
    const { data: session, error } = await supabaseAdmin
      .from('report_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({
        data: {
          sessionId,
          exists: false,
          phase1: {
            surveyCompleted: false,
            briefReportGenerated: false,
          },
          phase2: {
            uploadCompleted: false,
            questionsCompleted: false,
            generationStatus: 'not_started',
          },
          allowedPages: ['/', '/survey'],
          redirectTo: '/survey',
        } as SessionStatus,
      });
    }

    const status: SessionStatus = {
      sessionId,
      exists: true,
      phase1: {
        surveyCompleted: session.survey_completed || false,
        briefReportGenerated: session.brief_report_generated || false,
      },
      phase2: {
        uploadCompleted: session.upload_completed || false,
        questionsCompleted: session.questions_completed || false,
        generationStatus: mapGenerationStatus(session.status),
      },
      allowedPages: calculateAllowedPages(session),
      redirectTo: calculateRedirect(session, currentPage),
    };

    return NextResponse.json({ data: status });
  } catch (error) {
    console.error('Session status API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function mapGenerationStatus(status: string): SessionStatus['phase2']['generationStatus'] {
  switch (status) {
    case 'processing':
      return 'processing';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    default:
      return 'not_started';
  }
}

function calculateAllowedPages(session: {
  survey_completed?: boolean;
  brief_report_generated?: boolean;
  upload_completed?: boolean;
  questions_completed?: boolean;
  status?: string;
}): string[] {
  const pages = ['/', '/survey'];

  if (session.survey_completed) {
    pages.push('/survey-result');
  }

  if (session.brief_report_generated) {
    pages.push('/upload');
  }

  if (session.upload_completed) {
    pages.push('/questions');
  }

  if (session.questions_completed) {
    pages.push('/generating');
  }

  if (session.status === 'completed') {
    pages.push('/result');
  }

  return pages;
}

function calculateRedirect(
  session: {
    survey_completed?: boolean;
    brief_report_generated?: boolean;
    upload_completed?: boolean;
    questions_completed?: boolean;
    status?: string;
  },
  currentPage?: string | null
): string | null {
  if (!currentPage) return null;

  const redirectMap: Record<string, () => string | null> = {
    '/upload': () => {
      if (!session.brief_report_generated) return '/survey-result';
      return null;
    },
    '/questions': () => {
      if (!session.brief_report_generated) return '/survey-result';
      if (!session.upload_completed) return '/upload';
      return null;
    },
    '/generating': () => {
      if (!session.brief_report_generated) return '/survey-result';
      if (!session.upload_completed) return '/upload';
      if (!session.questions_completed) return '/questions';
      return null;
    },
    '/result': () => {
      if (!session.brief_report_generated) return '/survey-result';
      if (session.status === 'processing') return '/generating';
      if (session.status !== 'completed') return '/generating';
      return null;
    },
  };

  const check = redirectMap[currentPage];
  return check ? check() : null;
}
