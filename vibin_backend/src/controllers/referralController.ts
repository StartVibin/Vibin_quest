import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import logger from '@/utils/logger'

// Verify all social connections and award referral points if eligible
export const verifyAndAwardReferralPoints = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user was invited (has inviteCode and invitedBy)
    if (!user.invitedBy || !user.inviteCode) {
      return next(new AppError('User was not invited or referral data is missing', 400))
    }

    // Check if referral points were already awarded
    if (user.referralPoints > 0) {
      return res.status(200).json({
        success: true,
        message: 'Referral points already awarded',
        data: {
          walletAddress: user.walletAddress,
          referralPoints: user.referralPoints,
          totalPoints: user.totalPoints
        }
      })
    }

    // Verify all three required social platforms are connected (X, Telegram, Email)
    const socialConnections = {
      xConnected: user.xConnected && user.xId && user.xId.trim() !== '',
      telegramConnected: user.telegramConnected && user.telegramId && user.telegramId.trim() !== '',
      emailConnected: user.emailConnected && user.email && user.email.trim() !== ''
    }

    const connectedCount = Object.values(socialConnections).filter(Boolean).length

    if (connectedCount < 3) {
      return res.status(400).json({
        success: false,
        message: 'All three required social platforms (X, Telegram, Email) must be connected to receive referral points',
        data: {
          walletAddress: user.walletAddress,
          socialConnections,
          connectedCount,
          requiredCount: 3
        }
      })
    }

    // Check for duplicate social accounts across different wallets
    const socialCheck = await User.checkSocialAccountExists({
      xId: user.xId && user.xId.trim() !== '' ? user.xId : undefined,
      telegramId: user.telegramId && user.telegramId.trim() !== '' ? user.telegramId : undefined,
      email: user.email && user.email.trim() !== '' ? user.email : undefined
    })

    if (socialCheck && socialCheck.existingWallet !== user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: `Social account already connected to another wallet. ${socialCheck.platform} account is already linked to wallet: ${socialCheck.existingWallet}`,
        data: {
          platform: socialCheck.platform,
          existingWallet: socialCheck.existingWallet,
          currentWallet: user.walletAddress
        }
      })
    }

    // Award referral points ONLY to the inviter (not to the invited user)
    const inviter = await User.findByWalletAddress(user.invitedBy)
    if (inviter) {
      const inviterPoints = 500
      inviter.addReferralPoints(inviterPoints)
      inviter.addInvitedUser(user.walletAddress)
      await inviter.save()

      logger.info(`Referral points awarded: Inviter ${inviter.walletAddress} received ${inviterPoints} points for inviting ${user.walletAddress}`)
    }

    res.status(200).json({
      success: true,
      message: 'Referral points awarded successfully',
      data: {
        walletAddress: user.walletAddress,
        referralPointsAwarded: 0, // Invited user gets 0 referral points
        totalReferralPoints: user.referralPoints,
        totalPoints: user.totalPoints,
        socialConnections,
        inviterWallet: user.invitedBy,
        inviterPointsAwarded: inviter ? 500 : 0
      }
    })
  }
)

// Check social account status for a user
export const checkSocialAccountStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check social connections (X, Telegram, Email only)
    const socialConnections = {
      xConnected: user.xConnected && user.xId && user.xId.trim() !== '',
      telegramConnected: user.telegramConnected && user.telegramId && user.telegramId.trim() !== '',
      emailConnected: user.emailConnected && user.email && user.email.trim() !== ''
    }

    const connectedCount = Object.values(socialConnections).filter(Boolean).length

    // Check for duplicate social accounts (X, Telegram, Email only)
    const duplicateChecks = []
    
    if (user.xId && user.xId.trim() !== '') {
      const existingXUser = await User.findByXId(user.xId)
      if (existingXUser && existingXUser.walletAddress !== user.walletAddress) {
        duplicateChecks.push({
          platform: 'X/Twitter',
          existingWallet: existingXUser.walletAddress
        })
      }
    }

    if (user.telegramId && user.telegramId.trim() !== '') {
      const existingTelegramUser = await User.findByTelegramId(user.telegramId)
      if (existingTelegramUser && existingTelegramUser.walletAddress !== user.walletAddress) {
        duplicateChecks.push({
          platform: 'Telegram',
          existingWallet: existingTelegramUser.walletAddress
        })
      }
    }

    if (user.email && user.email.trim() !== '') {
      const existingEmailUser = await User.findByEmail(user.email)
      if (existingEmailUser && existingEmailUser.walletAddress !== user.walletAddress) {
        duplicateChecks.push({
          platform: 'Email',
          existingWallet: existingEmailUser.walletAddress
        })
      }
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        socialConnections,
        connectedCount,
        requiredCount: 3,
        isEligibleForReferral: connectedCount >= 3 && duplicateChecks.length === 0,
        duplicateAccounts: duplicateChecks,
        referralPoints: user.referralPoints,
        invitedBy: user.invitedBy,
        hasInviteCode: !!user.inviteCode
      }
    })
  }
)

// Get referral statistics
export const getReferralStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Get inviter info
    let inviter = null
    if (user.invitedBy) {
      inviter = await User.findByWalletAddress(user.invitedBy)
    }

    // Get invited users info
    const invitedUsers = []
    for (const invitedWallet of user.invitedUsers) {
      const invitedUser = await User.findByWalletAddress(invitedWallet)
      if (invitedUser) {
        invitedUsers.push({
          walletAddress: invitedUser.walletAddress,
          totalPoints: invitedUser.totalPoints,
          socialConnections: {
            xConnected: invitedUser.xConnected,
            telegramConnected: invitedUser.telegramConnected,
            emailConnected: invitedUser.emailConnected
          },
          joinedAt: invitedUser.createdAt
        })
      }
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        inviteCode: user.inviteCode,
        referralPoints: user.referralPoints,
        totalInvitedUsers: user.invitedUsers.length,
        inviter: inviter ? {
          walletAddress: inviter.walletAddress,
          totalPoints: inviter.totalPoints
        } : null,
        invitedUsers,
        totalReferralPointsEarned: user.referralPoints
      }
    })
  }
) 