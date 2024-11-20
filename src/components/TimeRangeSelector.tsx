import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TimeRange } from '@/hooks/useHealthData';

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
}

export const TimeRangeSelector = ({ timeRange, setTimeRange }: TimeRangeSelectorProps) => {
  const timeRanges = [
    { value: '60s' as TimeRange, label: '1 Minute' },
    { value: '1h' as TimeRange, label: '1 Hour' },
    { value: '6h' as TimeRange, label: '6 Hours' },
    { value: '24h' as TimeRange, label: '24 Hours' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {timeRanges.map(({ value, label }) => (
        <TouchableOpacity
          key={value}
          style={[styles.button, timeRange === value && styles.buttonActive]}
          onPress={() => setTimeRange(value)}
        >
          <Text style={[styles.text, timeRange === value && styles.textActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonActive: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  text: {
    color: '#666',
  },
  textActive: {
    color: 'white',
  },
});