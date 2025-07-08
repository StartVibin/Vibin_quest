export interface Quest {
  id: string
  platform: 'twitter' | 'discord' | 'telegram'
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
  discordId?: string
  telegramId?: string
  createdAt: Date
  updatedAt: Date
}

export type Platform = Quest['platform']

export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}