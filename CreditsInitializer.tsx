'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from 'cosmic-authentication';

export default function CreditsInitializer() {
  const { isAuthenticated, user, loading } = useAuth();
  const didRunRef = useRef(false);

  useEffect(() => {
    const tryInit = async () => {
      if (!isAuthenticated || !user) return;

      // Avoid duplicate calls per user
      const key = `creditsInit_${user.uid}`;
      if (didRunRef.current || typeof window === 'undefined') return;
      if (localStorage.getItem(key) === 'done') return;

      try {
        const res = await fetch('/api/user/initialize', { method: 'POST', keepalive: true });
        if (res.ok) {
          localStorage.setItem(key, 'done');
          // Ask navbar/components to refresh credits
          window.dispatchEvent(new CustomEvent('credits-updated'));
        }
      } catch {
        // ignore
      } finally {
        didRunRef.current = true;
      }
    };

    // Run when auth state becomes available
    if (!loading) {
      void tryInit();

      // Fallback retry shortly after in case of race conditions
      const t = window.setTimeout(() => void tryInit(), 1500);
      return () => window.clearTimeout(t);
    }
  }, [isAuthenticated, user, loading]);

  return null;
}