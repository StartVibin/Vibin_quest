"use client";

import React from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './page.module.css';
import { Logo } from '@/shared/icons';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not connected
    if (!isConnected) {
      router.push('/join');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoSection}>
          <Logo />
          <h1>Dashboard</h1>
        </div>
        <div className={styles.walletInfo}>
          <span>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Points</h3>
            <div className={styles.statValue}>1,250</div>
            <div className={styles.statChange}>+150 this week</div>
          </div>
          
          <div className={styles.statCard}>
            <h3>Quests Completed</h3>
            <div className={styles.statValue}>12</div>
            <div className={styles.statChange}>+3 this week</div>
          </div>
          
          <div className={styles.statCard}>
            <h3>Current Rank</h3>
            <div className={styles.statValue}>#42</div>
            <div className={styles.statChange}>+5 positions</div>
          </div>
          
          <div className={styles.statCard}>
            <h3>Airdropped Tokens</h3>
            <div className={styles.statValue}>125</div>
            <div className={styles.statChange}>+15 this week</div>
          </div>
        </div>

        <div className={styles.sections}>
          <div className={styles.section}>
            <h2>Recent Activity</h2>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>🎮</div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>Completed Game Quest</div>
                  <div className={styles.activityTime}>2 hours ago</div>
                </div>
                <div className={styles.activityPoints}>+50 pts</div>
              </div>
              
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>📱</div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>X Post Shared</div>
                  <div className={styles.activityTime}>1 day ago</div>
                </div>
                <div className={styles.activityPoints}>+25 pts</div>
              </div>
              
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>📧</div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>Telegram Group Joined</div>
                  <div className={styles.activityTime}>3 days ago</div>
                </div>
                <div className={styles.activityPoints}>+100 pts</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Available Quests</h2>
            <div className={styles.questList}>
              <div className={styles.questItem}>
                <div className={styles.questIcon}>🎯</div>
                <div className={styles.questContent}>
                  <div className={styles.questTitle}>Daily Check-in</div>
                  <div className={styles.questDescription}>Log in daily to earn points</div>
                </div>
                <button className={styles.questButton}>Start</button>
              </div>
              
              <div className={styles.questItem}>
                <div className={styles.questIcon}>📱</div>
                <div className={styles.questContent}>
                  <div className={styles.questTitle}>Share on X</div>
                  <div className={styles.questDescription}>Share our latest post</div>
                </div>
                <button className={styles.questButton}>Start</button>
              </div>
              
              <div className={styles.questItem}>
                <div className={styles.questIcon}>📧</div>
                <div className={styles.questContent}>
                  <div className={styles.questTitle}>Join Telegram</div>
                  <div className={styles.questDescription}>Join our community group</div>
                </div>
                <button className={styles.questButton}>Start</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 