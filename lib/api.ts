// ============================================================================
// API CONFIGURATION
// ============================================================================

import { WalletAuthUser } from "./types"
import { XUserData, TelegramAuthData, GoogleUserData, QuestProgressData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// API endpoints
export const API_ENDPOINTS = {
  // Quest endpoints
  VERIFY_X_CONNECT: `${API_BASE_URL}/quests/x/connect`,
  VERIFY_X_FOLLOW: `${API_BASE_URL}/quests/x/follow`,
  VERIFY_X_REPLY: `${API_BASE_URL}/quests/x/reply`,
  VERIFY_X_REPOST: `${API_BASE_URL}/quests/x/repost`,
  VERIFY_X_POST: `${API_BASE_URL}/quests/x/post`,
  VERIFY_TELEGRAM_CONNECT: `${API_BASE_URL}/quests/telegram/connect`,
  VERIFY_TELEGRAM_GROUP_JOIN: `${API_BASE_URL}/quests/telegram/join-group`,
  VERIFY_TELEGRAM_GROUP_VERIFY: `${API_BASE_URL}/quests/telegram/verify-group-join`,
  VERIFY_EMAIL_CONNECT: `${API_BASE_URL}/quests/email/connect`,
  GET_QUEST_PROGRESS: `${API_BASE_URL}/quests/progress`,
  
  // Auth endpoints
  GET_AUTH_MESSAGE: `${API_BASE_URL}/auth/message`,
  WALLET_AUTH: `${API_BASE_URL}/auth/wallet`,
  USER_PROFILE: `${API_BASE_URL}/auth/profile`,
  VERIFY_CODE: `${API_BASE_URL}/api/v1/referrals/verify`,
  TELEGRAM_USER_DATA: `${API_BASE_URL}/auth/telegram`,

  //  Spotify Token
  GET_SPOTIFY: `${API_BASE_URL}/auth/spotify/token`,
  
  // Game endpoints
  GAME_POINTS: `${API_BASE_URL}/game/points`,
  GAME_CAN_PLAY: `${API_BASE_URL}/game/can-play`,
  GAME_RECORD_PLAY: `${API_BASE_URL}/game/record-play`,
  
  // Leaderboard endpoints
  LEADERBOARD: `${API_BASE_URL}/api/v1/leaderboard`,
  
  // Config endpoints
  GET_X_POST_ID: `${API_BASE_URL}/config/x-post-id`,
  
  // Referral endpoints
  VERIFY_INVITATION_CODE: `${API_BASE_URL}/api/v1/referrals/verify`,
  CREATE_USER_WITH_REFERRAL: `${API_BASE_URL}/api/v1/referrals/create-user`,
  VALIDATE_USER_INVITE_CODE: `${API_BASE_URL}/api/v1/referrals/validate-user`,
  GET_REFERRAL_DATA: `${API_BASE_URL}/api/v1/referrals/data`,
  GET_INVITED_USERS_DATA: `${API_BASE_URL}/api/v1/referrals/invited-users`,
  GET_USER_REFERRAL_INFO: `${API_BASE_URL}/api/v1/referrals/user`,
  CALCULATE_REFERRAL_SCORES: `${API_BASE_URL}/api/v1/referrals/calculate-scores`,
  
  // User email management endpoints
  GET_USER_BY_EMAIL: `${API_BASE_URL}/api/v1/referrals/user-email`,
  UPDATE_USER_BY_EMAIL: `${API_BASE_URL}/api/v1/referrals/user-email`,
  GET_INCOMPLETE_USERS: `${API_BASE_URL}/api/v1/referrals/incomplete-users`,
  GET_WALLET_STATUS: `${API_BASE_URL}/api/v1/referrals/wallet-status`,
  
  // Email whitelist endpoints
  CHECK_EMAIL_WHITELIST: `${API_BASE_URL}/api/v1/email/check-whitelist`,
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
export interface UserProfile {
  walletAddress: string
  telegramVerified: boolean
  telegramJoined: boolean
  xConnected: boolean
  xFollowed: boolean
  xReplied: boolean
  xReposted: boolean
  xPosted: boolean
  telegramConnected: boolean
  telegramJoinedGroup: boolean
  emailConnected: boolean
  xId: string
  telegramId: string
  xUsername: string
  xDisplayName: string
  xProfileImageUrl: string
  xVerified: boolean
  telegramUsername: string
  telegramFirstName: string
  telegramLastName: string
  telegramPhotoUrl: string
  email: string
  googleId: string
  googleName: string
  googlePicture: string
  googleVerifiedEmail: boolean
  inviteCode: string
  invitedBy: string
  invitedUsers: string[]
  gamePoints: number
  referralPoints: number
  socialPoints: number
  referralCode: string
  isWhitelist: boolean
  highScore: number
  createdAt: Date
  updatedAt: Date
  totalPoints: number
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
      airdroped?: number
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

// X Post ID Config
export interface XPostIdResponse {
  success: boolean
  data: {
    xPostId: string
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
    //console.error(`API request failed for ${url}:`, error)
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

    // Use the appropriate endpoint based on platform
    const endpoint = platform === 'twitter' 
      ? API_ENDPOINTS.VERIFY_X_CONNECT 
      : API_ENDPOINTS.VERIFY_TELEGRAM_CONNECT

    return await createApiRequest<QuestVerificationResponse>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    )
  } catch (error) {
    //console.error('Error verifying quest with backend:', error)
    return {
      success: false,
      pointsAwarded: 0,
      totalPoints: 0,
      message: 'Failed to verify quest with backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================================================
// SPOTIFY API FUNCTIONS
export const getClaimStatus = async (email: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/claim-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to get claim status');
  }

  return response.json();
};



export const verifyXTask = async (walletAddress: string): Promise<XTaskResponse> => {
  try {
    const requestData: XTaskRequest = { walletAddress }
    
    return await createApiRequest<XTaskResponse>(
      API_ENDPOINTS.VERIFY_X_CONNECT,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    )
  } catch (error) {
    //console.error('Error verifying X task:', error)
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
    //console.error('Error sending game points:', error)
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
    const response = await createApiRequest<{ success: boolean; data: { totalPoints: number } }>(
      `${API_ENDPOINTS.USER_PROFILE}/${walletAddress}`
    )
    return response.data.totalPoints || 0
  } catch (error) {
    console.error('Error fetching user points:', error)
    return 0
  }
}

export const getUserProfile = async (walletAddress: string): Promise<UserProfile> => {
  const url = `${API_ENDPOINTS.USER_PROFILE}/${walletAddress}`
  
  try {
    const response = await createApiRequest<{ success: boolean; data: UserProfile }>(url)
    return response.data
  } catch (error) {
    throw error
  }
}

// ============================================================================
// LEADERBOARD API FUNCTIONS
// ============================================================================

// Get leaderboard data
export const getLeaderboard = async (page: number = 1, limit: number = 100) => {
  try {
    console.log(`🌐 [API] Calling leaderboard endpoint: ${API_ENDPOINTS.LEADERBOARD}?page=${page}&limit=${limit}`)
    
    const response = await fetch(`${API_ENDPOINTS.LEADERBOARD}?page=${page}&limit=${limit}`)
    const data = await response.json()
    
    console.log(`✅ [API] Leaderboard response received:`, {
      success: data.success,
      totalUsers: data.data?.users?.length || 0,
      page: data.data?.pagination?.page,
      totalPages: data.data?.pagination?.totalPages
    })
    
    return data
  } catch (error) {
    console.error(`❌ [API] Error fetching leaderboard:`, error)
    throw error
  }
}

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

export const authenticateWallet = async (
  walletAddress: string,
  originalMessage: string,
  signedMessage: string,
  referralCode?: string
): Promise<WalletAuthResponse> => {
  try {
    const requestData: WalletAuthRequest & { referralCode?: string } = {
      walletAddress,
      originalMessage,
      signedMessage,
      ...(referralCode && { referralCode })
    }

    return await createApiRequest<WalletAuthResponse>(
      API_ENDPOINTS.WALLET_AUTH,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    )
  } catch (error) {
    //console.error('Error authenticating wallet:', error)
    return {
      success: false,
      message: 'Failed to authenticate wallet',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Referral verification API functions
export const verifyReferalCode = async (referralCode: string) => {
  const response = await fetch(API_ENDPOINTS.VERIFY_INVITATION_CODE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: referralCode
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify Referral')
  }
  return response.json()
}

// New referral API functions
export const createUserWithReferral = async (userData: {
  spotifyEmail: string
  invitationCode: string
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  walletAddress?: string
}) => {
  const response = await fetch(API_ENDPOINTS.CREATE_USER_WITH_REFERRAL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
  if (!response.ok) {
    throw new Error('Failed to create user with referral')
  }
  return response.json()
}

export const getReferralData = async (page: number = 1, limit: number = 100) => {
  const response = await fetch(`${API_ENDPOINTS.GET_REFERRAL_DATA}?page=${page}&limit=${limit}`)

  if (!response.ok) {
    throw new Error('Failed to fetch referral data')
  }
  return response.json()
}

export const getInvitedUsersData = async (spotifyEmail: string, page: number = 1, limit: number = 100) => {
  const response = await fetch(`${API_ENDPOINTS.GET_INVITED_USERS_DATA}/${encodeURIComponent(spotifyEmail)}?page=${page}&limit=${limit}`)

  if (!response.ok) {
    throw new Error('Failed to fetch invited users data')
  }
  return response.json()
}

export const getUserReferralInfo = async (spotifyEmail: string) => {
  const response = await fetch(`${API_ENDPOINTS.GET_USER_REFERRAL_INFO}/${encodeURIComponent(spotifyEmail)}`)

  if (!response.ok) {
    throw new Error('Failed to fetch user referral info')
  }
  return response.json()
}

export const validateUserInviteCode = async (spotifyEmail: string, invitationCode: string) => {
  const response = await fetch(API_ENDPOINTS.VALIDATE_USER_INVITE_CODE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ spotifyEmail, invitationCode }),
  })

  if (!response.ok) {
    throw new Error('Failed to validate user invite code')
  }
  return response.json()
}

// User email management functions
export const getUserByEmail = async (spotifyEmail: string) => {
  const response = await fetch(`${API_ENDPOINTS.GET_USER_BY_EMAIL}/${encodeURIComponent(spotifyEmail)}`)

  if (!response.ok) {
    throw new Error('Failed to get user by email')
  }
  return response.json()
}

export const updateUserByEmail = async (spotifyEmail: string, updateData: { walletAddress: string }) => {
  const response = await fetch(`${API_ENDPOINTS.UPDATE_USER_BY_EMAIL}/${encodeURIComponent(spotifyEmail)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  })

  if (!response.ok) {
    throw new Error('Failed to update user by email')
  }
  return response.json()
}

export const getIncompleteUsers = async () => {
  const response = await fetch(API_ENDPOINTS.GET_INCOMPLETE_USERS)

  if (!response.ok) {
    throw new Error('Failed to get incomplete users')
  }
  return response.json()
}

export const getWalletAddressStatus = async () => {
  const response = await fetch(API_ENDPOINTS.GET_WALLET_STATUS)

  if (!response.ok) {
    throw new Error('Failed to get wallet address status')
  }
  return response.json()
}

// Email whitelist functions
export const checkEmailWhitelist = async (email: string, invitationCode: string) => {
  console.log(API_ENDPOINTS.CHECK_EMAIL_WHITELIST)
  const response = await fetch(API_ENDPOINTS.CHECK_EMAIL_WHITELIST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, invitationCode }),
  })

  if (!response.ok) {
    throw new Error('Failed to check email whitelist')
  }
  return response.json()
}

// Referral verification API functions
export const getSpotifyInfo = async (referralCode: string) => {
  const response = await fetch(API_ENDPOINTS.GET_SPOTIFY, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: referralCode
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify Spotify connection')
  }

  return response.json()
}

// Quest verification API functions
export const verifyXConnection = async (walletAddress: string, xData: XUserData) => {
  const response = await fetch(API_ENDPOINTS.VERIFY_X_CONNECT, {
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
  const response = await fetch(API_ENDPOINTS.VERIFY_X_FOLLOW, {
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
  const response = await fetch(API_ENDPOINTS.VERIFY_X_REPLY, {
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
  const response = await fetch(API_ENDPOINTS.VERIFY_X_REPOST, {
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
  const response = await fetch(API_ENDPOINTS.VERIFY_X_POST, {
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

export const verifyTelegramConnection = async (walletAddress: string, telegramData: TelegramAuthData) => {
  const response = await fetch(API_ENDPOINTS.VERIFY_TELEGRAM_CONNECT, {
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

export const verifyTelegramGroupJoin = async (walletAddress: string, groupUsername: string) => {
  const response = await fetch(API_ENDPOINTS.VERIFY_TELEGRAM_GROUP_VERIFY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      groupUsername
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify Telegram group join')
  }

  return response.json()
}

export const verifyEmailConnection = async (walletAddress: string, email: string, googleUserData?: GoogleUserData) => {
  const response = await fetch(API_ENDPOINTS.VERIFY_EMAIL_CONNECT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      email,
      googleUserData
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify email connection')
  }

  return response.json()
}

export const getUserQuestProgress = async (walletAddress: string) => {
  try {
    const response = await createApiRequest<{ success: boolean; data: QuestProgressData }>(
      `${API_ENDPOINTS.GET_QUEST_PROGRESS}/${walletAddress}`
    )
    return response
  } catch (error) {
    //console.error('Error getting quest progress:', error)
    throw error
  }
}

// Game limit functions
export interface GameLimitResponse {
  success: boolean
  data: {
    walletAddress: string
    canPlay: boolean
    dailyGamesPlayed: number
    gamesRemaining: number
    maxGamesPerDay: number
    lastGameDate: string
  }
  error?: string
}

export const checkCanPlayGame = async (walletAddress: string): Promise<GameLimitResponse> => {
  try {
    const response = await createApiRequest<GameLimitResponse>(
      `${API_ENDPOINTS.GAME_CAN_PLAY}/${walletAddress}`
    )
    return response
  } catch (error) {
    //console.error('Error checking if user can play game:', error)
    throw error
  }
}

export const recordGamePlay = async (walletAddress: string): Promise<GameLimitResponse> => {
  try {
    const response = await createApiRequest<GameLimitResponse>(
      API_ENDPOINTS.GAME_RECORD_PLAY,
      {
        method: 'POST',
        body: JSON.stringify({ walletAddress })
      }
    )
    return response
  } catch (error) {
    //console.error('Error recording game play:', error)
    throw error
  }
}

// X Post ID Config function
export const getXPostId = async (): Promise<XPostIdResponse> => {
  try {
    const response = await createApiRequest<XPostIdResponse>(
      API_ENDPOINTS.GET_X_POST_ID
    )
    return response
  } catch (error) {
    //console.error('Error getting X post ID:', error)
    throw error
  }
}

// ============================================================================
// REFERRAL FUNCTIONS
// ============================================================================

export interface ApplyReferralCodeRequest {
  walletAddress: string
  referralCode: string
}

export interface ApplyReferralCodeResponse {
  success: boolean
  message: string
  data: {
    referralCode: string
    referralPoints: number
    totalPoints: number
    referrerReward: number
    userReward: number
  }
  error?: string
}

export const applyReferralCode = async (
  walletAddress: string,
  referralCode: string
): Promise<ApplyReferralCodeResponse> => {
  try {
          const response = await createApiRequest<ApplyReferralCodeResponse>(
        API_ENDPOINTS.CREATE_USER_WITH_REFERRAL,
      {
        method: 'POST',
        body: JSON.stringify({ walletAddress, referralCode })
      }
    )
    return response
  } catch (error) {
    //console.error('Error applying referral code:', error)
    throw error
  }
}

export interface ReferralInfoResponse {
  success: boolean
  data: {
    referralCode: string
    referralPoints: number
    referredUsers: number
    totalPoints: number
  }
  error?: string
}

export const getReferralInfo = async (userId: string): Promise<ReferralInfoResponse> => {
  try {
          const response = await createApiRequest<ReferralInfoResponse>(
        `${API_ENDPOINTS.GET_USER_REFERRAL_INFO}/${userId}`
    )
    return response
  } catch (error) {
    //console.error('Error getting referral info:', error)
    throw error
  }
}

export interface TopReferrersResponse {
  success: boolean
  data: Array<{
    walletAddress: string
    referralPoints: number
    referralCode: string
    totalPoints: number
  }>
  error?: string
}

export const getTopReferrers = async (limit: number = 10): Promise<TopReferrersResponse> => {
  try {
          const response = await createApiRequest<TopReferrersResponse>(
        `${API_ENDPOINTS.GET_REFERRAL_DATA}?limit=${limit}`
    )
    return response
  } catch (error) {
    //console.error('Error getting top referrers:', error)
    throw error
  }
}