import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';

async function resetXReposted() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count users before update
    const totalUsers = await User.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);

    // Count users with xReposted = true
    const usersWithReposted = await User.countDocuments({ xReposted: true });
    console.log(`Users with xReposted = true: ${usersWithReposted}`);

    // Update all users to set xReposted = false
    const result = await User.updateMany(
      {}, // Update all documents
      { $set: { xReposted: false } }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} users`);
    console.log(`Total users processed: ${result.matchedCount}`);

    // Verify the update
    const usersStillReposted = await User.countDocuments({ xReposted: true });
    console.log(`Users with xReposted = true after update: ${usersStillReposted}`);

    if (usersStillReposted === 0) {
      console.log('✅ All users now have xReposted = false');
    } else {
      console.log('⚠️ Some users still have xReposted = true');
    }

  } catch (err) {
    console.error('❌ Error resetting xReposted:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetXReposted(); 