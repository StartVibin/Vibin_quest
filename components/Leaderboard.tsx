import React, { useState, useEffect } from 'react'
import { getLeaderboard } from '@/lib/api'
import styles from './Leaderboard.module.css'

interface LeaderboardUser {
  walletAddress: string
  spotifyEmail: string
  tracksPlayedCount: number
  diversityScore: number
  historyScore: number
  referralScore: number
  totalBasePoints: number
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

interface BackendUserData {
  walletAddress?: string;
  spotifyEmail?: string;
  tracksPlayedCount?: number;
  diversityScore?: number;
  historyScore?: number;
  referralScore?: number;
  totalBasePoints?: number;
  // Legacy fields for backward compatibility
  totalPoints?: number;
  gamePoints?: number;
  referralPoints?: number;
  socialPoints?: number;
  rank: number;
}

export const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(100)

  console.log(setLimit);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getLeaderboard()
      
      if (response.success && response.data) {
        // Transform the data to match the new scoring system
        const transformedData = {
          ...response.data,
          users: response.data.users.map((user: BackendUserData) => ({
            walletAddress: user.walletAddress || 'Unknown',
            spotifyEmail: user.spotifyEmail || '',
            tracksPlayedCount: user.tracksPlayedCount || user.totalPoints || 0,
            diversityScore: user.diversityScore || user.gamePoints || 0,
            historyScore: user.historyScore || user.referralPoints || 0,
            referralScore: user.referralScore || user.socialPoints || 0,
            totalBasePoints: user.totalBasePoints || (user.tracksPlayedCount || user.totalPoints || 0) + (user.diversityScore || user.gamePoints || 0) + (user.historyScore || user.referralPoints || 0) + (user.referralScore || user.socialPoints || 0),
            rank: user.rank
          }))
        };
        setLeaderboardData(transformedData);
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
        <h1 className={styles.title}>Leaderboard</h1>
        <p className={styles.subtitle}>Identity Revealed</p>
      </div>

      {/* Main Content Card */}
      <div className={styles.mainCard}>
        {/* Table Content */}
        {leaderboardData && leaderboardData.users.length > 0 ? (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Rank</th>
                    <th>Wallet Address</th>
                    <th>Quantity Score</th>
                    <th>Diversity Score</th>
                    <th>History Score</th>
                    <th>Referral Score</th>
                    <th>Total Base Points</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {leaderboardData.users.slice(0, limit).map((user) => (
                    <tr key={user.walletAddress} className={styles.tableRow}>
                      <td>
                        <span className={styles.rankBadge}>
                          #{user.rank}
                        </span>
                      </td>
                      <td>
                        <span className={styles.walletAddress}>
                          {formatWalletAddress(user.walletAddress)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.scoreValue}>
                          {user.tracksPlayedCount}
                        </span>
                      </td>
                      <td>
                        <span className={styles.scoreValue}>
                          {user.diversityScore}
                        </span>
                      </td>
                      <td>
                        <span className={styles.scoreValue}>
                          {user.historyScore}
                        </span>
                      </td>
                      <td>
                        <span className={styles.scoreValue}>
                          {user.referralScore}
                        </span>
                      </td>
                      <td>
                        <span className={styles.scoreValue}>
                          {user.totalBasePoints}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {leaderboardData.pagination.totalPages > 0 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  Prev
                </button>
                
                <div className={styles.paginationNumbers}>
                  {Array.from({ length: Math.min(5, leaderboardData.pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    if (pageNum === 1 || pageNum === leaderboardData.pagination.totalPages || 
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`${styles.pageNumber} ${currentPage === pageNum ? styles.activePage : ''}`}
                        >
                          {pageNum}
                        </button>
                      )
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className={styles.ellipsis}>...</span>
                    }
                    return null
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(leaderboardData.pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === leaderboardData.pagination.totalPages}
                  className={styles.paginationButton}
                >
                  Next
                </button>
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
    </div>
  )
} 