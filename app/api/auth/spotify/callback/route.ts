import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/spotify/callback';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/join/spotify?error=oauth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/join/spotify?error=no_code', request.url));
    }

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    });

    console.log(tokenResponse);
    

    if (!tokenResponse.ok) {
      //console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/join/spotify?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!profileResponse.ok) {
      //console.error('Profile fetch failed:', await profileResponse.text());
      return NextResponse.redirect(new URL('/join/spotify?error=profile_fetch_failed', request.url));
    }

    const profileData = await profileResponse.json();
    const { id, email, display_name } = profileData;

    const successUrl = new URL('/join/spotify', request.url);
    successUrl.searchParams.set('success', 'true');
    successUrl.searchParams.set('spotify_id', id);
    successUrl.searchParams.set('spotify_email', email || '');
    successUrl.searchParams.set('spotify_name', display_name || '');
    successUrl.searchParams.set('access_token', access_token);
    successUrl.searchParams.set('refresh_token', refresh_token);
    successUrl.searchParams.set('expires_in', expires_in.toString());

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Spotify callback error:', error);
    return NextResponse.redirect(new URL('/join/spotify?error=callback_failed', request.url));
  }
} 