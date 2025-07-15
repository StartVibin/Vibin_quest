"use client";

import React, { useState, useCallback, memo } from 'react';
import { LoginButton } from "@telegram-auth/react";
import { useAccount } from "wagmi";
import { toast } from 'react-toastify';
import { showWalletWarning } from "@/lib/utils";
import styles from "@/app/page.module.css";
import { ToastInstance } from '@/lib/types';

interface TelegramAuthData {
  id: number;
  first_name: string;
  auth_date: number;
  hash: string;
  last_name?: string;
  photo_url?: string;
  username?: string;
}

interface CustomTelegramButtonProps {
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
  botUsername?: string;
}

const CustomTelegramButton = memo(function CustomTelegramButton({ 
  onSuccess, 
  className = "", 
  children,
  botUsername = "MyVibinBot"
}: CustomTelegramButtonProps) {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);

  const sendToBackend = useCallback(async (telegramData: TelegramAuthData) => {
    try {
      console.log("Sending Telegram data to backend:", telegramData);
      
      if (!isConnected) {
        showWalletWarning(toast as ToastInstance);
        return;
      }
      
      // First save Telegram auth data
      const authData = {
        telegramData,
        walletAddress: address
      };
      
      const authResponse = await fetch('http://localhost:5000/api/v1/telegram/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });

      if (authResponse.ok) {
        const authResult = await authResponse.json();
        console.log("Telegram auth response:", authResult);
        
        // Then verify quest completion
        const { verifyTelegramConnection } = await import('@/lib/api');
        const verificationResult = await verifyTelegramConnection(address!, telegramData);
        
        toast.success(`Telegram connected successfully! Awarded ${verificationResult.data.pointsAwarded} points!`);
        setShowModal(false);
        onSuccess?.();
      } else {
        console.error("Backend error:", authResponse.status, authResponse.statusText);
        toast.error("Failed to connect Telegram. Please try again.");
      }
    } catch (error) {
      console.error("Error sending to backend:", error);
      toast.error("Failed to connect Telegram. Please try again.");
    }
  }, [isConnected, address, onSuccess]);

  const handleConnectClick = useCallback(() => {
    if (!isConnected) {
      showWalletWarning(toast as ToastInstance);
      return;
    }
    setShowModal(true);
  }, [isConnected]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

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
              minWidth: '300px',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              marginBottom: '1.5rem', 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: '#333'
            }}>
              Connect Telegram
            </h3>
            
            <p style={{ 
              marginBottom: '2rem', 
              color: '#666',
              fontSize: '1rem'
            }}>
              Click the button below to connect your Telegram account
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <LoginButton
                botUsername={botUsername}
                onAuthCallback={sendToBackend}
                buttonSize="large"
                showAvatar={true}
                cornerRadius={8}
              />
            </div>

            <button
              onClick={handleCloseModal}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#666'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default CustomTelegramButton; 