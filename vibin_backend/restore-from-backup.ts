import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';
const BACKUP_FILE = 'beatwise.users.json';

interface BackupUser {
  _id: string;
  walletAddress: string;
  referralCode?: string;
  inviteCode?: string;
  gamePoints?: number;
  referralPoints?: number;
  socialPoints?: number;
  [key: string]: any; // Allow other fields
}

async function restoreFromBackup() {
  try {
    // Check if backup file exists
    if (!fs.existsSync(BACKUP_FILE)) {
      console.error(`❌ Backup file not found: ${BACKUP_FILE}`);
      console.log('Please make sure the backup file is in the current directory');
      return;
    }

    console.log(`📁 Found backup file: ${BACKUP_FILE}`);
    
    // Read and parse backup file
    const backupData = fs.readFileSync(BACKUP_FILE, 'utf8');
    const backupUsers: BackupUser[] = JSON.parse(backupData);
    
    console.log(`📊 Backup contains ${backupUsers.length} users`);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get current user count
    const currentUserCount = await User.countDocuments();
    console.log(`📊 Current users in database: ${currentUserCount}`);

    // Check current state of users with Y0KHN8
    const usersWithY0KHN8 = await User.find({ referralCode: 'Y0KHN8' });
    console.log(`🔍 Found ${usersWithY0KHN8.length} users currently with Y0KHN8 referral code`);

    if (usersWithY0KHN8.length === 0) {
      console.log('✅ No users found with Y0KHN8 - nothing to restore!');
      return;
    }

    // Show current state
    console.log('\n📋 Current users with Y0KHN8 (showing first 5):');
    console.log('Wallet Address | Current Referral Code | Total Points');
    console.log('----------------|----------------------|-------------');
    
    usersWithY0KHN8.slice(0, 5).forEach((user) => {
      const truncatedWallet = user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4);
      const totalPoints = (user.gamePoints || 0) + (user.referralPoints || 0) + (user.socialPoints || 0);
      console.log(`${truncatedWallet} | ${user.referralCode.padEnd(20)} | ${totalPoints}`);
    });

    // Create a map of wallet address to backup data for quick lookup
    const backupMap = new Map<string, BackupUser>();
    backupUsers.forEach(user => {
      if (user.walletAddress) {
        backupMap.set(user.walletAddress.toLowerCase(), user);
      }
    });

    console.log(`\n🔄 Starting restoration process...`);
    
    let restoredCount = 0;
    let notFoundInBackup = 0;
    let errors = 0;

    // Restore referral codes for users with Y0KHN8
    for (const currentUser of usersWithY0KHN8) {
      try {
        const backupUser = backupMap.get(currentUser.walletAddress.toLowerCase());
        
        if (backupUser && backupUser.referralCode) {
          // Restore the original referral code
          await User.findByIdAndUpdate(
            currentUser._id,
            { referralCode: backupUser.referralCode },
            { new: true }
          );
          
          restoredCount++;
          
          if (restoredCount <= 5) {
            console.log(`✅ Restored ${currentUser.walletAddress.slice(0, 6)}...${currentUser.walletAddress.slice(-4)}: ${backupUser.referralCode}`);
          }
        } else {
          notFoundInBackup++;
          console.log(`⚠️ User ${currentUser.walletAddress.slice(0, 6)}...${currentUser.walletAddress.slice(-4)} not found in backup or has no referral code`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error restoring user ${currentUser.walletAddress}:`, error);
      }
    }

    // Show restoration results
    console.log('\n📊 Restoration Results:');
    console.log(`✅ Successfully restored: ${restoredCount} users`);
    console.log(`⚠️ Not found in backup: ${notFoundInBackup} users`);
    console.log(`❌ Errors during restoration: ${errors} users`);

    // Verify restoration
    console.log('\n🔍 Verifying restoration...');
    const remainingUsersWithY0KHN8 = await User.find({ referralCode: 'Y0KHN8' });
    console.log(`Users still with Y0KHN8: ${remainingUsersWithY0KHN8.length}`);

    if (remainingUsersWithY0KHN8.length === 0) {
      console.log('🎉 Restoration completed successfully! All users restored to original referral codes.');
    } else {
      console.log('⚠️ Some users still have Y0KHN8 - manual intervention may be needed');
      
      console.log('\n📋 Remaining users with Y0KHN8:');
      remainingUsersWithY0KHN8.forEach((user, index) => {
        const truncatedWallet = user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4);
        console.log(`${index + 1}. ${truncatedWallet}`);
      });
    }

    // Show sample of restored users
    console.log('\n📋 Sample of restored users (showing first 5):');
    console.log('Wallet Address | Restored Referral Code | Total Points');
    console.log('----------------|------------------------|-------------');
    
    const sampleRestoredUsers = await User.find({ 
      referralCode: { $ne: 'Y0KHN8', $exists: true, $nin: ['', null] } 
    }).limit(5);
    
    sampleRestoredUsers.forEach((user) => {
      const truncatedWallet = user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4);
      const totalPoints = (user.gamePoints || 0) + (user.referralPoints || 0) + (user.socialPoints || 0);
      console.log(`${truncatedWallet} | ${(user.referralCode || 'NO_CODE').padEnd(22)} | ${totalPoints}`);
    });

  } catch (err) {
    console.error('❌ Error during restoration:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the restoration
restoreFromBackup(); 