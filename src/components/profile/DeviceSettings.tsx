import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const DeviceSettings = () => {
  const [deviceKey, setDeviceKey] = React.useState("");
  const [showWifiSetup, setShowWifiSetup] = React.useState(false);
  const [showNetworkChange, setShowNetworkChange] = React.useState(false);

  React.useEffect(() => {
    const savedKey = localStorage.getItem('deviceKey');
    if (savedKey) {
      setDeviceKey(savedKey);
    }
  }, []);

  const handleSaveDeviceKey = () => {
    if (deviceKey.length !== 6 || isNaN(Number(deviceKey))) {
      toast({
        title: "Lỗi",
        description: "Mã thiết bị phải là 6 chữ số",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem('deviceKey', deviceKey);
    toast({
      title: "Đã lưu mã thiết bị",
      description: "Mã thiết bị của bạn đã được lưu thành công",
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mã thiết bị</h2>
      <div className="flex gap-4">
        <Input
          type="text"
          maxLength={6}
          placeholder="Nhập mã 6 số"
          value={deviceKey}
          onChange={(e) => setDeviceKey(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          className="flex-1"
        />
        <Button 
          onClick={handleSaveDeviceKey}
          variant="secondary"
        >
          Lưu mã
        </Button>
      </div>

      <div className="flex gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => setShowWifiSetup(true)}
        >
          Setup mạng lần đầu
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowNetworkChange(true)}
        >
          Thay đổi mạng
        </Button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg space-y-2 mt-2">
        <p className="text-sm text-gray-600">
          Lưu ý khi setup mạng lần đầu:
        </p>
        <p className="text-sm">
          <span className="font-semibold">Tên mạng:</span> Cảm biến tim
        </p>
        <p className="text-sm">
          <span className="font-semibold">Mật khẩu:</span> binhbinhthanh
        </p>
      </div>

      <Dialog open={showWifiSetup} onOpenChange={setShowWifiSetup}>
        <DialogContent className="sm:max-w-[800px] h-[600px]">
          <iframe
            src="http://wifi.setup"
            className="w-full h-full"
            title="Setup mạng lần đầu"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showNetworkChange} onOpenChange={setShowNetworkChange}>
        <DialogContent className="sm:max-w-[800px] h-[600px]">
          <iframe
            src="http://192.168.1.15"
            className="w-full h-full"
            title="Thay đổi mạng"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};