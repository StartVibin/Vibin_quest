"use client";

import React, { useState, useEffect } from 'react';
import { Referral } from '@/components/Referral';
import { getUserReferralInfo } from '@/lib/api';
import styles from './page.module.css';

interface ReferralUser {
  walletAddress: string;
  spotifyEmail: string;
  referralCode: string;
  referralScore: number;
  referralScoreToday: number;
  volumeScore: number;
  diversityScore: number;
  historyScore: number;
}

export default function ReferralPage() {
  const [userReferralInfo, setUserReferralInfo] = useState<ReferralUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  console.log(loading, userEmail, userReferralInfo);
  
  useEffect(() => {
    // Get user's Spotify email from localStorage
    const spotifyEmail = localStorage.getItem('spotify_email');
    if (spotifyEmail) {
      setUserEmail(spotifyEmail);
      fetchUserReferralInfo(spotifyEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserReferralInfo = async (email: string) => {
    try {
      const response = await getUserReferralInfo(email);
      if (response.success) {
        setUserReferralInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching user referral info:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.container}>
      {/* Main Referral Table */}
      <Referral />
    </div>
  );
}
