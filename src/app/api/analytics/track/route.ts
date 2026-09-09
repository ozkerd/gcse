import { NextResponse } from 'next/server';
import { recordAnalyticsEvent } from '@/lib/analytics/store';

export const runtime = 'edge';

async function hashIp(ip: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`gcse_salt_${ip}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  } catch {
    return 'anon';
  }
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Beacon or empty payload
    }

    const { path, visitorId, sessionId, referrer } = body;

    // Filter out internal tracking requests to /stats
    if (path && (path === '/stats' || path.startsWith('/stats/'))) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const rawIp =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      '127.0.0.1';

    const country = request.headers.get('cf-ipcountry') || 'GB';
    const ipHash = await hashIp(rawIp);

    const safeVisitorId =
      visitorId && typeof visitorId === 'string' && visitorId.trim()
        ? visitorId.trim()
        : `vid_${ipHash.slice(0, 8)}`;

    const event = await recordAnalyticsEvent({
      visitorId: safeVisitorId,
      sessionId: sessionId || undefined,
      path: path || '/',
      referrer: referrer || request.headers.get('referer') || undefined,
      userAgent,
      country,
      ipHash,
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Tracking failed' },
      { status: 500 }
    );
  }
}
