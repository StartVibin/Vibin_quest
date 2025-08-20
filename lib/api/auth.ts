export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;
export interface VerifyCodeRequest {
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export const authAPI = {
  verifyCode: async (code: string): Promise<VerifyCodeResponse> => {
    const url = `${API_BASE_URL}/api/v1/auth/verify-code`;
    const payload = { code };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

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