import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { getUserProfile } from '@/lib/api'

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

interface UseUserProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { address, isConnected } = useAccount()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    //console.log('🔍 Fetching profile for:', { address, isConnected })
    
    if (!address || !isConnected) {
      //console.log('❌ No address or not connected, clearing profile')
      setProfile(null)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      //console.log('📡 Making API call to getUserProfile with address:', address)
      
      const data = await getUserProfile(address)
      //console.log('✅ API response:', data)
      
      setProfile(data)
    } catch (err) {
      //console.error('❌ Error fetching user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }, [address, isConnected])

  // Memoize the profile to prevent unnecessary re-renders
  const memoizedProfile = useMemo(() => profile, [profile])

  useEffect(() => {
    //console.log('🔄 useEffect triggered:', { address, isConnected })
    
    if (!address || !isConnected) {
      setProfile(null)
      setError(null)
      return
    }

    // Initial fetch
    fetchProfile()

    // Set up interval for periodic updates (every 30 seconds instead of 3)
    const interval = setInterval(() => {
      //console.log('⏰ Periodic profile fetch triggered')
      fetchProfile()
    }, 30000)

    return () => clearInterval(interval)
  }, [address, isConnected, fetchProfile])

  //console.log('📊 Current state:', { profile: memoizedProfile, loading, error })

  return {
    profile: memoizedProfile,
    loading,
    error,
    refetch: fetchProfile
  }
} 