import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import SpotifyInfo from '@/models/SpotifyInfo'
import logger from '@/utils/logger'

const airdropList = [
  500000, 300000, 200000, 100000, 90000, 80000, 70000, 60000, 50000, 40000, 30000, 29000, 28000, 27000, 26000, 25000, 24000, 23000, 22000, 21000, 20000, 19000, 18000, 17000, 16000, 15000, 14000, 13000, 12000, 11000, 10000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000
];

// Get top users by total points
export const getTopUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = await SpotifyInfo.countDocuments();

    const page = 1;
    const skip = 0;

    // Get users directly from SpotifyInfo collection, sorted by the new scoring system
    const users = await SpotifyInfo.aggregate([
      {
        $addFields: {
          // Calculate total base points using the exact fields you specified
          totalBasePoints: {
            $add: [
              { $ifNull: ['$tracksPlayedCount', 0] },
              { $ifNull: ['$diversityScore', 0] },
              { $ifNull: ['$historyScore', 0] },
              { $ifNull: ['$referralScore', 0] }
            ]
          }
        }
      },
      {
        $sort: { totalBasePoints: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          walletAddress: 1,
          spotifyEmail: 1,
          tracksPlayedCount: 1,
          diversityScore: 1,
          historyScore: 1,
          referralScore: 1,
          totalBasePoints: 1,
          rank: { $add: [1, '$skip'] }
        }
      }
    ])

    // Get total count for pagination
    const totalUsers = await SpotifyInfo.countDocuments()

    // Add rank to each user
    const usersWithRank = users.map((user, index) => {
      return {
        ...user,
        rank: skip + index + 1
      };
    })

    logger.info(`Leaderboard requested: ${usersWithRank.length} users, page ${page}`)

    res.status(200).json({
      success: true,
      data: {
        users: usersWithRank,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    })
  }
)

