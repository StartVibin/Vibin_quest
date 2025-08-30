import { Router } from 'express'
import { 
  verifyInvitationCode,
  createUserWithReferral,
  getReferralData,
  getUserReferralInfo,
  calculateReferralScores,
  validateUserInviteCode,
  getUserByEmail,
  updateUserByEmail,
  getIncompleteUsers,
  getWalletAddressStatus
} from '@/controllers/referralController'
import { profileLimiter, strictLimiter } from '@/middleware/rateLimiter'

const router = Router()

// POST /referrals/verify - Verify invitation code
router.post('/verify', strictLimiter, verifyInvitationCode)

// POST /referrals/create-user - Create or update user with referral
router.post('/create-user', strictLimiter, createUserWithReferral)

// POST /referrals/validate-user - Validate user's invite code
router.post('/validate-user', strictLimiter, validateUserInviteCode)

// GET /referrals/data - Get referral data for referral page
router.get('/data', profileLimiter, getReferralData)

// GET /referrals/user/:spotifyEmail - Get user's referral information
router.get('/user/:spotifyEmail', profileLimiter, getUserReferralInfo)

// POST /referrals/calculate-scores - Calculate and update referral scores
router.post('/calculate-scores', profileLimiter, calculateReferralScores)

// GET /referrals/user-email/:spotifyEmail - Get user by email
router.get('/user-email/:spotifyEmail', profileLimiter, getUserByEmail)

// PUT /referrals/user-email/:spotifyEmail - Update user by email
router.put('/user-email/:spotifyEmail', strictLimiter, updateUserByEmail)

// GET /referrals/incomplete-users - Get users with incomplete data
router.get('/incomplete-users', profileLimiter, getIncompleteUsers)

// GET /referrals/wallet-status - Get wallet address status overview
router.get('/wallet-status', profileLimiter, getWalletAddressStatus)

export default router 