const API_BASE_URL = process.env.NEXT_PUBLIC_API || 'https://api.startvibin.io';

export interface SpotifyUser {
  id: string;
  email: string;
  display_name: string;
  images?: Array<{ url: string }>;
  country?: string;
  product?: string;
}

export interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface SpotifyDataSubmission {
  spotifyEmail: string;
  spotifyData: SpotifyUser;
  invitationCode: string;
}

// New interfaces for comprehensive Spotify data
export interface SpotifyTopTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: { id: string; name: string; images: Array<{ url: string }> };
  popularity: number;
  duration_ms: number;
}

export interface SpotifyRecentlyPlayed {
  track: SpotifyTopTrack;
  played_at: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: { total: number };
  owner: { id: string; display_name: string };
}

export interface SpotifyUserData {
  profile: SpotifyUser;
  topTracks: SpotifyTopTrack[];
  recentlyPlayed: SpotifyRecentlyPlayed[];
  playlists: SpotifyPlaylist[];
  refreshToken: string;
}

// New interfaces for extracted data
export interface SpotifyTopTrackInfo {
  name: string;
  artist: string;
  imageUrl?: string; // Add image URL for track artwork
}

export interface SpotifyTopArtistInfo {
  name: string;
  trackCount: number;
  imageUrl?: string; // Add image URL for artist image
}

export interface SpotifyListeningStats {
  totalTracksPlayed: number;
  uniqueArtistsCount: number;
  totalListeningTimeMs: number;
  anonymousTrackCount: number;
  topTracks: SpotifyTopTrackInfo[];
  topArtists: SpotifyTopArtistInfo[];
}

