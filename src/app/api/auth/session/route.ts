import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Verify the session token
    const payload = jwt.verify(sessionToken, JWT_SECRET) as any;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.email || payload.phone || payload.identifier,
        email: payload.email,
        phone: payload.phone,
        identifier: payload.identifier,
        method: payload.method,
        loginTime: payload.loginTime,
      }
    });

  } catch (error) {
    console.error('Session verification error:', error);
    
    // Clear invalid session cookie
    const response = NextResponse.json({ authenticated: false, user: null });
    response.cookies.delete('session');
    
    return response;
  }
}