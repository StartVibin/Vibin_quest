"use client";

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSharedContext } from '@/provider/SharedContext';

function InviteCodeContent() {
  const { setSharedValue } = useSharedContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // Set the invitation code in shared context
      setSharedValue(prev => ({
        ...prev,
        invitationCode: code
      }));

      // Store in localStorage
      localStorage.setItem('invitation_code', code);

      // Set cookie
      document.cookie = `invitation_code=${code}; path=/; max-age=86400`;

      toast.success(`Referral code ${code} has been applied!`);
      
      // Redirect to the main page
      router.push('/join/spotify');
    } else {
      toast.error('No referral code provided');
      router.push('/');
    }
  }, [searchParams, setSharedValue, router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '1.2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
        <div>Applying referral code...</div>
        <div style={{ fontSize: '1rem', marginTop: '0.5rem', opacity: 0.8 }}>
          Redirecting you to the registration page
        </div>
      </div>
    </div>
  );
}

export default function InviteCodePage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <div>Loading...</div>
        </div>
      </div>
    }>
      <InviteCodeContent />
    </Suspense>
  );
}
