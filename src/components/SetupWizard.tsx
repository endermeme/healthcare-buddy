import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowRight, X, Wifi, Settings, CheckCircle2, AlertCircle } from 'lucide-react';

interface SetupWizardProps {
  onClose: () => void;
}

export const SetupWizard = ({ onClose }: SetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      testConnection();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('http://192.168.1.15/data', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        toast({
          title: "Kết nối thành công",
          description: "Thiết bị đã sẵn sàng để sử dụng",
        });
        onClose();
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Kết nối thất bại",
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center text-primary">
              <Wifi className="h-12 w-12" />
            </div>
            <h2 className="text-lg font-semibold text-center">Kiểm tra kết nối WiFi</h2>
            <p className="text-center text-gray-600">
              Vui lòng kiểm tra thiết bị của bạn đã được kết nối với mạng WiFi chưa.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center text-primary">
              <Settings className="h-12 w-12" />
            </div>
            <h2 className="text-lg font-semibold text-center">Cấu hình thiết bị</h2>
            <p className="text-center text-gray-600">
              Truy cập vào trang cấu hình thiết bị tại địa chỉ:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <iframe
                src="http://192.168.4.1"
                className="w-full h-[300px]"
                frameBorder="0"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center text-primary">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-lg font-semibold text-center">Kết nối lại WiFi</h2>
            <p className="text-center text-gray-600">
              Vui lòng kết nối lại với mạng WiFi gia đình của bạn và nhấn "Kiểm tra kết nối"
              để hoàn tất quá trình cài đặt.
            </p>
            {isTestingConnection && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <span className="animate-spin">
                  <Settings className="h-5 w-5" />
                </span>
                Đang kiểm tra kết nối...
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thiết lập cảm biến</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {renderStepContent()}
        </div>

        <div className="flex justify-between mt-6">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isTestingConnection}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isTestingConnection}
            >
              <X className="h-4 w-4 mr-2" />
              Huỷ bỏ
            </Button>
            <Button
              onClick={handleNext}
              disabled={isTestingConnection}
            >
              {step === 3 ? 'Kiểm tra kết nối' : 'Tiếp theo'}
              {step < 3 && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};