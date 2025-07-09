import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { accessToken, username } = await request.json();
  if (!accessToken || !username) {
    return NextResponse.json({ error: 'Missing access token or username' }, { status: 400 });
  }

  // 1. Get user ID by username
  const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const userData = await userRes.json();
  if (!userRes.ok) {
    return NextResponse.json({ error: userData.error || 'Failed to get user data', details: userData }, { status: 400 });
  }
  const userId = userData.data.id;

  // 2. Get authenticated user's ID
  const meRes = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const meData = await meRes.json();
  if (!meRes.ok) {
    return NextResponse.json({ error: meData.error || 'Failed to get authenticated user', details: meData }, { status: 400 });
  }
  const myId = meData.data.id;

  // 3. Follow the user
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
    return NextResponse.json({ error: followData.error || 'Failed to follow user', details: followData }, { status: 400 });
  }

  return NextResponse.json(followData);
} 