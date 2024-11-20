import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useHealthData, TimeRange } from '@/hooks/useHealthData';
import { HealthChart } from '@/components/HealthChart';
import { ProfileHeader } from '@/components/ProfileHeader';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import { BottomNavigation } from '@/components/BottomNavigation';

const Index = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('60s');
  const { currentData, history, averages } = useHealthData(timeRange);

  return (
    <View style={styles.container}>
      <ScrollView>
        <ProfileHeader />
        <View style={styles.content}>
          <Text style={styles.title}>Health Monitoring</Text>
          <Text style={styles.subtitle}>Real-time Heart Rate Data</Text>

          <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Heart color="#ff4d4f" size={24} />
                <Text style={styles.statTitle}>Heart Rate</Text>
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>
                  {currentData?.heartRate || '--'}
                  <Text style={styles.statUnit}> BPM</Text>
                </Text>
                <Text style={styles.statAvg}>
                  Avg: {averages.avgHeartRate} BPM
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <HealthChart data={history} />
          </View>
        </View>
      </ScrollView>
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: 16,
    color: '#666',
  },
  statAvg: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    height: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
});

export default Index;