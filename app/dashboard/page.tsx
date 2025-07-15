"use client";

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import styles from './page.module.css';

import { useSpotifyData } from '@/lib/hooks/useSpotifyData';

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const [timeLeft] = useState('23:02:13');
  const [userLevel] = useState(23);
  const [contributeReward] = useState(123.02);
  
  // Use the Spotify data hook (refreshes every minute)
  const { data: spotifyData, isLoading, error, lastUpdated } = useSpotifyData(60000);

  // Extract data from the hook
  const topTracks = spotifyData?.topTracks || [];
  const topArtists = spotifyData?.topArtists || [];
  const listeningStats = spotifyData?.stats ? [
    { 
      value: spotifyData.stats.totalSavedTracks, 
      label: "Tracks Played", 
      icon: "🎵" 
    },
    { 
      value: spotifyData.stats.uniqueArtists, 
      label: "Unique Artists", 
      icon: "👤" 
    },
    { 
      value: `${spotifyData.stats.listeningSessions} sessions`, 
      label: "Listening Sessions", 
      icon: "🎧" 
    },
    { 
      value: spotifyData.stats.uniqueTracks, 
      label: "Unique Tracks", 
      icon: "😴" 
    },
  ] : [];

  // Mock data for score breakdown
  const scoreBreakdown = [
    { name: "Volume Score", value: 125, icon: "🔊" },
    { name: "Diversity Score", value: 125, icon: "👤" },
    { name: "History Score", value: 125, icon: "⏰" },
    { name: "Referral Score", value: 125, icon: "🔗" },
  ];



  const handleClaimReward = () => {
    toast.success('Reward claimed successfully!');
  };

  const handleShareInsights = () => {
    toast.info('Sharing insights...');
  };

  useEffect(() => {
    // Check if user is connected
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
  }, [isConnected]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Show success toast when data is loaded
  useEffect(() => {
    if (spotifyData && !isLoading) {
      toast.success('Spotify data loaded successfully!');
    }
  }, [spotifyData, isLoading]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1DB954',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Loading your Spotify data...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      {/* <header className={styles.header}>
        <div className={styles.logo}>
          <Logo />
          <span>VIBIN</span>
        </div>
        
        <nav className={styles.navigation}>
          <a href="/dashboard" className={`${styles.navLink} ${styles.active}`}>
            Dashboard
          </a>
          <a href="/quest" className={styles.navLink}>
            Quest
          </a>
          <a href="/staking" className={styles.navLink}>
            Staking
          </a>
          <a href="#" className={styles.navLink}>
            Burn (Coming Soon)
          </a>
        </nav>
        
        <button className={styles.connectWallet}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Connect Wallet
        </button>
      </header> */}

      {/* Main Content */}
      <main className={styles.main}>
        {/* Top Section - Identity & Rewards */}
        <section className={styles.topSection}>
          <div className={styles.identitySection}>
            <h1 className={styles.identityTitle}>Your Musical</h1>
            <h2 className={styles.identitySubtitle}>Identity Revealed</h2>
          </div>
          
          <div className={styles.rewardCard}>
            <div className={styles.rewardHeader}>
              <div className={styles.claimTimer}>
                Next claim: {timeLeft}
              </div>
              <div className={styles.userLevel}>
                your LVL: {userLevel}
                <div className={styles.levelIcon}>⭐</div>
              </div>
            </div>
            
            <div className={styles.rewardAmount}>
              Contribute Reward: {contributeReward}
              <span className={styles.currencySymbol}>λ</span>
            </div>
            
            <button onClick={handleClaimReward} className={styles.claimButton}>
              CLAIM REWARD
            </button>
            
            <div className={styles.eligibility}>
              Eligibility to Claim
              <span className={styles.infoIcon}>ℹ️</span>
            </div>
            
                      <button onClick={handleShareInsights} className={styles.shareButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Share Insights
          </button>
          
          {lastUpdated && (
            <div className={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          </div>
        </section>

        {/* Middle Section - Data Panels */}
        <section className={styles.middleSection}>
          {/* Top Tracks Panel */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Top Tracks</h3>
            <div className={styles.panelContent}>
              {topTracks.map((track, index) => (
                <div key={track.id} className={styles.listItem}>
                  <div className={`${styles.numberCircle} ${styles.purpleGradient}`}>
                    #{index + 1}
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{track.name}</div>
                    <div className={styles.itemSubtext}>{track.artist}</div>
                  </div>
                  <div className={styles.itemIcon}>▶️</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Artist Panel */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Top Artist</h3>
            <div className={styles.panelContent}>
              {topArtists.map((artist, index) => (
                <div key={artist.id} className={styles.listItem}>
                  <div className={`${styles.numberCircle} ${styles.blueGradient}`}>
                    #{index + 1}
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{artist.name}</div>
                  </div>
                  <div className={styles.itemIcon}>▶️</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Breakdown Panel */}
          <div className={`${styles.panel} ${styles.scorePanel}`}>
            <h3 className={styles.panelTitle}>Score Breakdown</h3>
            <div className={styles.panelContent}>
              {scoreBreakdown.map((score, index) => (
                <div key={index} className={styles.scoreItem}>
                  <div className={styles.scoreInfo}>
                    <span className={styles.scoreIcon}>{score.icon}</span>
                    <span className={styles.scoreName}>{score.name}</span>
                  </div>
                  <span className={styles.scoreValue}>{score.value}</span>
                </div>
              ))}
              <div className={styles.totalScore}>
                <div className={styles.totalInfo}>
                  <span className={styles.totalIcon}>🏆</span>
                  <span className={styles.totalLabel}>Total Base Points</span>
                </div>
                <span className={styles.totalValue}>789</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section - Listening Stats */}
        <section className={styles.bottomSection}>
          <h3 className={styles.sectionTitle}>Your Listening Stats</h3>
          <div className={styles.statsGrid}>
            {listeningStats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer - Technical Details */}
        <section className={styles.footer}>
          <h3 className={styles.sectionTitle}>Technical Details</h3>
          <div className={styles.technicalGrid}>
            <div className={styles.technicalColumn}>
              <div className={styles.technicalItem}>
                <span className={styles.technicalLabel}>Contributor</span>
                <span className={styles.technicalValue}>Oxasf1da.3123</span>
              </div>
              <div className={styles.technicalItem}>
                <span className={styles.technicalLabel}>Version</span>
                <span className={styles.technicalValue}>1.1.1.1</span>
              </div>
            </div>
            <div className={styles.technicalColumn}>
              <div className={styles.technicalItem}>
                <span className={styles.technicalLabel}>Account Hash</span>
                <span className={styles.technicalValue}>Oxasf1da.3123</span>
              </div>
              <div className={styles.technicalItem}>
                <span className={styles.technicalLabel}>Data Source</span>
                <span className={styles.technicalValue}>IPFS</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 