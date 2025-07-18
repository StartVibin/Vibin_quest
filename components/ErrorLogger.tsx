"use client";

import { useEffect } from 'react';

export default function ErrorLogger() {
  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;

    // Override fetch to intercept all requests
    window.fetch = async function(...args) {
      const [url, options] = args;
      const startTime = Date.now();
      
      try {
        // Log the request
        // console.log('🌐 Fetch Request:', {
        //   url,
        //   method: options?.method || 'GET',
        //   headers: options?.headers,
        //   body: options?.body,
        //   timestamp: new Date().toISOString()
        // });

        // Make the actual request
        const response = await originalFetch.apply(this, args);
        const endTime = Date.now();
        
        // Log the response
        console.log('📡 Fetch Response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          duration: `${endTime - startTime}ms`,
          timestamp: new Date().toISOString()
        });

        // If it's a 403 error, log additional details
        if (response.status === 403) {
          console.error('🚨 403 FORBIDDEN ERROR DETECTED:', {
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