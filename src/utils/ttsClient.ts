export async function synthesizeJapaneseSpeech(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  playbackRate: number = 1
): Promise<void> {
  try {
    if (!text.trim()) return;

    onStart?.();

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: 'ja-JP' }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate speech';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const { audioContent } = await response.json();
    const audioBlob = new Blob(
      [new Uint8Array(Buffer.from(audioContent, 'base64'))],
      { type: 'audio/mp3' }
    );
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.playbackRate = playbackRate;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      onEnd?.();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      onEnd?.();
      console.error('Audio playback error');
    };

    audio.play().catch((err) => {
      console.error('Audio play error:', err);
      onEnd?.();
    });
  } catch (error) {
    onEnd?.();
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('TTS error:', errorMsg, error);
    alert(errorMsg || 'Failed to generate speech. Please check your API configuration.');
  }
}
