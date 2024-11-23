import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Bluetooth, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScannedDevice {
  device: BluetoothDevice;
  name: string;
}

const ScanDevices = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(true);

  useEffect(() => {
    // Kiểm tra hỗ trợ Bluetooth
    if (!navigator.bluetooth) {
      setIsBluetoothSupported(false);
      toast({
        title: "Trình duyệt không hỗ trợ",
        description: "Vui lòng sử dụng Chrome, Edge hoặc Opera để có thể quét thiết bị Bluetooth.",
        variant: "destructive",
      });
    }
  }, []);

  const startScanning = async () => {
    if (!navigator.bluetooth) {
      toast({
        title: "Không thể quét",
        description: "Trình duyệt của bạn không hỗ trợ Bluetooth.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsScanning(true);
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
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

  if (!isBluetoothSupported) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Trình duyệt của bạn không hỗ trợ Bluetooth. Vui lòng sử dụng Chrome, Edge hoặc Opera.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

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