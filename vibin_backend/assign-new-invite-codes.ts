import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';
const NEW_INVITE_CODE = 'Y0KHN8';

async function assignNewInviteCodes() {
  console.log(`🎯 This script will assign invite code '${NEW_INVITE_CODE}' to ALL users in the database`);
  console.log(`📝 Note: This updates the 'inviteCode' field, NOT the 'referralCode' field\n`);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get total user count
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);

    // Get ALL users (not just top 100)
    const allUsers = await User.find({}).select({
      _id: 1,
      walletAddress: 1,
      inviteCode: 1,
      referralCode: 1,
      gamePoints: 1,
      referralPoints: 1,
      socialPoints: 1
    });

    console.log(`🎯 Found ${allUsers.length} total users to update`);

    if (allUsers.length === 0) {
      console.log('❌ No users found to update');
      return;
    }

    // Show current invite codes for first 10 users
    console.log('\n📋 Current invite codes for first 10 users:');
    console.log('Rank | Wallet Address | Current Invite Code | Current Referral Code | Total Points');
    console.log('-----|----------------|---------------------|----------------------|-------------');
    
    allUsers.slice(0, 10).forEach((user, index) => {
      const truncatedWallet = user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4);
      const currentInviteCode = user.inviteCode || 'NO_CODE';
      const currentReferralCode = user.referralCode || 'NO_CODE';
      const totalPoints = (user.gamePoints || 0) + (user.referralPoints || 0) + (user.socialPoints || 0);
      console.log(`${(index + 1).toString().padStart(4)} | ${truncatedWallet} | ${currentInviteCode.padEnd(19)} | ${currentReferralCode.padEnd(20)} | ${totalPoints}`);
    });

    // Update invite codes for ALL users
    console.log('\n🔄 Updating invite codes for ALL users...');
    
    const updatePromises = allUsers.map(async (user) => {
      try {
        const result = await User.findByIdAndUpdate(
          user._id,
          { inviteCode: NEW_INVITE_CODE },
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
    console.log(`❌ Failed to update ${allUsers.length - successfulUpdates.length} users`);

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const verificationResults = await User.aggregate([
      {
        $match: {
          inviteCode: NEW_INVITE_CODE
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

    console.log(`\n✅ Verification: Found ${verificationResults.length} users with new invite code '${NEW_INVITE_CODE}'`);
    console.log('\n📋 Top 10 users with new invite code:');
    console.log('Rank | Wallet Address | New Invite Code | Referral Code | Total Points');
    console.log('-----|----------------|-----------------|---------------|-------------');
    
    verificationResults.forEach((user, index) => {
      const truncatedWallet = user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4);
      const referralCode = user.referralCode || 'NO_CODE';
      console.log(`${(index + 1).toString().padStart(4)} | ${truncatedWallet} | ${user.inviteCode.padEnd(15)} | ${referralCode.padEnd(13)} | ${user.totalPoints}`);
    });

    // Show summary
    console.log('\n📊 Summary:');
    console.log(`Total users in database: ${totalUsers}`);
    console.log(`Total users processed: ${allUsers.length}`);
    console.log(`Successfully updated: ${successfulUpdates.length}`);
    console.log(`New invite code assigned: ${NEW_INVITE_CODE}`);
    console.log(`Users with new invite code: ${verificationResults.length}`);
    console.log(`\n💡 Note: This script updated the 'inviteCode' field, NOT the 'referralCode' field`);
    console.log(`   - inviteCode: ${NEW_INVITE_CODE} (for ALL users)`);
    console.log(`   - referralCode: unchanged (kept original values)`);

  } catch (err) {
    console.error('❌ Error assigning new invite codes:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
assignNewInviteCodes(); 