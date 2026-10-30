import React, { useState, useEffect } from 'react';
import { Settings, Volume2, Music, Smartphone, Volume1, Check } from 'lucide-react';
import {
  getGameSettings,
  updateGameSettings,
  subscribeGameSettings,
  triggerHaptic,
  type GameSettingsState,
} from '../../services/gameSettings';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  accentColor = '#5B9CFF',
}) => {
  const [settings, setSettings] = useState<GameSettingsState>(getGameSettings());

  useEffect(() => {
    return subscribeGameSettings(setSettings);
  }, []);

  if (!isOpen) return null;

  const toggle = (key: keyof GameSettingsState) => {
    const nextVal = !settings[key];
    updateGameSettings({ [key]: nextVal });
    triggerHaptic('click');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 border-t sm:border-2 border-white shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            <Settings size={24} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900">
              Oyun Ayarları
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Ses ve titreşim tercihlerini düzenle
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-6">
          {/* Sound Effects */}
          <div
            onClick={() => toggle('soundEffects')}
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Volume2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Ses Efektleri</h4>
                <p className="text-xs text-slate-500">Doğru ve yanlış yanıt sesleri</p>
              </div>
            </div>
            <div
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                settings.soundEffects ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.soundEffects ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Music */}
          <div
            onClick={() => toggle('music')}
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Music size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Oyun Müziği</h4>
                <p className="text-xs text-slate-500">Neşeli arka plan melodisi</p>
              </div>
            </div>
            <div
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                settings.music ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.music ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Vibration */}
          <div
            onClick={() => toggle('vibration')}
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Titreşim</h4>
                <p className="text-xs text-slate-500">Dokunma ve cevap hissi</p>
              </div>
            </div>
            <div
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                settings.vibration ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.vibration ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Speech Readout */}
          <div
            onClick={() => toggle('speechReadout')}
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                <Volume1 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Sesli Okuma (TTS)</h4>
                <p className="text-xs text-slate-500">Soruları otomatik sesli oku</p>
              </div>
            </div>
            <div
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                settings.speechReadout ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.speechReadout ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 rounded-2xl font-black font-display text-lg text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 10px 25px -5px ${accentColor}60`,
          }}
        >
          <Check size={20} className="stroke-[3]" />
          <span>Tamam</span>
        </button>
      </div>
    </div>
  );
};
