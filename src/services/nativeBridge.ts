export type OrientationMode = 'portrait' | 'landscape' | 'auto';

export interface GameFinishedPayload {
  activityId?: string;
  templateType: string;
  score: number;
  stars: number;
  correct: number;
  total: number;
  durationSec?: number;
}

export type OutgoingNativeMessage =
  | { type: 'GAME_READY' }
  | { type: 'GAME_STARTED' }
  | { type: 'GAME_PAUSED' }
  | { type: 'GAME_RESUMED' }
  | { type: 'GAME_FINISHED'; payload: GameFinishedPayload }
  | { type: 'CLOSE_GAME' }
  | { type: 'REQUEST_ORIENTATION'; mode: OrientationMode };

const sendToNative = (msg: OutgoingNativeMessage) => {
  try {
    const rnwv = (window as unknown as { ReactNativeWebView?: { postMessage: (data: string) => void } })
      ?.ReactNativeWebView;
    if (rnwv && typeof rnwv.postMessage === 'function') {
      rnwv.postMessage(JSON.stringify(msg));
    }
  } catch (err) {
    console.warn('Native bridge postMessage failed:', err);
  }
};

export const nativeBridge = {
  sendGameReady: () => sendToNative({ type: 'GAME_READY' }),
  sendGameStarted: () => sendToNative({ type: 'GAME_STARTED' }),
  sendGamePaused: () => sendToNative({ type: 'GAME_PAUSED' }),
  sendGameResumed: () => sendToNative({ type: 'GAME_RESUMED' }),
  sendGameFinished: (payload: GameFinishedPayload) =>
    sendToNative({ type: 'GAME_FINISHED', payload }),
  sendCloseGame: () => sendToNative({ type: 'CLOSE_GAME' }),
  requestOrientation: (mode: OrientationMode) =>
    sendToNative({ type: 'REQUEST_ORIENTATION', mode }),
};

export interface NativeBridgeHandlers {
  onHostBackPressed?: () => void;
  onPauseAudio?: () => void;
}

export const subscribeNativeMessages = (handlers: NativeBridgeHandlers): (() => void) => {
  const handleMessage = (e: MessageEvent) => {
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'HOST_BACK_PRESSED') {
        handlers.onHostBackPressed?.();
      } else if (data.type === 'PAUSE_ALL_AUDIO' || data.type === 'APP_PAUSE_AUDIO') {
        handlers.onPauseAudio?.();
      }
    } catch {
      // not a JSON message, ignore safely
    }
  };

  const handleCustomPause = () => {
    handlers.onPauseAudio?.();
  };

  window.addEventListener('message', handleMessage);
  window.addEventListener('app_pause_audio', handleCustomPause);

  return () => {
    window.removeEventListener('message', handleMessage);
    window.removeEventListener('app_pause_audio', handleCustomPause);
  };
};
