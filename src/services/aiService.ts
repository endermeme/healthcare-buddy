import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://api.alloy.ai/v1',
  dangerouslyAllowBrowser: true
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
    model: 'gpt-4-alloy',
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
    voice: 'nova', // Changed from 'alloy' to 'nova' for Vietnamese voice
    input: text,
  });

  const arrayBuffer = await response.arrayBuffer();
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};