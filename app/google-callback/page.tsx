"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export default function GoogleCallback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      window.opener?.postMessage({
        type: 'google_auth_error',
        error: error
      }, window.location.origin);
      window.close();
      return;
    }

    if (!code || !state) {
      console.error('Missing code or state parameter');
      window.opener?.postMessage({
        type: 'google_auth_error',
        error: 'Missing OAuth parameters'
      }, window.location.origin);
      window.close();
      return;
    }

    // Verify state parameter
    const savedState = localStorage.getItem('google_oauth_state');
    if (state !== savedState) {
      console.error('State parameter mismatch');
      window.opener?.postMessage({
        type: 'google_auth_error',
        error: 'State parameter mismatch'
      }, window.location.origin);
      window.close();
      return;
    }

    // Exchange code for access token
    exchangeCodeForToken(code);
  }, [searchParams]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch('/api/google/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { access_token } = await response.json();

      // Get user data with access token
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user data');
      }

      const userData: GoogleUserData = await userResponse.json();

      // Send user data back to parent window
      window.opener?.postMessage({
        type: 'google_auth_success',
        user: userData
      }, window.location.origin);

      // Clean up
      localStorage.removeItem('google_oauth_state');
      window.close();
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      window.opener?.postMessage({
        type: 'google_auth_error',
        error: 'Failed to authenticate with Google'
      }, window.location.origin);
      window.close();
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Connecting to Google...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
} 