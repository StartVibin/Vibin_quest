"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { toast } from 'react-toastify';
import styles from '../page.module.css';
import { Logo } from '@/shared/icons';
import LeftHalfModal from '@/components/LeftHalfModal';

export default function SpotifyLoginPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');

  useEffect(() => {
    // Get invitation code from session storage
    const storedCode = sessionStorage.getItem('invitationCode');
    if (!storedCode) {
      // If no invitation code, redirect back to first step
      router.push('/join');
      return;
    }
    setInvitationCode(storedCode);
  }, [router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your Spotify email');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically validate the email with your backend
      // For now, we'll simulate a successful validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store the email in session storage
      sessionStorage.setItem('spotifyEmail', email);
      
      // Navigate to wallet connection step
      router.push('/join/wallet');
    } catch (error) {
      console.error('Email validation error:', error);
      toast.error('Invalid email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/join');
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.backgroundImage} />
      </div>
      
      <LeftHalfModal>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            <h1 className={styles.title}>Welcome to <br/>the Vibin' app.</h1>
            <p className={styles.subtitle}>
              Spotify doesn't pay you for your data. We do.
            </p>
            <p className={styles.subtitle}>
              Enter your Spotify account email
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Spotify email"
                  className={styles.input}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={styles.continueButton}
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <div className={styles.loadingSpinner} />
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </form>
          
          <button
            onClick={handleBack}
            className={styles.backButton}
            disabled={isLoading}
          >
            ← Back
          </button>
        </div>
      </LeftHalfModal>
    </div>
  );
} 