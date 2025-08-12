interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  };
  external_urls: {
    spotify: string;
  };
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  external_urls: {
    spotify: string;
  };
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

export class SpotifyService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(endpoint,"request to the spotify api");
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Spotify API error: ${response.status} ${response.statusText}`;
      
      // Handle specific error cases
      if (response.status === 403) {
        if (errorText.includes('Insufficient client scope')) {
          errorMessage = 'Insufficient client scope: Please re-authenticate with Spotify to access all features';
        } else if (errorText.includes('Forbidden')) {
          errorMessage = 'Access forbidden: Please check your Spotify permissions';
        }
      } else if (response.status === 401) {
        errorMessage = 'Unauthorized: Please re-authenticate with Spotify';
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Get user profile
  async getUserProfile(): Promise<SpotifyProfile> {
    return this.makeRequest('/me');
  }

  // Get user's top tracks (short_term, medium_term, long_term)
  async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20): Promise<{ items: SpotifyTrack[] }> {
    return this.makeRequest(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
  }

  // Get user's top artists
  async getTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20): Promise<{ items: SpotifyArtist[] }> {
    return this.makeRequest(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
  }

  // Get recently played tracks
  async getRecentlyPlayed(limit: number = 50): Promise<{ items: Array<{ track: SpotifyTrack; played_at: string }> }> {
    return this.makeRequest(`/me/player/recently-played?limit=${limit}`);
  }

  // Get user's playlists
  async getUserPlaylists(limit: number = 50): Promise<{ items: Array<{ id: string; name: string; images?: Array<{ url: string }> }> }> {
    return this.makeRequest(`/me/playlists?limit=${limit}`);
  }

  // Get user's saved tracks
  async getSavedTracks(limit: number = 50): Promise<{ items: Array<{ track: SpotifyTrack; added_at: string }> }> {
    return this.makeRequest(`/me/tracks?limit=${limit}`);
  }

  // Get current playback
  async getCurrentPlayback(): Promise<{ is_playing: boolean; item?: SpotifyTrack }> {
    return this.makeRequest('/me/player');
  }

  // Get user's followed artists
  async getFollowedArtists(limit: number = 50): Promise<{ artists: { items: SpotifyArtist[] } }> {
    return this.makeRequest(`/me/following?type=artist&limit=${limit}`);
  }

  // Get audio features for tracks
  async getAudioFeatures(trackIds: string[]): Promise<{ audio_features: Array<{ id: string; danceability: number; energy: number; valence: number }> }> {
    const ids = trackIds.join(',');
    return this.makeRequest(`/audio-features?ids=${ids}`);
  }

  // Get detailed track analysis
  async getTrackAnalysis(trackId: string): Promise<{ segments: Array<{ start: number; duration: number; confidence: number }> }> {
    return this.makeRequest(`/audio-analysis/${trackId}`);
  }

  // Get user's listening history (recently played with more details)
  async getListeningHistory(limit: number = 50): Promise<{ recentlyPlayed: Array<{ track: SpotifyTrack; played_at: string }>; audioFeatures: Array<{ id: string; danceability: number; energy: number; valence: number }> }> {
    const recentlyPlayed = await this.getRecentlyPlayed(limit);
    
    // Get unique track IDs
    const trackIds = [...new Set(recentlyPlayed.items.map(item => item.track.id))];
    
    // Get audio features for these tracks
    const audioFeatures = await this.getAudioFeatures(trackIds);
    
    // Combine the data
    return {
      recentlyPlayed: recentlyPlayed.items,
      audioFeatures: audioFeatures.audio_features,
    };
  }

  // Get comprehensive user stats
  async getUserStats(): Promise<{
    profile: SpotifyProfile;
    topTracks: SpotifyTrack[];
    topArtists: SpotifyArtist[];
    recentlyPlayed: Array<{ track: SpotifyTrack; played_at: string }>;
    savedTracks: Array<{ track: SpotifyTrack; added_at: string }>;
    stats: {
      totalSavedTracks: number;
      uniqueArtists: number;
      uniqueTracks: number;
      listeningSessions: number;
    };
  }> {
    try {
      const [profile, topTracks, topArtists, recentlyPlayed, savedTracks] = await Promise.all([
        this.getUserProfile(),
        this.getTopTracks('long_term', 50),
        this.getTopArtists('medium_term', 50),
        this.getRecentlyPlayed(50),
        this.getSavedTracks(50),
      ]);

      return {
        profile,
        topTracks: topTracks.items,
        topArtists: topArtists.items,
        recentlyPlayed: recentlyPlayed.items,
        savedTracks: savedTracks.items,
        stats: {
          totalSavedTracks: savedTracks.items.length,
          uniqueArtists: new Set(topArtists.items.map(artist => artist.id)).size,
          uniqueTracks: new Set(topTracks.items.map(track => track.id)).size,
          listeningSessions: recentlyPlayed.items.length,
        },
      };
    } catch (error) {
      //console.error('Error fetching user stats:', error);
      throw error;
    }
  }
}

// Utility function to create Spotify service from stored token
export function createSpotifyService(): SpotifyService | null {
  const accessToken = localStorage.getItem('spotify_access_token');
  const tokenExpiry = localStorage.getItem('spotify_token_expiry');
  
  if (!accessToken) {
    //console.log('No Spotify access token found in localStorage');
    return null;
  }

  // Check if token is expired
  if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
    //console.log('Spotify access token expired, attempting refresh...');
    // For now, return null and let the hook handle the refresh
    // In a real app, you might want to handle this differently
    return null;
  }

  return new SpotifyService(accessToken);
}

// Function to refresh the Spotify token (unused but kept for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function refreshSpotifyToken(): Promise<SpotifyService | null> {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  
  if (!refreshToken) {
    //console.log('No refresh token found');
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_expires_in');
    localStorage.removeItem('spotify_token_expiry');
    return null;
  }

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

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokenData = await response.json();
    
    // Update stored tokens
    localStorage.setItem('spotify_access_token', tokenData.access_token);
    localStorage.setItem('spotify_refresh_token', tokenData.refresh_token || refreshToken);
    localStorage.setItem('spotify_expires_in', tokenData.expires_in.toString());
    localStorage.setItem('spotify_token_expiry', (Date.now() + tokenData.expires_in * 1000).toString());

    return new SpotifyService(tokenData.access_token);
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    // Clear invalid tokens
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_expires_in');
    localStorage.removeItem('spotify_token_expiry');
    return null;
  }
} 