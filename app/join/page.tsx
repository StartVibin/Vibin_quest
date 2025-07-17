"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import styles from './page.module.css';

import LeftHalfModal from '@/components/LeftHalfModal';

export default function JoinPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [invitationCode, setInvitationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Temporarily disable join functionality - redirect to home page
    toast.info('Join functionality is temporarily disabled. Please check back later.');
    router.push('/');
    return;
    
    // Check if wallet is connected
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      // Since we removed the wallet page, redirect to main page or show wallet connection
      return;
    }
  }, [isConnected, router]);

  const handleInvitationCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitationCode.trim()) {
      toast.error('Please enter an invitation code');
      return;
    }

    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically validate the invitation code with your backend
      // For now, we'll simulate a successful validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store the invitation code and wallet address in session storage for the next step
      sessionStorage.setItem('invitationCode', invitationCode);
      sessionStorage.setItem('walletAddress', address);
      
      // Navigate to the next step (Spotify email entry)
      router.push('/join/spotify');
    } catch (error) {
      console.error('Invitation code error:', error);
      toast.error('Invalid invitation code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.backgroundImage} />
      </div>
      
      <LeftHalfModal>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            
            <h1 className={styles.title}>Welcome to <br/>the Vibin&apos; app.</h1>
            <p className={styles.subtitle}>
              Spotify doesn&apos;t pay you for your data. We do.
            </p>
            <p className={styles.subtitle}>
              Invitation code access only - Privacy protected
            </p>
          </div>

          <form onSubmit={handleInvitationCodeSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              
              <div className={styles.inputWrapper}>
                <input
                  id="invitationCode"
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder="Enter your invitation code"
                  className={styles.input}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={styles.continueButton}
                  disabled={isLoading || !invitationCode.trim()}
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
        </div>
      </LeftHalfModal>
    </div>
  );
} 