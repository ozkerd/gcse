'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'server';
  const STORAGE_KEY = '_gcse_vid';

  try {
    let vid = localStorage.getItem(STORAGE_KEY);
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY, vid);
      // Also set cookie
      document.cookie = `${STORAGE_KEY}=${vid}; path=/; max-age=31536000; SameSite=Lax`;
    }
    return vid;
  } catch {
    return 'v_guest_' + Math.random().toString(36).substring(2, 8);
  }
}

function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>('');

  useEffect(() => {
    if (!pathname) return;

    // Do not track visits to the admin stats dashboard itself
    if (pathname === '/stats' || pathname.startsWith('/stats/')) {
      return;
    }

    const search = searchParams?.toString();
    const fullPath = search ? `${pathname}?${search}` : pathname;

    // Avoid double firing for the same path in strict mode
    if (lastTracked.current === fullPath) {
      return;
    }
    lastTracked.current = fullPath;

    const visitorId = getOrCreateVisitorId();
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    const payload = JSON.stringify({
      path: fullPath,
      visitorId,
      referrer,
    });

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/track', blob);
      } else {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Non-blocking tracking
    }
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
