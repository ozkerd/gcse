import { NextResponse } from 'next/server';
import { formatSpokenMathText } from '@/lib/math-format';

export const runtime = 'edge';

async function fetchPollyVoiceMp3(
  spokenText: string,
  pollyVoice: 'Brian' | 'Amy'
): Promise<ArrayBuffer | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const bodyParams = new URLSearchParams();
      bodyParams.set('msg', spokenText);
      bodyParams.set('lang', pollyVoice);
      bodyParams.set('source', 'ttsmp3');

      const metaRes = await fetch('https://ttsmp3.com/makemp3_new.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
        body: bodyParams.toString(),
      });

      if (metaRes.ok) {
        const data = (await metaRes.json()) as { URL?: string };
        if (data && data.URL) {
          const mp3Res = await fetch(data.URL);
          if (mp3Res.ok) {
            return await mp3Res.arrayBuffer();
          }
        }
      }
    } catch {
      // Retry same voice on transient network error
    }
  }
  return null;
}

/**
 * Edge-compatible Natural British Human Voice TTS Endpoint
 * Strictly 2 voices ONLY (no robotic voices, no extra accents):
 * - Dan (Male): Amazon Polly UK 'Brian'
 * - Mia (Female): Amazon Polly UK 'Amy'
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawText = (searchParams.get('text') || '').trim();
  const speaker = (searchParams.get('speaker') || 'Dan').toLowerCase();

  if (!rawText) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  // Convert all mathematical and scientific notation into natural UK spoken English, ensuring SSML safety
  const spokenText = formatSpokenMathText(rawText)
    .replace(/&/g, ' and ')
    .replace(/[<>&]/g, ' ')
    .slice(0, 950);

  const isMale = speaker.includes('dan');
  const pollyVoice: 'Brian' | 'Amy' = isMale ? 'Brian' : 'Amy';

  const audioBuffer = await fetchPollyVoiceMp3(spokenText, pollyVoice);
  if (audioBuffer && audioBuffer.byteLength > 0) {
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  return NextResponse.json({ error: 'TTS stream unavailable' }, { status: 503 });
}
