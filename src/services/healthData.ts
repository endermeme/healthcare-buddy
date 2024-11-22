import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

export interface HealthData {
  heartRate: number;
  bloodOxygen: number;
  timestamp: string;
}

interface ApiResponse {
  heartRate: number;
  spo2: number;
}

const API_ENDPOINT = 'http://192.168.1.15/data';

export const fetchHealthData = async (): Promise<HealthData | null> => {
  try {
    const response = await axios.get<ApiResponse>(API_ENDPOINT);
    
    if (!response.data || typeof response.data.heartRate !== 'number') {
      throw new Error('Invalid data format received');
    }

    const data: HealthData = {
      heartRate: response.data.heartRate,
      bloodOxygen: response.data.spo2,
      timestamp: new Date().toISOString(),
    };

    return data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    toast({
      title: "Lỗi kết nối",
      description: "Không thể kết nối với cảm biến. Vui lòng kiểm tra thiết bị.",
      variant: "destructive",
    });
    return null;
  }
};

interface WaterRecommendation {
  recommendation: string;
  glassesCount: number;
}

export const getWaterRecommendation = async (
  heartRate: number, 
  bloodOxygen: number
): Promise<WaterRecommendation> => {
  try {
    const prompt = `Based on a heart rate of ${heartRate} BPM and blood oxygen level of ${bloodOxygen}%, how many glasses of water should the person drink in the next hour? Provide a short recommendation and the number of glasses. Format your response as JSON with 'recommendation' and 'glassesCount' fields.`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer AIzaSyB_2kU2hjrDIojH0m5PezZtmdUuWp393Do`,
        },
      }
    );

    const result = JSON.parse(response.data.candidates[0].content.parts[0].text);
    return {
      recommendation: result.recommendation,
      glassesCount: result.glassesCount,
    };
  } catch (error) {
    console.error('Error getting water recommendation:', error);
    return {
      recommendation: "Stay hydrated by drinking water regularly",
      glassesCount: 8,
    };
  }
};