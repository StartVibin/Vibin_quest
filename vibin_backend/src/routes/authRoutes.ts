import { Router } from 'express'
import { 
  authenticateWallet, 
  getUserProfile, 
  verifyReferralCode,
  getAuthMessage,
  getTelegramUserData,
  spotifyToken,
  getSpotifyTokens,
  updateSpotifyInfo
} from '@/controllers/authController'
import { profileLimiter, strictLimiter } from '@/middleware/rateLimiter'

const router = Router()

// GET /auth/message - Get authentication message for signing
router.get('/message', strictLimiter, getAuthMessage)

// POST /auth/wallet - Authenticate wallet
router.post('/wallet', authenticateWallet)

// GET /auth/profile/:walletAddress - Get user profile
router.get('/profile/:walletAddress', profileLimiter, getUserProfile)

// GET /auth/telegram/:walletAddress - Get Telegram user data by wallet address
router.get('/telegram/:walletAddress', profileLimiter, getTelegramUserData)

// POST /auth/verify-code - Verify referral code
router.post('/verify-code', verifyReferralCode)

// POST /auth/spotify-token - Store/update/delete Spotify token data
router.post('/spotify-tokens', spotifyToken)

// POST /auth/spotify-tokens/get - Retrieve Spotify tokens by email
router.get('/spotify-tokens', getSpotifyTokens)

// POST /auth/spotify-info/update - Update or create Spotify info
router.post('/spotify-info/update', updateSpotifyInfo)

export default router 