import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { HealthData } from '@/services/healthData';

interface HealthChartProps {
  data: HealthData[];
}

export const HealthChart = ({ data }: HealthChartProps) => {
  const screenWidth = Dimensions.get('window').width - 32;

  const chartData = {
    labels: data.map(item => 
      new Date(item.timestamp).toLocaleTimeString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit'
      })
    ),
    datasets: [{
      data: data.map(item => item.heartRate)
    }]
  };

  return (
    <View>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={350}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 77, 79, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};