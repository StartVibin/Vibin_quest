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
      
      console.log(`[${new Date().toISOString()}] [isTokenExpired] Using timestamp:`, {
        expiryTime,
        now,
        isExpired,
        expiryDate: new Date(expiryTime).toISOString(),
        nowDate: new Date(now).toISOString(),
        timeUntilExpiry: expiryTime - now
      });
      
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
        
        console.log(`[${new Date().toISOString()}] [isTokenExpired] Using expires_in:`, {
          expiresInSeconds,
          createdTime,
          expiryTime,
          now,
          isExpired,
          expiryDate: new Date(expiryTime).toISOString(),
          nowDate: new Date(now).toISOString(),
          timeUntilExpiry: expiryTime - now
        });
        
        return isExpired;
      }
    }
    
    // If we can't determine expiry, assume not expired
    console.log(`[${new Date().toISOString()}] [isTokenExpired] Cannot determine expiry, assuming not expired`);
    return false;
  };

  // Fetch Spotify data using tokens from localStorage
  const fetchSpotifyData = async () => {
    
    if (!accessToken || !refreshToken) {
      throw new Error('No access token or refresh token found');
    }

    if (isTokenExpired()) {
      console.log(`[${new Date().toISOString()}] [fetchSpotifyData] Token expired, need to refresh`);
      // For now, just throw an error - you'll need to implement token refresh
      throw new Error('Token expired - please re-authenticate with Spotify');
    }

    try {
      // Fetch comprehensive user data using the access token
      const userData = await spotifyAPI.getComprehensiveUserData(accessToken, refreshToken);
      const stats = spotifyAPI.getListeningStats(userData);
      
      // Get the last known stats from localStorage to calculate incremental changes
      const lastKnownStats = JSON.parse(localStorage.getItem('lastKnownSpotifyStats') || '{}');
      
      // Calculate incremental changes (new data since last update)
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
        console.log(`[${new Date().toISOString()}] [fetchSpotifyData] Sending incremental stats:`, incrementalStats);
        console.log(`[${new Date().toISOString()}] [fetchSpotifyData] Previous stats:`, lastKnownStats);
        console.log(`[${new Date().toISOString()}] [fetchSpotifyData] Current stats:`, {
          listeningTime: stats.totalListeningTimeMs,
          uniqueArtistsCount: stats.uniqueArtistsCount,
          tracksPlayedCount: stats.totalTracksPlayed,
          anonymousTrackCount: stats.anonymousTrackCount
        });
        await sendSpotifyData(incrementalStats);
      } else {
        console.log(`[${new Date().toISOString()}] [fetchSpotifyData] No new data to send`);
        console.log(`[${new Date().toISOString()}] [fetchSpotifyData] Current stats unchanged from:`, lastKnownStats);
      }
      
      console.log(`[${new Date().toISOString()}] [fetchSpotifyData] Data fetched and processed successfully`);
      
      return {
        topArtists: stats.topArtists.slice(0, 5),
        topTracks: stats.topTracks.slice(0, 5),
        totalListeningTimeMs: stats.totalListeningTimeMs,
        totalTracksPlayed: stats.totalTracksPlayed,
        uniqueArtistsCount: stats.uniqueArtistsCount,
        anonymousTrackCount: stats.anonymousTrackCount,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [fetchSpotifyData] Error:`, error);
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

  // Test query to verify React Query intervals work
  // const testQuery = useQuery({
  //   queryKey: ['test-interval'],
  //   queryFn: () => {
  //     console.log(`[${new Date().toISOString()}] [testQuery] Test interval working!`);
  //     return { timestamp: Date.now() };
  //   },
  //   refetchInterval: 3000, // 3 seconds for testing
  //   refetchIntervalInBackground: true,
  //   staleTime: 0,
  // });

  // Monitor hook state changes
  // useEffect(() => {
  //   console.log(`[${new Date().toISOString()}] [useSpotifyData] State changed:`, {
  //     spotifyData: !!spotifyData,
  //     isSpotifyLoading,
  //     spotifyError: !!spotifyError,
  //     code: !!code,
  //     mail: !!mail,
  //     accessToken: !!accessToken,
  //     refreshToken: !!refreshToken,
  //     tokenExpired: isTokenExpired(),
  //     enabled: !!(code && mail && accessToken && refreshToken)
  //   });
  // }, [spotifyData, isSpotifyLoading, spotifyError, code, mail, accessToken, refreshToken]);

  // // Log when the query is enabled/disabled
  // useEffect(() => {
  //   const isEnabled = !!(code && mail && accessToken && refreshToken);
  //   console.log(`[${new Date().toISOString()}] [useSpotifyData] Query enabled:`, isEnabled, {
  //     hasCode: !!code,
  //     hasMail: !!mail,
  //     hasAccessToken: !!accessToken,
  //     hasRefreshToken: !!refreshToken,
  //     tokenExpired: isTokenExpired()
  //   });
  // }, [code, mail, accessToken, refreshToken]);

  // // Debug localStorage values
  // useEffect(() => {
  //   console.log(`[${new Date().toISOString()}] [useSpotifyData] localStorage values:`, {
  //     spotify_id: localStorage.getItem('spotify_id'),
  //     spotify_email: localStorage.getItem('spotify_email'),
  //     spotify_access_token: localStorage.getItem('spotify_access_token')?.substring(0, 20) + '...',
  //     spotify_refresh_token: localStorage.getItem('spotify_refresh_token')?.substring(0, 20) + '...',
  //     spotify_token_expiry: localStorage.getItem('spotify_token_expiry'),
  //     spotify_expires_in: localStorage.getItem('spotify_expires_in')
  //   });
  // }, []);

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
    console.log('[sendSpotifyData] Response:', data);
    return data;
  } catch (error) {
    console.error('[sendSpotifyData] Error:', error);
    throw error;
  }
} 