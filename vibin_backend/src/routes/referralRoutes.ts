import { Router } from 'express'
import { verifyAndAwardReferralPoints, checkSocialAccountStatus, getReferralStats } from '@/controllers/referralController'

const router = Router()

// POST /referrals/verify/:walletAddress - Verify social connections and award referral points
router.post('/verify/:walletAddress', verifyAndAwardReferralPoints)

// GET /referrals/status/:walletAddress - Check social account status
router.get('/status/:walletAddress', checkSocialAccountStatus)

// GET /referrals/stats/:walletAddress - Get referral statistics
router.get('/stats/:walletAddress', getReferralStats)

export default router 