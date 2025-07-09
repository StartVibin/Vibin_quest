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
    case 'discord':
      return 'from-purple-100 to-purple-200'
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

export const handleTwitterFollow = (username: string = 'beatwisedata') => {
  const twitterUrl = `https://twitter.com/intent/follow?screen_name=${username}`
  window.open(twitterUrl, '_blank', 'noopener,noreferrer')
}

export const handleDiscordJoin = () => {
  // Redirect to Discord OAuth flow
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI
  
  if (!clientId || !redirectUri) {
    console.error('Discord OAuth configuration missing')
    return
  }
  
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20guilds.join`
  window.open(discordAuthUrl, '_blank', 'noopener,noreferrer')
}

export const checkDiscordVerification = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Check if Discord verification is stored in localStorage
  const isVerified = localStorage.getItem('discord_verified') === 'true'
  const verifiedAt = localStorage.getItem('discord_verified_at')
  
  if (!isVerified || !verifiedAt) {
    return false
  }
  
  // Check if verification is still valid (e.g., within 24 hours)
  const verificationTime = new Date(verifiedAt).getTime()
  const currentTime = new Date().getTime()
  const hoursSinceVerification = (currentTime - verificationTime) / (1000 * 60 * 60)
  
  // Consider verification valid for 24 hours
  return hoursSinceVerification < 24
}

export const handleQuestAction = (questId: string, platform: string) => {
  switch (platform) {
    case 'twitter':
      handleTwitterFollow()
      break
    case 'discord':
      // Handle Discord join logic
      console.log('Discord quest clicked:', questId)
      break
    case 'telegram':
      // Handle Telegram join logic
      console.log('Telegram quest clicked:', questId)
      break
    default:
      console.log('Unknown platform:', platform)
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

export const handleXConnect = async () => {
  if (typeof window === 'undefined') return;
  // X OAuth 2.0 configuration
  const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID
  const redirectUri = `${window.location.origin}/x-callback`
  const scope = 'tweet.read users.read offline.access tweet.write follows.write'
  
  if (!clientId) {
    console.error('X OAuth not configured - missing NEXT_PUBLIC_X_CLIENT_ID')
    alert('X OAuth not configured. Please set up your X Developer App.')
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
  return localStorage.getItem('x_access_token');
}

export const handleXFollow = async (username: string = 'StartVibin') => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    alert('Please connect your X account first')
    return
  }
  try {
    const response = await fetch('/api/x/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, username }),
    });
    const data = await response.json();
    if (response.ok) {
      alert(`Successfully followed @${username}!`)
      localStorage.setItem('x_followed_vibin', 'true')
    } else {
      throw new Error(data.error || 'Failed to follow user')
    }
  } catch (error) {
    console.error('Follow action failed:', error)
    alert('Failed to follow user. Please try again.')
  }
}

export const handleXRepost = async (tweetId: string = '1940467598610911339') => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    alert('Please connect your X account first')
    return
  }
  try {
    const response = await fetch('/api/x/repost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, tweetId }),
    });
    const data = await response.json();
    if (response.ok) {
      alert('Successfully reposted!')
      localStorage.setItem('x_reposted', 'true')
    } else {
      throw new Error(data.error || 'Failed to repost')
    }
  } catch (error) {
    console.error('Repost action failed:', error)
    alert('Failed to repost. Please try again.')
  }
}

export const handleXReply = async (tweetId: string = '1940467598610911339') => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    alert('Please connect your X account first')
    return
  }
  try {
    const response = await fetch('/api/x/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, tweetId }),
    });
    const data = await response.json();
    if (response.ok) {
      alert('Successfully replied!')
      localStorage.setItem('x_replied', 'true')
    } else {
      throw new Error(data.error || 'Failed to reply')
    }
  } catch (error) {
    console.error('Reply action failed:', error)
    alert('Failed to reply. Please try again.')
  }
}

export const handleXPost = async () => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    alert('Please connect your X account first')
    return
  }
  try {
    const response = await fetch('/api/x/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
    const data = await response.json();
    if (response.ok) {
      alert('Successfully posted about Vibin!')
      localStorage.setItem('x_posted_vibin', 'true')
    } else {
      throw new Error(data.error || 'Failed to post')
    }
  } catch (error) {
    console.error('Post action failed:', error)
    alert('Failed to post. Please try again.')
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
      return localStorage.getItem('x_posted_vibin') === 'true'
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