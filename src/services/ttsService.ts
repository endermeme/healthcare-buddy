export const textToSpeech = async (text: string): Promise<void> => {
  const apiKey = import.meta.env.VITE_OPENAI_TTS_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key is not set in environment variables');
    throw new Error('OpenAI API key is missing');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'alloy',
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`TTS request failed: ${errorData.error?.message || response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();

    // Cleanup URL after playing
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
  } catch (error) {
    console.error('TTS error:', error);
    throw error;
  }
};