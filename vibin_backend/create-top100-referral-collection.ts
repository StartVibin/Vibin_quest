import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';

// Define schema for the new collection
const top100ReferralSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  referralCode: {
    type: String,
    required: false, // Make it optional
    default: 'NO_CODE'
  },
  totalPoints: {
    type: Number,
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create model for the new collection
const Top100Referral = mongoose.model('Top100Referral', top100ReferralSchema, 'top100Referrals');

async function createTop100ReferralCollection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get top 100 users sorted by totalPoints descending
    const top100Users = await User.aggregate([
      {
        $addFields: {
          totalPoints: {
            $add: ['$gamePoints', '$referralPoints', '$socialPoints']
          }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: 100
      },
      {
        $project: {
          walletAddress: 1,
          referralCode: 1,
          totalPoints: 1
        }
      }
    ]);

    console.log(`Found ${top100Users.length} top users`);

    // Clear existing data in the collection
    await Top100Referral.deleteMany({});
    console.log('Cleared existing top100Referrals collection');

    // Insert top 100 users into the new collection
    const referralData = top100Users
      .filter(user => user.referralCode && user.referralCode.trim() !== '') // Only include users with referral codes
      .map((user, index) => ({
        walletAddress: user.walletAddress,
        referralCode: user.referralCode,
        totalPoints: user.totalPoints,
        rank: index + 1
      }));

    const result = await Top100Referral.insertMany(referralData);
    console.log(`Successfully inserted ${result.length} users into top100Referrals collection`);

    // Display the results
    console.log('\nTop 100 Users Referral Codes:');
    console.log('Rank | Wallet Address | Referral Code | Total Points');
    console.log('-----|----------------|---------------|-------------');
    
    referralData.forEach((user, index) => {
      const truncatedWallet = user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4);
      console.log(`${(index + 1).toString().padStart(4)} | ${truncatedWallet} | ${user.referralCode.padEnd(12)} | ${user.totalPoints}`);
    });

  } catch (err) {
    console.error('Error creating top 100 referral collection:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createTop100ReferralCollection(); 