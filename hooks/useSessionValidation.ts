'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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

interface UseSessionValidationResult {
  sessionId: string | null;
  status: SessionStatus | null;
  isLoading: boolean;
  isValidated: boolean;
  isDevMode: boolean;
  refetch: () => Promise<SessionStatus | null>;
}

// Dev mode mock session - all access granted
const DEV_MODE_SESSION: SessionStatus = {
  sessionId: 'dev-mock-session',
  exists: true,
  phase1: {
    surveyCompleted: true,
    briefReportGenerated: true,
  },
  phase2: {
    uploadCompleted: true,
    questionsCompleted: true,
    generationStatus: 'completed',
  },
  allowedPages: ['/upload', '/questions', '/generating', '/result'],
  redirectTo: null,
};

export function useSessionValidation(): UseSessionValidationResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check for dev mode via URL parameter (?dev=true)
  const isDevMode = searchParams.get('dev') === 'true';
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);

  const validateSession = useCallback(
    async (sid: string): Promise<SessionStatus | null> => {
      try {
        const response = await fetch(
          `/api/session/status?sessionId=${sid}&page=${pathname}`
        );
        const data = await response.json();

        if (!response.ok) {
          console.error('Session validation error:', data.error);
          return null;
        }

        return data.data as SessionStatus;
      } catch (error) {
        console.error('Session validation failed:', error);
        return null;
      }
    },
    [pathname]
  );

  useEffect(() => {
    // Dev mode: skip all validation, use mock session
    if (isDevMode) {
      console.log('[Dev Mode] Bypassing session validation');
      setSessionId('dev-mock-session');
      setStatus(DEV_MODE_SESSION);
      setIsValidated(true);
      setIsLoading(false);
      return;
    }

    const storedSessionId = localStorage.getItem('sessionId');

    if (!storedSessionId) {
      // No session - redirect to survey
      router.push('/survey');
      return;
    }

    setSessionId(storedSessionId);

    // Validate session
    validateSession(storedSessionId).then((sessionStatus) => {
      if (!sessionStatus || !sessionStatus.exists) {
        // Invalid session - clear and redirect
        localStorage.removeItem('sessionId');
        router.push('/survey');
        return;
      }

      setStatus(sessionStatus);

      // Check if redirect needed
      if (sessionStatus.redirectTo) {
        router.push(sessionStatus.redirectTo);
        return;
      }

      setIsValidated(true);
      setIsLoading(false);
    });
  }, [router, validateSession, isDevMode]);

  const refetch = useCallback(async (): Promise<SessionStatus | null> => {
    if (!sessionId) return null;
    const newStatus = await validateSession(sessionId);
    if (newStatus) {
      setStatus(newStatus);
    }
    return newStatus;
  }, [sessionId, validateSession]);

  return {
    sessionId,
    status,
    isLoading,
    isValidated,
    isDevMode,
    refetch,
  };
}
