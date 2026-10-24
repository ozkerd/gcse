import { NextResponse } from 'next/server';

export const runtime = 'edge';

function splitTextIntoChunks(text: string, maxLen = 180): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxLen) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) chunks.push(current);
      current = word.slice(0, maxLen);
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Edge-compatible Natural British Human Voice TTS Endpoint
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

  // Clean LaTeX notation so formulas are spoken naturally like a human tutor
  const spokenText = rawText
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2')
    .replace(/\\times/g, ' times ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\Delta/g, ' change in ')
    .replace(/\\lambda/g, ' wavelength ')
    .replace(/\\rightarrow/g, ' leads to ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 900);

  const isMale = speaker.includes('dan') || speaker.includes('alex');
  const pollyVoice = isMale ? 'Brian' : 'Amy';

  // 1. Primary: Amazon Polly UK Natural Human Voices ('Brian' Male & 'Amy' Female) via ttsmp3
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
      const data = await metaRes.json();
      if (data && data.URL) {
        const mp3Res = await fetch(data.URL);
        if (mp3Res.ok && mp3Res.body) {
          return new Response(mp3Res.body, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      }
    }
  } catch {
    // Fall through to multi-chunk Google Neural TTS
  }

  // 2. Fallback: Multi-chunk Google Neural TTS (concatenates MP3 buffers for any length)
  try {
    const chunks = splitTextIntoChunks(spokenText, 175);
    const tl = isMale ? 'en-AU' : 'en-GB';
    const buffers: ArrayBuffer[] = [];

    for (const chunk of chunks) {
      const googleUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(
        chunk
      )}`;
      const res = await fetch(googleUrl);
      if (res.ok) {
        buffers.push(await res.arrayBuffer());
      }
    }

    if (buffers.length > 0) {
      const totalLen = buffers.reduce((acc, b) => acc + b.byteLength, 0);
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const b of buffers) {
        merged.set(new Uint8Array(b), offset);
        offset += b.byteLength;
      }

      return new Response(merged, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch {
    // Ignore
  }

  return NextResponse.json({ error: 'TTS stream unavailable' }, { status: 503 });
}
