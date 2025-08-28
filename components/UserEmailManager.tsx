"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getUserByEmail, updateUserByEmail, getIncompleteUsers, getWalletAddressStatus } from '@/lib/api';
import styles from './Leaderboard.module.css';

interface IncompleteUser {
  spotifyEmail: string;
  totalBasePoints: number;
  referralScore: number;
  updatedAt: string;
  createdAt: string;
}

interface WalletStatus {
  totalUsers: number;
  usersWithWallet: number;
  usersWithoutWallet: number;
  completionRate: number;
}

interface UserData {
  spotifyEmail: string;
  walletAddress: string | null;
  referralCode: string;
  invitationCode: string;
  referrerEmail: string;
  totalBasePoints: number;
  referralScore: number;
  referralScoreToday: number;
  volumeScore: number;
  diversityScore: number;
  historyScore: number;
  tracksPlayedCount: number;
  uniqueArtistCount: number;
  listeningTime: number;
  updatedAt: string;
  createdAt: string;
}

export const UserEmailManager: React.FC = () => {
  const [incompleteUsers, setIncompleteUsers] = useState<IncompleteUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Fetch incomplete users and wallet status on component mount
  useEffect(() => {
    fetchIncompleteUsers();
    fetchWalletStatus();
  }, []);

  const fetchIncompleteUsers = async () => {
    try {
      setLoading(true);
      const response = await getIncompleteUsers();
      
      if (response.success) {
        setIncompleteUsers(response.data.users);
        toast.success(`Found ${response.data.count} users with incomplete data`);
      } else {
        toast.error('Failed to fetch incomplete users');
      }
    } catch (error) {
      console.error('Error fetching incomplete users:', error);
      toast.error('Failed to fetch incomplete users');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletStatus = async () => {
    try {
      const response = await getWalletAddressStatus();
      
      if (response.success) {
        setWalletStatus(response.data);
      } else {
        toast.error('Failed to fetch wallet status');
      }
    } catch (error) {
      console.error('Error fetching wallet status:', error);
      toast.error('Failed to fetch wallet status');
    }
  };

  const handleUserSelect = async (email: string) => {
    try {
      setLoading(true);
      const response = await getUserByEmail(email);
      
      if (response.success) {
        setSelectedUser(response.data);
        setWalletAddress(response.data.walletAddress || '');
        toast.success('User data loaded successfully');
      } else {
        toast.error('Failed to load user data');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !walletAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    try {
      setUpdating(true);
      const response = await updateUserByEmail(selectedUser.spotifyEmail, {
        walletAddress: walletAddress.trim()
      });
      
      if (response.success) {
        toast.success('User updated successfully');
        // Refresh the incomplete users list
        await fetchIncompleteUsers();
        // Clear selected user
        setSelectedUser(null);
        setWalletAddress('');
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefresh = () => {
    fetchIncompleteUsers();
  };

  return (
    <div className={styles.leaderboardContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>User Email Manager</h1>
        <p className={styles.subtitle}>Manage incomplete user data and ensure all documents are complete</p>
        
        {/* Wallet Status Overview */}
        {walletStatus && (
          <div className={styles.walletStatusOverview}>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>Total Users:</span>
              <span className={styles.statusValue}>{walletStatus.totalUsers}</span>
            </div>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>With Wallet:</span>
              <span className={styles.statusValue} style={{ color: '#28a745' }}>{walletStatus.usersWithWallet}</span>
            </div>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>Without Wallet:</span>
              <span className={styles.statusValue} style={{ color: '#dc3545' }}>{walletStatus.usersWithoutWallet}</span>
            </div>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>Completion Rate:</span>
              <span className={styles.statusValue} style={{ color: '#007bff' }}>{walletStatus.completionRate}%</span>
            </div>
          </div>
        )}
        
        {/* Refresh Button */}
        <button 
          onClick={handleRefresh}
          className={styles.refreshButton}
          disabled={loading}
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainCard}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <div className={styles.loadingText}>Loading...</div>
          </div>
        ) : (
          <>
            {/* Incomplete Users List */}
            <div className={styles.tableContainer}>
              <h3>Users Missing Wallet Address ({incompleteUsers.length})</h3>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Email</th>
                    <th>Total Points</th>
                    <th>Referral Score</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {incompleteUsers.map((user) => (
                    <tr key={user.spotifyEmail} className={styles.tableRow}>
                      <td>
                        <span className={styles.walletAddress}>
                          {user.spotifyEmail}
                        </span>
                      </td>
                      <td>
                        <span className={styles.scoreValue}>
                          {user.totalBasePoints}
                        </span>
                      </td>
                      <td>
                        <span className={styles.scoreValue}>
                          {user.referralScore}
                        </span>
                      </td>
                      <td>
                        <span className={styles.trackCount}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className={styles.trackCount}>
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleUserSelect(user.spotifyEmail)}
                          className={styles.copyButton}
                          style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* User Update Form */}
            {selectedUser && (
              <div className={styles.referralShareSection} style={{ marginTop: '2rem' }}>
                <h3>Update User: {selectedUser.spotifyEmail}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className={styles.referralLabel}>Wallet Address</label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter wallet address"
                      className={styles.referralInput}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={handleUpdateUser}
                      className={styles.refreshButton}
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Update User'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setWalletAddress('');
                      }}
                      className={styles.retryButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {incompleteUsers.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>✅</div>
                <h3 className={styles.emptyStateTitle}>All Users Complete</h3>
                <p className={styles.emptyStateText}>All users have complete data with wallet addresses!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
