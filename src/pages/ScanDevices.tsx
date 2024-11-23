import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScanDevicesProps {
  onConnect: () => void;
}

const ScanDevices = ({ onConnect }: ScanDevicesProps) => {
  const [isScanning, setIsScanning] = useState(false);

  const startScanning = () => {
    setIsScanning(true);
    // Simulate scanning delay then auto-connect
    setTimeout(() => {
      setIsScanning(false);
      onConnect();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Kết nối thiết bị</h1>
        <p className="text-gray-500">Nhấn nút bên dưới để tiếp tục</p>
      </div>

      <Button 
        onClick={startScanning}
        disabled={isScanning}
        className="w-full"
      >
        {isScanning ? 'Đang kết nối...' : 'Kết nối'}
      </Button>
    </div>
  );
};

export default ScanDevices;