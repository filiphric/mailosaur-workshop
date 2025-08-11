import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/?error=missing-token', request.url));
    }

    // Verify the magic link token
    const payload = jwt.verify(token, JWT_SECRET) as any;

    if (payload.type !== 'magic-link') {
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    // Create a session token
    const sessionToken = jwt.sign(
      { 
        email: payload.email, 
        authenticated: true,
        method: 'magic-link',
        loginTime: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set the session cookie and redirect to success page
    const response = NextResponse.redirect(new URL('/success', request.url));
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Magic link verification error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.redirect(new URL('/?error=expired-link', request.url));
    }
    return NextResponse.redirect(new URL('/?error=invalid-link', request.url));
  }
}