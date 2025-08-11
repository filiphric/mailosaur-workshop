import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { otpStore, normalizeIdentifier, isValidPhone, deleteOtpData } from '@/lib/storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

    // Normalize phone number to match stored format
    const normalizedPhone = normalizeIdentifier(phone);
    
    if (!isValidPhone(normalizedPhone)) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Please include country code (e.g., +1234567890)' 
      }, { status: 400 });
    }

    // Check if OTP exists and is valid
    const storedOtp = otpStore.get(normalizedPhone);
    
    if (!storedOtp) {
      return NextResponse.json({ error: 'No OTP found for this phone number' }, { status: 400 });
    }

    if (Date.now() > storedOtp.expires) {
      deleteOtpData(normalizedPhone);
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    if (storedOtp.code !== code) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    // OTP is valid - remove it from store and create session
    deleteOtpData(normalizedPhone);

    // Create a session token
    const sessionToken = jwt.sign(
      { 
        phone: normalizedPhone, 
        authenticated: true,
        method: 'sms',
        loginTime: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({ 
      message: 'SMS verification successful',
      success: true 
    });

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;

  } catch (error) {
    console.error('SMS verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify SMS code' },
      { status: 500 }
    );
  }
}