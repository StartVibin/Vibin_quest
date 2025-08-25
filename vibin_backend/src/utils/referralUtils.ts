import User from '@/models/User'
import logger from '@/utils/logger'

export interface SocialConnectionStatus {
  xConnected: boolean
  telegramConnected: boolean
  emailConnected: boolean
  connectedCount: number
  isEligibleForReferral: boolean
}

/**
 * Check if user has all three required social platforms connected (X, Telegram, Email)
 */
export const checkSocialConnections = (user: any): SocialConnectionStatus => {
  const socialConnections = {
    xConnected: user.xConnected && user.xId && user.xId.trim() !== '',
    telegramConnected: user.telegramConnected && user.telegramId && user.telegramId.trim() !== '',
    emailConnected: user.emailConnected && user.email && user.email.trim() !== ''
  }

  const connectedCount = Object.values(socialConnections).filter(Boolean).length

  return {
    ...socialConnections,
    connectedCount,
    isEligibleForReferral: connectedCount >= 3
  }
}

/**
 * Check for duplicate social accounts across different wallets (X, Telegram, Email only)
 */
export const checkDuplicateSocialAccounts = async (user: any): Promise<{ exists: boolean, platform: string, existingWallet: string } | null> => {
  const socialCheck = await User.checkSocialAccountExists({
    xId: user.xId && user.xId.trim() !== '' ? user.xId : undefined,
    telegramId: user.telegramId && user.telegramId.trim() !== '' ? user.telegramId : undefined,
    email: user.email && user.email.trim() !== '' ? user.email : undefined
  })

  if (socialCheck && socialCheck.existingWallet !== user.walletAddress) {
    return socialCheck
  }

  return null
}

/**
 * Automatically verify and award referral points if eligible
 * This function should be called after each social platform connection
 */
export const autoVerifyAndAwardReferralPoints = async (walletAddress: string): Promise<{
  success: boolean
  message: string
  pointsAwarded?: number
  inviterPointsAwarded?: number
  error?: string
}> => {
  try {
    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }
    }

    // Check if user was invited (has inviteCode and invitedBy)
    if (!user.invitedBy || !user.inviteCode) {
      return {
        success: false,
        message: 'User was not invited or referral data is missing',
        error: 'NOT_INVITED'
      }
    }

    // Check if referral points were already awarded
    if (user.referralPoints > 0) {
      return {
        success: true,
        message: 'Referral points already awarded',
        pointsAwarded: 0,
        inviterPointsAwarded: 0
      }
    }

    // Check social connections
    const socialStatus = checkSocialConnections(user)
    
    // Log the current status for debugging
    logger.info(`Referral check for ${walletAddress}: X=${socialStatus.xConnected}, TG=${socialStatus.telegramConnected}, Email=${socialStatus.emailConnected}, Count=${socialStatus.connectedCount}/3`)

    if (!socialStatus.isEligibleForReferral) {
      return {
        success: false,
        message: `All three required social platforms (X, Telegram, Email) must be connected to receive referral points. Currently connected: ${socialStatus.connectedCount}/3`,
        error: 'INCOMPLETE_SOCIAL_CONNECTIONS'
      }
    }

    // Check for duplicate social accounts
    const duplicateCheck = await checkDuplicateSocialAccounts(user)
    if (duplicateCheck) {
      return {
        success: false,
        message: `Social account already connected to another wallet. ${duplicateCheck.platform} account is already linked to wallet: ${duplicateCheck.existingWallet}`,
        error: 'DUPLICATE_SOCIAL_ACCOUNT'
      }
    }

    // Award referral points ONLY to the inviter (not to the invited user)
    const inviter = await User.findByWalletAddress(user.invitedBy)
    let inviterPointsAwarded = 0
    
    if (inviter) {
      const inviterPoints = 500
      inviter.addReferralPoints(inviterPoints)
      inviter.addInvitedUser(user.walletAddress)
      await inviter.save()
      inviterPointsAwarded = inviterPoints

      logger.info(`Referral points awarded: Inviter ${inviter.walletAddress} received ${inviterPoints} points for inviting ${user.walletAddress}`)
    }

    return {
      success: true,
      message: 'Referral points awarded successfully',
      pointsAwarded: 0, // Invited user gets 0 referral points
      inviterPointsAwarded
    }

  } catch (error) {
    logger.error('Error in autoVerifyAndAwardReferralPoints:', error)
    return {
      success: false,
      message: 'Error processing referral points',
      error: 'PROCESSING_ERROR'
    }
  }
}

/**
 * Get detailed referral status for a user
 */
export const getReferralStatus = async (walletAddress: string): Promise<{
  success: boolean
  data?: {
    walletAddress: string
    socialConnections: SocialConnectionStatus
    isEligibleForReferral: boolean
    duplicateAccounts: any[]
    referralPoints: number
    invitedBy: string
    hasInviteCode: boolean
    error?: string
  }
  error?: string
}> => {
  try {
    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND'
      }
    }

    // Check social connections
    const socialStatus = checkSocialConnections(user)

    // Check for duplicate social accounts
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

    return {
      success: true,
      data: {
        walletAddress: user.walletAddress,
        socialConnections: socialStatus,
        isEligibleForReferral: socialStatus.isEligibleForReferral && duplicateChecks.length === 0,
        duplicateAccounts: duplicateChecks,
        referralPoints: user.referralPoints,
        invitedBy: user.invitedBy,
        hasInviteCode: !!user.inviteCode
      }
    }

  } catch (error) {
    logger.error('Error in getReferralStatus:', error)
    return {
      success: false,
      error: 'PROCESSING_ERROR'
    }
  }
} 