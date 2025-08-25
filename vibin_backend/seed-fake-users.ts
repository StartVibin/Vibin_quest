import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';

function randomString(len = 8): string {
  return Math.random().toString(36).substring(2, 2 + len);
}

function randomWalletAddress(): string {
  const hex = Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return '0x' + hex;
}

function randomPoints(): number {
  return Math.floor(Math.random() * (3000 - 100 + 1)) + 100; // 100 to 3000
}

function randomInviteCode(): string {
  return randomString(8).toUpperCase();
}

function randomSocialPoints(): number {
  return Math.floor(Math.random() * 10) * 100; // 0, 100, ..., 900
}

function randomReferralPoints(): number {
  return Math.floor(Math.random() * 2) * 500; // 0 or 500
}

function randomGamePoints(): number {
  return Math.floor(Math.random() * 300); // 0 to 299
}

async function seedFakeUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users: any[] = [];
    for (let i = 0; i < 30; i++) {
      const socialPoints = randomSocialPoints();
      const referralPoints = randomReferralPoints();
      const gamePoints = randomGamePoints();
      const totalPoints = socialPoints + referralPoints + gamePoints;
      users.push({
        walletAddress: randomWalletAddress(),
        inviteCode: randomInviteCode(),
        socialPoints,
        referralPoints,
        gamePoints,
        totalPoints,
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