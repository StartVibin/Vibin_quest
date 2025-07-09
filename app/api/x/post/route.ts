import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, text } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
    }
    const postText = text || 'Just discovered @StartVibin! 🚀\n\nAn amazing Web3 social platform where you can earn rewards for engaging with content.\n\nCheck it out: https://vibin.app\n\n#VibinApp #Web3 #SocialFi #Rewards';
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: postText,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || data.title || 'Failed to post' }, { status: response.status });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 