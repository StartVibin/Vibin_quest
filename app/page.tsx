"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';

import styles from "./page.module.css";
import LeftHalfModal from '@/components/LeftHalfModal';
import { verifyReferalCode } from '@/lib/api';
import { useSharedContext } from '@/provider/SharedContext';

export default function Home() {
  const { sharedValue, setSharedValue } = useSharedContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState(''); // Local state for input

  useEffect(() => {
    // Only clear data if user is starting fresh (no existing data)
    if (window) {
      const existingInvitationCode = localStorage.getItem('invitation_code');
      const existingSpotifyEmail = localStorage.getItem('spotify_email');
      
      // Only clear if there's no existing data (fresh start)
      if (!existingInvitationCode && !existingSpotifyEmail) {
        localStorage.removeItem('invitation_code');
        localStorage.removeItem('inviteCode');
        localStorage.removeItem('spotify_id');
        localStorage.removeItem('spotify_email');
        localStorage.removeItem('spotify_access_token');
      }
    }
  }, []);

  const handleInvitationCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitationCode?.trim()) {
      toast.error('Please enter an invitation code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyReferalCode(invitationCode);
      if (result.success) {
        toast.success("Valid invitation code.");
        document.cookie = `inviteCode=${invitationCode}; path=/; max-age=86400`; // 24 hours
        setSharedValue({ ...sharedValue, invitationCode: invitationCode, showWallet: false });
        
        router.push('/join/spotify');
      } else {
        toast.error("Invalid invitation code. Please try again.");
      }
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
            <div className={styles.stepIndicator}>Step 1 / 4</div>
            <h1 className={styles.title}>Welcome to <br />the Vibin&apos; app.</h1>
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
                  disabled={isLoading || !invitationCode?.trim()}
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

          {/* Already have an account section */}
          <div className={styles.alreadyHaveAccount}>
            <p className={styles.alreadyHaveAccountText}>
              Already have an account?
            </p>
            <button
              onClick={() => router.push('/join/spotify')}
              className={styles.skipButton}
              disabled={isLoading}
            >
              →
            </button>
          </div>
        </div>
      </LeftHalfModal>
    </div>
  );
}
