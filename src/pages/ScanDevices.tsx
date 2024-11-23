import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScanDevicesProps {
  onConnect: () => void;
}

const ScanDevices = ({ onConnect }: ScanDevicesProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([
    { id: '1', name: 'Device 1' },
    { id: '2', name: 'Device 2' }
  ]);

  const startScanning = () => {
    setIsScanning(true);
    // Simulate device scanning
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        {devices.map((device) => (
          <Card key={device.id}>
            <CardHeader>
              <CardTitle className="text-lg">{device.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={onConnect}>
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScanDevices;