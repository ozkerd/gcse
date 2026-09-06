import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { from, to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required email fields (to, subject, html)' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      // Send real email via Resend API
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: from || 'gcse.primerllm <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
        }),
      });

      const resendData = await resendResponse.json();

      if (!resendResponse.ok) {
        console.error('[Resend Email Error]', resendData);
        return NextResponse.json({ error: 'Resend API failed', details: resendData }, { status: 500 });
      }

      return NextResponse.json({ success: true, messageId: resendData.id, provider: 'resend' });
    }

    // Demo / Simulated mode when API key is not configured yet
    console.log(`[Demo Email Service] Simulating email to ${to} with subject "${subject}"`);
    return NextResponse.json({
      success: true,
      messageId: `demo-${Date.now()}`,
      provider: 'simulated',
      note: 'Set RESEND_API_KEY in environment variables to send real emails.',
    });

  } catch (error: any) {
    console.error('[Email API Route Error]', error);
    return NextResponse.json({ error: 'Failed to process email dispatch', details: error.message }, { status: 500 });
  }
}
