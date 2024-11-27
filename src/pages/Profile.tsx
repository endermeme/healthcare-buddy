import React from "react";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { DeviceSettings } from "@/components/profile/DeviceSettings";

export default function Profile() {
  return (
    <div className="container max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>
      
      <ProfileForm />

      <Separator className="my-8" />

      <DeviceSettings />
    </div>
  );
}