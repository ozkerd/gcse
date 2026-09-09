import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/analytics/store';

export const runtime = 'edge';

function verifyToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = JSON.parse(atob(token));
    return decoded && decoded.auth === true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '') || new URL(request.url).searchParams.get('token');

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const summary = getAnalyticsSummary();
    return NextResponse.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics summary' },
      { status: 500 }
    );
  }
}
