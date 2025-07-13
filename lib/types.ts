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
  xConnected: boolean;
  telegramId: string;
  telegramJoined: boolean;

  isWhitelist: boolean;
  referralCode: string;
  referralPoints: number;
  gamePoints: number;
  socialPoints: number;
  totalPoints: number;
};

export interface UserProfile {
  walletAddress: string
  telegramVerified: boolean
  telegramJoined: boolean
  xConnected: boolean
  xFollowed: boolean
  xReplied: boolean
  xReposted: boolean
  xPosted: boolean
  telegramConnected: boolean
  telegramJoinedGroup: boolean
  emailConnected: boolean
  xId: string
  telegramId: string
  xUsername: string
  xDisplayName: string
  xProfileImageUrl: string
  xVerified: boolean
  telegramUsername: string
  telegramFirstName: string
  telegramLastName: string
  telegramPhotoUrl: string
  email: string
  googleId: string
  googleName: string
  googlePicture: string
  googleVerifiedEmail: boolean
  inviteCode: string
  invitedBy: string
  invitedUsers: string[]
  gamePoints: number
  referralPoints: number
  socialPoints: number
  referralCode: string
  isWhitelist: boolean
  highScore: number
  createdAt: Date
  updatedAt: Date
  totalPoints: number
}

// Telegram Auth Data Types
export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// X (Twitter) User Data Types
export interface XUserData {
  id: string;
  username: string;
  name: string;
  profile_image_url: string;
  verified: boolean;
  protected?: boolean;
  created_at?: string;
  description?: string;
  location?: string;
  url?: string;
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
}

// Google User Data Types
export interface GoogleUserData {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture: string;
  locale?: string;
  hd?: string;
}

// Quest Progress Data Types
export interface QuestProgressData {
  walletAddress: string;
  telegramVerified: boolean;
  telegramJoined: boolean;
  xConnected: boolean;
  xFollowed: boolean;
  xReplied: boolean;
  xReposted: boolean;
  xPosted: boolean;
  telegramConnected: boolean;
  telegramJoinedGroup: boolean;
  emailConnected: boolean;
  totalPoints: number;
  gamePoints: number;
  referralPoints: number;
  socialPoints: number;
}

// Toast Types
export interface ToastInstance {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

export interface ToastOptions {
  position?: string;
  autoClose?: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
}