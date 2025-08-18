"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';

interface AuthGuardProps {
  children: React.ReactNode;
  requireFullAuth?: boolean;
}

export default function AuthGuard({ children, requireFullAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthenticationStatus();
  }, [isConnected]);

  const checkAuthenticationStatus = () => {
    try {
      // Check if user has completed the full authentication flow
      const invitationCode = localStorage.getItem('inviteCode');
      const spotifyId = localStorage.getItem('spotify_id');
      const spotifyEmail = localStorage.getItem('spotify_email');
      const spotifyAccessToken = localStorage.getItem('spotify_access_token');
      
      // For full authentication, we need all these items
      if (requireFullAuth) {
        const hasFullAuth = invitationCode && spotifyId && spotifyEmail && spotifyAccessToken && isConnected;
        
        if (!hasFullAuth) {
          // Redirect to appropriate step based on what's missing
          if (!invitationCode) {
            router.push('/');
          } else if (!spotifyId || !spotifyEmail || !spotifyAccessToken) {
            router.push('/join/spotify');
          } else if (!isConnected) {
            router.push('/join/wallet');
          }
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } else {
        // For partial auth (like join pages), just check invitation code
        if (!invitationCode) {
          router.push('/');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      toast.error('Authentication check failed. Please try again.');
      router.push('/');
      setIsAuthenticated(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
