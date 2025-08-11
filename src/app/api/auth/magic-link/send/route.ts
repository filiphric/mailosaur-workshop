import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create a transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a magic link token
    const token = jwt.sign(
      { email, type: 'magic-link' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/magic-link/verify?token=${token}`;

    const transporter = createTransporter();

    // Send magic link email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@example.com',
      to: email,
      subject: 'Your Magic Link - Mailosaur OTP Demo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sign in to Mailosaur OTP Demo</h2>
          <p>Click the link below to sign in to your account:</p>
          <p>
            <a href="${magicLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Sign In with Magic Link
            </a>
          </p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      message: 'Magic link sent successfully',
      success: true 
    });

  } catch (error) {
    console.error('Magic link send error:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}