"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

function GoogleCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {

    
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('❌ [Google Callback] Google OAuth error:', error);
      window.opener?.postMessage({
        type: 'google_auth_error',
        error: error
      }, window.location.origin);
      window.close();
      return;
    }

    if (!code || !state) {
      console.error('❌ [Google Callback] Missing code or state parameter');
      window.opener?.postMessage({
        type: 'google_auth_error',
        error: 'Missing OAuth parameters',
        source: 'google_oauth_callback',
        timestamp: new Date().toISOString()
      }, window.location.origin);
      window.close();
      return;
    }

    const savedState = localStorage.getItem('google_oauth_state');
    
    if (state !== savedState) {
      console.error('❌ [Google Callback] State parameter mismatch');
      window.opener?.postMessage({
        type: 'google_auth_error',
        error: 'State parameter mismatch',
        source: 'google_oauth_callback',
        timestamp: new Date().toISOString()
      }, window.location.origin);
      window.close();
      return;
    }

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
        const errorText = await response.text();
        console.error('❌ [Google Callback] Token exchange failed:', errorText);
        throw new Error(`Failed to exchange code for token: ${response.status} ${errorText}`);
      }

      const tokenData = await response.json();
      const { access_token } = tokenData;
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('❌ [Google Callback] Failed to get user data:', errorText);
        throw new Error(`Failed to get user data: ${userResponse.status} ${errorText}`);
      }

      const userData: GoogleUserData = await userResponse.json();
      window.opener?.postMessage({
        type: 'google_auth_success',
        user: userData,
        source: 'google_oauth_callback',
        timestamp: new Date().toISOString()
      }, window.location.origin);

      localStorage.removeItem('google_oauth_state');
      
      try {
        window.close();
      } catch (error) {
        console.warn('⚠️ [Google Callback] Could not close window automatically:', error);
        document.body.innerHTML = `
          <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
            text-align: center;
          ">
            <div>
              <h2 style="color: #4CAF50;">✅ Authentication Successful!</h2>
              <p>You can now close this window and return to the main application.</p>
              <button onclick="window.close()" style="
                padding: 10px 20px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
              ">Close Window</button>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ [Google Callback] Error in token exchange:', error);
      console.error('🔍 [Google Callback] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      window.opener?.postMessage({
        type: 'google_auth_error',
        error: 'Failed to authenticate with Google',
        source: 'google_oauth_callback',
        timestamp: new Date().toISOString()
      }, window.location.origin);
      
      try {
        window.close();
      } catch (error) {
        console.warn('⚠️ [Google Callback] Could not close window automatically:', error);
        document.body.innerHTML = `
          <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
            text-align: center;
          ">
            <div>
              <h2 style="color: #f44336;">❌ Authentication Failed</h2>
              <p>There was an error during authentication. Please try again.</p>
              <button onclick="window.close()" style="
                padding: 10px 20px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
              ">Close Window</button>
            </div>
          </div>
        `;
      }
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

export default function GoogleCallback() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading...</h2>
          <p>Please wait while we process your authentication.</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
} 