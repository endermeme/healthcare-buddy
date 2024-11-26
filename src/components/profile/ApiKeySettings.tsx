import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export function ApiKeySettings() {
  const [apiKey, setApiKey] = React.useState('');

  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('apiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setApiKey(value);
    }
  };

  const saveApiKey = () => {
    if (apiKey.length === 6) {
      localStorage.setItem('apiKey', apiKey);
      toast({
        title: "Đã lưu key API",
        description: "Key API đã được cập nhật thành công",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Key không hợp lệ",
        description: "Vui lòng nhập 6 chữ số",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="apiKey">Key API</Label>
      <div className="flex gap-2">
        <Input
          id="apiKey"
          type="text"
          maxLength={6}
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder="Nhập 6 chữ số"
          className="text-center text-2xl tracking-wider"
        />
        <Button onClick={saveApiKey}>
          Lưu
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        Key API được sử dụng để xác thực thiết bị với máy chủ. Vui lòng không chia sẻ key này với người khác.
      </p>
    </div>
  );
}