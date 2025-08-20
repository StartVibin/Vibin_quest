"use client";

import { Suspense } from "react";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';

function XCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing X connection...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`OAuth error: ${error}`);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authorization code or state parameter');

          return;
        }

        let storedState = null;
        let codeVerifier = null;
        if (typeof window !== 'undefined') {
          storedState = localStorage.getItem('x_oauth_state');
          codeVerifier = localStorage.getItem('x_code_verifier');
        }
        if (storedState !== state || !codeVerifier) {
          setStatus('error');
          setMessage('Invalid state parameter or missing code verifier');

          return;
        }

        const redirectUri = `${window.location.origin}/x-callback`;
        const response = await fetch('/api/x/oauth-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, code_verifier: codeVerifier, redirect_uri: redirectUri }),
        });
        const data = await response.json();
        if (!response.ok || !data.access_token) {
          setStatus('error');
          setMessage(data.error || 'Failed to get access token');
          return;
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('x_access_token', data.access_token);
          localStorage.setItem('x_verified', 'true');
          localStorage.setItem('x_verified_at', new Date().toISOString());
        }

        try {
          const profileRes = await fetch('/api/x/user-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: data.access_token }),
          });
          const profileData = await profileRes.json();

          if (profileData.data) {
            if (isConnected && address) {
              const verifyRes = await fetch('https://api.startvibin.io/api/v1/quests/x/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  walletAddress: address,
                  xId: profileData.data.id,
                  xUsername: profileData.data.username,
                  xDisplayName: profileData.data.name,
                  xProfileImageUrl: profileData.data.profile_image_url,
                  xVerified: profileData.data.verified
                }),
              });

              if (verifyRes.ok) {
                const verifyData = await verifyRes.json();
                setMessage(`X account connected successfully! Awarded ${verifyData.data.pointsAwarded} points!`);
              } else {
              }
            } else {
            }
          }
        } catch (profileErr) {
          console.error('Failed to fetch X user profile:', profileErr);
        }

        if (typeof window !== 'undefined') {
          localStorage.removeItem('x_oauth_state');
          localStorage.removeItem('x_code_verifier');
        }

        setStatus('success');

        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('X callback processing failed:', error);
        setStatus('error');
        setMessage('Failed to process X connection');
      }
    };

    processCallback();
  }, [searchParams, router, isConnected, address]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Connecting to X</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting back to app...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Failed</h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function XCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <XCallback />
    </Suspense>
  );
} 