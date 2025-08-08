"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import styles from './page.module.css';

import LeftHalfModal from '@/components/LeftHalfModal';
import { verifyReferalCode } from '@/lib/api';
import { useSharedContext } from '@/provider/SharedContext';

export default function JoinPage() {
  const { sharedValue, setSharedValue } = useSharedContext()

  const { isConnected } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [validReferral, isValidReferral] = useState(false);

  const { invitationCode } = sharedValue;

  useEffect(() => {
    if (validReferral && !isConnected) {
      router.push('/join/spotify');
    }
  }, [validReferral])

  useEffect(() => {
    let inviteCode = sessionStorage.getItem('invitationCode') ?? "";

    setSharedValue({ ...sharedValue, invitationCode: inviteCode, showWallet: false })

    verifyReferalCode(inviteCode).then(e => isValidReferral(e.success))
  }, [])

  const handleInvitationCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitationCode.trim()) {
      toast.error('Please enter an invitation code');
      return;
    }

    setIsLoading(true);
    try {
      verifyReferalCode(invitationCode).then(e => {
        if (e.success) {
          toast.success("Valid invitation code.");
          sessionStorage.setItem('invitationCode', invitationCode);
        } else toast.error("Invalid invitation code. Please try again.")
        isValidReferral(e.success)
      })

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
                  onChange={(e) => setSharedValue({ ...sharedValue, invitationCode: e.target.value })}
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