import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/google-callback`;

    // Debug logging
    console.log('Google OAuth Debug Info:');
    console.log('Client ID exists:', !!clientId);
    console.log('Client Secret exists:', !!clientSecret);
    console.log('Redirect URI:', redirectUri);
    console.log('Code received:', !!code);

    if (!clientId || !clientSecret) {
      console.error('Missing Google OAuth credentials:');
      console.error('GOOGLE_CLIENT_ID:', !!clientId);
      console.error('GOOGLE_CLIENT_SECRET:', !!clientSecret);
      return NextResponse.json({ 
        error: 'Google OAuth not configured. Please check your environment variables.',
        details: {
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          redirectUri
        }
      }, { status: 500 });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Google token exchange error:', errorData);
      console.error('Response status:', tokenResponse.status);
      console.error('Response headers:', Object.fromEntries(tokenResponse.headers.entries()));
      return NextResponse.json({ 
        error: 'Failed to exchange code for token',
        details: errorData
      }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
    });
  } catch (error) {
    console.error('Error in Google token exchange:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 