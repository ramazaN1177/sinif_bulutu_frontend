export interface GameSettingsState {
  soundEffects: boolean;
  music: boolean;
  vibration: boolean;
  speechReadout: boolean;
}

const STORAGE_KEY = 'sinif_bulutu_game_settings';

const DEFAULT_SETTINGS: GameSettingsState = {
  soundEffects: true,
  music: true,
  vibration: true,
  speechReadout: false,
};

const loadSettings = (): GameSettingsState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read game settings from localStorage:', e);
  }
  return DEFAULT_SETTINGS;
};

let currentSettings: GameSettingsState = loadSettings();
const listeners = new Set<(settings: GameSettingsState) => void>();

export const getGameSettings = (): GameSettingsState => currentSettings;

export const updateGameSettings = (patch: Partial<GameSettingsState>) => {
  currentSettings = { ...currentSettings, ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  } catch (e) {
    console.warn('Could not save game settings to localStorage:', e);
  }
  listeners.forEach((fn) => fn(currentSettings));
};

export const subscribeGameSettings = (fn: (settings: GameSettingsState) => void): (() => void) => {
  listeners.add(fn);
  fn(currentSettings);
  return () => {
    listeners.delete(fn);
  };
};

export const triggerHaptic = (type: 'success' | 'error' | 'click' = 'click') => {
  if (!currentSettings.vibration) return;
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (type === 'success') {
        navigator.vibrate([35, 40, 60]);
      } else if (type === 'error') {
        navigator.vibrate([60, 50, 60]);
      } else {
        navigator.vibrate(20);
      }
    }
  } catch {
    // Vibration not supported or allowed
  }
};
