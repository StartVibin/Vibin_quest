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