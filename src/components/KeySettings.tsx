import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export const KeySettings = () => {
  const [key, setKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('sensor_key');
    if (savedKey) {
      setKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (key.length !== 6) {
      toast({
        title: "Lỗi",
        description: "Key phải có đúng 6 ký tự",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem('sensor_key', key);
    toast({
      title: "Thành công",
      description: "Đã lưu key thành công",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Key cảm biến (6 ký tự)</label>
        <div className="flex gap-2">
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            maxLength={6}
            placeholder="Nhập key..."
            className="flex-1"
          />
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </div>
    </div>
  );
};