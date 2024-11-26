import { HealthData } from '@/services/healthData';

export const calculate10MinuteAverages = (data: HealthData[]) => {
  if (!data.length) return [];
  
  // Sort data by timestamp
  const sortedData = [...data].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const averages: HealthData[] = [];
  let currentBucket: HealthData[] = [];
  let bucketStartTime = new Date(sortedData[0].timestamp);

  sortedData.forEach(reading => {
    const readingTime = new Date(reading.timestamp);
    
    // If reading is within current 10-min window, add to bucket
    if (readingTime.getTime() - bucketStartTime.getTime() < 10 * 60 * 1000) {
      currentBucket.push(reading);
    } else {
      // Calculate average for current bucket
      if (currentBucket.length > 0) {
        const avgHeartRate = Math.round(
          currentBucket.reduce((sum, d) => sum + d.heartRate, 0) / currentBucket.length
        );
        const avgBloodOxygen = Math.round(
          currentBucket.reduce((sum, d) => sum + d.bloodOxygen, 0) / currentBucket.length
        );

        averages.push({
          timestamp: bucketStartTime.toISOString(),
          heartRate: avgHeartRate,
          bloodOxygen: avgBloodOxygen,
        });
      }

      // Start new bucket
      bucketStartTime = new Date(
        Math.floor(readingTime.getTime() / (10 * 60 * 1000)) * (10 * 60 * 1000)
      );
      currentBucket = [reading];
    }
  });

  // Don't forget the last bucket
  if (currentBucket.length > 0) {
    const avgHeartRate = Math.round(
      currentBucket.reduce((sum, d) => sum + d.heartRate, 0) / currentBucket.length
    );
    const avgBloodOxygen = Math.round(
      currentBucket.reduce((sum, d) => sum + d.bloodOxygen, 0) / currentBucket.length
    );

    averages.push({
      timestamp: bucketStartTime.toISOString(),
      heartRate: avgHeartRate,
      bloodOxygen: avgBloodOxygen,
    });
  }

  return averages;
};