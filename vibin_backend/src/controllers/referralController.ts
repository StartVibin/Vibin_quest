import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import SpotifyInfo from '@/models/SpotifyInfo'
import logger from '@/utils/logger'

// Generate a unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Verify invitation code and check if it exists in SpotifyInfo collection
export const verifyInvitationCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body

    if (!code) {
      return next(new AppError('Invitation code is required', 400))
    }

    try {
      // Find the invitation code in SpotifyInfo collection
      const referrer = await SpotifyInfo.findOne({ 
        referralCode: code.trim().toUpperCase() 
      })

      if (!referrer) {
        return res.status(200).json({
          success: false,
          message: 'Invalid invitation code'
        })
      }

      logger.info(`Invitation code verified: ${code} belongs to ${referrer.spotifyEmail}`)

      res.status(200).json({
        success: true,
        message: 'Invitation code is valid',
        data: {
          isValid: true,
          referrerEmail: referrer.spotifyEmail,
          referrerWalletAddress: referrer.walletAddress
        }
      })
    } catch (error) {
      logger.error('Error verifying invitation code:', error)
      return next(new AppError('Failed to verify invitation code', 500))
    }
  }
)

// Create or update user with referral information
export const createUserWithReferral = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { 
      spotifyEmail, 
      invitationCode, 
      accessToken, 
      refreshToken, 
      expiresIn,
      walletAddress 
    } = req.body

    if (!spotifyEmail || !invitationCode) {
      return next(new AppError('Spotify email and invitation code are required', 400))
    }

    try {
      // Check if user already exists
      let existingUser = await SpotifyInfo.findOne({ 
        spotifyEmail: spotifyEmail.toLowerCase() 
      })

      if (existingUser) {
        // User exists, update referral information
        existingUser.invitationCode = invitationCode
        existingUser.accessToken = accessToken
        existingUser.refreshToken = refreshToken
        existingUser.expiresIn = expiresIn
        existingUser.walletAddress = walletAddress
        
        // Generate referral code if user doesn't have one
        if (!existingUser.referralCode) {
          existingUser.referralCode = generateReferralCode()
        }

        await existingUser.save()
        logger.info(`Existing user updated with referral info: ${spotifyEmail}`)

        return res.status(200).json({
          success: true,
          message: 'User updated successfully',
          data: {
            spotifyEmail: existingUser.spotifyEmail,
            referralCode: existingUser.referralCode,
            invitationCode: existingUser.invitationCode
          }
        })
      }

      // Find the referrer by invitation code
      const referrer = await SpotifyInfo.findOne({ 
        referralCode: invitationCode.trim().toUpperCase() 
      })

      if (!referrer) {
        return next(new AppError('Invalid invitation code', 400))
      }

      // Generate new referral code for the new user
      const newReferralCode = generateReferralCode()

      // Create new user
      const newUser = new SpotifyInfo({
        operation: 'store',
        spotifyEmail: spotifyEmail.toLowerCase(),
        invitationCode: invitationCode.trim(),
        accessToken,
        refreshToken,
        expiresIn,
        walletAddress,
        referralCode: newReferralCode,
        referrerEmail: referrer.spotifyEmail,
        referralDate: new Date(),
        // Initialize all scores to 0
        volumeScore: 0,
        diversityScore: 0,
        historyScore: 0,
        referralScore: 0,
        referralScoreToday: 0,
        totalBasePoints: 0,
        tracksPlayedCount: 0,
        uniqueArtistCount: 0,
        listeningTime: 0,
        anonymousTracksPlayedCount: 0,
        playedDays: 0,
        referralCount: 0,
        point: 0,
        invitedUsers: []
      })

      await newUser.save()

      // Update referrer's invited users list (for backward compatibility)
      // Note: Referral scores are now calculated by finding users whose invitationCode 
      // matches the referrer's referralCode, not by using this invitedUsers array
      if (!referrer.invitedUsers?.includes(spotifyEmail.toLowerCase())) {
        referrer.invitedUsers?.push(spotifyEmail.toLowerCase())
        referrer.referralCount = referrer.invitedUsers?.length || 0
        await referrer.save()
      }

      logger.info(`New user created with referral: ${spotifyEmail} referred by ${referrer.spotifyEmail}`)

      res.status(201).json({
        success: true,
        message: 'User created successfully with referral',
        data: {
          spotifyEmail: newUser.spotifyEmail,
          referralCode: newUser.referralCode,
          invitationCode: newUser.invitationCode,
          referrerEmail: newUser.referrerEmail
        }
      })
    } catch (error) {
      logger.error('Error creating user with referral:', error)
      return next(new AppError('Failed to create user', 500))
    }
  }
)

