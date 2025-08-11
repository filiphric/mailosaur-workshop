import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ 
    message: 'Logged out successfully',
    success: true 
  });

  // Clear the session cookie
  response.cookies.delete('session');

  return response;
}