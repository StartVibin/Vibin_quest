"use client";

import React, { useState, useCallback, memo } from 'react';
import { useAccount } from "wagmi";
import { toast } from 'react-toastify';
import { showWalletWarning } from "@/lib/utils";
import styles from "@/app/page.module.css";
import { ToastInstance } from '@/lib/types';

interface TelegramGroupJoinButtonProps {
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
  groupUsername?: string;
  groupInviteLink?: string;
}

const TelegramGroupJoinButton = memo(function TelegramGroupJoinButton({ 
  onSuccess, 
  className = "", 
  children,
  groupUsername = "vibin_official",
  groupInviteLink = "https://t.me/vibin_official"
}: TelegramGroupJoinButtonProps) {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);

  const sendToBackend = useCallback(async () => {
    try {
      
      if (!isConnected) {
        showWalletWarning(toast as ToastInstance);
        return;
      }
      
      // Verify group membership with backend
      const { verifyTelegramGroupJoin } = await import('@/lib/api');
      const verificationResult = await verifyTelegramGroupJoin(address!, groupUsername);
      
      toast.success(`Successfully joined Telegram group! Awarded ${verificationResult.data.pointsAwarded} points!`);
      setShowModal(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error verifying group join:", error);
      toast.error("Failed to verify group membership. Please try again.");
    }
  }, [isConnected, address, groupUsername, onSuccess]);

  const handleJoinClick = useCallback(() => {
    if (!isConnected) {
      showWalletWarning(toast as ToastInstance);
      return;
    }
    setShowModal(true);
  }, [isConnected]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleJoinGroup = useCallback(() => {
    // Open Telegram group in new tab
    window.open(groupInviteLink, '_blank', 'noopener,noreferrer');
    
    // Show instructions to user
    toast.info("Group opened in new tab. Please join the group and return here to verify.", {
      autoClose: 5000,
    });
    
    // Give user time to join, then verify
    setTimeout(() => {
      sendToBackend();
    }, 3000);
  }, [groupInviteLink, sendToBackend]);

  return (
    <>
      <button 
        className={`${styles.mainTaskButton} ${className}`}
        onClick={handleJoinClick}
      >
        {children || "Join Us"}
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
              Join Our Telegram Group
            </h3>
            
            <p style={{ 
              marginBottom: '1.5rem', 
              color: '#666',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              Join our official Telegram group to stay updated with the latest news, 
              announcements, and community discussions.
            </p>

            <div style={{ 
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <p style={{ 
                margin: '0 0 0.5rem 0',
                fontWeight: '600',
                color: '#333'
              }}>
                Group: @{groupUsername}
              </p>
              <p style={{ 
                margin: 0,
                fontSize: '0.9rem',
                color: '#666'
              }}>
                Click the button below to join
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleJoinGroup}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#0088cc',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Join Group
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
});

export default TelegramGroupJoinButton; 