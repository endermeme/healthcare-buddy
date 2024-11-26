import React from "react";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ApiKeySettings } from "@/components/profile/ApiKeySettings";

export default function Profile() {
  return (
    <div className="container max-w-2xl mx-auto p-4 pb-20 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>
        <ProfileForm />
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Cài đặt thiết bị</h2>
        <ApiKeySettings />
      </div>
    </div>
  );
}