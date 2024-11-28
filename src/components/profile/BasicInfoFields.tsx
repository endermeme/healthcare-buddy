import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

interface BasicInfoFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const formSchema = z.object({
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 150, {
    message: "Tuổi phải là số dương từ 1-150",
  }),
  gender: z.enum(["male", "female"], {
    required_error: "Vui lòng chọn giới tính",
  }),
  weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 500, {
    message: "Cân nặng phải là số dương từ 1-500kg",
  }),
  height: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 300, {
    message: "Chiều cao phải là số dương từ 1-300cm",
  }),
  medicalHistory: z.string().min(1, "Vui lòng nhập tiền sử bệnh").max(1000, "Tiền sử bệnh quá dài"),
});

export const BasicInfoFields = ({ form }: BasicInfoFieldsProps) => {
  return (
    <>
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
                value={field.value}
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
        name="height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chiều cao (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Nhập chiều cao" {...field} />
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
    </>
  );
};