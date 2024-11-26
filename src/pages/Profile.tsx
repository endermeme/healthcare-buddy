import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const formSchema = z.object({
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 150, {
    message: "Tuổi phải là số dương từ 1-150",
  }),
  gender: z.enum(["male", "female"], {
    required_error: "Vui lòng chọn giới tính",
  }),
  weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 500, {
    message: "Cân nặng phải là số dương từ 1-500kg",
  }),
  medicalHistory: z.string().min(1, "Vui lòng nhập tiền sử bệnh").max(1000, "Tiền sử bệnh quá dài"),
});

export default function Profile() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: "",
      gender: undefined,
      weight: "",
      medicalHistory: "",
    },
  });

  // Load saved data from localStorage on component mount
  React.useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      Object.keys(parsedProfile).forEach((key) => {
        form.setValue(key as keyof z.infer<typeof formSchema>, parsedProfile[key]);
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
    <div className="container max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tuổi</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Nhập tuổi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Nam
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Nữ
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cân nặng (kg)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Nhập cân nặng" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medicalHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiền sử bệnh</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập tiền sử bệnh của bạn"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Lưu ý: Các chỉ số sức khỏe như nhịp tim, SpO2 sẽ được đo và cập nhật tự động thông qua thiết bị đeo. Vui lòng đảm bảo thiết bị được kết nối đúng cách để có kết quả chính xác.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full">
            Lưu thông tin
          </Button>
        </form>
      </Form>
    </div>
  );
}