import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, tweetId, text } = await req.json();
    if (!accessToken || !tweetId) {
      return NextResponse.json({ error: 'Missing accessToken or tweetId' }, { status: 400 });
    }
    const replyText = text || 'LFG!';
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: replyText,
        reply: {
          in_reply_to_tweet_id: tweetId,
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || data.title || 'Failed to reply' }, { status: response.status });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 