import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Download, ChevronDown, Trash2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogCard } from './LogCard';
import { LogDetail } from './LogDetail';
import { loadLogs, HourlyLog, LOGS_STORAGE_KEY } from '@/services/healthData';
import { Checkbox } from "@/components/ui/checkbox";

export const LogViewer = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [logs, setLogs] = useState<HourlyLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<HourlyLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedLogs = loadLogs();
    setLogs(storedLogs);

    const interval = setInterval(() => {
      setLogs(loadLogs());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      value: date,
      label: format(date, 'dd/MM/yyyy', { locale: vi })
    };
  });

  const handleAddToFavorites = () => {
    toast({
      title: "Đã lưu vào mục yêu thích",
      description: `Log ngày ${format(selectedDate, 'dd/MM/yyyy')} đã được lưu`,
    });
  };

  const handleDownload = () => {
    if (selectedLogs.length === 0) {
      toast({
        title: "Chưa chọn log",
        description: "Vui lòng chọn ít nhất một log để tải về",
        variant: "destructive",
      });
      return;
    }

    const selectedData = logs.filter(log => selectedLogs.includes(log.hour));
    const jsonData = JSON.stringify(selectedData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_logs_${format(selectedDate, 'dd-MM-yyyy')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Tải log thành công",
      description: `Đã tải ${selectedLogs.length} log về máy của bạn`,
    });
  };

  const handleDelete = () => {
    if (selectedLogs.length === 0) {
      toast({
        title: "Chưa chọn log",
        description: "Vui lòng chọn ít nhất một log để xóa",
        variant: "destructive",
      });
      return;
    }

    const newLogs = logs.filter(log => !selectedLogs.includes(log.hour));
    setLogs(newLogs);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(newLogs));
    setSelectedLogs([]);

    toast({
      title: "Xóa log thành công",
      description: `Đã xóa ${selectedLogs.length} log`,
    });
  };

  const handleLogClick = (log: HourlyLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleLogSelect = (hour: string) => {
    setSelectedLogs(prev => {
      if (prev.includes(hour)) {
        return prev.filter(h => h !== hour);
      }
      return [...prev, hour];
    });
  };

  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.hour);
    const selectedDateStart = new Date(selectedDate.setHours(0, 0, 0, 0));
    const selectedDateEnd = new Date(selectedDate.setHours(23, 59, 59, 999));
    return logDate >= selectedDateStart && logDate <= selectedDateEnd;
  });

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
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            className="flex-1 sm:flex-initial"
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Xóa</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="space-y-4 p-4">
          {filteredLogs.map((log) => (
            <div key={log.hour} className="flex items-center gap-4">
              <Checkbox
                checked={selectedLogs.includes(log.hour)}
                onCheckedChange={() => handleLogSelect(log.hour)}
              />
              <div className="flex-1">
                <LogCard 
                  log={log}
                  onClick={() => handleLogClick(log)}
                />
              </div>
            </div>
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