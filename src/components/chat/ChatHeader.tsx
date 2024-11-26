import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { HourlyLog } from '@/services/healthData';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { loadLogs } from '@/services/healthData';

interface ChatHeaderProps {
  onBack: () => void;
  selectedLogId: string | null;
  onLogSelect: (logId: string) => void;
}

export const ChatHeader = ({ 
  onBack, 
  selectedLogId,
  onLogSelect 
}: ChatHeaderProps) => {
  const logs = loadLogs();
  
  const selectedLog = logs.find(log => log.hour === selectedLogId);

  const formatTimeString = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm - dd/MM/yyyy', { locale: vi });
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
                {selectedLog ? 
                  formatTimeString(selectedLog.hour) :
                  'Chọn bản ghi'
                }
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {logs
                .sort((a, b) => new Date(b.hour).getTime() - new Date(a.hour).getTime())
                .map((log) => (
                  <DropdownMenuItem
                    key={log.hour}
                    onClick={() => onLogSelect(log.hour)}
                    className="flex flex-col items-start"
                  >
                    <span className="font-medium">
                      {formatTimeString(log.hour)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Nhịp tim: {log.averageHeartRate} BPM | 
                      SpO2: {log.averageBloodOxygen}%
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