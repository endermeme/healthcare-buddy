import React, { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { DeviceSettings } from "@/components/profile/DeviceSettings";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Profile() {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  let clickTimer: NodeJS.Timeout;

  useEffect(() => {
    if (clickCount === 5) {
      setShowEasterEgg(true);
      setClickCount(0);
    }

    // Reset click count after 2 seconds of inactivity
    clickTimer = setTimeout(() => {
      setClickCount(0);
    }, 2000);

    return () => {
      clearTimeout(clickTimer);
    };
  }, [clickCount]);

  const handleTitleClick = () => {
    setClickCount(prev => prev + 1);
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 pb-20">
      <h1 
        className="text-2xl font-bold mb-6 cursor-pointer select-none" 
        onClick={handleTitleClick}
      >
        Thông tin cá nhân
      </h1>
      
      <ProfileForm />

      <Separator className="my-8" />

      <DeviceSettings />

      <Dialog open={showEasterEgg} onOpenChange={setShowEasterEgg}>
        <DialogContent className="sm:max-w-[800px] h-[600px]">
          <iframe
            src="https://facebook.com/binh.tagilla"
            className="w-full h-full"
            title="Facebook Profile"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}