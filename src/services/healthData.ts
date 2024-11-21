import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from '@/components/ui/use-toast';

export interface HealthData {
  heartRate: number;
  bloodOxygen: number;
  timestamp: string;
}

const logHealthData = (data: HealthData) => {
  const vietnamTime = formatInTimeZone(new Date(data.timestamp), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
  const logEntry = `${vietnamTime} - Heart Rate: ${data.heartRate}, Blood Oxygen: ${data.bloodOxygen}\n`;
  
  axios.post('http://192.168.1.15/log', {
    timestamp: vietnamTime,
    data: logEntry
  }).catch(error => {
    console.error('Failed to log health data:', error);
  });
};

export const fetchHealthData = async (): Promise<HealthData> => {
  try {
    console.log('Attempting to fetch data from http://192.168.1.15/data');
    const response = await axios.get('http://192.168.1.15/data');
    console.log('Received response:', response.data);
    
    if (!response.data || typeof response.data.heartRate !== 'number') {
      throw new Error('Invalid data format received');
    }

    const data = {
      heartRate: response.data.heartRate,
      bloodOxygen: response.data.bloodOxygen || 98, // Default value if not provided
      timestamp: new Date().toISOString(),
    };

    logHealthData(data);
    return data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    toast({
      title: "Connection Error",
      description: "Could not connect to the health sensors. Please check if the device is online.",
      variant: "destructive",
    });
    throw error;
  }
};

interface WaterRecommendation {
  recommendation: string;
  glassesCount: number;
}

export const getWaterRecommendation = async (heartRate: number, bloodOxygen: number): Promise<WaterRecommendation> => {
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
      glassesCount: 1,
    };
  }
};