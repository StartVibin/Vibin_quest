// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE_URL = 'http://localhost:5000/api/v1'
const DISCORD_API_BASE = 'https://discord.com/api'

// API endpoints
export const API_ENDPOINTS = {
  // Quest endpoints
  VERIFY_QUEST: '/api/quests/verify',
  X_TASK: `${API_BASE_URL}/quests/x-task`,
  
  // User endpoints
  GET_USER_POINTS: '/api/user/points',
  USER_PROFILE: `${API_BASE_URL}/auth/profile`,
  
  // Game endpoints
  GAME_POINTS: `${API_BASE_URL}/game/points`,
  
  // Leaderboard endpoints
  LEADERBOARD: `${API_BASE_URL}/leaderboard`,
  
  // Auth endpoints
  WALLET_AUTH: `${API_BASE_URL}/auth/wallet`,
  
  // Discord endpoints
  DISCORD_TOKEN: '/api/discord/token',
  DISCORD_USER: `${DISCORD_API_BASE}/users/@me`,
  DISCORD_GUILD_MEMBER: (serverId: string) => `${DISCORD_API_BASE}/users/@me/guilds/${serverId}/member`,
  DISCORD_OAUTH_TOKEN: `${DISCORD_API_BASE}/oauth2/token`
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Quest verification
export interface QuestVerificationRequest {
  questId: string
  platform: 'twitter' | 'discord' | 'telegram'
  walletAddress: string
  discordUserId?: string
  discordUsername?: string
  signature?: string
}

export interface QuestVerificationResponse {
  success: boolean
  pointsAwarded: number
  totalPoints: number
  message: string
  error?: string
}

// X/Twitter task
export interface XTaskRequest {
  walletAddress: string
}

export interface XTaskResponse {
  success: boolean
  pointsAwarded?: number
  totalPoints?: number
  message?: string
  error?: string
}

// Game points
export interface GamePointsRequest {
  walletAddress: string
  gamePoints: number
}

export interface GamePointsResponse {
  success: boolean
  message: string
  error?: string
}

// Wallet authentication
export interface WalletAuthRequest {
  walletAddress: string
  originalMessage: string
  signedMessage: string
}

export interface WalletAuthResponse {
  success: boolean
  message: string
  user?: any
  error?: string
}

// User profile
export interface UserProfileResponse {
  success: boolean
  data: {
    walletAddress: string
    xJoined: boolean
    discordJoined: boolean
    telegramJoined: boolean
    xId: string
    discordId: string
    telegramId: string
    gamePoints: number
    referralPoints: number
    socialPoints: number
    referralCode: string
    isWhitelist: boolean
    highScore: number
    totalPoints: number
    totalSocialJoined: number
    createdAt: string
    updatedAt: string
  }
  error?: string
}

// Leaderboard
export interface LeaderboardResponse {
  success: boolean
  data: {
    users: Array<{
      walletAddress: string
      totalPoints: number
      gamePoints: number
      referralPoints: number
      socialPoints: number
      rank: number
    }>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

// Discord
export interface DiscordTokenRequest {
  code: string
  redirect_uri: string
}

export interface DiscordTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string
  verified: boolean
  email: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
  }
  return response.json()
}

const createApiRequest = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    return handleApiResponse<T>(response)
  } catch (error) {
    console.error(`API request failed for ${url}:`, error)
    throw error
  }
}

// ============================================================================
// QUEST API FUNCTIONS
// ============================================================================

