import { useState, useEffect, useCallback } from 'react'
import { getLeaderboard } from '@/lib/api'
import { LeaderboardEntry } from '@/lib/types'

interface LeaderboardData {
  users: LeaderboardEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[]
  loading: boolean
  error: string | null
  refetch: () => void
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
}

export const useLeaderboard = (): UseLeaderboardReturn => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await getLeaderboard()
      
      if (data.success && data.data) {
        setLeaderboard(data.data.users || [])
        setPagination(data.data.pagination || null)
      } else {
        setError('Failed to fetch leaderboard data')
        setLeaderboard([])
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
    pagination
  }
} 