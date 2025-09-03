"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { toast } from 'react-toastify';
import styles from '../page.module.css';
import AuthGuard from '@/components/AuthGuard';

import LeftHalfModal from '@/components/LeftHalfModal';
import SpotifyOAuthModal from '@/components/SpotifyOAuthModal';
import { useSharedContext } from '@/provider/SharedContext';
import { getIndexOfEmail } from '@/lib/api/getIndexOfEmail';
import { createUserWithReferral, validateUserInviteCode, checkEmailWhitelist } from '@/lib/api';

function SpotifyLoginContent() {

  const { sharedValue, setSharedValue } = useSharedContext()
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);
  const [index, setIndex] = useState(0);

  const {
    invitationCode,
    spotifyEmail
  } = sharedValue

  console.log("invitationCode", typeof invitationCode)



  const handleSpotifyOAuthSuccess = useCallback(async () => {
    try {
      const spotifyEmail = localStorage.getItem('spotify_email');
      const spotifyAccessToken = localStorage.getItem('spotify_access_token');
      const invitationCode = localStorage.getItem('invitation_code') || sharedValue.invitationCode;

      if (!invitationCode || !spotifyEmail || !spotifyAccessToken) {
        toast.error('Missing registration data. No code or email or access token. Please start over.');
        router.push('/join');
        return;
      }

      // Create user with referral information
      try {

        const validationResponse = await validateUserInviteCode(spotifyEmail, invitationCode);

        if (!validationResponse.success) {
          if (validationResponse.data?.reason === 'code_mismatch') {
            toast.error('Please use correct invite code.');
            // Clear the wrong invitation code and redirect to first step
            localStorage.removeItem('invitation_code');
            setSharedValue(prev => ({ ...prev, invitationCode: '' }));
            router.push('/');
            return;
          } else {
            toast.error(validationResponse.message || 'Invalid invitation code');
            return;
          }
        }

        const createUserResponse = await createUserWithReferral({
          spotifyEmail,
          invitationCode,
          accessToken: spotifyAccessToken,
          refreshToken: localStorage.getItem('spotify_refresh_token') || '',
          expiresIn: parseInt(localStorage.getItem('spotify_expires_in') || '7200'),
          walletAddress: '' // Will be set later when wallet connects
        });

        if (createUserResponse.success) {
          if (createUserResponse.data.referralCode) {
            localStorage.setItem('user_referral_code', createUserResponse.data.referralCode);
          }
        }
      } catch (referralError) {
        console.error('Error creating user with referral:', referralError);
        toast.warning('Referral setup incomplete, but continuing with registration...');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Spotify connected successfully!');

      router.push('/join/wallet');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to complete registration. Please try again.');
    }
  }, [router]);

  useEffect(() => {
    const code = localStorage.getItem('invitation_code');
   
    if (!code) {
      // Check if user came from invitation code page
      const referrer = document.referrer;
      if (!referrer.includes('/join') && !referrer.includes(window.location.origin)) {
        router.push('/');
      }
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'true') {
      const spotifyId = urlParams.get('spotify_id');
      const spotifyEmail = urlParams.get('spotify_email');
      const spotifyName = urlParams.get('spotify_name');
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const expiresIn = urlParams.get('expires_in');

      localStorage.setItem('spotify_id', spotifyId || '');
      localStorage.setItem('spotify_email', spotifyEmail || '');
      localStorage.setItem('spotify_name', spotifyName || '');
      localStorage.setItem('spotify_access_token', accessToken || '');
      localStorage.setItem('spotify_refresh_token', refreshToken || '');
      localStorage.setItem('spotify_expires_in', expiresIn || '');
      localStorage.setItem('spotify_token_expiry', (Date.now() + (parseInt(expiresIn || '0') * 1000)).toString());

      // Store invitation code if it exists
      const existingInvitationCode = localStorage.getItem('invitation_code');
      if (existingInvitationCode) {
        localStorage.setItem('invitation_code', existingInvitationCode);
      }

      document.cookie = `spotify_id=${spotifyId || ''}; path=/; max-age=86400`;
      document.cookie = `spotify_email=${spotifyEmail || ''}; path=/; max-age=86400`;
      
      handleSpotifyOAuthSuccess();

      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      toast.error(`Spotify connection failed: ${error}`);
      setShowSpotifyModal(false);

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [router, handleSpotifyOAuthSuccess]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!spotifyEmail.trim()) {
      toast.error('Please enter your Spotify email');
      return;
    }

    if (!spotifyEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Get the invitation code from localStorage or shared context
    const invitationCode = localStorage.getItem('invitation_code') || sharedValue.invitationCode;
    
    if (!invitationCode) {
      toast.error('No invitation code found. Please start over.');
      router.push('/');
      return;
    }

    setIsLoading(true);
    try {
      const whitelistResponse = await checkEmailWhitelist(spotifyEmail, invitationCode);
      
      if (whitelistResponse.success) {
        if (whitelistResponse.data.isWhitelisted) {
          // Email is whitelisted - proceed with normal flow
          console.log(`✅ Email ${spotifyEmail} is whitelisted - proceeding with Spotify OAuth`);
          
          // Get email index for Spotify OAuth
          const index = await getIndexOfEmail(spotifyEmail);
          setIndex(index);
          setShowSpotifyModal(true);
        } else {
          // Email not whitelisted - check if it's second time
          if (whitelistResponse.data.isSecondTime) {
            // Second time login - show "already booked" message
            console.log(`🔄 Email ${spotifyEmail} already in whitelist - second time login`);
            toast.info("You already booked, please wait until we register your info");
          } else {
            // First time - show "successfully booked" message
            console.log(`❌ Email ${spotifyEmail} not whitelisted - first time, adding to whitelist`);
            toast.success("You successfully booked. Currently we're experiencing busy on server, please come back later");
            
            // Store the referral code for later use
            if (whitelistResponse.data.referralCode) {
              localStorage.setItem('user_referral_code', whitelistResponse.data.referralCode);
            }
          }
          
          // Redirect to home page for both cases
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      } else {
        toast.error(whitelistResponse.message || 'Failed to check email whitelist');
      }
    } catch (error) {
      console.error('Email whitelist check error:', error);
      toast.error('Failed to check email whitelist. Please try again.');
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
            <div className={styles.stepIndicator}>Step 2 / 4</div>
            <h1 className={styles.title}>Welcome to <br />the Vibin&apos; app.</h1>
            <p className={styles.subtitle}>
              Spotify doesn&apos;t pay you for your data. We do.
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
                  value={spotifyEmail}
                  onChange={(e) => setSharedValue({ ...sharedValue, spotifyEmail: e.target.value })}
                  placeholder="Enter your Spotify email"
                  className={styles.input}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={styles.continueButton}
                  disabled={isLoading || !spotifyEmail.trim()}
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

      <SpotifyOAuthModal
        isOpen={showSpotifyModal}
        onClose={() => setShowSpotifyModal(false)}
        email={spotifyEmail}
        index={index}
      />
    </div>
  );
}

export default function SpotifyLoginPage() {
  return (
    <AuthGuard requireFullAuth={false}>
      <SpotifyLoginContent />
    </AuthGuard>
  );
} 