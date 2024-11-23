import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useHealthData } from '../hooks/useHealthData';
import { LineChart } from 'react-native-chart-kit';

const Index = () => {
  const [timeRange, setTimeRange] = useState('5m');
  const { currentData, history, averages } = useHealthData(timeRange);

  const chartData = {
    labels: history.map(item => {
      const date = new Date(item.timestamp);
      return `${date.getHours()}:${date.getMinutes()}`;
    }),
    datasets: [
      {
        data: history.map(item => item.heartRate),
        color: () => '#ff4d4f',
        strokeWidth: 2,
      },
      {
        data: history.map(item => item.bloodOxygen),
        color: () => '#4096ff',
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Nhịp tim</Text>
          <Text style={styles.statValue}>
            {currentData?.heartRate || '--'} BPM
          </Text>
          <Text style={styles.statAverage}>
            TB: {averages.avgHeartRate}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>SpO2</Text>
          <Text style={styles.statValue}>
            {currentData?.bloodOxygen || '--'}%
          </Text>
          <Text style={styles.statAverage}>
            TB: {averages.avgBloodOxygen}%
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statAverage: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default Index;
