import { NextResponse } from 'next/server';
import { totpStore, otpStore } from '@/lib/storage';

export async function GET() {
  const debug = {
    totp: {
      size: totpStore.size,
      keys: Array.from(totpStore.keys()),
      entries: Array.from(totpStore.entries()).map(([key, value]) => ({
        key,
        secret: value.secret.substring(0, 8) + '...', // Only show partial secret for security
        verified: value.verified
      }))
    },
    otp: {
      size: otpStore.size,
      keys: Array.from(otpStore.keys()),
      entries: Array.from(otpStore.entries()).map(([key, value]) => ({
        key,
        code: value.code,
        expires: new Date(value.expires).toISOString(),
        isExpired: Date.now() > value.expires
      }))
    },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(debug, { status: 200 });
}