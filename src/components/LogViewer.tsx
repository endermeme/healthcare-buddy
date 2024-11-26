import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Download, ChevronDown } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogCard, type MinuteLog } from './LogCard';
import { LogDetail } from './LogDetail';
import {
  fetchDailyLogs,
  addToFavorites,
  downloadLogs,
  getDailyLogs,
  type DailyLog,
} from '@/services/logApiService';

export const LogViewer = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [minuteLogs, setMinuteLogs] = useState<MinuteLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<MinuteLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Generate last 7 days
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      value: date,
      label: format(date, 'dd/MM/yyyy', { locale: vi })
    };
  });

  const handleAddToFavorites = () => {
    const logToSave: DailyLog = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      minuteLogs: minuteLogs
    };
    addToFavorites(logToSave);
    toast({
      title: "Đã lưu vào mục yêu thích",
      description: `Log ngày ${format(selectedDate, 'dd/MM/yyyy')} đã được lưu`,
    });
  };

  const handleDownload = () => {
    const logs = getDailyLogs();
    downloadLogs(logs);
    toast({
      title: "Tải log thành công",
      description: "File log đã được tải về máy của bạn",
    });
  };

  const handleLogClick = (log: MinuteLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[180px] justify-between">
              {format(selectedDate, 'dd/MM/yyyy', { locale: vi })}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {dateOptions.map((option) => (
              <DropdownMenuItem
                key={option.label}
                onClick={() => setSelectedDate(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddToFavorites}
            className="flex-1 sm:flex-initial"
          >
            <Star className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Lưu yêu thích</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            className="flex-1 sm:flex-initial"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Tải về</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="space-y-4 p-4">
          {minuteLogs.map((log) => (
            <LogCard 
              key={log.minute}
              log={log}
              onClick={() => handleLogClick(log)}
            />
          ))}
        </div>
      </ScrollArea>

      <LogDetail
        log={selectedLog}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};