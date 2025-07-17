"use client";

import { useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const completeRegistration = useCallback(async () => {
    try {
      // Get all stored data
      const invitationCode = sessionStorage.getItem('invitationCode');
      const walletAddress = sessionStorage.getItem('walletAddress');
      const spotifyId = localStorage.getItem('spotify_id');
      const spotifyEmail = localStorage.getItem('spotify_email');
      const spotifyName = localStorage.getItem('spotify_name');
      const spotifyAccessToken = localStorage.getItem('spotify_access_token');

      // Temporarily disable join functionality
      toast.info('Join functionality is temporarily disabled. Please check back later.');
      router.push('/');
      return;
      
      if (!invitationCode || !walletAddress || !spotifyId) {
        toast.error('Missing registration data. Please start over.');
        router.push('/join');
        return;
      }

      // Prepare registration data
      const registrationData = {
        invitationCode,
        walletAddress,
        spotifyId,
        spotifyEmail,
        spotifyName,
        spotifyAccessToken,
      };

      console.log('Complete registration data:', registrationData);

      // Here you would send the data to your backend
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear session storage (keep localStorage for Spotify data)
      sessionStorage.removeItem('invitationCode');
      sessionStorage.removeItem('walletAddress');
      sessionStorage.removeItem('spotifyEmail');
      sessionStorage.removeItem('spotify_oauth_state');

      toast.success('Registration completed successfully!');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration completion error:', error);
      toast.error('Failed to complete registration');
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          console.error('Spotify OAuth error:', error);
          toast.error('Spotify authorization failed');
          router.push('/');
          return;
        }

        if (!code) {
          toast.error('No authorization code received');
          router.push('/');
          return;
        }

        // Verify state parameter (you should implement proper state verification)
        const storedState = sessionStorage.getItem('spotify_oauth_state');
        if (state !== storedState) {
          console.warn('State mismatch - potential CSRF attack');
          // For development, we'll continue anyway
        }

        // Exchange the authorization code for access token
        const tokenResponse = await fetch('/api/auth/spotify/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(errorData.error || 'Token exchange failed');
        }

        const tokenData = await tokenResponse.json();
        
        // Store the tokens and user data in localStorage for persistence
        localStorage.setItem('spotify_access_token', tokenData.access_token);
        localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
        localStorage.setItem('spotify_expires_in', tokenData.expires_in.toString());
        localStorage.setItem('spotify_token_expiry', (Date.now() + tokenData.expires_in * 1000).toString());
        localStorage.setItem('spotify_id', tokenData.spotify_id);
        localStorage.setItem('spotify_email', tokenData.spotify_email || '');
        localStorage.setItem('spotify_name', tokenData.spotify_name || '');

        // Clear the OAuth state
        sessionStorage.removeItem('spotify_oauth_state');

        toast.success('Spotify connected successfully!');
        
        // Complete the registration process
        await completeRegistration();
        
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('Failed to complete Spotify connection');
        router.push('/');
      }
    };

    handleCallback();
  }, [searchParams, router, completeRegistration]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1DB954',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p>Connecting to Spotify...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1DB954',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p>Loading...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CallbackContent />
    </Suspense>
  );
} 