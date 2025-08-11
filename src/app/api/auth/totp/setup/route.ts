import { NextRequest, NextResponse } from 'next/server';
import { TOTP } from 'otpauth';
import QRCode from 'qrcode';
import { totpStore, normalizeIdentifier, validateIdentifier, setTotpData } from '@/lib/storage';

export async function POST(request: NextRequest) {
  console.log('🚀 TOTP Setup route called');
  
  try {
    const { identifier } = await request.json();
    console.log('📧 Setup identifier received:', identifier);

    if (!identifier) {
      console.log('❌ No identifier provided');
      return NextResponse.json({ error: 'Identifier (email/phone) is required' }, { status: 400 });
    }

    // Normalize and validate identifier
    const normalizedIdentifier = normalizeIdentifier(identifier);
    const validation = validateIdentifier(normalizedIdentifier);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid identifier format. Please use a valid email address or phone number with country code (e.g., +1234567890)' 
      }, { status: 400 });
    }

    // Generate TOTP secret
    const totp = new TOTP({
      issuer: 'Mailosaur OTP Demo',
      label: normalizedIdentifier,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    // Store the secret using normalized identifier with persistence
    setTotpData(normalizedIdentifier, { secret: totp.secret.base32, verified: false });
    
    console.log(`✅ TOTP setup complete for identifier: ${normalizedIdentifier}`);
    console.log(`📊 Current totpStore size: ${totpStore.size}`);

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(totp.toString());

    return NextResponse.json({
      secret: totp.secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: totp.secret.base32,
      success: true
    });

  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup TOTP' },
      { status: 500 }
    );
  }
}