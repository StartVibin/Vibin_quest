import { useState, useEffect, useCallback } from 'react';
import { createSpotifyService } from '@/lib/spotifyService';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string | null;
  spotifyUrl: string | null;
}

interface SpotifyArtist {
  id: string;
  name: string;
  image: string | null;
  spotifyUrl: string | null;
}

interface SpotifyRecentlyPlayed {
  id: string;
  name: string;
  artist: string;
  playedAt: string;
  image: string | null;
}

interface SpotifySavedTrack {
  id: string;
  name: string;
  artist: string;
  addedAt: string;
  image: string | null;
}

interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  followers: {
    total: number;
  };
  country: string;
  product: string;
}

interface SpotifyData {
  profile: SpotifyProfile;
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
  recentlyPlayed: SpotifyRecentlyPlayed[];
  savedTracks: SpotifySavedTrack[];
  stats: {
    totalSavedTracks: number;
    uniqueArtists: number;
    uniqueTracks: number;
    listeningSessions: number;
  };
}

interface UseSpotifyDataReturn {
  data: SpotifyData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

export function useSpotifyData(refreshInterval: number = 60000): UseSpotifyDataReturn {
  const [data, setData] = useState<SpotifyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      let spotifyService = createSpotifyService();

      // If no service and we have a refresh token, try to refresh
      if (!spotifyService) {
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if (refreshToken) {
          try {
            const response = await fetch('/api/auth/spotify/refresh-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refresh_token: refreshToken,
              }),
            });

            console.log(response);
            

            if (response.ok) {
              const tokenData = await response.json();

              // Update stored tokens
              localStorage.setItem('spotify_access_token', tokenData.access_token);
              localStorage.setItem('spotify_refresh_token', tokenData.refresh_token || refreshToken);
              localStorage.setItem('spotify_expires_in', tokenData.expires_in.toString());
              localStorage.setItem('spotify_token_expiry', (Date.now() + tokenData.expires_in * 1000).toString());

              spotifyService = new (await import('@/lib/spotifyService')).SpotifyService(tokenData.access_token);
            }
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
          }
        }
      }

      if (!spotifyService) {
        setError('No Spotify access token found. Please connect your Spotify account.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Get comprehensive user stats
      const userStats = await spotifyService.getUserStats();

      console.log("userStats ", userStats);


      // Transform the data for the dashboard
      const transformedData: SpotifyData = {
        profile: userStats.profile,
        topTracks: userStats.topTracks.slice(0, 5).map((track: { id: string; name: string; artists: Array<{ name: string }>; album: { name: string; images?: Array<{ url: string }> }; external_urls?: { spotify: string } }) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown Artist',
          album: track.album?.name || 'Unknown Album',
          image: track.album?.images?.[0]?.url || null,
          spotifyUrl: track.external_urls?.spotify || null,
        })),
        topArtists: userStats.topArtists.slice(0, 5).map((artist: { id: string; name: string; images?: Array<{ url: string }>; external_urls?: { spotify: string } }) => ({
          id: artist.id,
          name: artist.name,
          image: artist.images?.[0]?.url || null,
          spotifyUrl: artist.external_urls?.spotify || null,
        })),
        recentlyPlayed: userStats.recentlyPlayed.map((item: { track: { id: string; name: string; artists: Array<{ name: string }>; album?: { images?: Array<{ url: string }> } }; played_at: string }) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0]?.name || 'Unknown Artist',
          playedAt: item.played_at,
          image: item.track.album?.images?.[0]?.url || null,
        })),
        savedTracks: userStats.savedTracks.map((item: { track: { id: string; name: string; artists: Array<{ name: string }>; album?: { images?: Array<{ url: string }> } }; added_at: string }) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0]?.name || 'Unknown Artist',
          addedAt: item.added_at,
          image: item.track.album?.images?.[0]?.url || null,
        })),
        stats: {
          totalSavedTracks: userStats.stats.totalSavedTracks,
          uniqueArtists: userStats.stats.uniqueArtists,
          uniqueTracks: userStats.stats.uniqueTracks,
          listeningSessions: userStats.stats.listeningSessions,
        },
      };

      setData(transformedData);
      setLastUpdated(new Date());
      //console.log('Spotify data fetched successfully:', transformedData);
    } catch (err) {
      //console.error('Error fetching Spotify data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Spotify data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up interval for periodic refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        //console.log('Refreshing Spotify data...');
        fetchData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    refresh,
    lastUpdated,
  };
} 