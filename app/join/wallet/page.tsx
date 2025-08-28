"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { toast } from 'react-toastify';
import styles from '../page.module.css';
import AuthGuard from '@/components/AuthGuard';

import LeftHalfModal from '@/components/LeftHalfModal';

function WalletConnectionContent() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  // const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const storedCode = localStorage.getItem('invitation_code');
    const spotifyEmail = localStorage.getItem('spotify_email');

    if (!storedCode || !spotifyEmail) {
      toast.error('Missing registration data, No code or email. Please start over.');
      router.push('/join');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (isConnected && address && !isAuthenticating) {
      handleWalletAuthentication();
    }
  }, [isConnected, address]);

  const handleWalletAuthentication = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsAuthenticating(true);
    try {
      //const welcomeMessage = "Welcome to Vibin!";
      //const signature = await signMessageAsync({ message: welcomeMessage });

      const pendingReferralCode = localStorage.getItem('pendingReferralCode');
     // const authData = await authenticateWallet(address, welcomeMessage, signature, pendingReferralCode || undefined);

      if (true) {
        if (pendingReferralCode) {
          localStorage.removeItem('pendingReferralCode');
        }

        toast.success('Wallet connected successfully!');
        router.push('/join/complete');
      } else {
        toast.error('Wallet authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Wallet authentication error:', error);
      toast.error('Failed to authenticate wallet. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleMetaMaskConnectWallet = async () => {
    if (!isConnected) {
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      } else {
        toast.error('No wallet connectors available');
      }
      return;
    }

    if (isConnected && address) {
      await handleWalletAuthentication();
    }
  };

  const handleCoinbaseConnectWallet = async () => {
    if (!isConnected) {
      if (connectors.length > 0) {
        connect({ connector: connectors[1] });
      } else {
        toast.error('No wallet connectors available');
      }
      return;
    }

    if (isConnected && address) {
      await handleWalletAuthentication();
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

      <LeftHalfModal>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            <div className={styles.stepIndicator}>Step 3 / 4</div>
            <h1 className={styles.title}>Connect wallet</h1>
            <p className={styles.subtitle}>
              Spotify doesn&apos;t pay you for your data. We do.
            </p>
          </div>

          <div className={styles.walletSection}>
            <div className={styles.walletOptions}>
              <div className={styles.walletOption}>
                <div className={styles.walletIcon}>
                  <img src="/metamask-icon.svg" alt="MetaMask" />
                </div>
                <div className={styles.walletInfo}>
                  <span className={styles.walletName}>MetaMask</span>
                </div>
                <button
                  onClick={handleMetaMaskConnectWallet}
                  className={styles.connectButton}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Connecting...' : 'Connect'}
                </button>
              </div>

              <div className={styles.walletOption}>
                <div className={styles.walletIcon}>
                  <img src="/coinbase-icon.svg" alt="Coinbase" />
                </div>
                <div className={styles.walletInfo}>
                  <span className={styles.walletName}>Coinbase</span>
                </div>
                <button
                  onClick={handleCoinbaseConnectWallet}
                  className={styles.connectButton}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Connecting...' : 'Connect'}
                </button>
              </div>

              <div className={styles.walletOption}>
                <div className={styles.walletIcon}>
                  <img src="/safepal-icon.svg" alt="SafePal" />
                </div>
                <div className={styles.walletInfo}>
                  <span className={styles.walletName}>SafePal</span>
                </div>
                <button
                  onClick={handleMetaMaskConnectWallet}
                  className={styles.connectButton}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleBack}
            className={styles.backButton}
            disabled={isAuthenticating}
          >
            ← Back
          </button>
        </div>
      </LeftHalfModal>
    </div>
  );
}
export default function WalletConnectionPage() {
  return (
    <AuthGuard requireFullAuth={false}>
      <WalletConnectionContent />
    </AuthGuard>
  );
}