// Check if user exists and validate their invite code
export const validateUserInviteCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { spotifyEmail, invitationCode } = req.body

    if (!spotifyEmail || !invitationCode) {
      return next(new AppError('Spotify email and invitation code are required', 400))
    }

    try {
      // Check if user already exists
      const existingUser = await SpotifyInfo.findOne({ 
        spotifyEmail: spotifyEmail.toLowerCase() 
      })

      if (existingUser) {
        // User exists, check if they already have a referrer
          // User already has a referrer, check if the current invite code matches
        if (existingUser.invitationCode !== invitationCode.trim().toUpperCase()) {
          logger.info(`User ${spotifyEmail} has different invite code. Expected: ${existingUser.invitationCode}, Got: ${invitationCode}`)
          return res.status(200).json({
            success: false,
            message: 'Please use correct invite code',
            data: {
              isValid: false,
              reason: 'code_mismatch',
              expectedCode: existingUser.invitationCode
            }
          })
        }
        
        // User exists and either has no referrer or the code matches
        logger.info(`User ${spotifyEmail} validation successful`)
        return res.status(200).json({
          success: true,
          message: 'User validation successful',
          data: {
            isValid: true,
            userExists: true,
            hasReferrer: !!existingUser.referrerEmail
          }
        })
      }

      // User doesn't exist, any valid invite code is fine
      logger.info(`New user ${spotifyEmail} with invite code ${invitationCode}`)
      return res.status(200).json({
        success: true,
        message: 'New user validation successful',
        data: {
          isValid: true,
          userExists: false
        }
      })

    } catch (error) {
      logger.error('Error validating user invite code:', error)
      return next(new AppError('Failed to validate user invite code', 500))
    }
  }
)

// Get referral data for the referral page
// This function now automatically calculates referral scores before returning data
// to ensure the dashboard always shows fresh, accurate referral information
export const getReferralData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 100 } = req.query
    const pageNum = parseInt(page as string) || 1
    const limitNum = parseInt(limit as string) || 100
    const skip = (pageNum - 1) * limitNum

    try {
      logger.info(`🔄 Auto-calculating referral scores before fetching dashboard data...`)
      
      // First, automatically calculate referral scores to ensure fresh data
      try {
        // Get all users who have a referral code (potential referrers)
        const usersToUpdate = await SpotifyInfo.find({
          referralCode: { $exists: true, $ne: '' }
        })

        logger.info(`📊 Auto-updating ${usersToUpdate.length} users with referral codes...`)

        let updatedCount = 0
        let totalReferralPointsCalculated = 0

        for (const user of usersToUpdate) {
          let totalReferralPoints = 0
          let todayReferralPoints = 0

          // Find all users whose invitation code matches this user's referral code
          const invitedUsers = await SpotifyInfo.find({
            invitationCode: user.referralCode
          })

          // Calculate referral points from users who used this user's invitation code
          for (const invitedUser of invitedUsers) {
            if (invitedUser.totalBasePoints) {
              // 20% of invited user's total base points
              const referralPoints = invitedUser.totalBasePoints * 0.2
              totalReferralPoints += referralPoints

              // Check if points were earned today
              const today = new Date()
              const userUpdatedToday = invitedUser.updatedAt.toDateString() === today.toDateString()
              
              if (userUpdatedToday) {
                todayReferralPoints += referralPoints
              }
            }
          }

          // Update user's referral scores if needed
          if (user.referralScore !== totalReferralPoints || user.referralScoreToday !== todayReferralPoints) {
            user.referralScore = Math.floor(totalReferralPoints)
            user.referralScoreToday = Math.floor(todayReferralPoints)
            await user.save()
            updatedCount++
            totalReferralPointsCalculated += totalReferralPoints
          }
        }

        logger.info(`✅ Auto-calculation completed: ${updatedCount} users updated, ${totalReferralPointsCalculated.toFixed(2)} total points calculated`)
      } catch (calcError) {
        logger.error('⚠️ Auto-calculation failed, proceeding with existing data:', calcError)
        // Continue with existing data if calculation fails
      }

      // Get total count - show all users, not just those with wallets
      const totalUsers = await SpotifyInfo.countDocuments({
        spotifyEmail: { $exists: true, $ne: '' }
      })

      logger.info(`📊 Fetching referral dashboard data: ${totalUsers} total users`)

      // Get users with referral data, sorted by referral score - show all users
      const users = await SpotifyInfo.find({
        spotifyEmail: { $exists: true, $ne: '' }
      })
      .select('walletAddress spotifyEmail referralScore referralScoreToday totalBasePoints updatedAt')
      .sort({ referralScore: -1, totalBasePoints: -1 }) // Fallback to totalBasePoints if referralScore is same
      .skip(skip)
      .limit(limitNum)

      logger.info(`📋 Users fetched for dashboard: ${users.length} (page ${pageNum}, limit ${limitNum})`)
      
      // Debug: Log first few users
      if (users.length > 0) {
        logger.info('📊 First user sample:', {
          spotifyEmail: users[0].spotifyEmail,
          referralScore: users[0].referralScore,
          referralScoreToday: users[0].referralScoreToday,
          totalBasePoints: users[0].totalBasePoints,
          walletAddress: users[0].walletAddress
        })
      }

      // Transform data for frontend
      const transformedUsers = users.map((user, index) => ({
        walletAddress: user.walletAddress || 'Unknown',
        spotifyEmail: user.spotifyEmail || '',
        dateOfConnection: user.updatedAt.toISOString().split('T')[0],
        referralScoreToday: user.referralScoreToday || 0,
        totalBasePoints: user.totalBasePoints || 0,
        rank: skip + index + 1
      }))

      const totalPages = Math.ceil(totalUsers / limitNum)

      logger.info(`🎯 Dashboard data ready: ${transformedUsers.length} users, ${totalPages} pages`)

      res.status(200).json({
        success: true,
        data: {
          users: transformedUsers,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalUsers,
            totalPages
          }
        }
      })
    } catch (error) {
      logger.error('❌ Error fetching referral data:', error)
      return next(new AppError('Failed to fetch referral data', 500))
    }
  }
)

