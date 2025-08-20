import { useState, useEffect } from 'react';
import { getClaimStatus } from '@/lib/api';

interface ClaimStatus {
  canClaim: boolean;
  lastClaimDate: string;
  nextClaimDate: string;
  timeUntilNextClaim: number;
  daysUntilNextClaim: number;
  hoursUntilNextClaim: number;
  minutesUntilNextClaim: number;
}

export const useClaimStatus = (email: string | null) => {
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaimStatus = async () => {
    if (!email) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getClaimStatus(email);
      setClaimStatus(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch claim status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimStatus();
    
    // Refresh every minute to update countdown
    const interval = setInterval(fetchClaimStatus, 60000);
    return () => clearInterval(interval);
  }, [email]);

  return { claimStatus, loading, error, refetch: fetchClaimStatus };
};