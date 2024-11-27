import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { loadLogs } from '@/services/healthData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface ChatHeaderProps {
  onBack: () => void;
  selectedLogIds: string[];
  onLogSelect: (logIds: string[]) => void;
  onClearChat: () => void;
}

export const ChatHeader = ({ onBack, selectedLogIds, onLogSelect, onClearChat }: ChatHeaderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempSelectedLogs, setTempSelectedLogs] = useState<string[]>([]);
  const logs = loadLogs();
  
  // Group logs by date
  const groupedLogs = logs.reduce((groups: { [key: string]: typeof logs }, log) => {
    const date = format(new Date(log.hour), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {});

  const handleLogSelect = (value: string) => {
    if (value.startsWith('day-')) {
      // If a day is selected, include all logs from that day
      const date = value.replace('day-', '');
      const dayLogs = groupedLogs[date] || [];
      const logIds = dayLogs.map(log => log.hour);
      onLogSelect(logIds);
      setIsDialogOpen(false);
    } else {
      setIsDialogOpen(true);
      setTempSelectedLogs(selectedLogIds);
    }
  };

  const handleConfirmSelection = () => {
    onLogSelect(tempSelectedLogs);
    setIsDialogOpen(false);
  };

  const handleCheckboxChange = (logId: string) => {
    setTempSelectedLogs(prev => {
      if (prev.includes(logId)) {
        return prev.filter(id => id !== logId);
      }
      return [...prev, logId];
    });
  };

  const handleSelectAllDay = (date: string) => {
    const dayLogs = groupedLogs[date] || [];
    const dayLogIds = dayLogs.map(log => log.hour);
    
    setTempSelectedLogs(prev => {
      const allSelected = dayLogIds.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !dayLogIds.includes(id));
      }
      return [...new Set([...prev, ...dayLogIds])];
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b z-10">
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Select
          value={selectedLogIds.length === 1 ? selectedLogIds[0] : ''}
          onValueChange={handleLogSelect}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Chọn bản ghi..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedLogs).map(([date, dayLogs]) => (
              <SelectGroup key={date}>
                <SelectLabel className="px-2 py-1.5">
                  {format(new Date(date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                </SelectLabel>
                <SelectItem value={`day-${date}`} className="pl-4 font-medium">
                  Tất cả bản ghi trong ngày
                </SelectItem>
                {dayLogs.map((log) => (
                  <SelectItem
                    key={log.hour}
                    value={log.hour}
                    className="pl-6"
                  >
                    {format(new Date(log.hour), 'HH:00')}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClearChat}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn bản ghi</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-4">
              {Object.entries(groupedLogs).map(([date, dayLogs]) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={dayLogs.every(log => tempSelectedLogs.includes(log.hour))}
                      onCheckedChange={() => handleSelectAllDay(date)}
                    />
                    <span className="font-medium">
                      {format(new Date(date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {dayLogs.map((log) => (
                      <div key={log.hour} className="flex items-center space-x-2">
                        <Checkbox
                          checked={tempSelectedLogs.includes(log.hour)}
                          onCheckedChange={() => handleCheckboxChange(log.hour)}
                        />
                        <span>{format(new Date(log.hour), 'HH:00')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button onClick={handleConfirmSelection}>
              <Check className="mr-2 h-4 w-4" />
              Đồng ý
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};