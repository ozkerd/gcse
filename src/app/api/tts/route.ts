import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Edge-compatible Natural British Human Voice TTS Endpoint
 * Uses natural UK voices:
 * - Alex (GCSE Coach): British Male ('Brian' neural voice)
 * - Maya (Year 11 Student): British Female ('Amy' neural voice)
 * With automatic fallback to Google UK English Neural stream.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = (searchParams.get('text') || '').trim();
  const speaker = searchParams.get('speaker') || 'Alex';

  if (!text) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  // Clean LaTeX symbols so the voice reads formulas naturally like a human teacher
  const spokenText = text
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2')
    .replace(/\\times/g, ' times ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\Delta/g, ' change in ')
    .replace(/\\lambda/g, ' wavelength ')
    .replace(/\\rightarrow/g, ' leads to ')
    .replace(/\s+/g, ' ')
    .slice(0, 500);

  const voiceName = speaker.toLowerCase().includes('alex') ? 'Brian' : 'Amy';

  // Primary: Amazon Polly UK Natural Human Voices (Brian & Amy) via StreamElements
  try {
    const pollyUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(
      voiceName
    )}&text=${encodeURIComponent(spokenText)}`;

    const res = await fetch(pollyUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    if (res.ok && res.body) {
      return new Response(res.body, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch {
    // Fall through to Google UK TTS
  }

  // Fallback: Google UK English TTS ( split into <200 char sentence chunks if needed )
  try {
    const shortChunk = spokenText.slice(0, 200);
    const googleUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q=${encodeURIComponent(
      shortChunk
    )}`;
    const fallbackRes = await fetch(googleUrl);
    if (fallbackRes.ok && fallbackRes.body) {
      return new Response(fallbackRes.body, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch {
    // Client will gracefully fall back to browser Neural voice
  }

  return NextResponse.json({ error: 'TTS stream unavailable' }, { status: 503 });
}
