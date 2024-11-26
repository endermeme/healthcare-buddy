import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Trash2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { loadLogs } from '@/services/healthData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface ChatHeaderProps {
  onBack: () => void;
  selectedLogIds: string[];
  onLogSelect: (logIds: string[]) => void;
  onClearChat: () => void;
}

export const ChatHeader = ({ onBack, selectedLogIds, onLogSelect, onClearChat }: ChatHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelectedLogs, setTempSelectedLogs] = useState<string[]>(selectedLogIds);
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

  const handleConfirmSelection = () => {
    onLogSelect(tempSelectedLogs);
    setIsOpen(false);
  };

  const getSelectedText = () => {
    if (selectedLogIds.length === 0) {
      return "Chọn bản ghi...";
    }

    const selectedDates = new Set(
      selectedLogIds.map(id => format(new Date(id), 'yyyy-MM-dd'))
    );

    if (selectedDates.size === 1) {
      const date = Array.from(selectedDates)[0];
      const dayLogs = groupedLogs[date] || [];
      const selectedHours = selectedLogIds.map(id => format(new Date(id), 'HH:00'));
      
      if (selectedHours.length === dayLogs.length) {
        return `Cả ngày ${format(new Date(date), 'dd/MM/yyyy')}`;
      }
      return selectedHours.join(', ');
    }

    return `${selectedLogIds.length} bản ghi được chọn`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b z-10">
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Button 
          variant="outline" 
          className="flex-1 justify-between"
          onClick={() => setIsOpen(true)}
        >
          <span className="truncate">{getSelectedText()}</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClearChat}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn bản ghi</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4">
            <div className="px-4 space-y-4">
              {Object.entries(groupedLogs).map(([date, dayLogs]) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
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
                      <div key={log.hour} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
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
          <div className="mt-4">
            <Button onClick={handleConfirmSelection} className="w-full">
              <Check className="mr-2 h-4 w-4" />
              Đồng ý
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};