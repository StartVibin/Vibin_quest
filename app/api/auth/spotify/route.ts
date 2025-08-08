import { NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3000/callback';

export async function GET() {
  try {
    const state = Math.random().toString(36).substring(7);
    
    const spotifyAuthUrl = new URL('https://accounts.spotify.com/authorize');
    spotifyAuthUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID!);
    spotifyAuthUrl.searchParams.append('response_type', 'code');
    spotifyAuthUrl.searchParams.append('redirect_uri', SPOTIFY_REDIRECT_URI);
    spotifyAuthUrl.searchParams.append('state', state);
    spotifyAuthUrl.searchParams.append('scope', 'user-read-email user-read-private user-read-recently-played user-top-read user-read-playback-state user-modify-playback-state user-library-read user-follow-read playlist-read-private playlist-read-collaborative');
    
    return NextResponse.json({ 
      authUrl: spotifyAuthUrl.toString(),
      state 
    });
  } catch (error) {
    console.error('Spotify OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Spotify OAuth' },
      { status: 500 }
    );
  }
} 