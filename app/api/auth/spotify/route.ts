import { NextResponse } from 'next/server';
import { sessionStore } from '@/lib/sessionStore';

const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/spotify/callback';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, index } = body;
    
    if (!email || index === undefined) {
      return NextResponse.json(
        { error: 'Email and index are required' },
        { status: 400 }
      );
    }
    
    console.log("🚀 ~ POST ~ Email:", email);
    console.log("🚀 ~ POST ~ Index:", index);
    
    const SPOTIFY_CLIENT_ID = process.env[`SPOTIFY_CLIENT_ID_${index}`];
    const SPOTIFY_CLIENT_SECRET = process.env[`SPOTIFY_CLIENT_SECRET_${index}`];
    
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      return NextResponse.json(
        { error: `Spotify credentials not found for index ${index}` },
        { status: 500 }
      );
    }
    
    // Generate a unique state parameter
    const state = Math.random().toString(36).substring(7);
    
    // Store email and index in SERVER-SIDE session store using state as key
    sessionStore.set(state, email, index);
    
    console.log("🚀 ~ POST ~ Stored in session store - State:", state);
    console.log("🚀 ~ POST ~ Stored in session store - Email:", email);
    console.log("🚀 ~ POST ~ Stored in session store - Index:", index);
    
    // Log session store stats
    const stats = sessionStore.getStats();
    console.log("📊 Session store stats after storing:", stats);

    //console.log("spotify clientId no 1==============================", clientId);
    const spotifyAuthUrl = new URL('https://accounts.spotify.com/authorize');
    spotifyAuthUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID!);
    spotifyAuthUrl.searchParams.append('response_type', 'code');
    spotifyAuthUrl.searchParams.append('redirect_uri', SPOTIFY_REDIRECT_URI);
    spotifyAuthUrl.searchParams.append('state', state);
    spotifyAuthUrl.searchParams.append('index', index.toString());

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