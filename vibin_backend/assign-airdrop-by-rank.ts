import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin';

const airdropList = [
  500000, 300000, 200000, 100000, 90000, 80000, 70000, 60000, 50000, 40000, 30000, 29000, 28000, 27000, 26000, 25000, 24000, 23000, 22000, 21000, 20000, 19000, 18000, 17000, 16000, 15000, 14000, 13000, 12000, 11000, 10000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000
];

function formatK(amount: number): string {
  if (amount >= 1000) {
    return (amount / 1000) + 'k';
  }
  return amount.toString();
}

async function assignAirdropByRank() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users sorted by totalPoints descending
    const users = await User.find().sort({ totalPoints: -1 });

    for (let i = 0; i < users.length; i++) {
      const airdropAmount = i < airdropList.length ? airdropList[i] : airdropList[airdropList.length - 1];
      users[i].airdroped = airdropAmount;
      await users[i].save();
      console.log(`Rank ${i + 1}: ${users[i].walletAddress} - ${formatK(airdropAmount)}`);
    }

    console.log('Airdrop assignment complete.');
  } catch (err) {
    console.error('Error assigning airdrop:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

assignAirdropByRank(); 