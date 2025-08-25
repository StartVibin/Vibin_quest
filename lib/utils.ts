import { ToastInstance } from './types';

export const formatAddress = (address: string): string => {
  if (address.length <= 8) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatPoints = (points: number): string => {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`
  }
  return points.toString()
}

export const getPlatformGradient = (platform: string) => {
  switch (platform) {
    case 'twitter':
      return 'from-gray-100 to-gray-200'
    case 'telegram':
      return 'from-blue-100 to-blue-200'
    default:
      return 'from-gray-100 to-gray-200'
  }
}

export const getRankIcon = (rank: number): string => {
  switch (rank) {
    case 1: return '🏆'
    case 2: return '🥈'
    case 3: return '🥉'
    default: return rank.toString()
  }
}

// Simple className concatenation utility (replaces clsx/cn)
export const combineClasses = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Show wallet connection warning
export const showWalletWarning = (toast: ToastInstance) => {
  toast.warning('Please connect your wallet first to complete this task!', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  })
}

export const handleTwitterFollow = (username: string = 'beatwisedata') => {
  const twitterUrl = `https://twitter.com/intent/follow?screen_name=${username}`
  window.open(twitterUrl, '_blank', 'noopener,noreferrer')
}

export const handleQuestAction = (questId: string, platform: string) => {
  switch (platform) {
    case 'twitter':
      handleTwitterFollow()
      break
    case 'telegram':
      // Handle Telegram join logic
      //console.log('Telegram quest clicked:', questId)
      break
    default:
      //console.log('Unknown platform:', platform)
  }
}

// PKCE code challenge generation (SHA-256, base64url)
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export const handleXConnect = async (toast: ToastInstance) => {
  if (typeof window === 'undefined') return;
  
  // X OAuth 2.0 configuration
  const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID
  const redirectUri = `${window.location.origin}/x-callback`
  const scope = 'tweet.read users.read offline.access tweet.write follows.write'
  
  if (!clientId) {
    //console.error('X OAuth not configured - missing NEXT_PUBLIC_X_CLIENT_ID')
    toast.error('X OAuth not configured. Please set up your X Developer App.')
    return
  }
  
  // Generate state parameter for security
  const state = Math.random().toString(36).substring(2, 15)
  localStorage.setItem('x_oauth_state', state)
  
  // Generate PKCE code verifier and challenge
  const codeVerifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  localStorage.setItem('x_code_verifier', codeVerifier)
  
  // Build OAuth URL
  const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scope)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('code_challenge', codeChallenge)
  
  // Redirect to X OAuth
  window.location.href = authUrl.toString()
}

// X API Actions
const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('x_access_token');
  console.log('🔍 [getAccessToken] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
  return token;
}

export const handleXFollow = async (username: string = 'StartVibin', toast: ToastInstance, walletAddress?: string) => {
  console.log('🔄 [X Follow] Starting follow process for:', username);
  
  const accessToken = getAccessToken();
  console.log('🔑 [X Follow] Access token status:', !!accessToken);
  
  if (!accessToken) {
    console.error('❌ [X Follow] No access token found');
    toast.error('Please connect your X account first')
    return
  }
  
  if (!walletAddress) {
    console.error('❌ [X Follow] No wallet address provided');
    toast.error('Wallet address is required')
    return
  }
  
  try {
    console.log('📡 [X Follow] Calling X follow API...');
    const requestBody = { accessToken, username };
    console.log('📤 [X Follow] Request body:', {
      hasAccessToken: !!accessToken,
      username,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : null
    });
    
    // First perform the X action
    const response = await fetch('/api/x/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📊 [X Follow] API response status:', response.status);
    const data = await response.json();
    console.log('📊 [X Follow] API response data:', data);
    
    if (response.ok) {
      console.log('✅ [X Follow] X follow successful, verifying with backend...');
      // Then verify with backend
      const { verifyXFollow } = await import('./api');
      const verificationResult = await verifyXFollow(walletAddress, username);
      
      console.log('✅ [X Follow] Backend verification successful:', verificationResult);
      toast.success(`Successfully followed @${username}! Awarded ${verificationResult.data.pointsAwarded} points!`)
      localStorage.setItem('x_followed_vibin', 'true')
    } else {
      console.error('❌ [X Follow] X follow failed:', data);
      throw new Error(data.error || data.details || 'Failed to follow user')
    }
  } catch (error) {
    console.error('❌ [X Follow] Follow action failed:', error);
    console.error('🔍 [X Follow] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    toast.error('Failed to follow user. Please try again.')
  }
}

export const handleXRepost = async (tweetId: string = '1940467598610911339', toast: ToastInstance, walletAddress?: string) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    toast.error('Please connect your X account first')
    return
  }
  
  if (!walletAddress) {
    toast.error('Wallet address is required')
    return
  }
  
  try {
    // First perform the X action
    const response = await fetch('/api/x/repost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, tweetId }),
    });
    const data = await response.json();
    if (response.ok) {
      // Then verify with backend
      const { verifyXRepost } = await import('./api');
      const verificationResult = await verifyXRepost(walletAddress, tweetId);
      
      toast.success(`Successfully reposted! Awarded ${verificationResult.data.pointsAwarded} points!`)
      localStorage.setItem('x_reposted', 'true')
    } else {
      throw new Error(data.error || 'Failed to repost')
    }
  } catch (error) {
    console.error('Repost action failed:', error)
    toast.error('Failed to repost. Please try again.')
  }
}

