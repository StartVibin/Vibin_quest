"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface SpotifyReauthButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function SpotifyReauthButton({ 
  className = "", 
  children = "Re-authenticate Spotify" 
}: SpotifyReauthButtonProps) {
  const router = useRouter();

  const handleReauth = () => {
    try {
      // Clear all Spotify tokens
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_expires_in');
      localStorage.removeItem('spotify_token_expiry');
      localStorage.removeItem('spotify_id');
      localStorage.removeItem('spotify_email');
      localStorage.removeItem('spotify_name');
      
      // Clear session storage
      localStorage.removeItem('spotify_oauth_state');
      
      toast.success('Spotify tokens cleared. Please re-authenticate.');
      
      // Redirect to Spotify authentication
      router.push('/join/spotify');
    } catch (error) {
      console.error('Error clearing Spotify tokens:', error);
      toast.error('Failed to clear tokens. Please try again.');
    }
  };

  return (
    <button
      onClick={handleReauth}
      className={className}
      style={{
        padding: '8px 16px',
        backgroundColor: '#1DB954',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
        ...(className ? {} : {
          ':hover': {
            backgroundColor: '#1ed760'
          }
        })
      }}
    >
      {children}
    </button>
  );
} 