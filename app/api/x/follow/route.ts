import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [X Follow API] Request received');
    console.log('📋 [X Follow API] Request method:', request.method);
    console.log('📋 [X Follow API] Request headers:', Object.fromEntries(request.headers.entries()));
    
    const contentType = request.headers.get('content-type');
    console.log('📋 [X Follow API] Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ [X Follow API] Invalid content type:', contentType);
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }
    
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('📋 [X Follow API] Raw request body:', requestBody);
    } catch (parseError) {
      console.error('❌ [X Follow API] Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { accessToken, username } = requestBody;
    console.log('📋 [X Follow API] Extracted data:', { 
      hasAccessToken: !!accessToken, 
      username,
      accessTokenLength: accessToken?.length,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : null
    });
    
    if (!accessToken || !username) {
      console.error('❌ [X Follow API] Missing required data:', { accessToken: !!accessToken, username: !!username });
      return NextResponse.json({ error: 'Missing access token or username' }, { status: 400 });
    }

  console.log('📡 [X Follow API] Fetching user data for username:', username);
  const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const userData = await userRes.json();
  console.log('📊 [X Follow API] User data response status:', userRes.status);
  console.log('📊 [X Follow API] User data response:', userData);
  
  if (!userRes.ok) {
    console.error('❌ [X Follow API] Failed to get user data:', userData);
    return NextResponse.json({ error: userData.error || 'Failed to get user data', details: userData }, { status: 400 });
  }
  const userId = userData.data.id;
  console.log('🔍 [X Follow API] User data:', userData);
  console.log('✅ [X Follow API] User ID found:', userId);

  console.log('📡 [X Follow API] Fetching authenticated user data');
  const meRes = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const meData = await meRes.json();
  console.log('📊 [X Follow API] Me data response status:', meRes.status);
  console.log('📊 [X Follow API] Me data response:', meData);
  
  if (!meRes.ok) {
    console.error('❌ [X Follow API] Failed to get authenticated user:', meData);
    return NextResponse.json({ error: meData.error || 'Failed to get authenticated user', details: meData }, { status: 400 });
  }
  const myId = meData.data.id;
  console.log('✅ [X Follow API] Authenticated user ID found:', myId);

  console.log('📡 [X Follow API] Following user:', { myId, userId, username });
  const followRes = await fetch(`https://api.twitter.com/2/users/${myId}/following`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target_user_id: userId }),
  });
  const followData = await followRes.json();
  console.log('📊 [X Follow API] Follow response status:', followRes.status);
  console.log('📊 [X Follow API] Follow response:', followData);
  
  if (!followRes.ok) {
    console.error('❌ [X Follow API] Failed to follow user:', followData);
    return NextResponse.json({ error: followData.error || 'Failed to follow user', details: followData }, { status: 400 });
  }

  console.log('✅ [X Follow API] Successfully followed user');
  return NextResponse.json(followData);
  } catch (error) {
    console.error('❌ [X Follow API] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 