import React, { useState, useEffect } from 'react'
import { getReferralData, getUserReferralInfo } from '@/lib/api'
import styles from './Referral.module.css'
import { toast } from 'react-toastify'
import { Copy } from '@/shared/icons'

interface ReferralUser {
  walletAddress: string
  spotifyEmail: string
  dateOfConnection: string
  referralScoreToday: number
  totalBasePoints: number
  rank: number
}

interface ReferralData {
  users: ReferralUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  userReferralCode?: string
}

export const Referral: React.FC = () => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setCurrentLimit] = useState(100)

  console.log(setCurrentLimit);
  
  const fetchReferral = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getReferralData(currentPage, limit)
      
        
      if (response.success && response.data) {
        // Also fetch user's referral info to get their referral code
        try {
          const spotifyEmail = localStorage.getItem('spotify_email')
          if (spotifyEmail) {
            const userReferralResponse = await getUserReferralInfo(spotifyEmail)
            if (userReferralResponse.success && userReferralResponse.data) {
              setReferralData({
                ...response.data,
                userReferralCode: userReferralResponse.data.referralCode
              })
            } else {
              setReferralData(response.data)
            }
          } else {
            setReferralData(response.data)
          }
        } catch (referralError) {
          console.error('Error fetching user referral info:', referralError)
          setReferralData(response.data)
        }
      } else {
        console.error('Referral API error:', response)
        setError('Failed to fetch referral data')
      }
    } catch (err) {
      console.error('Error fetching referral:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch referral')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferral()
  }, [currentPage, limit])

  const formatWalletAddress = (address: string) => {
    if (!address || address === 'Unknown') return 'Unknown'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyReferralCode = async () => {
    const referralCode = referralData?.userReferralCode
    if (referralCode) {
      try {
        await navigator.clipboard.writeText(referralCode)
        toast.success('Referral code copied to clipboard')
      } catch (err) {
        console.error('Failed to copy referral code:', err)
      }
    }
  }

  const copyReferralLink = async () => {
    const referralCode = referralData?.userReferralCode
    if (referralCode) {
      const referralLink = `https://app.startvibin.io/invite/code?code=${referralCode}`
      try {
        await navigator.clipboard.writeText(referralLink)
        toast.success('Referral link copied to clipboard')
      } catch (err) {
        console.error('Failed to copy referral link:', err)
      }
    }
  }



  if (loading && !referralData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading Referral Page...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Error Loading Referral Page</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => fetchReferral()}
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
      <div className={styles.headerContainer}>
        <div className={styles.headerSection}>
            <h1 className={styles.title}>Referral Leaderboard</h1>
            <p className={styles.subtitle}>Track Your Referral Earnings</p>
        </div>

        {/* Top Right Section with Referral Info and Refresh Button */}
        <div className={styles.topRightSection}>

            <h2 className={styles.inviteFriendsTitle}>Invite Your Friends</h2>
            {/* Referral Code and Link Section */}
            <div className={styles.referralShareSection}>
                <div className={styles.referralShareItem}>
                    <label className={styles.referralLabel}>Referral Link</label>
                    <div className={styles.referralInputGroup}>
                      <input
                          type="text"
                          value={`app.startvibin.io/invite/code?code=${referralData?.userReferralCode || 'CODE'}`}
                          readOnly
                          className={styles.referralInput}
                      />
                      <button
                          onClick={() => copyReferralLink()}
                          className={styles.copyButton}
                          title="Copy referral link"
                      >
                          <Copy width={24} height={24} />
                      </button>
                </div>
            </div>
            
            <div className={styles.referralShareItem}>
                <label className={styles.referralLabel}>Referral Code</label>
                <div className={styles.referralInputGroup}>
                  <input
                      type="text"
                      value={referralData?.userReferralCode || 'CODE'}
                      readOnly
                      className={styles.referralInput}
                  />
                  <button
                      onClick={() => copyReferralCode()}
                      className={styles.copyButton}
                      title="Copy referral code"
                  >
                      <Copy width={24} height={24} />
                  </button>
                </div>
            </div>
          </div>

        </div>
      </div>
      

      {/* Main Content Card */}
      <div className={styles.mainCard}>
        {/* Table Content */}
        {referralData && referralData.users.length > 0 ? (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Rank</th>
                    <th>Wallet Address</th>
                    <th>Date of Connection</th>
                    <th>Referral Score Today</th>
                    <th>Total Base Points</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {referralData.users.map((user) => (
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
                        <span className={styles.trackCount}>
                          {user.dateOfConnection}
                        </span>
                      </td>
                      <td>
                        <span className={styles.scoreValue}>
                          {user.referralScoreToday}
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
            {referralData.pagination.totalPages > 0 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  Prev
                </button>
                
                <div className={styles.paginationNumbers}>
                  {Array.from({ length: Math.min(5, referralData.pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    if (pageNum === 1 || pageNum === referralData.pagination.totalPages || 
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
                  onClick={() => setCurrentPage(Math.min(referralData.pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === referralData.pagination.totalPages}
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
            <h3 className={styles.emptyStateTitle}>No Referral Data</h3>
            <p className={styles.emptyStateText}>No users have earned referral points yet. Start referring friends to earn rewards!</p>
          </div>
        )}
      </div>
    </div>
  )
} 