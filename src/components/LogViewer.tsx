import { useState } from 'react';
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
import {
  getLogsForDate,
  deleteLog,
  type HourLog,
} from '@/services/logService';

export const LogViewer = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLog, setSelectedLog] = useState<HourLog | null>(null);
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

  const hourLogs = getLogsForDate(format(selectedDate, 'yyyy-MM-dd'));

  const handleLogClick = (log: HourLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleDeleteLog = (hourIndex: number) => {
    deleteLog(format(selectedDate, 'yyyy-MM-dd'), hourIndex);
    toast({
      title: "Đã xóa log",
      description: "Log đã được xóa thành công",
    });
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
      </div>

      <ScrollArea className="h-[600px] rounded-md border">
        <div className="space-y-4 p-4">
          {hourLogs.map((log, index) => (
            <div key={log.hour} className="relative">
              <LogCard 
                log={log}
                onClick={() => handleLogClick(log)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLog(index);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
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