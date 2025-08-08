import React, { useState, useEffect } from 'react'
import { getLeaderboard } from '@/lib/api'

interface LeaderboardUser {
  walletAddress: string
  totalPoints: number
  gamePoints: number
  referralPoints: number
  socialPoints: number
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

export const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(100)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getLeaderboard()
      
      if (response.success && response.data) {
        setLeaderboardData(response.data)
      } else {
        setError('Failed to fetch leaderboard data')
      }
    } catch (err) {
      //console.error('Error fetching leaderboard:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const formatWalletAddress = (address: string) => {
    if (!address) return 'Unknown'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    if (rank === 2) return 'bg-gray-100 border-gray-300 text-gray-800'
    if (rank === 3) return 'bg-orange-100 border-orange-300 text-orange-800'
    return 'bg-white border-gray-200 text-gray-700'
  }

  if (loading && !leaderboardData) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Leaderboard</h3>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button 
          onClick={() => fetchLeaderboard()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
        <div className="flex items-center space-x-4">
          <select 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <button 
            onClick={() => fetchLeaderboard()}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {leaderboardData && leaderboardData.users.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Wallet</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Points</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Game</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Referral</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Social</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.users.map((user) => (
                  <tr 
                    key={user.walletAddress} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getRankColor(user.rank)}`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-semibold text-lg">
                        {getRankBadge(user.rank)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-600">
                        {formatWalletAddress(user.walletAddress)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-lg text-blue-600">
                        {user.totalPoints.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm text-gray-600">
                        {user.gamePoints.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm text-gray-600">
                        {user.referralPoints.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm text-gray-600">
                        {user.socialPoints.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {leaderboardData.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, leaderboardData.pagination.total)} of {leaderboardData.pagination.total} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {currentPage} of {leaderboardData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(leaderboardData.pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === leaderboardData.pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Leaderboard Data</h3>
          <p className="text-gray-500">No users have earned points yet. Be the first!</p>
        </div>
      )}

      {/* Stats Summary */}
      {leaderboardData && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {leaderboardData.pagination.total}
              </div>
              <div className="text-sm text-blue-600">Total Users</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {leaderboardData.users.length > 0 ? leaderboardData.users[0].totalPoints.toLocaleString() : '0'}
              </div>
              <div className="text-sm text-green-600">Top Score</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {leaderboardData.users.length > 0 ? Math.round(leaderboardData.users.reduce((sum, user) => sum + user.totalPoints, 0) / leaderboardData.users.length).toLocaleString() : '0'}
              </div>
              <div className="text-sm text-purple-600">Avg Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 