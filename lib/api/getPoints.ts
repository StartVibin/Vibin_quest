import axios from "axios";

export const getDetailedPoints = async (email: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/points`,{
        email: email
    });

    return response.data.data;
}