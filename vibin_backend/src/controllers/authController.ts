import { Request, Response, NextFunction } from 'express'
import { ethers } from 'ethers'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import Code from '@/models/Code'
import SpotifyInfo from '@/models/SpotifyInfo'
import { WalletAuthRequest, WalletAuthResponse, SignatureVerificationResult } from '@/types/auth'
import logger from '@/utils/logger'
import { calculateSpotifyPoints, calculateReferralPoints, calculateTodayReferralPoints } from '@/utils/spotifyPoints'

// Verify Ethereum signature
function verifySignature(
  originalMessage: string,
  signedMessage: string,
  expectedAddress: string
): SignatureVerificationResult {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(originalMessage, signedMessage)

    // Check if the recovered address matches the expected address
    const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()

    return {
      isValid,
      recoveredAddress: recoveredAddress.toLowerCase()
    }
  } catch (error) {
    logger.error('Signature verification failed:', error)
    return {
      isValid: false,
      recoveredAddress: ''
    }
  }
}

// Generate a unique message for signing
function generateAuthMessage(walletAddress: string): string {
  const timestamp = Date.now()
  return `Sign this message to authenticate with BeatWise.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis signature will be used to verify your wallet ownership.`
}

// Wallet authentication endpoint
export const authenticateWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, originalMessage, signedMessage, referralCode }: WalletAuthRequest & { referralCode?: string } = req.body

    // Validate required fields
    if (!walletAddress || !originalMessage || !signedMessage) {
      return next(new AppError('Wallet address, original message, and signed message are required', 400))
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return next(new AppError('Invalid wallet address format', 400))
    }

    // Verify the signature
    const verificationResult = verifySignature(originalMessage, signedMessage, walletAddress)

    if (!verificationResult.isValid) {
      return next(new AppError('Invalid signature. The signed message does not match the wallet address.', 401))
    }

    // Normalize wallet address to lowercase
    const normalizedAddress = walletAddress.toLowerCase()

    try {
      // Check if user already exists
      let user = await User.findByWalletAddress(normalizedAddress)
      let isNewUser = false

      if (!user) {
        // Create new user
        user = new User({
          walletAddress: normalizedAddress,
          xConnected: false,
          telegramVerified: false,
          telegramJoined: false,
          referralCode: generateReferralCode(),
          inviteCode: generateReferralCode() // Generate unique invite code
        })

        await user.save()
        isNewUser = true

        logger.info(`New user created with wallet address: ${normalizedAddress}`)

        // Apply referral code if provided (only set up relationship, no points awarded)
        if (referralCode && isNewUser) {
          try {
            // Find the referrer by invite code
            const referrer = await User.findOne({ inviteCode: referralCode.toUpperCase() })
            if (referrer && referrer.id !== user.id) {
              // Set up referral relationship only
              user.referralCode = referralCode.toUpperCase()
              user.invitedBy = referrer.walletAddress

              // Add user to referrer's invited users list
              if (!referrer.invitedUsers.includes(user.walletAddress)) {
                referrer.invitedUsers.push(user.walletAddress)
              }

              await user.save()
              await referrer.save()

              logger.info(`Referral relationship established: ${referrer.walletAddress} referred ${user.walletAddress}`)
            }
          } catch (referralError) {
            logger.error('Error applying referral code during registration:', referralError)
            // Don't fail the registration if referral fails
          }
        }
      } else {
        logger.info(`Existing user authenticated with wallet address: ${normalizedAddress}`)
      }

      // Prepare response
      const response: WalletAuthResponse = {
        success: true,
        message: isNewUser ? 'User registered successfully' : 'User authenticated successfully',
        data: {
          user: {
            id: user.id,
            walletAddress: user.walletAddress,
            gamePoints: user.gamePoints,
            referralPoints: user.referralPoints,
            socialPoints: user.socialPoints,
            totalPoints: user.totalPoints,
            airdroped: user.airdroped,

            telegramVerified: user.telegramVerified,
            telegramJoined: user.telegramJoined,
            // Social task completion flags
            xConnected: user.xConnected,
            xFollowed: user.xFollowed,
            xReplied: user.xReplied,
            xReposted: user.xReposted,
            xPosted: user.xPosted,
            telegramConnected: user.telegramConnected,
            telegramJoinedGroup: user.telegramJoinedGroup,
            emailConnected: user.emailConnected,
            spotifyConnected: user.spotifyConnected,
            xId: user.xId,
            telegramId: user.telegramId,
            // X/Twitter user data
            xUsername: user.xUsername,
            xDisplayName: user.xDisplayName,
            xProfileImageUrl: user.xProfileImageUrl,
            xVerified: user.xVerified,
            // Telegram user data
            telegramUsername: user.telegramUsername,
            telegramFirstName: user.telegramFirstName,
            telegramLastName: user.telegramLastName,
            telegramPhotoUrl: user.telegramPhotoUrl,
            // Spotify data
            spotifyId: user.spotifyId,
            spotifyEmail: user.spotifyEmail,
            // Invite system
            inviteCode: user.inviteCode,
            invitedBy: user.invitedBy,
            invitedUsers: user.invitedUsers,
            isWhitelist: user.isWhitelist,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          isNewUser
        }
      }

      res.status(200).json(response)

    } catch (error) {
      logger.error('Error during wallet authentication:', error)
      return next(new AppError('Authentication failed. Please try again.', 500))
    }
  }
)

