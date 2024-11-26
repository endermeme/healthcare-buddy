import axios from 'axios';

const BASE_API_ENDPOINT = 'http://192.168.1.15/data';

export interface ApiResponse {
  heartRate: number;
  spo2: number;
}

export const fetchSensorData = async (apiKey: string) => {
  const response = await axios.get<ApiResponse>(BASE_API_ENDPOINT, {
    params: { key: apiKey },
    timeout: 5000,
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
  return response.data;
};