export const verifyQuestWithBackend = async (
  questId: string,
  platform: string,
  walletAddress: string,
  discordData?: { userId: string; username: string }
): Promise<QuestVerificationResponse> => {
  try {
    const requestData: QuestVerificationRequest = {
      questId,
      platform: platform as 'twitter' | 'discord' | 'telegram',
      walletAddress,
      ...(discordData && {
        discordUserId: discordData.userId,
        discordUsername: discordData.username
      })
    }

    return await createApiRequest<QuestVerificationResponse>(
      API_ENDPOINTS.VERIFY_QUEST,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    )
  } catch (error) {
    console.error('Error verifying quest with backend:', error)
    return {
      success: false,
      pointsAwarded: 0,
      totalPoints: 0,
      message: 'Failed to verify quest with backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export const verifyXTask = async (walletAddress: string): Promise<XTaskResponse> => {
  try {
    const requestData: XTaskRequest = { walletAddress }
    
    return await createApiRequest<XTaskResponse>(
      API_ENDPOINTS.X_TASK,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    )
  } catch (error) {
    console.error('Error verifying X task:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================================================
// GAME API FUNCTIONS
// ============================================================================

export const sendGamePoints = async (
  walletAddress: string, 
  gamePoints: number
): Promise<GamePointsResponse> => {
  try {
    const requestData: GamePointsRequest = { walletAddress, gamePoints }
    
    return await createApiRequest<GamePointsResponse>(
      API_ENDPOINTS.GAME_POINTS,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    )
  } catch (error) {
    console.error('Error sending game points:', error)
    return {
      success: false,
      message: 'Failed to send game points',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================================================
// USER API FUNCTIONS
// ============================================================================

export const getUserPoints = async (walletAddress: string): Promise<number> => {
  try {
    const response = await createApiRequest<{ totalPoints: number }>(
      `${API_ENDPOINTS.GET_USER_POINTS}?wallet=${walletAddress}`
    )
    return response.totalPoints || 0
  } catch (error) {
    console.error('Error fetching user points:', error)
    return 0
  }
}

export const getUserProfile = async (walletAddress: string): Promise<UserProfileResponse> => {
  const url = `${API_ENDPOINTS.USER_PROFILE}/${walletAddress}`
  console.log('🌐 Making API call to:', url)
  
  try {
    const response = await createApiRequest<UserProfileResponse>(url)
    console.log('✅ API Response data:', response)
    return response
  } catch (error) {
    console.error('❌ Error fetching user profile:', error)
    throw error
  }
}

// ============================================================================
// LEADERBOARD API FUNCTIONS
// ============================================================================

export const getLeaderboard = async (): Promise<LeaderboardResponse> => {
  try {
    return await createApiRequest<LeaderboardResponse>(API_ENDPOINTS.LEADERBOARD)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return { 
      success: false, 
      data: { 
        users: [], 
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } 
      } 
    }
  }
}

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

export const authenticateWallet = async (
  walletAddress: string,
  originalMessage: string,
  signedMessage: string
): Promise<WalletAuthResponse> => {
  try {
    const requestData: WalletAuthRequest = {
      walletAddress,
      originalMessage,
      signedMessage
    }

    return await createApiRequest<WalletAuthResponse>(
      API_ENDPOINTS.WALLET_AUTH,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    )
  } catch (error) {
    console.error('Error authenticating wallet:', error)
    return {
      success: false,
      message: 'Failed to authenticate wallet',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================================================
// DISCORD API FUNCTIONS
// ============================================================================

export const getDiscordToken = async (
  code: string, 
  redirectUri: string
): Promise<DiscordTokenResponse> => {
  try {
    const requestData: DiscordTokenRequest = { code, redirect_uri: redirectUri }
    
    return await createApiRequest<DiscordTokenResponse>(
      API_ENDPOINTS.DISCORD_TOKEN,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    )
  } catch (error) {
    console.error('Error getting Discord token:', error)
    throw error
  }
}

export const getDiscordUser = async (accessToken: string): Promise<DiscordUser> => {
  try {
    return await createApiRequest<DiscordUser>(
      API_ENDPOINTS.DISCORD_USER,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )
  } catch (error) {
    console.error('Error fetching Discord user:', error)
    throw error
  }
}

export const verifyDiscordMembership = async (
  accessToken: string, 
  serverId: string
): Promise<boolean> => {
  try {
    if (!serverId) {
      console.error('Discord server ID not configured')
      return false
    }

    await createApiRequest(
      API_ENDPOINTS.DISCORD_GUILD_MEMBER(serverId),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )
    return true
  } catch (error) {
    console.error('Error verifying Discord membership:', error)
    return false
  }
} 