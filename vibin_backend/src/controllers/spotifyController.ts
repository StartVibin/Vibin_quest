import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import SpotifyInfo from '@/models/SpotifyInfo'
import logger from '@/utils/logger'
import dotenv from 'dotenv'
import { ethers, parseUnits } from 'ethers'
import { EmailList } from '@/models'

dotenv.config();

const claimInProgress = new Set<string>();
const actionInProgress = new Set<string>();

//ethernet connection
const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/be2eb559ee7e401e96dea9892a72c8eb`);
const privateKey = process.env.SECRETKEY!; // Use environment variables in production
const wallet = new ethers.Wallet(privateKey, provider);

const correctClaimContractAbi = [
  // TokensClaimed event - this must match exactly with your Solidity contract
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "messageHash",
        "type": "bytes32"
      }
    ],
    "name": "TokensClaimed",
    "type": "event"
  },
  // Include other functions you need
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "nonce", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" }
    ],
    "name": "claimTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];


const erc20Abi = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
];
const claimContractAbi = [
  "function claimTokens(uint256 amount, uint256 nonce, uint256 deadline, bytes memory signature) external",
]
const tokenAddress = process.env.TOKEN_ADDRESS_TEST;
const contractAddress = process.env.CLAIM_CONTRACT_ADDRESS_TEST;

// Update user's Spotify data
export const updateSpotifyData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, spotifyId, spotifyEmail } = req.body

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    if (!spotifyId) {
      return next(new AppError('Spotify ID is required', 400))
    }

    if (!spotifyEmail) {
      return next(new AppError('Spotify email is required', 400))
    }

    // Check if this Spotify account is already connected to another wallet
    const existingSpotifyUser = await User.findBySpotifyId(spotifyId)
    if (existingSpotifyUser && existingSpotifyUser.walletAddress !== walletAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: `Spotify account is already connected to wallet: ${existingSpotifyUser.walletAddress}`,
        data: {
          existingWallet: existingSpotifyUser.walletAddress,
          currentWallet: walletAddress
        }
      })
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user already connected Spotify to prevent double points
    const wasAlreadyConnected = user.spotifyConnected

    // Update user with Spotify data
    user.spotifyId = spotifyId
    user.spotifyEmail = spotifyEmail
    user.spotifyConnected = true

    // Award social points for Spotify connection (only if not already connected)
    let pointsAwarded = 0
    if (!wasAlreadyConnected) {
      pointsAwarded = 50 // Award 50 points for Spotify connection
      user.socialPoints += pointsAwarded
    }

    await user.save()

    if (pointsAwarded > 0) {
      logger.info(`User ${walletAddress} connected Spotify account: ${spotifyId}, awarded ${pointsAwarded} points`)
    } else {
      logger.info(`User ${walletAddress} updated Spotify account: ${spotifyId} (already connected)`)
    }

    res.status(200).json({
      success: true,
      message: wasAlreadyConnected ? 'Spotify data updated successfully' : 'Spotify connected successfully',
      data: {
        walletAddress: user.walletAddress,
        spotifyId: user.spotifyId,
        spotifyEmail: user.spotifyEmail,
        spotifyConnected: user.spotifyConnected,
        pointsAwarded,
        socialPoints: user.socialPoints,
        totalPoints: user.totalPoints
      }
    })
  }
)

// Get user's Spotify data
export const getSpotifyData = catchAsync(
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

    // Check if user has Spotify data
    if (!user.spotifyConnected || !user.spotifyId) {
      return next(new AppError('User has not connected Spotify', 404))
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        spotifyId: user.spotifyId,
        spotifyEmail: user.spotifyEmail,
        spotifyConnected: user.spotifyConnected,
        connectedAt: user.updatedAt
      }
    })
  }
)

export const claimSpotifyPoints = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { publicKey, inviteCode, email } = req.body

    console.log("claim request", publicKey, inviteCode)

    if (!publicKey || !inviteCode || !email) {
      return next(new AppError('Wallet address and invite code is required', 400))
    }

    try {
      if (claimInProgress.has(publicKey)) {
        console.log("action in progress");
        return res.status(429).json({ error: 'Action already in progress' });
      }
      claimInProgress.add(publicKey);

      console.log(req.body);

      const spotifyInfo = await SpotifyInfo.findOne({ spotifyEmail: email })
      if (!spotifyInfo) {
        return next(new AppError("user not found", 400))
      }
      spotifyInfo.walletAddress = publicKey;
      await spotifyInfo.save();
      const tokenContract = new ethers.Contract(tokenAddress!, erc20Abi, wallet);
      const [decimals] = await Promise.all([
        tokenContract.decimals()
      ]);
      console.log("spotifyInfo", spotifyInfo)
      // Use the new totalBasePoints field instead of old calculation
      const point = (spotifyInfo.totalBasePoints || 0) - (spotifyInfo.totalBasePointsAtClaim || 0);
      const amount = parseUnits((point / 100).toString(), decimals);
      const contract = new ethers.Contract(contractAddress!, claimContractAbi, wallet);

      const nonce = 1;
      const deadline = Math.floor(Date.now() / 1000) + 300000000;

      const claimData = {
        recipient: publicKey,
        amount: amount.toString(),
        nonce: 1,
        deadline: deadline
      };

      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256', 'uint256'],
        [claimData.recipient, claimData.amount, claimData.nonce, claimData.deadline]
      );

      const backendSignature = await wallet.signMessage(ethers.getBytes(messageHash));
      console.log("🚀 ~ claimWithContract ~ backendSignature:", backendSignature);


      
      // Update the claim tracking fields after successful claim
      spotifyInfo.totalBasePointsAtClaim = spotifyInfo.totalBasePoints;
      // Keep old fields for backward compatibility if needed
      // spotifyInfo.volumeScoreAtClaim = spotifyInfo.volumeScore;
      // spotifyInfo.diversityScoreAtClaim = spotifyInfo.diversityScore;
      // spotifyInfo.historyScoreAtClaim = spotifyInfo.historyScore;
      await spotifyInfo.save();

      return res.status(200).json({
        success: true,
        message: "Verification successful",
        claimData: {
          amount: claimData.amount,
          nonce: claimData.nonce,
          deadline: claimData.deadline,
          signature: backendSignature
        }

      });


    } catch (error) {
      console.log("error", error)
      return next(new AppError('Error claiming points', 500))
    } finally {
      console.log("action completed");
      claimInProgress.delete(publicKey);
    }
  }
)

export const getIndexOfEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.query

    console.log("email for getting index-------->", email)
    const emailData = await EmailList.findOne({ email })
    if (!emailData) {
      return next(new AppError("user not found", 400))
    }
    return res.status(200).json({ success: true, data: emailData })
  }
)

export const getPoints = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body
      const userData = await SpotifyInfo.findOne({ spotifyEmail: email })
      if (!userData) {
        return next(new AppError("user not found", 400))
      }
      const pointData = {
        totalBasePoints: userData.totalBasePoints,
        volumeScore: userData.volumeScore,
        diversityScore: userData.diversityScore,
        historyScore: userData.historyScore,
      }
      return res.status(200).json({ success: true, data: pointData })
    } catch (error) {
      console.log("error", error)
      return next(new AppError('Error getting points', 500))
    }
  }
)

export const getClaimStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    const user = await SpotifyInfo.findOne({ spotifyEmail: email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const now = new Date();
    const lastClaimDate = user.claimDate || new Date(0); // Default to epoch if never claimed
    const nextClaimDate = new Date(lastClaimDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // +7 days
    
    const canClaim = now >= nextClaimDate;
    const timeUntilNextClaim = Math.max(0, nextClaimDate.getTime() - now.getTime());
    
    const claimStatus = {
      canClaim,
      lastClaimDate: lastClaimDate.toISOString(),
      nextClaimDate: nextClaimDate.toISOString(),
      timeUntilNextClaim,
      daysUntilNextClaim: Math.ceil(timeUntilNextClaim / (24 * 60 * 60 * 1000)),
      hoursUntilNextClaim: Math.ceil(timeUntilNextClaim / (60 * 60 * 1000)),
      minutesUntilNextClaim: Math.ceil(timeUntilNextClaim / (60 * 1000)),
      secondsUntilNextClaim: Math.ceil(timeUntilNextClaim / 1000)
    };

    res.status(200).json({ success: true, data: claimStatus });
  } catch (error) {
    console.log("error", error);
    return next(new AppError('Error getting claim status', 500));
  }
});

export const startListener = () => {
  console.log('Starting event listener...');

  const contract = new ethers.Contract(contractAddress!, correctClaimContractAbi, provider);

  // Method 1: Safe event listening with error handling
  const setupEventListener = () => {
    try {
      // Create the event filter
      const filter = contract.filters.TokensClaimed();
      console.log('Event filter created:', filter);

      // Listen for events with proper error handling
      contract.on('TokensClaimed', async (...args) => {
        try {
          console.log('Raw event args:', args);

          // The last argument is always the event object
          const event = args[args.length - 1];

          // Extract the actual arguments (excluding the event object)
          const [recipient, amount, messageHash] = args.slice(0, -1);

          console.log('🎉 TokensClaimed event detected!');
          console.log({
            recipient: recipient,
            amount: amount.toString(),
            messageHash: messageHash,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            logIndex: event.logIndex
          });

          await processSuccessfulClaim({
            recipient,
            amount: amount.toString(),
            messageHash,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });

        } catch (eventError) {
          console.error('Error processing event:', eventError);
        }
      });

    } catch (setupError) {
      console.error('Error setting up event listener:', setupError);
    }
  };

  setupEventListener();

  // Handle provider errors
  provider.on('error', (error) => {
    console.error('Provider error:', error);
  });

  return contract;


};

async function processSuccessfulClaim(eventData: any) {
  try {
    const walletPubKey = eventData.recipient;
    const user = await SpotifyInfo.findOne({ walletAddress: walletPubKey });
    if (!user) {
      console.error('User not found for wallet:', walletPubKey);
      return;
    }
    console.log("🚀 ~ processSuccessfulClaim ~ user:", user)

    user.totalBasePointsAtClaim = user.totalBasePoints;
    user.volumeScoreAtClaim = user.volumeScore;
    user.diversityScoreAtClaim = user.diversityScore;
    user.historyScoreAtClaim = user.historyScore;
    user.claimDate = new Date();

    await user.save();

    console.log('✅ Successfully processed claim event');
  } catch (error) {
    console.error('Error processing claim:', error);
  }
}

// Get user data by email for dashboard
// This function now automatically calculates referral scores before returning data
// to ensure the dashboard always shows fresh, accurate referral information
export const getUserByEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.params

    if (!email) {
      return next(new AppError('Email is required', 400))
    }

    try {
      logger.info(`🔄 Auto-calculating referral scores for dashboard user: ${email}`)
      
      // First, automatically calculate referral scores to ensure fresh data
      try {
        // Find the user first
        const user = await SpotifyInfo.findOne({ spotifyEmail: email })
        
        if (user && user.referralCode) {
          logger.info(`📊 Auto-updating referral scores for user: ${email} (Referral Code: ${user.referralCode})`)
          
          let totalReferralPoints = 0
          let todayReferralPoints = 0

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

              logger.info(`  📈 ${invitedUser.spotifyEmail}: ${invitedUser.totalBasePoints} base points → ${referralPoints.toFixed(2)} referral points (20%)`)

              // Check if points were earned today
              const today = new Date()
              const userUpdatedToday = invitedUser.updatedAt.toDateString() === today.toDateString()
              
              if (userUpdatedToday) {
                todayReferralPoints += referralPoints
                logger.info(`  🌅 Points earned today: ${referralPoints.toFixed(2)}`)
              }
            }
          }

          const oldReferralScore = user.referralScore || 0
          const oldTodayScore = user.referralScoreToday || 0

          // Update user's referral scores if needed
          if (user.referralScore !== totalReferralPoints || user.referralScoreToday !== todayReferralPoints) {
            user.referralScore = Math.floor(totalReferralPoints)
            user.referralScoreToday = Math.floor(todayReferralPoints)
            await user.save()
            
            logger.info(`✅ Updated ${email}: referralScore ${oldReferralScore} → ${user.referralScore} (+${user.referralScore - oldReferralScore})`)
            logger.info(`✅ Updated ${email}: referralScoreToday ${oldTodayScore} → ${user.referralScoreToday} (+${user.referralScoreToday - oldTodayScore})`)
          } else {
            logger.info(`⏭️ No update needed for ${email} (scores unchanged)`)
          }
        } else {
          logger.info(`ℹ️ User ${email} has no referral code, skipping calculation`)
        }
      } catch (calcError) {
        logger.error('⚠️ Auto-calculation failed, proceeding with existing data:', calcError)
        // Continue with existing data if calculation fails
      }

      // Now fetch the updated user data
      const spotifyInfo = await SpotifyInfo.findOne({ spotifyEmail: email })

      if (!spotifyInfo) {
        return next(new AppError('User not found', 404))
      }

      logger.info(`📊 Dashboard data for ${email}:`)
      logger.info(`  • Referral Score: ${spotifyInfo.referralScore || 0}`)
      logger.info(`  • Today's Referral Score: ${spotifyInfo.referralScoreToday || 0}`)
      logger.info(`  • Total Base Points: ${spotifyInfo.totalBasePoints || 0}`)
      logger.info(`  • Tracks Played: ${spotifyInfo.tracksPlayedCount || 0}`)
      logger.info(`  • Diversity Score: ${spotifyInfo.diversityScore || 0}`)
      logger.info(`  • History Score: ${spotifyInfo.historyScore || 0}`)

      // Return the exact fields needed for dashboard
      res.status(200).json({
        success: true,
        data: {
          tracksPlayedCount: spotifyInfo.tracksPlayedCount || 0,
          diversityScore: spotifyInfo.diversityScore || 0,
          historyScore: spotifyInfo.historyScore || 0,
          referralScore: spotifyInfo.referralScore || 0,
          totalBasePoints: spotifyInfo.totalBasePoints || 0,
          walletAddress: spotifyInfo.walletAddress || '',
          spotifyEmail: spotifyInfo.spotifyEmail || email,
          createdAt: spotifyInfo.createdAt,
          updatedAt: spotifyInfo.updatedAt,
        }
      })
    } catch (error) {
      logger.error(`❌ Error fetching user data for email ${email}:`, error)
      return next(new AppError('Error fetching user data', 500))
    }
  }
)