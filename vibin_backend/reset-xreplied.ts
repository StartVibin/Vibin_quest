import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';

async function resetXReplied() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count users before update
    const totalUsers = await User.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);

    // Count users with xReplied = true
    const usersWithReplied = await User.countDocuments({ xReplied: true });
    console.log(`Users with xReplied = true: ${usersWithReplied}`);

    // Update all users to set xReplied = false
    const result = await User.updateMany(
      {}, // Update all documents
      { $set: { xReplied: false } }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} users`);
    console.log(`Total users processed: ${result.matchedCount}`);

    // Verify the update
    const usersStillReplied = await User.countDocuments({ xReplied: true });
    console.log(`Users with xReplied = true after update: ${usersStillReplied}`);

    if (usersStillReplied === 0) {
      console.log('✅ All users now have xReplied = false');
    } else {
      console.log('⚠️ Some users still have xReplied = true');
    }

  } catch (err) {
    console.error('❌ Error resetting xReplied:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetXReplied(); 