export const handleXReply = async (tweetId: string = '1940467598610911339', toast: ToastInstance, walletAddress?: string) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    toast.error('Please connect your X account first')
    return
  }
  
  if (!walletAddress) {
    toast.error('Wallet address is required')
    return
  }
  
  try {
    // First perform the X action
    const response = await fetch('/api/x/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, tweetId }),
    });
    const data = await response.json();
    if (response.ok) {
      // Then verify with backend
      const { verifyXReply } = await import('./api');
      const verificationResult = await verifyXReply(walletAddress, tweetId);
      
      toast.success(`Successfully replied! Awarded ${verificationResult.data.pointsAwarded} points!`)
      localStorage.setItem('x_replied', 'true')
    } else {
      throw new Error(data.error || 'Failed to reply')
    }
  } catch (error) {
    console.error('Reply action failed:', error)
    toast.error('Failed to reply. Please try again.')
  }
}

export const handleXPost = async (toast: ToastInstance, walletAddress?: string) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    toast.error('Please connect your X account first')
    return
  }
  
  if (!walletAddress) {
    toast.error('Wallet address is required')
    return
  }
  
  try {
    // First perform the X action
    const response = await fetch('/api/x/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
    const data = await response.json();
    if (response.ok) {
      // Then verify with backend
      const { verifyXPost } = await import('./api');
      const verificationResult = await verifyXPost(walletAddress);
      
      toast.success(`Successfully posted! Awarded ${verificationResult.data.pointsAwarded} points!`)
      localStorage.setItem('x_posted', 'true')
    } else {
      throw new Error(data.error || 'Failed to post')
    }
  } catch (error) {
    console.error('Post action failed:', error)
    toast.error('Failed to post. Please try again.')
  }
}

export const checkXActionStatus = (action: string): boolean => {
  if (typeof window === 'undefined') return false;
  switch (action) {
    case 'follow':
      return localStorage.getItem('x_followed_vibin') === 'true'
    case 'repost':
      return localStorage.getItem('x_reposted') === 'true'
    case 'reply':
      return localStorage.getItem('x_replied') === 'true'
    case 'post':
      return localStorage.getItem('x_posted') === 'true'
    default:
      return false
  }
}

// Update game points and high score
export const updateGamePoints = (
  currentStats: { gamePoints: number; highScore: number },
  newGamePoints: number
): { gamePoints: number; highScore: number } => {
  const updatedGamePoints = currentStats.gamePoints + newGamePoints;
  const updatedHighScore = Math.max(currentStats.highScore, newGamePoints);
  
  return {
    gamePoints: updatedGamePoints,
    highScore: updatedHighScore
  };
};

// Update total points after game points change
export const updateTotalPoints = (
  currentStats: { gamePoints: number; socialPoints: number }
): number => {
  return currentStats.gamePoints + currentStats.socialPoints;
};

// Complete user stats update when receiving game points
export const updateUserStatsWithGamePoints = (
  currentStats: { gamePoints: number; highScore: number; socialPoints: number },
  newGamePoints: number
): { gamePoints: number; highScore: number; socialPoints: number; totalPoints: number } => {
  const updatedGameStats = updateGamePoints(currentStats, newGamePoints);
  
    return {
    ...updatedGameStats,
    socialPoints: currentStats.socialPoints,
    totalPoints: updateTotalPoints({
      gamePoints: updatedGameStats.gamePoints,
      socialPoints: currentStats.socialPoints
    })
  };
};

export async function postXStats({
  topTracks,
  totalListeningTimeMs,
  uniqueArtistsCount,
  topArtists
}: {
  topTracks: { name: string; artist: string }[];
  totalListeningTimeMs: number;
  uniqueArtistsCount: number;
  topArtists: { name: string; trackCount?: number }[];
}) {
    console.log("topTracks", topTracks)
    console.log("totalListeningTimeMs", totalListeningTimeMs)
    console.log("uniqueArtistsCount", uniqueArtistsCount)
    console.log("topArtists", topArtists)   
  if (typeof window === 'undefined') return;
  const accessToken = getAccessToken();
  if (!accessToken) {
    console.error('No X access token found. Please connect X first.');
    return;
  }

  // Check if already posted recently (within last 5 minutes)
  const lastPostedTime = localStorage.getItem('x_last_posted_time');
  const now = Date.now();
  if (lastPostedTime && (now - parseInt(lastPostedTime)) < 5 * 60 * 1000) {
    // Show "already shared" message
    return { alreadyShared: true };
  }

  // Format listening time
  function formatMsToHrMin(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // Compose the tweet
  const tweet =
    `🎧 My Spotify stats this week:\n` +
    `Top 3 Artists: ${topArtists.slice(0, 3).map(a => a.name).join(', ')}\n` +
    `Top 3 Tracks: ${topTracks.slice(0, 3).map(t => t.name).join(', ')}\n` +
    `Total Listening Time: ${formatMsToHrMin(totalListeningTimeMs)}\n` +
    `Unique Artists: ${uniqueArtistsCount}\n` +
    `#Vibin #SpotifyStats`;

  // Post to local API route to avoid CORS
  try {
    const response = await fetch('/api/x/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, text: tweet }),
    });
    const result = await response.json();
    console.log('✅ [postXStats] Tweet posted:', result);
    
    if (result.success) {
      // Store timestamp of successful post
      localStorage.setItem('x_last_posted_time', now.toString());
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ [postXStats] Error posting to X:', error);
    return { success: false, error: 'Network error' };
  }
}