import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';
const NEW_REFERRAL_CODE = 'Y0KHN8';

async function assignNewReferralCodes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get total user count
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);

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
          _id: 1,
          walletAddress: 1,
          referralCode: 1,
          totalPoints: 1,
          gamePoints: 1,
          referralPoints: 1,
          socialPoints: 1
        }
      }
    ]);

    console.log(`🎯 Found ${top100Users.length} top users to update`);

    if (top100Users.length === 0) {
      console.log('❌ No users found to update');
      return;
    }

    // Show current referral codes for top 10 users
    console.log('\n📋 Current referral codes for top 10 users:');
    console.log('Rank | Wallet Address | Current Referral Code | Total Points');
    console.log('-----|----------------|----------------------|-------------');
    
    top100Users.slice(0, 10).forEach((user, index) => {
      const truncatedWallet = user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4);
      const currentCode = user.referralCode || 'NO_CODE';
      console.log(`${(index + 1).toString().padStart(4)} | ${truncatedWallet} | ${currentCode.padEnd(20)} | ${user.totalPoints}`);
    });

    // Update referral codes for top 100 users
    console.log('\n🔄 Updating referral codes...');
    
    const updatePromises = top100Users.map(async (user) => {
      try {
        const result = await User.findByIdAndUpdate(
          user._id,
          { referralCode: NEW_REFERRAL_CODE },
          { new: true }
        );
        return result;
      } catch (error) {
        console.error(`❌ Error updating user ${user.walletAddress}:`, error);
        return null;
      }
    });

    const updatedUsers = await Promise.all(updatePromises);
    const successfulUpdates = updatedUsers.filter(user => user !== null);
    
    console.log(`✅ Successfully updated ${successfulUpdates.length} users`);
    console.log(`❌ Failed to update ${top100Users.length - successfulUpdates.length} users`);

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const verificationResults = await User.aggregate([
      {
        $match: {
          referralCode: NEW_REFERRAL_CODE
        }
      },
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
        $limit: 10
      }
    ]);

    console.log(`\n✅ Verification: Found ${verificationResults.length} users with new referral code '${NEW_REFERRAL_CODE}'`);
    console.log('\n📋 Top 10 users with new referral code:');
    console.log('Rank | Wallet Address | New Referral Code | Total Points');
    console.log('-----|----------------|-------------------|-------------');
    
    verificationResults.forEach((user, index) => {
      const truncatedWallet = user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4);
      console.log(`${(index + 1).toString().padStart(4)} | ${truncatedWallet} | ${user.referralCode.padEnd(17)} | ${user.totalPoints}`);
    });

    // Show summary
    console.log('\n📊 Summary:');
    console.log(`Total users in database: ${totalUsers}`);
    console.log(`Top users processed: ${top100Users.length}`);
    console.log(`Successfully updated: ${successfulUpdates.length}`);
    console.log(`New referral code assigned: ${NEW_REFERRAL_CODE}`);
    console.log(`Users with new code: ${verificationResults.length}`);

  } catch (err) {
    console.error('❌ Error assigning new referral codes:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
assignNewReferralCodes(); 