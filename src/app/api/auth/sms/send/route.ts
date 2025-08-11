import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { otpStore, normalizeIdentifier, isValidPhone, setOtpData } from '@/lib/storage';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Normalize and validate phone number
    const normalizedPhone = normalizeIdentifier(phone);
    
    if (!isValidPhone(normalizedPhone)) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Please include country code (e.g., +1234567890)' 
      }, { status: 400 });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP using normalized phone with persistence
    setOtpData(normalizedPhone, { code: otpCode, expires });

    // Send SMS via Twilio (use original phone format for Twilio)
    await client.messages.create({
      body: `Your verification code is: ${otpCode}. This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone,
    });

    return NextResponse.json({ 
      message: 'SMS sent successfully',
      success: true 
    });

  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}