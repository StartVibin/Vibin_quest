"use client";

import { useEffect } from 'react';

export default function ErrorLogger() {
  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;

    // Override fetch to intercept all requests
    window.fetch = async function(...args) {
      const [url, options] = args;
      
      try {
        const response = await originalFetch.apply(this, args);

        if (response.status === 403) {
          console.error('403 FORBIDDEN ERROR DETECTED:', {
            url,
            method: options?.method || 'GET',
            requestHeaders: options?.headers,
            requestBody: options?.body,
            responseHeaders: Object.fromEntries(response.headers.entries()),
            timestamp: new Date().toISOString()
          });

          // Try to get response body for more details
          try {
            const responseClone = response.clone();
            const responseText = await responseClone.text();
            console.error('🚨 403 Error Response Body:', responseText);
          } catch (e) {
            console.error('🚨 Could not read 403 response body:', e);
          }
        }

        return response;
      } catch (error) {
        console.error('🚨 Fetch Error:', {
          url,
          error: error instanceof Error ? error.message : error,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    };

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null; // This component doesn't render anything
} 