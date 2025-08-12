export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.startvibin.io';

console.log('🌍 Environment check:', {
  NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

export interface VerifyCodeRequest {
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const authAPI = {
  verifyCode: async (code: string): Promise<VerifyCodeResponse> => {
    const url = `${API_BASE_URL}/api/v1/auth/verify-code`;
    const payload = { code };
    
    console.log('🚀 Sending API request:', {
      url,
      method: 'POST',
      payload,
      headers: { 'Content-Type': 'application/json' }
    });
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📡 API Response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.message || 'Failed to verify code');
      }

      console.log('✅ API Success:', data);
      return data;
    } catch (error) {
      console.error('❌ Error verifying code:', error);
      throw error;
    }
  },
}; 