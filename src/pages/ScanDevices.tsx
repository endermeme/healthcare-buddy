import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Text } from '@/components/ui/text';

const ScanDevices = ({ navigation }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);

  const startScanning = () => {
    setIsScanning(true);
    // Simulate device scanning
    setTimeout(() => {
      setIsScanning(false);
      setDevices([
        { id: '1', name: 'Device 1' },
        { id: '2', name: 'Device 2' }
      ]);
    }, 2000);
  };

  const connectToDevice = (device) => {
    navigation.navigate('Monitor');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Scan Devices</h1>
        <p className="text-gray-500">Search for nearby sensor devices</p>
      </div>

      <Button 
        onClick={startScanning}
        disabled={isScanning}
        className="w-full"
      >
        {isScanning ? 'Scanning...' : 'Start Scan'}
      </Button>

      <ScrollArea className="h-[400px]">
        {devices.map((device) => (
          <Card key={device.id} className="p-4 mb-2">
            <div className="flex justify-between items-center">
              <div>
                <Text className="font-medium">{device.name}</Text>
                <Text className="text-sm text-gray-500">ESP32 Sensor</Text>
              </div>
              <Button onClick={() => connectToDevice(device)}>
                Connect
              </Button>
            </div>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ScanDevices;