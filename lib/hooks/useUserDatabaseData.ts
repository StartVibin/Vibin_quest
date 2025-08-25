import { useQuery } from '@tanstack/react-query';

interface UserDatabaseData {
  tracksPlayedCount: number;
  diversityScore: number;
  historyScore: number;
  referralScore: number;
  totalBasePoints: number;
  walletAddress: string;
  spotifyEmail: string;
  playedDays?: number;
  createdAt?: string;
  updatedAt?: string;
}

async function fetchUserDatabaseData(email: string): Promise<UserDatabaseData> {
  if (!email) {
    throw new Error('Email is required');
  }

  try {
    const response = await fetch(`https://api.startvibin.io/api/v1/spotify/user/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch user data');
    }

    return {
      tracksPlayedCount: data.data.tracksPlayedCount || 0,
      diversityScore: data.data.diversityScore || 0,
      historyScore: data.data.historyScore || 0,
      referralScore: data.data.referralScore || 0,
      totalBasePoints: data.data.totalBasePoints || 0,
      walletAddress: data.data.walletAddress || '',
      spotifyEmail: data.data.spotifyEmail || email,
      playedDays: data.data.playedDays || 0,
      createdAt: data.data.createdAt || '',
      updatedAt: data.data.updatedAt || '',
    };
  } catch (error) {
    console.error('Error fetching user database data:', error);
    throw error;
  }
}

export function useUserDatabaseData() {
  const email = typeof window !== 'undefined' ? localStorage.getItem('spotify_email') : null;

  return useQuery({
    queryKey: ['userDatabaseData', email],
    queryFn: () => fetchUserDatabaseData(email!),
    enabled: !!email,
    refetchInterval: 60000, // Refetch every 60 seconds - reduced from 30 seconds for stability
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}
