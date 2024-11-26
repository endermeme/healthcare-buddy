import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Heart, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthData, HealthData } from '@/services/healthData';

const History = () => {
  const [records, setRecords] = useState<HealthData[]>([]);
  const navigate = useNavigate();
  
  const { data: currentData } = useQuery({
    queryKey: ['healthData'],
    queryFn: fetchHealthData,
    refetchInterval: 60000, // Fetch every minute
  });

  useEffect(() => {
    if (currentData) {
      setRecords(prev => [...prev, currentData].slice(-60)); // Keep last 60 records
    }
  }, [currentData]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Lịch sử theo dõi</h1>
      
      <div className="grid gap-4">
        {records.map((record, index) => (
          <Card 
            key={record.timestamp}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/detail/${index}`)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg">
                {format(new Date(record.timestamp), 'HH:mm:ss')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>{record.heartRate} BPM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>{record.bloodOxygen}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default History;