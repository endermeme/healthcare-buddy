import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { HealthChart } from '@/components/HealthChart';
import { loadLogs } from '@/services/healthData';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Load the specific log data for this hour
  const logs = loadLogs();
  const currentLog = logs.find(log => log.hour === id);
  
  if (!currentLog) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/history')}
          className="mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center text-gray-500 py-8">
          Không tìm thấy dữ liệu cho giờ này
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/history')}
        className="mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Chi tiết theo dõi {new Date(currentLog.hour).toLocaleTimeString('vi-VN', {
            hour: '2-digit'
          })}:00
        </h1>
        
        <div className="grid gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                {currentLog.secondsData.length} lần đo
              </span>
              <span className={currentLog.isRecording ? "text-blue-500" : "text-green-500"}>
                {currentLog.isRecording ? "Đang ghi..." : "Đã hoàn tất"}
              </span>
            </div>
            <HealthChart data={currentLog.secondsData} />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Chi tiết từng lần đo</h2>
            </div>
            <div className="divide-y">
              {currentLog.secondsData.map((data, index) => (
                <div key={data.timestamp} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(data.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                    <div className="flex gap-4">
                      <span className="text-red-500">
                        {data.heartRate} BPM
                      </span>
                      <span className="text-blue-500">
                        SpO2: {data.bloodOxygen}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;