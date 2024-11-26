export interface HealthData {
  heartRate: number;
  bloodOxygen: number;
  timestamp: string;
  heartRates: number[];
  oxygenLevels: number[];
}

export interface ApiResponse {
  heartRate: number;
  spo2: number;
}

export interface HourlyLog {
  hour: string;
  isRecording: boolean;
  lastRecordTime: string | null;
  averageHeartRate: number;
  averageBloodOxygen: number;
  secondsData: HealthData[];
}

export interface WaterRecommendation {
  recommendation: string;
  glassesCount: number;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  audioUrl?: string;
  transcription?: string;
}