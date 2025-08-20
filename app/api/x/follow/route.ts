import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    
    const contentType = request.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ [X Follow API] Invalid content type:', contentType);
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }
    
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error('❌ [X Follow API] Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { accessToken, username } = requestBody;
    
    if (!accessToken || !username) {
      console.error('❌ [X Follow API] Missing required data:', { accessToken: !!accessToken, username: !!username });
      return NextResponse.json({ error: 'Missing access token or username' }, { status: 400 });
    }

  const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const userData = await userRes.json();
  
  if (!userRes.ok) {
    console.error('❌ [X Follow API] Failed to get user data:', userData);
    return NextResponse.json({ error: userData.error || 'Failed to get user data', details: userData }, { status: 400 });
  }
  const userId = userData.data.id;
  const meRes = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const meData = await meRes.json();
  
  if (!meRes.ok) {
    console.error('❌ [X Follow API] Failed to get authenticated user:', meData);
    return NextResponse.json({ error: meData.error || 'Failed to get authenticated user', details: meData }, { status: 400 });
  }
  const myId = meData.data.id;
  const followRes = await fetch(`https://api.twitter.com/2/users/${myId}/following`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target_user_id: userId }),
  });
  const followData = await followRes.json();
  
  if (!followRes.ok) {
    console.error('❌ [X Follow API] Failed to follow user:', followData);
    return NextResponse.json({ error: followData.error || 'Failed to follow user', details: followData }, { status: 400 });
  }

  return NextResponse.json(followData);
  } catch (error) {
    console.error('❌ [X Follow API] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 