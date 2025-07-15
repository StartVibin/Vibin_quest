"use client";

import React, { useState, useEffect } from 'react';

export default function RegistrationDebug() {
  const [sessionData, setSessionData] = useState<Record<string, string>>({});
  const [localData, setLocalData] = useState<Record<string, string>>({});

  const refreshData = () => {
    // Get all sessionStorage data
    const session: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        session[key] = sessionStorage.getItem(key) || '';
      }
    }
    setSessionData(session);

    // Get all localStorage data
    const local: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        local[key] = localStorage.getItem(key) || '';
      }
    }
    setLocalData(local);
  };

  useEffect(() => {
    refreshData();
    // Refresh every 2 seconds
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  const requiredSessionData = [
    'invitationCode',
    'walletAddress',
    'spotifyEmail',
    'spotify_oauth_state'
  ];

  const requiredLocalData = [
    'spotify_id',
    'spotify_email', 
    'spotify_name',
    'spotify_access_token',
    'spotify_refresh_token',
    'spotify_expires_in',
    'spotify_token_expiry'
  ];

  const missingSessionData = requiredSessionData.filter(key => !sessionData[key]);
  const missingLocalData = requiredLocalData.filter(key => !localData[key]);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#1a1a1a',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      border: '1px solid #333'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#1DB954' }}>Registration Debug</h4>
      
      <div style={{ marginBottom: '15px' }}>
        <h5 style={{ margin: '0 0 5px 0', color: '#fff' }}>SessionStorage:</h5>
        {Object.keys(sessionData).length === 0 ? (
          <p style={{ color: '#ff6b6b', margin: '0' }}>Empty</p>
        ) : (
          <div>
            {Object.entries(sessionData).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '2px' }}>
                <span style={{ color: '#1DB954' }}>{key}:</span> 
                <span style={{ color: value ? '#fff' : '#ff6b6b' }}>
                  {value ? (key.includes('token') ? '***' : value) : 'MISSING'}
                </span>
              </div>
            ))}
          </div>
        )}
        {missingSessionData.length > 0 && (
          <div style={{ marginTop: '5px' }}>
            <span style={{ color: '#ff6b6b' }}>Missing: {missingSessionData.join(', ')}</span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h5 style={{ margin: '0 0 5px 0', color: '#fff' }}>LocalStorage:</h5>
        {Object.keys(localData).length === 0 ? (
          <p style={{ color: '#ff6b6b', margin: '0' }}>Empty</p>
        ) : (
          <div>
            {Object.entries(localData).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '2px' }}>
                <span style={{ color: '#1DB954' }}>{key}:</span> 
                <span style={{ color: value ? '#fff' : '#ff6b6b' }}>
                  {value ? (key.includes('token') ? '***' : value) : 'MISSING'}
                </span>
              </div>
            ))}
          </div>
        )}
        {missingLocalData.length > 0 && (
          <div style={{ marginTop: '5px' }}>
            <span style={{ color: '#ff6b6b' }}>Missing: {missingLocalData.join(', ')}</span>
          </div>
        )}
      </div>

      <button 
        onClick={refreshData}
        style={{
          background: '#1DB954',
          color: '#fff',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Refresh
      </button>
    </div>
  );
} 