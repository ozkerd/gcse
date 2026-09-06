import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Gmail SMTP Email Dispatch API Route
 * Configured with Google App Password & alias noreply@btpsec.com
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { from, to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required email fields (to, subject, html)' }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER || 'ozkan.erdogan@btpsec.com';
    // Remove spaces from app password if present
    const rawPass = process.env.GMAIL_APP_PASSWORD || 'menh nhgw zpys pfnk';
    const gmailPass = rawPass.replace(/\s+/g, '');

    const fromAddress = from || process.env.GMAIL_FROM || 'gcse.primerllm <noreply@btpsec.com>';

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use TLS SSL
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // Dispatch email
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    console.log(`[Gmail SMTP Success] Message sent to ${to}. MessageId: ${info.messageId}`);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      provider: 'gmail_smtp',
      sentTo: to,
    });

  } catch (error: any) {
    console.error('[Gmail SMTP Error]', error);

    // Fallback: If Gmail SMTP encounters any error (e.g. rate limit), return informative error
    return NextResponse.json({
      error: 'Gmail SMTP dispatch failed',
      details: error.message || String(error),
    }, { status: 500 });
  }
}
