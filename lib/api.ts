// ============================================================================
// API CONFIGURATION
// ============================================================================

import { WalletAuthUser } from "./types"

const API_BASE_URL = 'http://localhost:5000/api/v1'

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
  

}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Quest verification
export interface QuestVerificationRequest {
  questId: string
  platform: 'twitter' | 'telegram'
  walletAddress: string
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
  data?: {
    user: WalletAuthUser;
    isNewUser: boolean;
  };
  error?: string;
}

// User profile
export interface UserProfileResponse {
  success: boolean
  data: {
    walletAddress: string
    xJoined: boolean
    telegramJoined: boolean
    xId: string
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
  platform: 'twitter' | 'telegram',
  walletAddress: string
): Promise<QuestVerificationResponse> => {
  try {
    const requestData: QuestVerificationRequest = {
      questId,
      platform,
      walletAddress
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

// Quest verification API functions
export const verifyXConnection = async (walletAddress: string, xData: any) => {
  const response = await fetch(`${API_BASE_URL}/quests/x/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      xId: xData.id,
      xUsername: xData.username,
      xDisplayName: xData.name,
      xProfileImageUrl: xData.profile_image_url,
      xVerified: xData.verified
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify X connection')
  }

  return response.json()
}

export const verifyXFollow = async (walletAddress: string, targetUsername: string) => {
  const response = await fetch(`${API_BASE_URL}/quests/x/follow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      targetUsername
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify X follow')
  }

  return response.json()
}

export const verifyXReply = async (walletAddress: string, tweetId: string) => {
  const response = await fetch(`${API_BASE_URL}/quests/x/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      tweetId
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify X reply')
  }

  return response.json()
}

export const verifyXRepost = async (walletAddress: string, tweetId: string) => {
  const response = await fetch(`${API_BASE_URL}/quests/x/repost`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      tweetId
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify X repost')
  }

  return response.json()
}

export const verifyXPost = async (walletAddress: string) => {
  const response = await fetch(`${API_BASE_URL}/quests/x/post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify X post')
  }

  return response.json()
}

export const verifyTelegramConnection = async (walletAddress: string, telegramData: any) => {
  const response = await fetch(`${API_BASE_URL}/quests/telegram/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      telegramId: telegramData.id,
      telegramUsername: telegramData.username,
      telegramFirstName: telegramData.first_name,
      telegramLastName: telegramData.last_name,
      telegramPhotoUrl: telegramData.photo_url
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify Telegram connection')
  }

  return response.json()
}

export const verifyEmailConnection = async (walletAddress: string, email: string) => {
  const response = await fetch(`${API_BASE_URL}/quests/email/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      email
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify email connection')
  }

  return response.json()
}

export const getUserQuestProgress = async (walletAddress: string) => {
  const response = await fetch(`${API_BASE_URL}/quests/progress/${walletAddress}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user quest progress')
  }

  return response.json()
}

 