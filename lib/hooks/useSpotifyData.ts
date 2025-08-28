import { useQuery } from '@tanstack/react-query';
import { spotifyAPI } from '@/lib/api/spotify';

export function useSpotifyData(inviteCode?: string) {
  //const queryClient = useQueryClient();

  // Get data directly from localStorage
  const code = inviteCode || (typeof window !== 'undefined' ? localStorage.getItem('spotify_id') || '' : '');
  const mail = (typeof window !== 'undefined' ? localStorage.getItem('spotify_email') || '' : '');
  const accessToken = (typeof window !== 'undefined' ? localStorage.getItem('spotify_access_token') || '' : '');
  const refreshToken = (typeof window !== 'undefined' ? localStorage.getItem('spotify_refresh_token') || '' : '');
  const tokenExpiry = (typeof window !== 'undefined' ? localStorage.getItem('spotify_token_expiry') || '0' : '0');


  // Check if token is expired
  const isTokenExpired = () => {
    // Check if we have a timestamp expiry
    if (tokenExpiry && tokenExpiry !== '0') {
      const expiryTime = parseInt(tokenExpiry);
      const now = Date.now();
      const isExpired = now >= expiryTime;
      
      
      return isExpired;
    }
    
    // Check if we have expires_in (seconds from now)
    const expiresIn = (typeof window !== 'undefined' ? localStorage.getItem('spotify_expires_in') || '0' : '0');
    if (expiresIn && expiresIn !== '0') {
      // Calculate when the token was created and when it expires
      const expiresInSeconds = parseInt(expiresIn);
      const tokenCreated = (typeof window !== 'undefined' ? localStorage.getItem('spotify_token_created') || '0' : '0');
      
      if (tokenCreated && tokenCreated !== '0') {
        const createdTime = parseInt(tokenCreated);
        const expiryTime = createdTime + (expiresInSeconds * 1000);
        const now = Date.now();
        const isExpired = now >= expiryTime;
        
        return isExpired;
      }
    }
    
    return false;
  };

  // Fetch Spotify data using tokens from localStorage
  const fetchSpotifyData = async () => {
    
    if (!accessToken || !refreshToken) {
      throw new Error('No access token or refresh token found');
    }

    if (isTokenExpired()) {
      throw new Error('Token expired - please re-authenticate with Spotify');
    }

    try {
      const userData = await spotifyAPI.getComprehensiveUserData(accessToken, refreshToken);
      const stats = spotifyAPI.getListeningStats(userData);
      const lastKnownStats = JSON.parse(localStorage.getItem('lastKnownSpotifyStats') || '{}');
      const incrementalStats = {
        listeningTime: Math.max(0, stats.totalListeningTimeMs - (lastKnownStats.listeningTime || 0)),
        uniqueArtistCount: Math.max(0, stats.uniqueArtistsCount - (lastKnownStats.uniqueArtistsCount || 0)),
        tracksPlayedCount: Math.max(0, stats.totalTracksPlayed - (lastKnownStats.tracksPlayedCount || 0)),
        anonymousTracksPlayedCount: Math.max(0, stats.anonymousTrackCount - (lastKnownStats.anonymousTrackCount || 0)),
        spotifyEmail: mail,
      };
      
      // Store current stats for next comparison
      localStorage.setItem('lastKnownSpotifyStats', JSON.stringify({
        listeningTime: stats.totalListeningTimeMs,
        uniqueArtistsCount: stats.uniqueArtistsCount,
        tracksPlayedCount: stats.totalTracksPlayed,
        anonymousTrackCount: stats.anonymousTrackCount,
        timestamp: Date.now()
      }));
      
      // Only send data if there are actual changes
      const hasChanges = Object.values(incrementalStats).some(value => 
        typeof value === 'number' && value > 0
      );
      
      if (hasChanges) {

        await sendSpotifyData(incrementalStats);
      } else {

      }

      return {
        topArtists: stats.topArtists.slice(0, 5),
        topTracks: stats.topTracks.slice(0, 5),
        totalListeningTimeMs: stats.totalListeningTimeMs,
        totalTracksPlayed: stats.totalTracksPlayed,
        uniqueArtistsCount: stats.uniqueArtistsCount,
        anonymousTrackCount: stats.anonymousTrackCount,
      };
    } catch (error) {
      throw error;
    }
  };

  // Query for Spotify data, refetch every 30 seconds
  const {
    data: spotifyData,
    isLoading: isSpotifyLoading,
    error: spotifyError,
    refetch: refetchSpotifyData,
  } = useQuery({
    queryKey: ['spotify-data', code, accessToken],
    queryFn: fetchSpotifyData,
    enabled: !!(code && mail && accessToken && refreshToken), // Simplified: just check if we have the basic data
    refetchInterval: 30000, // 30 seconds - reduced from 6 seconds to prevent overwhelming backend
    refetchIntervalInBackground: true, // Critical: allows refetching when tab is not focused
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 3, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 15000, // Data is considered stale after 15 seconds
    gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
  });

  return {
    isLoading: isSpotifyLoading,
    error: spotifyError,
    data: spotifyData,
    refetch: refetchSpotifyData,
  };
}

/**
 * Send Spotify stats to the backend for updating user info
 * @param stats Object containing all Spotify stats and scores
 * Required: spotifyEmail
 */
export async function sendSpotifyData(stats: {
  spotifyEmail: string;
  invitationCode?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  volumeScore?: number;
  diversityScore?: number;
  historyScore?: number;
  referralScore?: number;
  totalBasePoints?: number;
  referralCode?: string;
  tracksPlayedCount?: number;
  uniqueArtistCount?: number;
  listeningTime?: number;
  anonymousTracksPlayedCount?: number;
  playedDays?: number;
  referralCount?: number;
  point?: number;
  pointsToday?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invitedUsers?: any;
}) {
  if (!stats.spotifyEmail) {
    throw new Error('spotifyEmail is required');
  }
  try {
    const res = await fetch('https://api.startvibin.io/api/v1/auth/spotify-info/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
} 