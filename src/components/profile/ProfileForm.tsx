import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { BasicInfoFields, formSchema } from "./BasicInfoFields";

export const ProfileForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: "",
      gender: undefined,
      weight: "",
      height: "",
      medicalHistory: "",
    },
  });

  React.useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      Object.keys(parsedProfile).forEach((key) => {
        if (key in form.getValues()) {
          form.setValue(key as keyof z.infer<typeof formSchema>, parsedProfile[key], {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      });
    }
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    localStorage.setItem('userProfile', JSON.stringify(values));
    toast({
      title: "Đã lưu thông tin",
      description: "Thông tin cá nhân của bạn đã được lưu thành công",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoFields form={form} />

        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Lưu ý: Các chỉ số sức khỏe cơ bản như nhịp tim, SpO2 sẽ được đo và cập nhật tự động thông qua thiết bị đeo.
          </AlertDescription>
        </Alert>

        <Button type="submit" className="w-full">
          Lưu thông tin
        </Button>
      </form>
    </Form>
  );
};