// Get user's rank by wallet address
export const getUserRank = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find the user with Spotify info
    const user = await User.aggregate([
      {
        $match: { walletAddress: walletAddress.toLowerCase() }
      },
      {
        $lookup: {
          from: 'spotifyInfos',
          localField: 'spotifyEmail',
          foreignField: 'spotifyEmail',
          as: 'spotifyInfo'
        }
      },
      {
        $addFields: {
          totalTracksPlayed: { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.tracksPlayedCount', 0] }, 0] },
          uniqueArtistsCount: { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.uniqueArtistCount', 0] }, 0] },
          totalListeningTimeMs: { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.listeningTime', 0] }, 0] },
          anonymousTrackCount: { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.anonymousTracksPlayedCount', 0] }, 0] },
          totalBasePoints: {
            $add: [
              { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.tracksPlayedCount', 0] }, 0] },
              { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.uniqueArtistCount', 0] }, 0] },
              { $floor: { $divide: [{ $ifNull: [{ $arrayElemAt: ['$spotifyInfo.listeningTime', 0] }, 0] }, 60000] } },
              { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.anonymousTracksPlayedCount', 0] }, 0] }
            ]
          }
        }
      }
    ])

    if (!user || user.length === 0) {
      return next(new AppError('User not found', 404))
    }

    const userData = user[0]
    const userTotalBasePoints = userData.totalBasePoints

    // Count users with higher total base points (this gives us the rank)
    const rank = await User.aggregate([
      {
        $lookup: {
          from: 'spotifyInfos',
          localField: 'spotifyEmail',
          foreignField: 'spotifyEmail',
          as: 'spotifyInfo'
        }
      },
      {
        $addFields: {
          totalBasePoints: {
            $add: [
              { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.tracksPlayedCount', 0] }, 0] },
              { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.uniqueArtistCount', 0] }, 0] },
              { $floor: { $divide: [{ $ifNull: [{ $arrayElemAt: ['$spotifyInfo.listeningTime', 0] }, 0] }, 60000] } },
              { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.anonymousTracksPlayedCount', 0] }, 0] }
            ]
          }
        }
      },
      {
        $match: {
          totalBasePoints: { $gt: userTotalBasePoints }
        }
      },
      {
        $count: 'count'
      }
    ])

    const userRank = (rank[0]?.count || 0) + 1

    // Get total users count
    const totalUsers = await User.countDocuments()

    logger.info(`User rank requested for ${walletAddress}: rank ${userRank}/${totalUsers}`)

    res.status(200).json({
      success: true,
      data: {
        walletAddress: userData.walletAddress,
        totalTracksPlayed: userData.totalTracksPlayed,
        uniqueArtistsCount: userData.uniqueArtistsCount,
        totalListeningTimeMs: userData.totalListeningTimeMs,
        anonymousTrackCount: userData.anonymousTrackCount,
        totalBasePoints: userData.totalBasePoints,
        // Keep old fields for backward compatibility
        totalPoints: userData.gamePoints + userData.referralPoints + userData.socialPoints,
        gamePoints: userData.gamePoints,
        referralPoints: userData.referralPoints,
        socialPoints: userData.socialPoints,
        airdroped: userData.airdroped,
        rank: userRank,
        totalUsers
      }
    })
  }
)

// Get leaderboard by point type
export const getLeaderboardByType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.params
    const limit = parseInt(req.query.limit as string) || 10
    const page = parseInt(req.query.page as string) || 1
    const skip = (page - 1) * limit

    let sortField: string
    let pointType: string

    switch (type.toLowerCase()) {
      case 'tracks':
        sortField = 'totalTracksPlayed'
        pointType = 'totalTracksPlayed'
        break
      case 'artists':
        sortField = 'uniqueArtistsCount'
        pointType = 'uniqueArtistsCount'
        break
      case 'listening':
        sortField = 'totalListeningTimeMs'
        pointType = 'totalListeningTimeMs'
        break
      case 'anonymous':
        sortField = 'anonymousTrackCount'
        pointType = 'anonymousTrackCount'
        break
      case 'base':
        sortField = 'totalBasePoints'
        pointType = 'totalBasePoints'
        break
      // Keep old types for backward compatibility
      case 'game':
        sortField = 'gamePoints'
        pointType = 'gamePoints'
        break
      case 'referral':
        sortField = 'referralPoints'
        pointType = 'referralPoints'
        break
      case 'social':
        sortField = 'socialPoints'
        pointType = 'socialPoints'
        break
      case 'total':
        sortField = 'totalBasePoints'
        pointType = 'totalBasePoints'
        break
      default:
        return next(new AppError('Invalid point type. Use: tracks, artists, listening, anonymous, base, game, referral, social, or total', 400))
    }

    let users
    let totalUsers

    // For new scoring system types, we need to aggregate with SpotifyInfo
    if (['tracks', 'artists', 'listening', 'anonymous', 'base', 'total'].includes(type.toLowerCase())) {
      users = await User.aggregate([
        {
          $lookup: {
            from: 'spotifyInfos',
            localField: 'spotifyEmail',
            foreignField: 'spotifyEmail',
            as: 'spotifyInfo'
          }
        },
        {
          $addFields: {
            totalTracksPlayed: { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.tracksPlayedCount', 0] }, 0] },
            uniqueArtistsCount: { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.uniqueArtistCount', 0] }, 0] },
            totalListeningTimeMs: { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.listeningTime', 0] }, 0] },
            anonymousTrackCount: { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.anonymousTracksPlayedCount', 0] }, 0] },
            totalBasePoints: {
              $add: [
                { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.tracksPlayedCount', 0] }, 0] },
                { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.uniqueArtistCount', 0] }, 0] },
                { $floor: { $divide: [{ $ifNull: [{ $arrayElemAt: ['$spotifyInfo.listeningTime', 0] }, 0] }, 60000] } },
                { $ifNull: [{ $arrayElemAt: ['$spotifyInfo.anonymousTracksPlayedCount', 0] }, 0] }
              ]
            }
          }
        },
        {
          $sort: { [sortField]: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $project: {
            walletAddress: 1,
            totalTracksPlayed: 1,
            uniqueArtistsCount: 1,
            totalListeningTimeMs: 1,
            anonymousTrackCount: 1,
            totalBasePoints: 1,
            gamePoints: 1,
            referralPoints: 1,
            socialPoints: 1,
            airdroped: 1
          }
        }
      ])

      totalUsers = await User.countDocuments()
    } else {
      // For old point types, we can use regular query
      users = await User.find()
        .sort({ [sortField]: -1 })
        .skip(skip)
        .limit(limit)
        .select(`walletAddress ${pointType} gamePoints referralPoints socialPoints airdroped`)

      totalUsers = await User.countDocuments()
    }

    // Add rank to each user
    const usersWithRank = users.map((user, index) => {
      let airdroped = 0;
      if (skip + index < 100) {
        airdroped = (skip + index) < airdropList.length ? airdropList[skip + index] : 0;
      }
      return {
        ...(user.toObject ? user.toObject() : user),
        rank: skip + index + 1,
        airdroped
      };
    })

    logger.info(`${type} leaderboard requested: ${usersWithRank.length} users, page ${page}`)

    res.status(200).json({
      success: true,
      data: {
        type: type.toLowerCase(),
        users: usersWithRank,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    })
  }
) 