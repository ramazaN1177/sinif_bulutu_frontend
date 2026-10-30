export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

export const stopSpeaking = () => {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {}
};

export const speakText = (text: string, onEnd?: () => void) => {
  if (!isSpeechSupported() || !text?.trim()) return;
  try {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'tr-TR';
    utterance.rate = 0.95; // slightly slower and friendlier for primary school kids
    utterance.pitch = 1.05; // slightly warmer/cheerful pitch

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    // Try finding a Turkish voice if available
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find((v) => v.lang.startsWith('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
    onEnd?.();
  }
};
