import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Bluetooth } from "lucide-react";

interface BluetoothDevice {
  device: BluetoothDevice;
  name: string;
}

const ScanDevices = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'ESP32_BT_API' }
        ],
        optionalServices: ['generic_access']
      });

      if (device.name) {
        setDevices(prev => [...prev, { device, name: device.name }]);
        toast({
          title: "Tìm thấy thiết bị",
          description: `Đã kết nối với ${device.name}`,
        });
      }
    } catch (error) {
      console.error('Bluetooth Error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể quét thiết bị Bluetooth. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Quét Thiết Bị</h1>
          <p className="text-gray-600">Tìm kiếm các thiết bị cảm biến ở gần</p>
        </div>

        <Button 
          className="w-full"
          onClick={startScanning}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang quét...
            </>
          ) : (
            <>
              <Bluetooth className="mr-2 h-4 w-4" />
              Bắt đầu quét
            </>
          )}
        </Button>

        <div className="space-y-2">
          {devices.map((device, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{device.name}</h3>
                  <p className="text-sm text-gray-500">ESP32 Sensor</p>
                </div>
                <Button variant="outline" size="sm">
                  Kết nối
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScanDevices;