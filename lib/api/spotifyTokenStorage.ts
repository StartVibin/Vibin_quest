import { API_BASE_URL } from './auth';

export interface SpotifyTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  userId?: string;
  spotifyEmail: string;
}

export interface TokenStorageResponse {
  success: boolean;
  message: string;
  data?: SpotifyTokenData;
}

export type TokenOperation = 'store' | 'get' | 'refresh';

export const spotifyTokenStorage = {
  // Single endpoint for all token operations
  handleTokenOperation: async (
    operation: TokenOperation,
    data: {
      spotifyEmail?: string;
      invitationCode?: string;
      accessToken?: string;
      refreshToken?: string;
      expiresIn?: number;
    }
  ): Promise<TokenStorageResponse> => {
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/spotify-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          ...data
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${operation} tokens`);
      }

      const result = await response.json();
      if (operation === 'get' && result.success) {
        localStorage.setItem('spotifyAccessToken', result.data?.accessToken || '');
        localStorage.setItem('spotifyRefreshToken', result.data?.refreshToken || '');
        localStorage.setItem('spotifyExpiresAt', result.data?.expiresAt.toString() || ''); 
        localStorage.setItem('spotifyEmail', result.data?.spotifyEmail || '');
      }
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Store tokens securely in backend database
  storeTokens: async (
    spotifyEmail: string,
    invitationCode: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<TokenStorageResponse> => {
    //const expiresAt = Date.now() + (expiresIn * 1000); // Convert to milliseconds
    
    return spotifyTokenStorage.handleTokenOperation('store', {
      spotifyEmail,
      invitationCode,
      accessToken,
      refreshToken,
      expiresIn
    });
  },

  // Retrieve tokens from backend database
  getTokens: async (spotifyEmail: string): Promise<TokenStorageResponse> => {
    return spotifyTokenStorage.handleTokenOperation('get', {
      spotifyEmail
    });
  },

  // Refresh access token using refresh token
  refreshAccessToken: async (refreshToken: string): Promise<TokenStorageResponse> => {
    return spotifyTokenStorage.handleTokenOperation('refresh', {
      refreshToken
    });
  },

  // Check if tokens are valid
  isTokenValid: (expiresAt: number): boolean => {
    const now = Date.now();
    const isValid = now < expiresAt;
    return isValid;
  },

  // Get valid access token (refresh if needed)
  getValidAccessToken: async (spotifyEmail: string): Promise<string | null> => {
    
    try {
      // First, try to get stored tokens
      const tokenResponse = await spotifyTokenStorage.getTokens(spotifyEmail);
      
      if (!tokenResponse.success || !tokenResponse.data) {
        return null;
      }

      const { accessToken, refreshToken, expiresAt } = tokenResponse.data;

      // Check if current token is still valid
      if (spotifyTokenStorage.isTokenValid(expiresAt)) {
        return accessToken;
      }

      // Token expired, refresh it
      const refreshResponse = await spotifyTokenStorage.refreshAccessToken(refreshToken);
      
      if (refreshResponse.success && refreshResponse.data) {
        return refreshResponse.data.accessToken;
      }

      return null;
    } catch (error) {
      console.error('❌ Token Storage: Error getting valid access token:', error);
      return null;
    }
  }
}; 