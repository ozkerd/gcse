import { NextResponse } from 'next/server';

export const runtime = 'edge';

const DEFAULT_PASSWORD = process.env.STATS_PASSWORD || 'gcse2026';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    if (password.trim() !== DEFAULT_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }

    // Generate authenticated token with expiration timestamp
    const timestamp = Date.now();
    const token = btoa(JSON.stringify({ auth: true, ts: timestamp }));

    return NextResponse.json({
      success: true,
      token,
      message: 'Authentication successful',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
