import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyB_2kU2hjrDIojH0m5PezZtmdUuWp393Do");

export interface GeminiAnalysis {
  status: string;
  analysis: {
    health_summary: string;
    recommendation: string;
    detailed_insights: {
      average_heart_rate: number;
      average_oxygen_level: number;
    }
  }
}

export const analyzeHealthData = async (
  heartRateData: number[],
  oxygenData: number[],
  timestamp: string
): Promise<GeminiAnalysis> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Dữ liệu sức khỏe người dùng trong 1 giờ qua được ghi nhận. Vui lòng phân tích nhịp tim và oxy máu, sau đó đưa ra đánh giá sức khỏe tổng quát.
    - Dữ liệu nhịp tim: [${heartRateData.join(", ")}]
    - Dữ liệu oxy máu: [${oxygenData.join(", ")}]
    - Thời gian: ${timestamp}
    - Yêu cầu:
      1. Đánh giá sức khỏe tổng quát.
      2. Đưa ra nhận xét nếu có bất thường.
      3. Gợi ý các cải thiện nếu cần.
    Trả lời bằng JSON theo định dạng:
    {
      "status": "success",
      "analysis": {
        "health_summary": "...",
        "recommendation": "...",
        "detailed_insights": {
          "average_heart_rate": ...,
          "average_oxygen_level": ...
        }
      }
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing health data:", error);
    throw error;
  }
};