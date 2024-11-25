import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Activity, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDailyLogs } from '@/services/logService';

const genAI = new GoogleGenerativeAI('AIzaSyD43V6kDfzyue2KNumQlzvDj1oN6jLtaUg');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'health' | 'general'>('general');
  const navigate = useNavigate();

  const getHealthContext = () => {
    const logs = getDailyLogs();
    const dates = Object.keys(logs).sort().reverse();
    if (dates.length === 0) return null;

    const latestDate = dates[0];
    const latestLogs = logs[latestDate] || [];
    const latestLog = latestLogs[latestLogs.length - 1];
    
    if (!latestLog) return null;

    // Phân tích chỉ số nhịp tim
    const heartRateAnalysis = () => {
      const rate = latestLog.logs[0]?.heartRate ?? 0;
      if (rate < 60) return "nhịp tim thấp (nhịp chậm)";
      if (rate > 100) return "nhịp tim cao (nhịp nhanh)";
      return "nhịp tim bình thường";
    };

    // Phân tích chỉ số SpO2
    const spo2Analysis = () => {
      const spo2 = latestLog.logs[0]?.bloodOxygen ?? 0;
      if (spo2 >= 95) return "mức oxy máu tốt";
      if (spo2 >= 90) return "mức oxy máu ở ngưỡng cần theo dõi";
      return "mức oxy máu thấp, cần chú ý";
    };

    return `Context: Dữ liệu sức khỏe mới nhất (${latestDate}):

Chỉ số hiện tại:
- Nhịp tim: ${latestLog.logs[0]?.heartRate ?? '--'} BPM (${heartRateAnalysis()})
- SpO2: ${latestLog.logs[0]?.bloodOxygen ?? '--'}% (${spo2Analysis()})

Thông tin tham khảo:
- Nhịp tim bình thường: 60-100 BPM
- SpO2 bình thường: ≥95%
- SpO2 cần theo dõi: 90-94%
- SpO2 nguy hiểm: <90%

User Question: `;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      let prompt = userMessage;
      if (mode === 'health') {
        const healthContext = getHealthContext();
        if (healthContext) {
          prompt = `${healthContext}${userMessage}

Hãy phân tích các chỉ số sức khỏe trên và đưa ra lời khuyên cụ thể. Nếu có bất kỳ chỉ số nào bất thường, hãy giải thích nguyên nhân có thể và đề xuất các biện pháp cải thiện.`;
        }
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex h-14 items-center px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium">AI Assistant</span>
          <div className="ml-auto flex gap-2">
            <Button
              variant={mode === 'health' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('health')}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Sức khỏe
            </Button>
            <Button
              variant={mode === 'general' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('general')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Chung
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white shadow-sm'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-white shadow-sm">
                Đang trả lời...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'health' ? "Hỏi về sức khỏe..." : "Nhập tin nhắn..."}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary-hover"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;