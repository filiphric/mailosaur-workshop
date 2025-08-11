import { NextRequest, NextResponse } from 'next/server';
import { TOTP } from 'otpauth';
import jwt from 'jsonwebtoken';
import { totpStore, normalizeIdentifier, validateIdentifier, setTotpData } from '@/lib/storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { identifier, code } = await request.json();

    if (!identifier || !code) {
      return NextResponse.json({ error: 'Identifier and code are required' }, { status: 400 });
    }

    // Normalize identifier to match what was stored
    const normalizedIdentifier = normalizeIdentifier(identifier);
    const validation = validateIdentifier(normalizedIdentifier);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid identifier format. Please use a valid email address or phone number with country code (e.g., +1234567890)' 
      }, { status: 400 });
    }

    console.log(`TOTP verify attempt for identifier: ${normalizedIdentifier}`);
    console.log(`Current totpStore size: ${totpStore.size}`);
    console.log(`totpStore keys:`, Array.from(totpStore.keys()));

    // Get stored TOTP secret
    const storedTotp = totpStore.get(normalizedIdentifier);
    
    if (!storedTotp) {
      return NextResponse.json({ 
        error: `No TOTP setup found for identifier "${normalizedIdentifier}". Please complete the setup process first.`,
        debug: {
          requestedIdentifier: normalizedIdentifier,
          availableIdentifiers: Array.from(totpStore.keys()),
          storeSize: totpStore.size
        }
      }, { status: 400 });
    }

    // Create TOTP instance with stored secret
    const totp = new TOTP({
      issuer: 'Mailosaur OTP Demo',
      label: normalizedIdentifier,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: storedTotp.secret,
    });

    // Verify the code
    const delta = totp.validate({ token: code, window: 1 });
    
    if (delta === null) {
      return NextResponse.json({ error: 'Invalid TOTP code' }, { status: 400 });
    }

    // Mark as verified and create session
    setTotpData(normalizedIdentifier, { ...storedTotp, verified: true });
    console.log(`✅ TOTP verification successful for identifier: ${normalizedIdentifier}`);

    // Create a session token
    const sessionToken = jwt.sign(
      { 
        identifier: normalizedIdentifier, 
        authenticated: true,
        method: 'totp',
        loginTime: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({ 
      message: 'TOTP verification successful',
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
    console.error('TOTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify TOTP code' },
      { status: 500 }
    );
  }
}