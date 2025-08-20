"use client";

import React, { useState } from 'react';
import { useAccount } from "wagmi";
import { toast } from 'react-toastify';
import { showWalletWarning } from "@/lib/utils";
import styles from "@/app/page.module.css";
import { ToastInstance } from '@/lib/types';

interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

interface GoogleOAuthButtonProps {
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
  clientId?: string;
}

export default function GoogleOAuthButton ({ 
  onSuccess, 
  className = "", 
  children,
  clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
}: GoogleOAuthButtonProps) {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);

  const sendToBackend = async (userData: GoogleUserData) => {
    try {
      
      if (!isConnected) {
        console.warn("⚠️ [Google OAuth] Wallet not connected, showing warning");
        showWalletWarning(toast as ToastInstance);
        return;
      }
      
      const { verifyEmailConnection } = await import('@/lib/api');
      const verificationResult = await verifyEmailConnection(address!, userData.email, userData);
      
      if (verificationResult.data && verificationResult.data.pointsAwarded) {
        toast.success(`Email connected successfully! Awarded ${verificationResult.data.pointsAwarded} points!`);
      } else {
        toast.success("Email connected successfully!");
      }
      setShowModal(false);
      onSuccess?.();
    } catch (error) {
      console.error("❌ [Google OAuth] Error sending to backend:", error);
      console.error("🔍 [Google OAuth] Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error("Failed to connect email. Please try again.");
    }
  }

  const handleConnectClick = () => {
    if (!isConnected) {
      showWalletWarning(toast as ToastInstance);
      return;
    }
    setShowModal(true);
  }

  const handleCloseModal = () => {
    setShowModal(false);
   }

  const handleGoogleLogin = () => {
    
    if (!clientId || clientId === '') {
      console.error("❌ [Google OAuth] Client ID not configured");
      toast.error("Google OAuth not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.");
      return;
    }

    const redirectUri = `${window.location.origin}/google-callback`;
    const scope = 'email profile';
    const responseType = 'code';
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('google_oauth_state', state);
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', responseType);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    
    const popup = window.open(
      authUrl.toString(),
      'google-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      console.error("❌ [Google OAuth] Popup was blocked by browser");
      toast.error("Popup was blocked. Please allow popups for this site and try again.");
      return;
    }
    
    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);

    const handleMessage = (event: MessageEvent) => {
      const timestamp = new Date().toISOString();
      
      if (event.origin !== window.location.origin) {
        console.warn("⚠️ [Google OAuth] Message from different origin:", event.origin);
        return;
      }
      
      if (!event.data || typeof event.data !== 'object') {
        return;
      }
      
      const isMetaMaskMessage = 
        event.data.target === 'metamask-inpage' ||
        event.data.target === 'metamask-provider' ||
        event.data.name === 'metamask-provider' ||
        (event.data.data && event.data.data.target === 'metamask-inpage') ||
        (event.data.data && event.data.data.target === 'metamask-provider') ||
        (event.data.data && event.data.data.name === 'metamask-provider') ||
        (event.data.data && event.data.data.data && event.data.data.data.method?.startsWith('metamask_')) ||
        (event.data.data && event.data.data.data && event.data.data.data.method?.startsWith('wallet_'));
      
      if (isMetaMaskMessage) {
        return;
      }
      
      if (event.data.type !== 'google_auth_success' && event.data.type !== 'google_auth_error') {
        console.log(`📨 [Google OAuth] [${timestamp}] Ignoring non-Google OAuth message:`, event.data.type);
        return;
      }
      
      if (event.data.type === 'google_auth_success' && !event.data.user) {
        console.log(`📨 [Google OAuth] [${timestamp}] Ignoring Google OAuth message without user data`);
        return;
      }
      
      if (event.data.source !== 'google_oauth_callback') {
        console.log(`📨 [Google OAuth] [${timestamp}] Ignoring message from unknown source:`, event.data.source);
        return;
      }
      
      console.log(`📨 [Google OAuth] [${timestamp}] Processing legitimate Google OAuth message:`, {
        type: event.data.type,
        source: event.data.source,
        timestamp: event.data.timestamp
      });
      
      if (event.data.type === 'google_auth_success') {
        console.log("✅ [Google OAuth] Auth success message received");
        console.log("👤 [Google OAuth] User data:", event.data.user);
        sendToBackend(event.data.user);
        
        try {
        } catch (error) {
          console.warn("⚠️ [Google OAuth] Could not close popup:", error);
        }
        
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'google_auth_error') {
        console.error("❌ [Google OAuth] Auth error message received:", event.data.error);
        toast.error("Google authentication failed. Please try again.");
        
        try {
          if (popup && !popup.closed) {
            popup.close();
          }
        } catch (error) {
          console.warn("⚠️ [Google OAuth] Could not close popup:", error);
        }
        
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
    console.log("👂 [Google OAuth] Message listener attached");
    
    setTimeout(() => {
      console.warn("⚠️ [Google OAuth] No message received within 60 seconds - checking popup status");
      if (popup && !popup.closed) {
        console.log("🪟 [Google OAuth] Popup is still open");
        try {
          console.log("🔗 [Google OAuth] Popup location:", popup.location.href);
        } catch (error) {
          console.warn("⚠️ [Google OAuth] Cannot access popup location due to CORS:", error);
        }
      } else {
        console.log("🪟 [Google OAuth] Popup is closed");
      }
    }, 60000);
   }

  return (
    <>
      <button 
        className={`${styles.mainTaskButton} ${className}`}
        onClick={handleConnectClick}
      >
        {children || "Connect"}
      </button>

      {/* Modal */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              minWidth: '350px',
              maxWidth: '450px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: '#333'
            }}>
              Connect Email
            </h3>
            
            <p style={{ 
              marginBottom: '2rem', 
              color: '#666',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              Connect your Google account to verify your email address and earn points.
            </p>

            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleGoogleLogin}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>

              <button
                onClick={handleCloseModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: '#666'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
