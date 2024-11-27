import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'sk-alloy-YourKeyHere', // Replace with your actual API key
  baseURL: 'https://api.alloy.ai/v1', // Replace with actual Alloy API endpoint
});

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper-1');

  const response = await openai.audio.transcriptions.create({
    file: audioBlob as any,
    model: 'whisper-1',
    language: 'vi'
  });

  return response.text;
};

export const getChatResponse = async (message: string, metadata?: any) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-alloy', // Replace with actual Alloy model name
    messages: [
      {
        role: 'system',
        content: 'You are a helpful medical assistant. Respond in Vietnamese.'
      },
      {
        role: 'user',
        content: message
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  return response.choices[0].message.content;
};

export const textToSpeech = async (text: string, messageId: string) => {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
  });

  const arrayBuffer = await response.arrayBuffer();
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};