// Get user's referral information
export const getUserReferralInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { spotifyEmail } = req.params

    if (!spotifyEmail) {
      return next(new AppError('Spotify email is required', 400))
    }

    try {
      logger.info(`🔍 Fetching referral info for user: ${spotifyEmail}`)
      
      const user = await SpotifyInfo.findOne({ 
        spotifyEmail: spotifyEmail.toLowerCase() 
      })

      if (!user) {
        logger.warn(`❌ User not found: ${spotifyEmail}`)
        return next(new AppError('User not found', 404))
      }

      logger.info(`👤 User found: ${user.spotifyEmail}`)
      logger.info(`  • Referral Code: ${user.referralCode || 'None'}`)
      logger.info(`  • Current Referral Score: ${user.referralScore || 0}`)
      logger.info(`  • Today's Referral Score: ${user.referralScoreToday || 0}`)

      // Get invited users' basic info using new invitation code method
      const invitedUsers = await SpotifyInfo.find({
        invitationCode: user.referralCode
      }).select('spotifyEmail totalBasePoints updatedAt')

      logger.info(`🔍 Found ${invitedUsers.length} users who used invitation code: ${user.referralCode}`)

      // Log details of each invited user
      invitedUsers.forEach((invitedUser, index) => {
        logger.info(`  📊 Invited User ${index + 1}:`)
        logger.info(`    • Email: ${invitedUser.spotifyEmail}`)
        logger.info(`    • Total Base Points: ${invitedUser.totalBasePoints || 0}`)
        logger.info(`    • Last Updated: ${invitedUser.updatedAt}`)
        logger.info(`    • Potential Referral Points (20%): ${((invitedUser.totalBasePoints || 0) * 0.2).toFixed(2)}`)
      })

      const totalPotentialPoints = invitedUsers.reduce((sum, u) => sum + ((u.totalBasePoints || 0) * 0.2), 0)
      logger.info(`💰 Total potential referral points: ${totalPotentialPoints.toFixed(2)}`)

      res.status(200).json({
        success: true,
        data: {
          referralCode: user.referralCode,
          referralScore: user.referralScore || 0,
          referralScoreToday: user.referralScoreToday || 0,
          referralCount: user.referralCount || 0,
          invitedUsers: invitedUsers.map(u => ({
            email: u.spotifyEmail,
            points: u.totalBasePoints || 0,
            joinedDate: u.updatedAt
          }))
        }
      })
    } catch (error) {
      logger.error('❌ Error fetching user referral info:', error)
      return next(new AppError('Failed to fetch referral info', 500))
    }
  }
)

