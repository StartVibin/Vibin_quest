import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';
const NEW_INVITATION_CODE = 'Y0KHN8';

// Function to generate random referral code in Y0KHN8 style (8 characters, alphanumeric)
function generateRandomReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Define SpotifyInfo schema inline
const spotifyInfoSchema = new mongoose.Schema({
  spotifyEmail: String,
  accessToken: String,
  anonymousTracksPlayedCount: Number,
  claimDate: Date,
  diversityScore: Number,
  diversityScoreAtClaim: Number,
  expiresIn: Number,
  historyScore: Number,
  historyScoreAtClaim: Number,
  invitationCode: String,
  invitedUsers: [String],
  listeningTime: Number,
  playedDays: Number,
  point: Number,
  pointAtClaim: Number,
  referralCode: String,
  referralCount: Number,
  referralScore: Number,
  referralScoreAtClaim: Number,
  refreshToken: String,
  totalBasePoints: Number,
  totalBasePointsAtClaim: Number,
  tracksPlayedCount: Number,
  uniqueArtistCount: Number,
  volumeScore: Number,
  volumeScoreAtClaim: Number,
  walletAddress: String
}, {
  collection: 'spotifyInfos' // Specify the exact collection name
});

const SpotifyInfo = mongoose.model('SpotifyInfo', spotifyInfoSchema);

async function updateSpotifyInfosCodes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get total count of spotifyInfos
    const totalCount = await SpotifyInfo.countDocuments();
    console.log(`📊 Total users in spotifyInfos collection: ${totalCount}`);

    if (totalCount === 0) {
      console.log('❌ No users found in spotifyInfos collection');
      return;
    }

    // Check current state
    console.log('\n🔍 Checking current state...');
    
    const usersWithInvitationCode = await SpotifyInfo.countDocuments({ invitationCode: { $exists: true, $ne: '' } });
    const usersWithoutInvitationCode = await SpotifyInfo.countDocuments({ 
      $or: [
        { invitationCode: { $exists: false } },
        { invitationCode: '' },
        { invitationCode: null }
      ]
    });
    
    console.log(`📋 Users with invitationCode: ${usersWithInvitationCode}`);
    console.log(`📋 Users without invitationCode: ${usersWithoutInvitationCode}`);

    // Show sample of current data
    console.log('\n📋 Sample of current data (showing first 5):');
    console.log('Wallet Address | Current Invitation Code | Current Referral Code | Points');
    console.log('----------------|------------------------|----------------------|-------');
    
    const sampleUsers = await SpotifyInfo.find().limit(5);
    sampleUsers.forEach((user, index) => {
      const truncatedWallet = user.walletAddress ? user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4) : 'NO_WALLET';
      const invitationCode = user.invitationCode || 'NO_CODE';
      const referralCode = user.referralCode || 'NO_CODE';
      const points = user.point || 0;
      console.log(`${(index + 1).toString().padStart(2)}. ${truncatedWallet} | ${invitationCode.padEnd(22)} | ${referralCode.padEnd(20)} | ${points}`);
    });

    // Start updating process
    console.log('\n🔄 Starting update process...');
    
    let updatedCount = 0;
    let errors = 0;

    // Get all users
    const allUsers = await SpotifyInfo.find({});
    
    for (const user of allUsers) {
      try {
        // Generate new random referral code
        const newReferralCode = generateRandomReferralCode();
        
        // Update both invitationCode and referralCode
        const result = await SpotifyInfo.findByIdAndUpdate(
          user._id,
          {
            invitationCode: NEW_INVITATION_CODE,
            referralCode: newReferralCode
          },
          { new: true }
        );
        
        if (result) {
          updatedCount++;
          
          // Show progress for first 10 updates
          if (updatedCount <= 10) {
            const truncatedWallet = user.walletAddress ? user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4) : 'NO_WALLET';
            console.log(`✅ Updated ${truncatedWallet}: invitationCode=${NEW_INVITATION_CODE}, referralCode=${newReferralCode}`);
          }
        }
      } catch (error) {
        errors++;
        const wallet = user.walletAddress || 'UNKNOWN';
        console.error(`❌ Error updating user ${wallet}:`, error);
      }
    }

    // Show results
    console.log('\n📊 Update Results:');
    console.log(`✅ Successfully updated: ${updatedCount} users`);
    console.log(`❌ Errors during update: ${errors} users`);

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    
    const usersWithNewInvitationCode = await SpotifyInfo.countDocuments({ invitationCode: NEW_INVITATION_CODE });
    const usersWithReferralCodes = await SpotifyInfo.countDocuments({ 
      referralCode: { $exists: true, $nin: ['', null] } 
    });
    
    console.log(`Users with new invitationCode '${NEW_INVITATION_CODE}': ${usersWithNewInvitationCode}`);
    console.log(`Users with referral codes: ${usersWithReferralCodes}`);

    // Show sample of updated data
    console.log('\n📋 Sample of updated data (showing first 5):');
    console.log('Wallet Address | New Invitation Code | New Referral Code | Points');
    console.log('----------------|---------------------|-------------------|-------');
    
    const updatedSampleUsers = await SpotifyInfo.find().limit(5);
    updatedSampleUsers.forEach((user, index) => {
      const truncatedWallet = user.walletAddress ? user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4) : 'NO_WALLET';
      const invitationCode = user.invitationCode || 'NO_CODE';
      const referralCode = user.referralCode || 'NO_CODE';
      const points = user.point || 0;
      console.log(`${(index + 1).toString().padStart(2)}. ${truncatedWallet} | ${invitationCode.padEnd(21)} | ${referralCode.padEnd(19)} | ${points}`);
    });

    // Show summary
    console.log('\n📊 Summary:');
    console.log(`Total users in collection: ${totalCount}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`New invitation code assigned: ${NEW_INVITATION_CODE}`);
    console.log(`New referral codes generated: ${usersWithReferralCodes}`);
    console.log(`\n💡 All users now have:`);
    console.log(`   - invitationCode: ${NEW_INVITATION_CODE}`);
    console.log(`   - referralCode: Random 8-character code (e.g., ${generateRandomReferralCode()})`);

  } catch (err) {
    console.error('❌ Error updating spotifyInfos codes:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
updateSpotifyInfosCodes(); 