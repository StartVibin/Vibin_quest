"use client";

import { useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const completeRegistration = useCallback(async () => {
    try {
      const invitationCode = localStorage.getItem('invitation_code');
      const walletAddress = localStorage.getItem('walletAddress');
      const spotifyId = localStorage.getItem('spotify_id');


      
      if (!invitationCode || !walletAddress || !spotifyId) {
        toast.error('Missing registration data. No code or email or access token or wallet address. Please start over.');
        router.push('/join');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // localStorage.removeItem('invitation_code');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('spotifyEmail');
      localStorage.removeItem('spotify_oauth_state');

      toast.success('Registration completed successfully!');
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration completion error:', error);
      toast.error('Failed to complete registration');
      console.error("pushing to root page", error)
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
          //console.error('Spotify OAuth error:', error);
          toast.error('Spotify authorization failed');
          console.error("pushing to root page", error)
          router.push('/');
          return;
        }

        if (!code) {
          toast.error('No authorization code received');
          console.error("pushing to root page", error)
          router.push('/');
          return;
        }

        const storedState = localStorage.getItem('spotify_oauth_state');
        if (state !== storedState) {
          //console.warn('State mismatch - potential CSRF attack');
        }

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
        
        localStorage.setItem('spotify_access_token', tokenData.access_token);
        localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
        localStorage.setItem('spotify_expires_in', tokenData.expires_in.toString());
        localStorage.setItem('spotify_token_expiry', (Date.now() + tokenData.expires_in * 1000).toString());
        localStorage.setItem('spotify_id', tokenData.spotify_id);
        localStorage.setItem('spotify_email', tokenData.spotify_email || '');
        localStorage.setItem('spotify_name', tokenData.spotify_name || '');

        localStorage.removeItem('spotify_oauth_state');

        toast.success('Spotify connected successfully!');
        
        await completeRegistration();
        
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('Failed to complete Spotify connection');
        console.error("pushing to root page", error)
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