export const spotifyAPI = {
  // Get Spotify OAuth URL
  getAuthUrl: (): string => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = `${window.location.origin}/callback`;
    const scope = 'user-read-email user-read-private user-top-read user-read-recently-played';
    
    // console.log('🎵 Frontend: Generating Spotify OAuth URL...');
    // console.log('🎵 Frontend: Client ID:', clientId ? 'present' : 'missing');
    // console.log('🎵 Frontend: Redirect URI:', redirectUri);
    // console.log('🎵 Frontend: Window location origin:', window.location.origin);
    
    const params = new URLSearchParams({
      client_id: clientId!,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scope,
      show_dialog: 'true'
    });
    
    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    //console.log('🎵 Frontend: Generated auth URL:', authUrl);
    
    return authUrl;
  },

  // Exchange code for access token via Next.js API route (SECURE)
  exchangeCodeForToken: async (code: string): Promise<SpotifyAuthResponse> => {
    // console.log('🎵 Frontend: Sending code to backend for token exchange...');
    // console.log('🎵 Frontend: Code length:', code.length);
    
    const response = await fetch('/api/auth/spotify/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    // console.log('🎵 Frontend: Response status:', response.status);
    // console.log('🎵 Frontend: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to exchange code for token');
    }

    const responseData = await response.json();
    // console.log('✅ Frontend: Token exchange successful!');
    // console.log('🎵 Frontend: Received token data:', {
    //   access_token: responseData.access_token ? `${responseData.access_token.substring(0, 20)}...` : 'undefined',
    //   token_type: responseData.token_type,
    //   expires_in: responseData.expires_in,
    //   scope: responseData.scope
    // });

    return responseData;
  },

  // Get user profile from Spotify
  getUserProfile: async (accessToken: string): Promise<SpotifyUser> => {
   // console.log('🎵 Frontend: Getting user profile from Spotify...');
   // console.log('🎵 Frontend: Using access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'undefined');
    
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    const userData = await response.json();
   // console.log('✅ Frontend: Successfully got user profile!');
    // console.log('🎵 Frontend: User profile data:', {
    //   id: userData.id,
    //   email: userData.email,
    //   display_name: userData.display_name,
    //   country: userData.country,
    //   product: userData.product,
    //   images_count: userData.images?.length || 0
    // });

    return userData;
  },

  // Get user's top tracks
  getTopTracks: async (accessToken: string, limit: number = 20): Promise<SpotifyTopTrack[]> => {
    //console.log('🎵 Frontend: Getting user top tracks...');
    
    const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=short_term`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get top tracks');
    }

    const data = await response.json();
    return data.items;
  },

  // Get user's recently played tracks
  getRecentlyPlayed: async (accessToken: string, limit: number = 20): Promise<SpotifyRecentlyPlayed[]> => {
    //console.log('🎵 Frontend: Getting recently played tracks...');
    
    const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get recently played');
    }

    const data = await response.json();
    return data.items;
  },

  // Get user's playlists
  getPlaylists: async (accessToken: string, limit: number = 20): Promise<SpotifyPlaylist[]> => {
    //console.log('🎵 Frontend: Getting user playlists...');
    
    const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.error('❌ Frontend: Failed to get playlists');
      throw new Error('Failed to get playlists');
    }

    const data = await response.json();
    console.log('✅ Frontend: Got playlists:', data.items.length);
    return data.items;
  },

  // Get comprehensive user data (profile + music data)
  getComprehensiveUserData: async (accessToken: string, refreshToken: string): Promise<SpotifyUserData> => {
    
    try {
      const [profile, topTracks, recentlyPlayed, playlists] = await Promise.all([
        spotifyAPI.getUserProfile(accessToken),
        spotifyAPI.getTopTracks(accessToken, 10),
        spotifyAPI.getRecentlyPlayed(accessToken, 10),
        spotifyAPI.getPlaylists(accessToken, 10)
      ]);

      const userData: SpotifyUserData = {
        profile,
        topTracks,
        recentlyPlayed,
        playlists,
        refreshToken
      };

      return userData;
    } catch (error) {
      throw error;
    }
  },

  // Submit comprehensive Spotify data to backend
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitSpotifyData: async (data: SpotifyDataSubmission): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/spotify-connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit Spotify data');
    }

    return response.json();
  },

  // Extract top 5 tracks with name and artist
  getTopTracksInfo: (topTracks: SpotifyTopTrack[], limit: number = 5): SpotifyTopTrackInfo[] => {
    return topTracks.slice(0, limit).map(track => ({
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      imageUrl: track.album.images[0]?.url || undefined // Preserve album image
    }));
  },

  // Extract top 5 artists with track count
  getTopArtistsInfo: (topTracks: SpotifyTopTrack[], limit: number = 5): SpotifyTopArtistInfo[] => {
    const artistCounts: { [key: string]: { trackCount: number; imageUrl?: string } } = {};
    
    // Count tracks per artist and collect image URLs
    topTracks.forEach(track => {
      track.artists.forEach(artist => {
        if (!artistCounts[artist.name]) {
          artistCounts[artist.name] = { 
            trackCount: 0, 
            imageUrl: track.album.images[0]?.url || undefined 
          };
        }
        artistCounts[artist.name].trackCount += 1;
      });
    });
    
    // Convert to array and sort by track count
    const artistArray = Object.entries(artistCounts).map(([name, data]) => ({
      name,
      trackCount: data.trackCount,
      imageUrl: data.imageUrl
    }));
    
    // Sort by track count (descending) and take top 5
    return artistArray
      .sort((a, b) => b.trackCount - a.trackCount)
      .slice(0, limit);
  },

  // Calculate listening statistics
  getListeningStats: (userData: SpotifyUserData): SpotifyListeningStats => {
    const { topTracks } = userData;
    
    // Get unique artists from top tracks
    const uniqueArtists = new Set<string>();
    topTracks.forEach(track => {
      track.artists.forEach(artist => uniqueArtists.add(artist.name));
    });
    
    // Calculate total listening time (from top tracks)
    const totalListeningTimeMs = topTracks.reduce((total, track) => total + track.duration_ms, 0);
    
    // Count anonymous tracks (tracks without proper artist info)
    const anonymousTrackCount = topTracks.filter(track => 
      !track.artists.length || track.artists.some(artist => 
        !artist.name || artist.name.toLowerCase().includes('unknown') || artist.name.toLowerCase().includes('anonymous')
      )
    ).length;
    
    // Get top 5 tracks and artists
    const topTracksInfo = spotifyAPI.getTopTracksInfo(topTracks, 5);
    const topArtistsInfo = spotifyAPI.getTopArtistsInfo(topTracks, 5);
    
    const stats: SpotifyListeningStats = {
      totalTracksPlayed: topTracks.length,
      uniqueArtistsCount: uniqueArtists.size,
      totalListeningTimeMs,
      anonymousTrackCount,
      topTracks: topTracksInfo,
      topArtists: topArtistsInfo
    };
    
    // console.log('📊 Listening stats calculated:', {
    //   totalTracks: stats.totalTracksPlayed,
    //   uniqueArtists: stats.uniqueArtistsCount,
    //   totalTimeMinutes: Math.round(stats.totalListeningTimeMs / 60000),
    //   anonymousTracks: stats.anonymousTrackCount,
    //   topTracks: stats.topTracks.length,
    //   topArtists: stats.topArtists.length
    // });
    
    return stats;
  },

  // Get formatted listening time
  formatListeningTime: (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  },

  // Submit comprehensive Spotify data with music preferences
  submitComprehensiveSpotifyData: async (
    spotifyEmail: string,
    invitationCode: string,
    userData: SpotifyUserData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
   // console.log('🎵 Frontend: Submitting comprehensive Spotify data...');
    
    // Calculate listening statistics
    const listeningStats = spotifyAPI.getListeningStats(userData);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/spotify-connect-comprehensive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spotifyEmail,
        invitationCode,
        spotifyData: userData,
        listeningStats
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit comprehensive Spotify data');
    }

    const result = await response.json();
    return result;
  }
}; 