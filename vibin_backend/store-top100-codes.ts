import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import Code from './src/models/Code';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';

async function storeTop100Codes() {
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

    // Filter users with valid referral codes
    const usersWithCodes = top100Users.filter(user => 
      user.referralCode && user.referralCode.trim() !== ''
    );

    console.log(`${usersWithCodes.length} users have valid referral codes`);

    // Clear existing data in the codes collection
    await Code.deleteMany({});
    console.log('Cleared existing codes collection');

    // Insert top users into the codes collection
    const codeData = usersWithCodes.map((user, index) => ({
      walletAddress: user.walletAddress,
      referralCode: user.referralCode,
      totalPoints: user.totalPoints,
      rank: index + 1
    }));

    const result = await Code.insertMany(codeData);
    console.log(`Successfully inserted ${result.length} codes into codes collection`);

    // Display the results
    console.log('\nTop 100 Users Referral Codes:');
    console.log('Rank | Wallet Address | Referral Code | Total Points');
    console.log('-----|----------------|---------------|-------------');
    
    codeData.forEach((code, index) => {
      const truncatedWallet = code.walletAddress.slice(0, 6) + '...' + code.walletAddress.slice(-4);
      console.log(`${(index + 1).toString().padStart(4)} | ${truncatedWallet} | ${code.referralCode.padEnd(12)} | ${code.totalPoints}`);
    });

  } catch (err) {
    console.error('Error storing top 100 codes:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

storeTop100Codes(); 