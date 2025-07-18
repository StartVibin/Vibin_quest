"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { toast } from 'react-toastify';
import styles from '../page.module.css';

import LeftHalfModal from '@/components/LeftHalfModal';
import SpotifyOAuthModal from '@/components/SpotifyOAuthModal';

export default function SpotifyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setInvitationCode] = useState('');
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);

  const handleSpotifyOAuthSuccess = useCallback(async () => {
    try {
      // Get stored data from session storage and localStorage
      const storedCode = sessionStorage.getItem('invitationCode');
      const storedAddress = sessionStorage.getItem('walletAddress');
      const spotifyId = localStorage.getItem('spotify_id');
      const spotifyEmail = localStorage.getItem('spotify_email');
      const spotifyName = localStorage.getItem('spotify_name');
      const spotifyAccessToken = localStorage.getItem('spotify_access_token');
      
      if (!storedCode || !storedAddress || !spotifyId) {
        toast.error('Missing registration data. Please start over.');
        router.push('/join');
        return;
      }
      
      // Here you would typically send all the data to your backend
      const registrationData = {
        invitationCode: storedCode,
        walletAddress: storedAddress,
        spotifyId: spotifyId,
        spotifyEmail: spotifyEmail,
        spotifyName: spotifyName,
        spotifyAccessToken: spotifyAccessToken,
        userEmail: email, // The email entered in the form
      };
      
      console.log('Registration data:', registrationData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear session storage (keep localStorage for Spotify data persistence)
      sessionStorage.removeItem('invitationCode');
      sessionStorage.removeItem('walletAddress');
      sessionStorage.removeItem('spotifyEmail');
      sessionStorage.removeItem('spotify_oauth_state');
      
      toast.success('Registration completed successfully!');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to complete registration. Please try again.');
    }
  }, [router, email]);

  useEffect(() => {
    // Temporarily disable join functionality - redirect to home page
    toast.info('Join functionality is temporarily disabled. Please check back later.');
    router.push('/');
    return;
    
    // Get invitation code from session storage
    const storedCode = sessionStorage.getItem('invitationCode');
    if (!storedCode) {
      // If no invitation code, redirect back to first step
      router.push('/join');
      return;
    }
    setInvitationCode(storedCode || '');

    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success === 'true') {
      // OAuth was successful
      const spotifyId = urlParams.get('spotify_id');
      const spotifyEmail = urlParams.get('spotify_email');
      const spotifyName = urlParams.get('spotify_name');
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const expiresIn = urlParams.get('expires_in');
      
      // Store Spotify data in localStorage for persistence
      localStorage.setItem('spotify_id', spotifyId || '');
      localStorage.setItem('spotify_email', spotifyEmail || '');
      localStorage.setItem('spotify_name', spotifyName || '');
      localStorage.setItem('spotify_access_token', accessToken || '');
      localStorage.setItem('spotify_refresh_token', refreshToken || '');
      localStorage.setItem('spotify_expires_in', expiresIn || '');
      localStorage.setItem('spotify_token_expiry', (Date.now() + (parseInt(expiresIn || '0') * 1000)).toString());
      
      // Complete registration
      handleSpotifyOAuthSuccess();
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      // OAuth failed
      toast.error(`Spotify connection failed: ${error}`);
      setShowSpotifyModal(false);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [router, handleSpotifyOAuthSuccess]);

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
      
      // Show Spotify OAuth modal
      setShowSpotifyModal(true);
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
            <h1 className={styles.title}>Welcome to <br/>the Vibin&apos; app.</h1>
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
      
      <SpotifyOAuthModal
        isOpen={showSpotifyModal}
        onClose={() => setShowSpotifyModal(false)}
        email={email}
      />
    </div>
  );
} 