// Get or create user by email (for email management)
export const getUserByEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { spotifyEmail } = req.params

    if (!spotifyEmail) {
      return next(new AppError('Spotify email is required', 400))
    }

    try {
      // Find user by email
      let user = await SpotifyInfo.findOne({ 
        spotifyEmail: spotifyEmail.toLowerCase() 
      })

      if (!user) {
        // User doesn't exist, return not found
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        })
      }

      // Return user data
      res.status(200).json({
        success: true,
        message: 'User found successfully',
        data: {
          spotifyEmail: user.spotifyEmail,
          walletAddress: user.walletAddress || null,
          referralCode: user.referralCode,
          invitationCode: user.invitationCode,
          referrerEmail: user.referrerEmail,
          totalBasePoints: user.totalBasePoints || 0,
          referralScore: user.referralScore || 0,
          referralScoreToday: user.referralScoreToday || 0,
          volumeScore: user.volumeScore || 0,
          diversityScore: user.diversityScore || 0,
          historyScore: user.historyScore || 0,
          tracksPlayedCount: user.tracksPlayedCount || 0,
          uniqueArtistCount: user.uniqueArtistCount || 0,
          listeningTime: user.listeningTime || 0,
          updatedAt: user.updatedAt,
          createdAt: user.createdAt
        }
      })
    } catch (error) {
      logger.error('Error getting user by email:', error)
      return next(new AppError('Failed to get user by email', 500))
    }
  }
)

// Update user data by email (for email management)
export const updateUserByEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { spotifyEmail } = req.params
    const updateData = req.body

    if (!spotifyEmail) {
      return next(new AppError('Spotify email is required', 400))
    }

    try {
      // Find user by email
      const user = await SpotifyInfo.findOne({ 
        spotifyEmail: spotifyEmail.toLowerCase() 
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        })
      }

      // Update user data (only allow specific fields to be updated)
      const allowedFields = [
        'walletAddress', 'accessToken', 'refreshToken', 'expiresIn',
        'totalBasePoints', 'volumeScore', 'diversityScore', 'historyScore',
        'referralScore', 'referralScoreToday', 'tracksPlayedCount',
        'uniqueArtistCount', 'listeningTime', 'anonymousTracksPlayedCount'
      ]

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          // For walletAddress, ensure the field is properly set even if it didn't exist before
          if (field === 'walletAddress' && updateData[field]) {
            user.walletAddress = updateData[field]
          } else if (updateData[field] !== undefined) {
            (user as any)[field] = updateData[field]
          }
        }
      }

      await user.save()
      logger.info(`User ${spotifyEmail} updated successfully`)

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
          spotifyEmail: user.spotifyEmail,
          walletAddress: user.walletAddress,
          totalBasePoints: user.totalBasePoints,
          referralScore: user.referralScore
        }
      })
    } catch (error) {
      logger.error('Error updating user by email:', error)
      return next(new AppError('Failed to update user', 500))
    }
  }
)

// Get all users with incomplete data (missing wallet address)
export const getIncompleteUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Find users missing wallet address - handle both missing field and empty/null values
      const incompleteUsers = await SpotifyInfo.find({
        $or: [
          { walletAddress: { $exists: false } },  // Field doesn't exist at all
          { walletAddress: null },                // Field exists but is null
          { walletAddress: '' },                  // Field exists but is empty string
          { walletAddress: { $type: "undefined" } } // Field is undefined
        ]
      }).select('spotifyEmail totalBasePoints referralScore updatedAt createdAt')

      logger.info(`Found ${incompleteUsers.length} users with incomplete data`)

      res.status(200).json({
        success: true,
        message: `Found ${incompleteUsers.length} incomplete users`,
        data: {
          users: incompleteUsers.map(user => ({
            spotifyEmail: user.spotifyEmail,
            totalBasePoints: user.totalBasePoints || 0,
            referralScore: user.referralScore || 0,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt
          })),
          count: incompleteUsers.length
        }
      })
    } catch (error) {
      logger.error('Error getting incomplete users:', error)
      return next(new AppError('Failed to get incomplete users', 500))
    }
  }
)

// Get wallet address status overview for all users
export const getWalletAddressStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get total count of all users
      const totalUsers = await SpotifyInfo.countDocuments({
        spotifyEmail: { $exists: true, $ne: '' }
      })

      // Get count of users with wallet addresses
      const usersWithWallet = await SpotifyInfo.countDocuments({
        $and: [
          { walletAddress: { $exists: true } },
          { walletAddress: { $ne: null } },
          { walletAddress: { $ne: '' } },
          { walletAddress: { $type: { $ne: "undefined" } } }
        ]
      })

      // Get count of users without wallet addresses
      const usersWithoutWallet = await SpotifyInfo.countDocuments({
        $or: [
          { walletAddress: { $exists: false } },
          { walletAddress: null },
          { walletAddress: '' },
          { walletAddress: { $type: "undefined" } }
        ]
      })

      logger.info(`Wallet address status: ${usersWithWallet} with wallet, ${usersWithoutWallet} without wallet`)

      res.status(200).json({
        success: true,
        message: 'Wallet address status retrieved successfully',
        data: {
          totalUsers,
          usersWithWallet,
          usersWithoutWallet,
          completionRate: totalUsers > 0 ? Math.round((usersWithWallet / totalUsers) * 100) : 0
        }
      })
    } catch (error) {
      logger.error('Error getting wallet address status:', error)
      return next(new AppError('Failed to get wallet address status', 500))
    }
  }
)

