const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import the User model using the same schema as your app
const User = require('./src/models/User').default || require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';

function randomString(len = 8) {
  return Math.random().toString(36).substring(2, 2 + len);
}

async function seedFakeUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = [];
    for (let i = 0; i < 30; i++) {
      const walletAddress = `0xFAKE${i}${randomString(34 - ('' + i).length)}`.toLowerCase();
      const xId = `xid_${randomString(10)}_${i}`;
      const telegramId = `${100000 + i}`;
      const email = `user${i}@example.com`;
      users.push({
        walletAddress,
        xId,
        xUsername: `xuser${i}`,
        xDisplayName: `Fake X User ${i}`,
        xProfileImageUrl: '',
        xVerified: false,
        xConnected: true,
        telegramId,
        telegramUsername: `tguser${i}`,
        telegramFirstName: `TG${i}`,
        telegramLastName: `User${i}`,
        telegramPhotoUrl: '',
        telegramVerified: true,
        telegramConnected: true,
        email,
        emailConnected: true,
        socialPoints: 0,
        referralPoints: 0,
        totalPoints: 0,
        invitedBy: null,
        inviteCode: null,
        invitedUsers: [],
        spotifyId: null,
        spotifyConnected: false
      });
    }

    const result = await User.insertMany(users);
    console.log(`Inserted ${result.length} fake users.`);
  } catch (err) {
    console.error('Error seeding fake users:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedFakeUsers(); 