// Kiểm tra tính hợp lệ của dữ liệu cho 5 lần ghi đầu tiên
export const isValidFirstFiveReading = (heartRate: number, bloodOxygen: number): boolean => {
  return (
    heartRate > 0 && 
    heartRate <= 100 && // Chỉ lấy BPM <= 100 cho 5 lần đầu
    bloodOxygen > 0 && 
    bloodOxygen <= 100
  );
};

// Kiểm tra tính hợp lệ của dữ liệu cho các lần ghi sau
export const isValidLaterReading = (heartRate: number, bloodOxygen: number): boolean => {
  return (
    heartRate > 0 && 
    bloodOxygen > 0 && 
    bloodOxygen <= 100 // Chỉ kiểm tra SpO2 <= 100 cho các lần sau
  );
};

// Tính trung bình của một mảng số
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Math.round(sum / numbers.length);
};