// Get authentication message for signing
export const getAuthMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.query

    if (!walletAddress || typeof walletAddress !== 'string') {
      return next(new AppError('Wallet address is required', 400))
    }

    if (!ethers.isAddress(walletAddress)) {
      return next(new AppError('Invalid wallet address format', 400))
    }

    const message = generateAuthMessage(walletAddress)

    res.status(200).json({
      success: true,
      data: {
        message,
        walletAddress: walletAddress.toLowerCase()
      }
    })
  }
)

// Generate a unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Get user profile by wallet address
export const getUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return next(new AppError('Invalid wallet address format', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        xConnected: user.xConnected,
        telegramVerified: user.telegramVerified,
        telegramJoined: user.telegramJoined,
        // Social task completion flags

        xFollowed: user.xFollowed,
        xReplied: user.xReplied,
        xReposted: user.xReposted,
        xPosted: user.xPosted,
        telegramConnected: user.telegramConnected,
        telegramJoinedGroup: user.telegramJoinedGroup,
        emailConnected: user.emailConnected,
        spotifyConnected: user.spotifyConnected,
        xId: user.xId,
        telegramId: user.telegramId,
        // X/Twitter user data
        xUsername: user.xUsername,
        xDisplayName: user.xDisplayName,
        xProfileImageUrl: user.xProfileImageUrl,
        xVerified: user.xVerified,
        // Telegram user data
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        telegramLastName: user.telegramLastName,
        telegramPhotoUrl: user.telegramPhotoUrl,
        // Spotify data
        spotifyId: user.spotifyId,
        spotifyEmail: user.spotifyEmail,
        // Invite system
        inviteCode: user.inviteCode,
        invitedBy: user.invitedBy,
        invitedUsers: user.invitedUsers,
        gamePoints: user.gamePoints,
        referralPoints: user.referralPoints,
        socialPoints: user.socialPoints,
        isWhitelist: user.isWhitelist,
        highScore: user.highScore,
        totalPoints: user.totalPoints,
        airdroped: user.airdroped,
        totalSocialJoined: [user.xConnected, user.telegramJoined].filter(Boolean).length,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  }
)

// Get Telegram user data by wallet address
export const getTelegramUserData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return next(new AppError('Invalid wallet address format', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user has Telegram data
    if (!user.telegramJoined || !user.telegramId) {
      return next(new AppError('User has not connected Telegram', 404))
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        telegramLastName: user.telegramLastName,
        telegramPhotoUrl: user.telegramPhotoUrl,
        telegramVerified: user.telegramVerified,
        telegramJoined: user.telegramJoined,
        telegramJoinedAt: user.updatedAt // Assuming this is when they joined
      }
    })
  }
)

