'use client';

import { useEffect } from 'react';
import { initSentry, setUserContext } from '@/sentry.config';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Sentry on client side
    initSentry();

    // Set anonymous user context based on session
    // Generate or retrieve session ID from localStorage
    let sessionId = localStorage.getItem('tripplan_session_id');
    if (!sessionId) {
      // Generate a new session ID (CUID-like format)
      sessionId = 'session_' + Math.random().toString(36).substr(2, 12);
      localStorage.setItem('tripplan_session_id', sessionId);
    }
    setUserContext(sessionId);
  }, []);

  return <>{children}</>;
}
