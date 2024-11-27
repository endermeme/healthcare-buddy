import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { loadLogs } from '@/services/healthData';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChatHeaderProps {
  onBack: () => void;
  selectedLogIds: string[];
  onLogSelect: (logIds: string[]) => void;
  onClearChat: () => void;
}

export const ChatHeader = ({ onBack, selectedLogIds, onLogSelect, onClearChat }: ChatHeaderProps) => {
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
    } else {
      // For individual log selection
      const currentSelection = [...selectedLogIds];
      const index = currentSelection.indexOf(value);
      
      if (index === -1) {
        currentSelection.push(value);
      } else {
        currentSelection.splice(index, 1);
      }
      
      onLogSelect(currentSelection);
    }
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
    </div>
  );
};