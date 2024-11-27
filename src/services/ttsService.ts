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