// Verify referral code
export const verifyReferralCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body

    if (!code) {
      return next(new AppError('Referral code is required', 400))
    }

    console.log("referral code", code)

    // Find code in the codes collection
    const codeData = await Code.findByReferralCode(code.trim())

    if (!codeData) {
      return res.status(200).json({
        success: false,
        
      })
    }

    logger.info(`Referral code verified: ${code} belongs to ${codeData.walletAddress}`)

    res.status(200).json({
      success: true,
      message: 'Referral code is valid',
      data: {
        isValid: true,
        
      }
    })
  }
) 

// Store, update, delete, or get Spotify token data
export const spotifyToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { operation } = req.body

    if (!operation) {
      return next(new AppError('operation is required', 400))
    }

    if (operation === 'get') {
      const { spotifyEmail } = req.body
      if (!spotifyEmail) {
        return next(new AppError('spotifyEmail is required for get operation', 400))
      }
      const tokenDoc = await SpotifyInfo.findOne({ spotifyEmail: spotifyEmail.toLowerCase() })
      if (!tokenDoc) {
        return res.status(200).json({
          success: false,
          message: 'No tokens found for this email'
        })
      }
      const expiresAt = tokenDoc.updatedAt.getTime() + (tokenDoc.expiresIn || 0 * 1000)
      return res.status(200).json({
        success: true,
        message: 'Tokens retrieved successfully',
        data: {
          accessToken: tokenDoc.accessToken,
          refreshToken: tokenDoc.refreshToken,
          expiresAt,
          spotifyEmail: tokenDoc.spotifyEmail
        }
      })
    }

    // For store, update, delete
    const { spotifyEmail, invitationCode, accessToken, refreshToken, expiresIn } = req.body

    if (!['store', 'update', 'delete'].includes(operation)) {
      return next(new AppError('Invalid operation. Must be: store, update, delete, or get', 400))
    }

    if (operation === 'store') {
      if (!spotifyEmail || !invitationCode || !accessToken || !refreshToken || !expiresIn) {
        return next(new AppError('All fields are required for store: spotifyEmail, invitationCode, accessToken, refreshToken, expiresIn', 400))
      }
      let result
      let existingToken = await SpotifyInfo.findByInvitationCode(invitationCode)
      if (existingToken) {
        // Update the existing record
        result = await SpotifyInfo.findOneAndUpdate(
          { invitationCode: invitationCode.trim() },
          {
            operation,
            spotifyEmail,
            accessToken,
            refreshToken,
            expiresIn
          },
          { new: true, runValidators: true }
        )
        logger.info(`Spotify token updated for invitationCode: ${invitationCode}`)
      } else {
        // Create new token
        const newToken = new SpotifyInfo({
          operation,
          spotifyEmail,
          invitationCode,
          accessToken,
          refreshToken,
          expiresIn
        })
        result = await newToken.save()
        logger.info(`Spotify token stored for email: ${spotifyEmail}`)
      }
      if (!result) {
        return next(new AppError('Failed to process Spotify token operation', 500))
      }
      return res.status(200).json({
        success: true,
        message: `Spotify token stored/updated successfully`,
        data: {
          operation,
          spotifyEmail: result.spotifyEmail,
          invitationCode: result.invitationCode,
          expiresIn: result.expiresIn,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt
        }
      })
    } else if (operation === 'update') {
      if (!spotifyEmail || !invitationCode || !accessToken || !refreshToken || !expiresIn) {
        return next(new AppError('All fields are required for update: spotifyEmail, invitationCode, accessToken, refreshToken, expiresIn', 400))
      }
      const result = await SpotifyInfo.findOneAndUpdate(
        { spotifyEmail: spotifyEmail.toLowerCase() },
        {
          operation,
          invitationCode,
          accessToken,
          refreshToken,
          expiresIn
        },
        { new: true, runValidators: true }
      )
      if (!result) {
        return next(new AppError('Spotify token not found for this email', 404))
      }
      logger.info(`Spotify token updated for email: ${spotifyEmail}`)
      return res.status(200).json({
        success: true,
        message: `Spotify token updated successfully`,
        data: {
          operation,
          spotifyEmail: result.spotifyEmail,
          invitationCode: result.invitationCode,
          expiresIn: result.expiresIn,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt
        }
      })
    } else if (operation === 'delete') {
      if (!spotifyEmail) {
        return next(new AppError('spotifyEmail is required for delete operation', 400))
      }
      const result = await SpotifyInfo.findOneAndDelete({ spotifyEmail: spotifyEmail.toLowerCase() })
      if (!result) {
        return next(new AppError('Spotify token not found for this email', 404))
      }
      logger.info(`Spotify token deleted for email: ${spotifyEmail}`)
      return res.status(200).json({
        success: true,
        message: `Spotify token deleted successfully`,
        data: {
          operation,
          spotifyEmail: result.spotifyEmail,
          invitationCode: result.invitationCode,
          expiresIn: result.expiresIn,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt
        }
      })
    }
  }
) 

