import { useQuery } from '@tanstack/react-query';
import { getDetailedPoints } from '../api/getPoints';
import { useEffect, useRef } from 'react';

interface UsePointsOptions {
  email: string;
  enabled?: boolean;
  refetchInterval?: number;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const usePoints = ({
  email,
  enabled = true,
  refetchInterval = 10000, // 10 seconds default
  onSuccess,
  onError
}: UsePointsOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    refetch,
    isRefetching,
    isFetching
  } = useQuery({
    queryKey: ['points', email],
    queryFn: () => getDetailedPoints(email),
    enabled: enabled && !!email,
    refetchInterval: refetchInterval,
    refetchIntervalInBackground: true,
    staleTime: 5000, // Data is considered fresh for 5 seconds
    gcTime: 300000, // Keep data in cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Handle success callback
  useEffect(() => {
    if (isSuccess && data && onSuccess) {
      onSuccess(data);
    }
  }, [isSuccess, data, onSuccess]);

  // Handle error callback
  useEffect(() => {
    if (isError && error && onError) {
      onError(error);
    }
  }, [isError, error, onError]);

  // Manual interval management as backup (optional)
  useEffect(() => {
    if (enabled && email && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [enabled, email, refetchInterval, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    isRefetching,
    isFetching,
    refetch,
    // Helper methods
    startPolling: () => refetch(),
    stopPolling: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    // Status helpers
    hasData: !!data,
    isPolling: isFetching || isRefetching,
  };
};

// Convenience hook with default 10-second interval
export const usePointsWithInterval = (email: string, enabled: boolean = true) => {
  return usePoints({
    email,
    enabled,
    refetchInterval: 10000, // 10 seconds
  });
};

// Hook for manual control (no automatic polling)
export const usePointsManual = (email: string, enabled: boolean = true) => {
  return usePoints({
    email,
    enabled,
    refetchInterval: 0, // No automatic polling
  });
};

// Hook with custom interval
export const usePointsCustomInterval = (
  email: string, 
  intervalMs: number, 
  enabled: boolean = true
) => {
  return usePoints({
    email,
    enabled,
    refetchInterval: intervalMs,
  });
};

/*
 * USAGE EXAMPLES:
 * 
 * // Basic usage with 10-second interval
 * const { data, isLoading, error } = usePointsWithInterval(userEmail);
 * 
 * // Custom interval (5 seconds)
 * const { data, isLoading, error } = usePointsCustomInterval(userEmail, 5000);
 * 
 * // Manual control (no automatic polling)
 * const { data, isLoading, error, refetch } = usePointsManual(userEmail);
 * 
 * // With callbacks
 * const { data, isLoading, error } = usePoints({
 *   email: userEmail,
 *   refetchInterval: 10000,
 *   onSuccess: (data) => console.log('Points updated:', data),
 *   onError: (error) => console.error('Failed to fetch points:', error)
 * });
 * 
 * // Conditional polling
 * const { data, isLoading, error } = usePoints({
 *   email: userEmail,
 *   enabled: isUserLoggedIn,
 *   refetchInterval: 10000
 * });
 */
