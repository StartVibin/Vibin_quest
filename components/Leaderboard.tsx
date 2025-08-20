import React, { useState, useEffect } from 'react'
import { getLeaderboard } from '@/lib/api'
import styles from './Leaderboard.module.css'

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
      
      console.log('Fetching leaderboard data...')
      const response = await getLeaderboard()
      console.log('Leaderboard response:', response)
      
      if (response.success && response.data) {
        setLeaderboardData(response.data)
      } else {
        console.error('Leaderboard API error:', response)
        setError('Failed to fetch leaderboard data')
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading leaderboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Error Loading Leaderboard</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => fetchLeaderboard()}
            className={styles.retryButton}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.leaderboardContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Vibin Leaderboard</h1>
        <p className={styles.subtitle}>Compete with the best Vibin users worldwide</p>
      </div>

      {/* Main Content Card */}
      <div className={styles.mainCard}>
        {/* Controls Header */}
        <div className={styles.controlsHeader}>
          <h2 className={styles.controlsTitle}>Top Users</h2>
          <div className={styles.controlsGroup}>
            <select 
              value={limit} 
              onChange={(e) => setLimit(Number(e.target.value))}
              className={styles.select}
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
            <button 
              onClick={() => fetchLeaderboard()}
              className={styles.refreshButton}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Table Content */}
        {leaderboardData && leaderboardData.users.length > 0 ? (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Rank</th>
                    <th>Wallet Address</th>
                    <th className={styles.textRight}>Total Points</th>
                    <th className={styles.textRight}>Game</th>
                    <th className={styles.textRight}>Referral</th>
                    <th className={styles.textRight}>Social</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {leaderboardData.users.slice(0, limit).map((user) => (
                    <tr 
                      key={user.walletAddress} 
                      className={`${getRankColor(user.rank)}`}
                    >
                      <td>
                        <span className={styles.rankBadge}>
                          {getRankBadge(user.rank)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.walletAddress}>
                          {formatWalletAddress(user.walletAddress)}
                        </span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={styles.totalPoints}>
                          {user.totalPoints.toLocaleString()}
                        </span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={`${styles.pointBadge} ${styles.gamePoints}`}>
                          {user.gamePoints.toLocaleString()}
                        </span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={`${styles.pointBadge} ${styles.referralPoints}`}>
                          {user.referralPoints.toLocaleString()}
                        </span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={`${styles.pointBadge} ${styles.socialPoints}`}>
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
              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  Showing <span>{((currentPage - 1) * limit) + 1}</span> to{' '}
                  <span>{Math.min(currentPage * limit, leaderboardData.pagination.total)}</span> of{' '}
                  <span>{leaderboardData.pagination.total}</span> users
                </div>
                <div className={styles.paginationControls}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={styles.paginationButton}
                  >
                    ← Previous
                  </button>
                  <span className={styles.paginationPage}>
                    {currentPage} / {leaderboardData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(leaderboardData.pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === leaderboardData.pagination.totalPages}
                    className={styles.paginationButton}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🏆</div>
            <h3 className={styles.emptyStateTitle}>No Leaderboard Data</h3>
            <p className={styles.emptyStateText}>No users have earned points yet. Be the first to climb the ranks!</p>
          </div>
        )}
      </div>

      {/* Stats Summary Cards */}
      {leaderboardData && (
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.blue}`}>
            <div className={styles.statValue}>{leaderboardData.pagination.total}</div>
            <div className={styles.statLabel}>Total Users</div>
          </div>
          
          <div className={`${styles.statCard} ${styles.green}`}>
            <div className={styles.statValue}>
              {leaderboardData.users.length > 0 ? leaderboardData.users[0].totalPoints.toLocaleString() : '0'}
            </div>
            <div className={styles.statLabel}>Top Score</div>
          </div>
          
          <div className={`${styles.statCard} ${styles.purple}`}>
            <div className={styles.statValue}>
              {leaderboardData.users.length > 0 ? Math.round(leaderboardData.users.reduce((sum, user) => sum + user.totalPoints, 0) / leaderboardData.users.length).toLocaleString() : '0'}
            </div>
            <div className={styles.statLabel}>Average Score</div>
          </div>
        </div>
      )}
    </div>
  )
} 