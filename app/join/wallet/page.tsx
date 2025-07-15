"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { toast } from 'react-toastify';
import styles from '../page.module.css';
import { Logo } from '@/shared/icons';

export default function WalletLoginPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const [isLoading, setIsLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [spotifyEmail, setSpotifyEmail] = useState('');

  useEffect(() => {
    // Get stored data from session storage
    const storedCode = sessionStorage.getItem('invitationCode');
    const storedEmail = sessionStorage.getItem('spotifyEmail');
    
    if (!storedCode || !storedEmail) {
      // If missing any step, redirect back to first step
      router.push('/join');
      return;
    }
    
    setInvitationCode(storedCode);
    setSpotifyEmail(storedEmail);
  }, [router]);

  const handleWalletConnect = async () => {
    if (isConnected) {
      // If already connected, complete the registration
      await completeRegistration();
      return;
    }

    setIsLoading(true);
    try {
      const connector = connectors[0]; // Use the first available connector
      if (connector) {
        await connect({ connector });
        toast.success('Wallet connected successfully!');
        await completeRegistration();
      } else {
        toast.error('No wallet connectors available');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async () => {
    try {
      // Here you would typically send all the data to your backend
      // invitationCode, spotifyEmail, and wallet address
      const registrationData = {
        invitationCode,
        spotifyEmail,
        walletAddress: address,
      };
      
      console.log('Registration data:', registrationData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear session storage
      sessionStorage.removeItem('invitationCode');
      sessionStorage.removeItem('spotifyEmail');
      
      toast.success('Registration completed successfully!');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to complete registration. Please try again.');
    }
  };

  const handleBack = () => {
    router.push('/join/spotify');
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.backgroundImage} />
      </div>
      
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <Logo />
          <h1 className={styles.title}>Welcome to the Vibin' app.</h1>
          <p className={styles.subtitle}>
            Spotify doesn't pay you for your data. We do.
          </p>
          <p className={styles.subtitle}>
            Connect your wallet to complete registration
          </p>
        </div>

        <div className={styles.loginSection}>
          <div className={styles.loginCard}>
            <div className={styles.summarySection}>
              <h3 className={styles.summaryTitle}>Registration Summary</h3>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Invitation Code:</span>
                <span className={styles.summaryValue}>{invitationCode}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Spotify Email:</span>
                <span className={styles.summaryValue}>{spotifyEmail}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Wallet Address:</span>
                <span className={styles.summaryValue}>
                  {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not connected'}
                </span>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={`${styles.loginButton} ${styles.primaryButton}`}
                onClick={handleWalletConnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.loadingSpinner} />
                ) : (
                  <>
                    <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {isConnected ? 'Complete Registration' : 'Connect Wallet'}
                  </>
                )}
              </button>
            </div>
            
            <button
              onClick={handleBack}
              className={styles.backButton}
              disabled={isLoading}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 