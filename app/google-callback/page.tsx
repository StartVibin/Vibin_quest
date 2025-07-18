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
    console.log("🔄 [Google Callback] Callback page loaded");
    console.log("🔍 [Google Callback] Search params:", Object.fromEntries(searchParams.entries()));
    console.log("🔍 [Google Callback] Raw URL:", window.location.href);
    
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log("📋 [Google Callback] Extracted parameters:", { 
      code: code ? `${code.substring(0, 10)}...` : null, 
      state: !!state, 
      error 
    });

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
      console.log('🔍 [Google Callback] Code:', code);
      console.log('🔍 [Google Callback] State:', state);
      window.opener?.postMessage({
        type: 'google_auth_error',
        error: 'Missing OAuth parameters'
      }, window.location.origin);
      window.close();
      return;
    }

    // Verify state parameter
    const savedState = localStorage.getItem('google_oauth_state');
    console.log('🔐 [Google Callback] State verification:', { received: state, saved: savedState, match: state === savedState });
    
    if (state !== savedState) {
      console.error('❌ [Google Callback] State parameter mismatch');
      window.opener?.postMessage({
        type: 'google_auth_error',
        error: 'State parameter mismatch'
      }, window.location.origin);
      window.close();
      return;
    }

    console.log('✅ [Google Callback] All parameters valid, starting token exchange');
    // Exchange code for access token
    exchangeCodeForToken(code);
  }, [searchParams]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      console.log('🔄 [Google Callback] Starting token exchange with code:', code.substring(0, 10) + '...');
      
      console.log('📡 [Google Callback] Calling /api/google/token...');
      const response = await fetch('/api/google/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      console.log('📊 [Google Callback] Token response status:', response.status);
      console.log('📊 [Google Callback] Token response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Google Callback] Token exchange failed:', errorText);
        throw new Error(`Failed to exchange code for token: ${response.status} ${errorText}`);
      }

      const tokenData = await response.json();
      console.log('✅ [Google Callback] Token received:', { 
        hasAccessToken: !!tokenData.access_token,
        tokenLength: tokenData.access_token?.length 
      });

      const { access_token } = tokenData;

      // Get user data with access token
      console.log('👤 [Google Callback] Fetching user info from Google...');
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      console.log('📊 [Google Callback] User info response status:', userResponse.status);

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('❌ [Google Callback] Failed to get user data:', errorText);
        throw new Error(`Failed to get user data: ${userResponse.status} ${errorText}`);
      }

      const userData: GoogleUserData = await userResponse.json();
      console.log('✅ [Google Callback] User data received:', userData);

      // Send user data back to parent window
      console.log('📤 [Google Callback] Sending success message to parent window');
      window.opener?.postMessage({
        type: 'google_auth_success',
        user: userData
      }, window.location.origin);

      // Clean up
      localStorage.removeItem('google_oauth_state');
      console.log('🧹 [Google Callback] Cleanup completed, attempting to close window');
      
      // Try to close window safely
      try {
        window.close();
      } catch (error) {
        console.warn('⚠️ [Google Callback] Could not close window automatically:', error);
        // Show a message to the user to close manually
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
        error: 'Failed to authenticate with Google'
      }, window.location.origin);
      
      // Try to close window safely
      try {
        window.close();
      } catch (error) {
        console.warn('⚠️ [Google Callback] Could not close window automatically:', error);
        // Show an error message to the user
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