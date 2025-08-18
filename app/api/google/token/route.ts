import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    
    const { code } = await request.json();

    if (!code) {
      console.error('❌ [Google Token API] No authorization code provided');
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.startvibin.io'}/google-callback`;

    console.log('🔧 [Google Token API] Configuration:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    });

    if (!clientId || !clientSecret) {
      console.error('❌ [Google Token API] Missing Google OAuth credentials');
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
    console.log('📡 [Google Token API] Exchanging code for token with Google...');
    
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

    console.log('📊 [Google Token API] Google response status:', tokenResponse.status);
    console.log('📊 [Google Token API] Google response ok:', tokenResponse.ok);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ [Google Token API] Google token exchange error:', errorData);
      console.error('📊 [Google Token API] Response status:', tokenResponse.status);
      console.error('📊 [Google Token API] Response headers:', Object.fromEntries(tokenResponse.headers.entries()));
      return NextResponse.json({ 
        error: 'Failed to exchange code for token',
        details: errorData
      }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ [Google Token API] Token exchange successful');
    console.log('🔑 [Google Token API] Token received:', {
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in
    });

    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
    });
  } catch (error) {
    console.error('❌ [Google Token API] Error in token exchange:', error);
    console.error('🔍 [Google Token API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 