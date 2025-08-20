"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import styles from '../page.module.css';
import AuthGuard from '@/components/AuthGuard';

import LeftHalfModal from '@/components/LeftHalfModal';

function CompletionContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const spotifyEmail = localStorage.getItem('spotify_email');
    const spotifyId = localStorage.getItem('spotify_id');
    const spotifyAccessToken = localStorage.getItem('spotify_access_token');
    
    if (!spotifyEmail || !spotifyId || !spotifyAccessToken) {
      toast.error('Missing Spotify data. Please connect Spotify first.');
      router.push('/join/spotify');
      return;
    }
  }, [router]);

  const handleCompleteRegistration = async () => {
    setIsLoading(true);
    try {
      // const invitationCode = localStorage.getItem('invitation_code');
      const spotifyId = localStorage.getItem('spotify_id');
      const spotifyEmail = localStorage.getItem('spotify_email');
      // const spotifyName = localStorage.getItem('spotify_name');
      const spotifyAccessToken = localStorage.getItem('spotify_access_token');
      
      // const registrationData = {
      //   invitationCode,
      //   spotifyId,
      //   spotifyEmail,
      //   spotifyName,
      //   spotifyAccessToken,
      // };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // localStorage.removeItem('invitation_code');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('spotify_oauth_state');
      // Don't remove spotifyEmail - it's needed for AuthGuard
      
      // Set cookies for middleware access
      document.cookie = `spotify_id=${spotifyId}; path=/; max-age=86400`;
      document.cookie = `spotify_email=${spotifyEmail}; path=/; max-age=86400`;
      document.cookie = `spotify_access_token=${spotifyAccessToken}; path=/; max-age=86400`;
      
      toast.success('Registration completed successfully!');
      
      // Add a small delay to ensure the toast is visible and localStorage is updated
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/join/wallet');
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.backgroundImage} />
      </div>
      
      <LeftHalfModal>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            <div className={styles.stepIndicator}>Step 4 / 4</div>
            <h1 className={styles.title}>Complete registration</h1>
            <p className={styles.subtitle}>
              You&apos;re almost there! Complete your registration to start earning.
            </p>
          </div>

          <div className={styles.completionSection}>
            <div className={styles.completionChecklist}>
              <div className={styles.checklistItem}>
                <div className={styles.checkIcon}>✓</div>
                <span>Invitation code verified</span>
              </div>
              <div className={styles.checklistItem}>
                <div className={styles.checkIcon}>✓</div>
                <span>Spotify account connected</span>
              </div>
              <div className={styles.checklistItem}>
                <div className={styles.checkIcon}>✓</div>
                <span>Wallet connected</span>
              </div>
            </div>

            <div className={styles.benefitsSection}>
              <h3>What you&apos;ll get:</h3>
              <ul className={styles.benefitsList}>
                <li>Earn points for your Spotify data</li>
                <li>Access to exclusive rewards</li>
                <li>Early access to new features</li>
                <li>Referral bonuses</li>
              </ul>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              onClick={handleCompleteRegistration}
              className={styles.completeButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={styles.loadingSpinner} />
              ) : (
                'Complete Registration'
              )}
            </button>
            
            <button
              onClick={handleBack}
              className={styles.backButton}
              disabled={isLoading}
            >
              ← Back
            </button>
          </div>
        </div>
      </LeftHalfModal>
    </div>
  );
}

export default function CompletionPage() {
  return (
    <AuthGuard requireFullAuth={false}>
      <CompletionContent />
    </AuthGuard>
  );
}


