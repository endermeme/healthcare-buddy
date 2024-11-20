import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Heart, Plus, BookOpen, User, Home } from 'lucide-react-native';
import { useHealthData, TimeRange } from '@/hooks/useHealthData';
import { HealthChart } from '@/components/HealthChart';

const Index = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('60s');
  const { currentData, history, averages } = useHealthData(timeRange);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '60s', label: '1 Minute' },
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profile}>
            <View style={styles.avatar} />
            <Text style={styles.name}>Jillian Hanson</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Health Monitoring</Text>
          <Text style={styles.subtitle}>Real-time Heart Rate Data</Text>

          {/* Time Range Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRangeContainer}>
            {timeRanges.map(({ value, label }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.timeRangeButton,
                  timeRange === value && styles.timeRangeButtonActive
                ]}
                onPress={() => setTimeRange(value)}
              >
                <Text style={[
                  styles.timeRangeText,
                  timeRange === value && styles.timeRangeTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Stats */}
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

          {/* Chart */}
          <View style={styles.chartContainer}>
            <HealthChart data={history} />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Home size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButtonMain}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <BookOpen size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <User size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
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
  timeRangeContainer: {
    marginBottom: 16,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeRangeButtonActive: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  timeRangeText: {
    color: '#666',
  },
  timeRangeTextActive: {
    color: 'white',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navButton: {
    padding: 8,
  },
  navButtonMain: {
    backgroundColor: '#1a73e8',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
  },
});

export default Index;