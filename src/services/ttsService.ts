export const textToSpeech = async (text: string): Promise<void> => {
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'alloy'
      })
    });

    if (!response.ok) {
      throw new Error('TTS request failed');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch (error) {
    console.error('TTS error:', error);
  }
};