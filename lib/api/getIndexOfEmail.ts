import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;


export const getIndexOfEmail = async (email: string) => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/spotify/get-index-of-email`, {
    params: { email },
  });
  return response.data.data.index;
};
