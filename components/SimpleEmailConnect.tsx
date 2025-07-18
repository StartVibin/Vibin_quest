"use client";

import React, { useState } from 'react';
import { useAccount } from "wagmi";
import { toast } from 'react-toastify';
import { showWalletWarning } from '@/lib/utils';
import { ToastInstance } from '@/lib/types';

interface SimpleEmailConnectProps {
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function SimpleEmailConnect({ 
  onSuccess, 
  className = "", 
  children 
}: SimpleEmailConnectProps) {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectClick = () => {
    if (!isConnected) {
      showWalletWarning(toast as ToastInstance);
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("📧 [Simple Email] Connecting email:", email);
      
      // Import the API function
      const { verifyEmailConnection } = await import('@/lib/api');
      
      // Send email directly to backend (without OAuth verification)
      const verificationResult = await verifyEmailConnection(address!, email, undefined);
      
      console.log("✅ [Simple Email] Connection successful:", verificationResult);
      toast.success(`Email connected successfully! Awarded ${verificationResult.data.pointsAwarded} points!`);
      
      setShowModal(false);
      setEmail('');
      onSuccess?.();
    } catch (error) {
      console.error("❌ [Simple Email] Connection failed:", error);
      toast.error("Failed to connect email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className={`${className}`}
        onClick={handleConnectClick}
      >
        {children || "Connect Email"}
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
              Enter your email address to connect it to your wallet and earn points.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
                required
              />
              
              <div style={{ 
                display: 'flex', 
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: isLoading ? '#f5f5f5' : 'white',
                    color: isLoading ? '#999' : '#333',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isLoading ? 'Connecting...' : 'Connect Email'}
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: '#f5f5f5',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    color: '#666'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 