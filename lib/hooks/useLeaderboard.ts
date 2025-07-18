import { useState, useEffect } from 'react'
import { getLeaderboard } from '@/lib/api'

interface LeaderboardUser {
  walletAddress: string
  totalPoints: number
  gamePoints: number
  referralPoints: number
  socialPoints: number
  airdroped?: number
  rank: number
}

interface LeaderboardData {
  users: LeaderboardUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseLeaderboardReturn {
  leaderboardData: LeaderboardData | null
  loading: boolean
  error: string | null
  currentPage: number
  limit: number
  refetch: () => void
  setCurrentPage: (page: number) => void
  setLimit: (limit: number) => void
}

export const useLeaderboard = (): UseLeaderboardReturn => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      //console.log('🔄 Fetching leaderboard data...')
      const response = await getLeaderboard()
      
      if (response.success && response.data) {
        //console.log('✅ Leaderboard data received:', response.data)
        //console.log('🔍 Sample user data:', response.data.users[0])
        setLeaderboardData(response.data)
      } else {
        //console.error('❌ Failed to fetch leaderboard data')
        setError('Failed to fetch leaderboard data')
      }
    } catch (err) {
      //console.error('❌ Error fetching leaderboard:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard()

    // Set up interval for periodic updates (every 5 seconds)
    const interval = setInterval(() => {
      //console.log('⏰ Periodic leaderboard fetch triggered (5s interval)')
      fetchLeaderboard()
    }, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [currentPage, limit])

  return {
    leaderboardData,
    loading,
    error,
    currentPage,
    limit,
    refetch: fetchLeaderboard,
    setCurrentPage,
    setLimit
  }
} 