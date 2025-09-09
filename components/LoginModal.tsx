import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Check if user has existing authentication data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/user/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        if (userData.success && userData.data) {
          // User exists - restore their session data
          const user = userData.data;
          
          // Store user data in localStorage
          localStorage.setItem('spotify_id', user.spotifyId || '');
          localStorage.setItem('spotify_email', user.spotifyEmail || email);
          localStorage.setItem('spotify_name', user.spotifyName || '');
          localStorage.setItem('spotify_access_token', user.spotifyAccessToken || '');
          localStorage.setItem('spotify_refresh_token', user.spotifyRefreshToken || '');
          localStorage.setItem('spotify_expires_in', user.spotifyExpiresIn || '7200');
          localStorage.setItem('spotify_token_expiry', (Date.now() + (parseInt(user.spotifyExpiresIn || '7200') * 1000)).toString());
          
          // Set cookies for middleware access
          document.cookie = `spotify_id=${user.spotifyId || ''}; path=/; max-age=86400`;
          document.cookie = `spotify_email=${user.spotifyEmail || email}; path=/; max-age=86400`;
          document.cookie = `spotify_access_token=${user.spotifyAccessToken || ''}; path=/; max-age=86400`;
          
          // Store referral code if available
          if (user.referralCode) {
            localStorage.setItem('user_referral_code', user.referralCode);
          }
          
          toast.success('Welcome back! You are now logged in.');
          onLoginSuccess();
          onClose();
          
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          toast.error('No account found with this email address. Please register first.');
        }
      } else if (response.status === 404) {
        toast.error('No account found with this email address. Please register first.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Login to Your Account</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.loginIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <h3>Welcome Back!</h3>
          <p>Enter your email address to access your account.</p>
          
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={styles.emailInput}
                disabled={isLoading}
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading || !email.trim()}
              className={styles.loginButton}
            >
              {isLoading ? (
                <div className={styles.loadingSpinner} />
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className={styles.helpText}>
            <p>Don't have an account? <button onClick={() => { onClose(); router.push('/join'); }} className={styles.registerLink}>Register here</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}
