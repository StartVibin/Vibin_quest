export interface Quest {
  id: string
  platform: 'twitter' | 'telegram'
  title: string
  points: number
  bonus: number
  icon?: string
}

export interface LeaderboardEntry {
  rank: number
  walletAddress: string
  totalPoints: number
  gamePoints: number
  referralPoints: number
  socialPoints: number
}

export interface UserStats {
  gamePoints: number
  highScore: number
  socialPoints: number
  totalPoints: number
}

export interface User {
  id: string
  walletAddress: string
  name?: string
  gamePoints: number
  highScore: number
  socialPoints: number
  totalPoints: number
  xId?: string

  telegramId?: string
  createdAt: Date
  updatedAt: Date
}

export type Platform = Quest['platform']

export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export type WalletAuthUser = {
  id: string;
  createdAt: string;
  updatedAt: string;
  walletAddress: string;
  xId: string;
  xJoined: boolean;
  telegramId: string;
  telegramJoined: boolean;

  isWhitelist: boolean;
  referralCode: string;
  referralPoints: number;
  gamePoints: number;
  socialPoints: number;
  totalPoints: number;
};