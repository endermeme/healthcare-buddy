import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { HealthData } from '@/services/healthData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  onBack: () => void;
  healthData: HealthData[] | undefined;
  selectedTimeIndex: number | null;
  onTimeSelect: (index: number) => void;
}

export const ChatHeader = ({ 
  onBack, 
  healthData, 
  selectedTimeIndex, 
  onTimeSelect 
}: ChatHeaderProps) => {
  const formatTimeString = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="flex h-14 items-center px-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium">AI Assistant</span>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                {selectedTimeIndex !== null && healthData ? 
                  formatTimeString(healthData[selectedTimeIndex].timestamp) :
                  'Chọn thời điểm'
                }
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {healthData && healthData
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((data, index) => (
                  <DropdownMenuItem
                    key={data.timestamp}
                    onClick={() => onTimeSelect(index)}
                    className="flex flex-col items-start"
                  >
                    <span className="font-medium">{formatTimeString(data.timestamp)}</span>
                    <span className="text-xs text-gray-500">
                      Nhịp tim: {data.heartRates.join(', ')} | 
                      SpO2: {data.oxygenLevels.join(', ')}
                    </span>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};