// Calculate and update referral scores for all users
export const calculateReferralScores = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('🚀 Starting referral score calculation process...')
      
      // Get all users who have a referral code (potential referrers)
      const users = await SpotifyInfo.find({
        referralCode: { $exists: true, $ne: '' }
      })

      logger.info(`📊 Found ${users.length} users with referral codes to process`)

      let updatedCount = 0
      let totalReferralPointsCalculated = 0

      for (const user of users) {
        logger.info(`\n👤 Processing user: ${user.spotifyEmail} (Referral Code: ${user.referralCode})`)
        
        let totalReferralPoints = 0
        let todayReferralPoints = 0
        let invitedUsersFound = 0

        // Find all users whose invitation code matches this user's referral code
        const invitedUsers = await SpotifyInfo.find({
          invitationCode: user.referralCode
        })

        logger.info(`🔍 Found ${invitedUsers.length} users who used invitation code: ${user.referralCode}`)

        // Calculate referral points from users who used this user's invitation code
        for (const invitedUser of invitedUsers) {
          if (invitedUser.totalBasePoints) {
            // 20% of invited user's total base points
            const referralPoints = invitedUser.totalBasePoints * 0.2
            totalReferralPoints += referralPoints
            invitedUsersFound++

            logger.info(`  📈 ${invitedUser.spotifyEmail}: ${invitedUser.totalBasePoints} base points → ${referralPoints.toFixed(2)} referral points (20%)`)

            // Check if points were earned today
            const today = new Date()
            const userUpdatedToday = invitedUser.updatedAt.toDateString() === today.toDateString()
            
            if (userUpdatedToday) {
              todayReferralPoints += referralPoints
              logger.info(`  🌅 Points earned today: ${referralPoints.toFixed(2)}`)
            }
          } else {
            logger.info(`  ⚠️  ${invitedUser.spotifyEmail}: No totalBasePoints found`)
          }
        }

        const oldReferralScore = user.referralScore || 0
        const oldTodayScore = user.referralScoreToday || 0

        logger.info(`📊 User ${user.spotifyEmail} summary:`)
        logger.info(`  • Invited users found: ${invitedUsersFound}`)
        logger.info(`  • Total referral points: ${totalReferralPoints.toFixed(2)}`)
        logger.info(`  • Today's referral points: ${todayReferralPoints.toFixed(2)}`)
        logger.info(`  • Previous referral score: ${oldReferralScore}`)
        logger.info(`  • Previous today score: ${oldTodayScore}`)

        // Update user's referral scores
        if (user.referralScore !== totalReferralPoints || user.referralScoreToday !== todayReferralPoints) {
          user.referralScore = Math.floor(totalReferralPoints)
          user.referralScoreToday = Math.floor(todayReferralPoints)
          await user.save()
          updatedCount++
          totalReferralPointsCalculated += totalReferralPoints

          logger.info(`✅ Updated ${user.spotifyEmail}: ${oldReferralScore} → ${user.referralScore} (${totalReferralPoints > oldReferralScore ? '+' : ''}${user.referralScore - oldReferralScore})`)
        } else {
          logger.info(`⏭️  No update needed for ${user.spotifyEmail} (scores unchanged)`)
        }
      }

      logger.info(`\n🎯 Referral score calculation completed!`)
      logger.info(`📈 Summary:`)
      logger.info(`  • Total users processed: ${users.length}`)
      logger.info(`  • Users updated: ${updatedCount}`)
      logger.info(`  • Total referral points calculated: ${totalReferralPointsCalculated.toFixed(2)}`)
      logger.info(`  • Average referral points per user: ${users.length > 0 ? (totalReferralPointsCalculated / users.length).toFixed(2) : 0}`)

      res.status(200).json({
        success: true,
        message: `Referral scores updated for ${updatedCount} users using new invitation code method`,
        data: { 
          updatedCount,
          totalUsersProcessed: users.length,
          totalReferralPointsCalculated: Math.floor(totalReferralPointsCalculated)
        }
      })
    } catch (error) {
      logger.error('❌ Error calculating referral scores:', error)
      return next(new AppError('Failed to calculate referral scores', 500))
    }
  }
) 