// Update or create SpotifyInfo document
export const updateSpotifyInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      spotifyEmail,
      invitationCode,
      accessToken,
      refreshToken,
      expiresIn,
      volumeScore,
      diversityScore,
      historyScore,
      referralScore,
      totalBasePoints,
      referralCode,
      tracksPlayedCount,
      uniqueArtistCount,
      listeningTime,
      anonymousTracksPlayedCount,
      playedDays,
      referralCount,
      point,
      pointsToday,
      invitedUsers
    } = req.body

    if (!spotifyEmail) {
      return next(new AppError('spotifyEmail is required', 400))
    }

    // First, get the existing user data to accumulate values
    const existingUser = await SpotifyInfo.findOne({ spotifyEmail: spotifyEmail.toLowerCase() })
    
    // Prepare update data with accumulation logic
    const updateData: any = {
      invitationCode,
      accessToken,
      refreshToken,
      expiresIn,
      referralCode,
      playedDays,
      referralCount,
      pointsToday,
      invitedUsers
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

    // ACCUMULATE values instead of overwriting them
    if (tracksPlayedCount !== undefined && tracksPlayedCount > 0) {
      const existingTracks = existingUser?.tracksPlayedCount || 0
      updateData.tracksPlayedCount = existingTracks + tracksPlayedCount
      console.log(`📊 Accumulating tracks: ${existingTracks} + ${tracksPlayedCount} = ${updateData.tracksPlayedCount}`)
    } else if (tracksPlayedCount === 0) {
      // Keep existing value if no new tracks
      updateData.tracksPlayedCount = existingUser?.tracksPlayedCount || 0
      console.log(`📊 No new tracks, keeping existing: ${updateData.tracksPlayedCount}`)
    }

    if (uniqueArtistCount !== undefined && uniqueArtistCount > 0) {
      const existingArtists = existingUser?.uniqueArtistCount || 0
      updateData.uniqueArtistCount = existingArtists + uniqueArtistCount
      console.log(`📊 Accumulating artists: ${existingArtists} + ${uniqueArtistCount} = ${updateData.uniqueArtistCount}`)
    } else if (uniqueArtistCount === 0) {
      // Keep existing value if no new artists
      updateData.uniqueArtistCount = existingUser?.uniqueArtistCount || 0
      console.log(`📊 No new artists, keeping existing: ${updateData.uniqueArtistCount}`)
    }

    if (listeningTime !== undefined && listeningTime > 0) {
      const existingTime = existingUser?.listeningTime || 0
      updateData.listeningTime = existingTime + listeningTime
      console.log(`📊 Accumulating listening time: ${existingTime} + ${listeningTime} = ${updateData.listeningTime}`)
    } else if (listeningTime === 0) {
      // Keep existing value if no new listening time
      updateData.listeningTime = existingUser?.listeningTime || 0
      console.log(`📊 No new listening time, keeping existing: ${updateData.listeningTime}`)
    }

    if (anonymousTracksPlayedCount !== undefined && anonymousTracksPlayedCount > 0) {
      const existingAnonymous = existingUser?.anonymousTracksPlayedCount || 0
      updateData.anonymousTracksPlayedCount = existingAnonymous + anonymousTracksPlayedCount
      console.log(`📊 Accumulating anonymous tracks: ${existingAnonymous} + ${anonymousTracksPlayedCount} = ${updateData.anonymousTracksPlayedCount}`)
    } else if (anonymousTracksPlayedCount === 0) {
      // Keep existing value if no new anonymous tracks
      updateData.anonymousTracksPlayedCount = existingUser?.anonymousTracksPlayedCount || 0
      console.log(`📊 No new anonymous tracks, keeping existing: ${updateData.anonymousTracksPlayedCount}`)
    }

    // Calculate Spotify points based on ACCUMULATED values
    const calculatedPoints = calculateSpotifyPoints({
      listeningTime: updateData.listeningTime,
      uniqueArtistCount: updateData.uniqueArtistCount,
      tracksPlayedCount: updateData.tracksPlayedCount
    })
    
    // Set individual score components (ensure non-negative values)
    updateData.volumeScore = Math.max(0, calculatedPoints.volumePoints)
    updateData.diversityScore = Math.max(0, calculatedPoints.diversityPoints)
    updateData.historyScore = Math.max(0, calculatedPoints.historyPoints)
    
    // Calculate referral points
    const referralPoints = await calculateReferralPoints(spotifyEmail, SpotifyInfo)
    const todayReferralPoints = await calculateTodayReferralPoints(spotifyEmail, SpotifyInfo)
    updateData.referralScore = Math.max(0, referralPoints)
    updateData.referralScoreToday = Math.max(0, todayReferralPoints)
    
    // Calculate TOTAL base points (Spotify points + referral points)
    const totalSpotifyPoints = Math.max(0, calculatedPoints.points)
    const calculatedTotalBasePoints = totalSpotifyPoints + updateData.referralScore
    
    // Ensure total points are never negative
    const finalTotalBasePoints = Math.max(0, calculatedTotalBasePoints)
    
    updateData.point = totalSpotifyPoints  // Spotify-only points
    updateData.totalBasePoints = finalTotalBasePoints  // Total of all points
    
    // Log the calculation for debugging
    logger.info(`Point calculation for ${spotifyEmail}:`, {
      existing: {
        tracksPlayedCount: existingUser?.tracksPlayedCount || 0,
        uniqueArtistCount: existingUser?.uniqueArtistCount || 0,
        listeningTime: existingUser?.listeningTime || 0,
        totalBasePoints: existingUser?.totalBasePoints || 0
      },
      new: {
        tracksPlayedCount: tracksPlayedCount || 0,
        uniqueArtistCount: uniqueArtistCount || 0,
        listeningTime: listeningTime || 0
      },
      accumulated: {
        tracksPlayedCount: updateData.tracksPlayedCount,
        uniqueArtistCount: updateData.uniqueArtistCount,
        listeningTime: updateData.listeningTime
      },
      calculated: {
        volumePoints: calculatedPoints.volumePoints,
        diversityPoints: calculatedPoints.diversityPoints,
        historyPoints: calculatedPoints.historyPoints,
        totalSpotifyPoints,
        referralPoints: updateData.referralScore,
        totalBasePoints: finalTotalBasePoints
      }
    })

    // Update or create
    const result = await SpotifyInfo.findOneAndUpdate(
      { spotifyEmail: spotifyEmail.toLowerCase() },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Spotify info updated successfully',
      data: result
    })
  }
)

// Get Spotify tokens by email
export const getSpotifyTokens = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { operation, spotifyEmail } = req.body

    if (operation !== 'get' || !spotifyEmail) {
      return next(new AppError('operation and spotifyEmail are required', 400))
    }

    const tokenDoc = await SpotifyInfo.findOne({ spotifyEmail: spotifyEmail.toLowerCase() })
    if (!tokenDoc) {
      return res.status(200).json({
        success: false,
        message: 'No tokens found for this email'
      })
    }

    // Calculate expiresAt (ms since epoch)
    const expiresAt = tokenDoc.updatedAt.getTime() + (tokenDoc.expiresIn || 0 * 1000)

    res.status(200).json({
      success: true,
      message: 'Tokens retrieved successfully',
      data: {
        accessToken: tokenDoc.accessToken,
        refreshToken: tokenDoc.refreshToken,
        expiresAt,
        spotifyEmail: tokenDoc.spotifyEmail
      }
    })
  }
) 