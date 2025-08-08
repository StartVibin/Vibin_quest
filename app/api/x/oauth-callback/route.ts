import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    //console.log("🚀 ~ POST ~ request:", request)
    //console.log("🚀 ~ POST request is calling now")
    const { code, code_verifier, redirect_uri } = await request.json();
    const client_id = process.env.NEXT_PUBLIC_X_CLIENT_ID;
    const client_secret = process.env.X_CLIENT_SECRET;

    if (!code || !code_verifier || !redirect_uri || !client_id || !client_secret) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id,
      redirect_uri,
      code_verifier,
    });

    const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: params,
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to get access token', details: data }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
} 