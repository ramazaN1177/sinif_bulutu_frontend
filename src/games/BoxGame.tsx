import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Package, X, RotateCcw, Sparkles } from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';

interface BoxGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

export const BoxGame: React.FC<BoxGameProps> = ({
  title: _title = 'Kutu Açma Oyunu',
  items: initialItems,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  const hud = useGameHudOptional();
  const [items, setItems] = useState<ActivityItem[]>(initialItems);
  const [openedBoxIds, setOpenedBoxIds] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<ActivityItem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Sync with GameHud
  useEffect(() => {
    hud?.setScore(openedBoxIds.length * 20);
    hud?.setTotalQuestions(items.length);
    hud?.setQuestionIndex(openedBoxIds.length);
    hud?.setQuestionText('Açmak için bir kutuya dokun!');
  }, [hud, openedBoxIds.length, items.length]);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleOpenBox = (item: ActivityItem) => {
    setActiveItem(item);
    setShowAnswer(false);
    if (!openedBoxIds.includes(item.id)) {
      setOpenedBoxIds((prev) => [...prev, item.id]);
    }
  };

  const closeBox = () => {
    setActiveItem(null);
    setShowAnswer(false);
    if (openedBoxIds.length === items.length) {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      hud?.finishGame(3, items.length);
      if (onFinish) onFinish(100);
    }
  };

  const resetGame = () => {
    setOpenedBoxIds([]);
    setActiveItem(null);
    setShowAnswer(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 select-none overflow-y-auto">
      {/* Fallback Top Bar when NOT inside GameShell */}
      {!hud?.isInsideShell && (
        <div className="flex items-center justify-between w-full max-w-3xl mb-3 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-slate-600">
              Açılan Kutular: <strong className="text-slate-900 text-base">{openedBoxIds.length}</strong> / {items.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetGame}
              className="p-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 text-xs font-bold"
            >
              <RotateCcw size={14} />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>
      )}

      {/* Boxes Grid */}
      <div className="w-full max-w-3xl flex-1 flex items-center justify-center py-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 w-full">
        {items.map((item, idx) => {
          const isOpened = openedBoxIds.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleOpenBox(item)}
              className={`aspect-square rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 border-2 cursor-pointer ${
                isOpened
                  ? 'bg-slate-100 border-slate-200 opacity-60 scale-95'
                  : 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 border-amber-300 hover:border-amber-200 shadow-lg hover:-translate-y-1.5 hover:shadow-orange-500/30 active:scale-95'
              }`}
            >
              {/* Ribbon cross pattern */}
              {!isOpened && (
                <>
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 sm:h-2.5 bg-yellow-300/40 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 sm:w-2.5 bg-yellow-300/40 pointer-events-none" />
                </>
              )}

              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-xs flex items-center justify-center mb-1 sm:mb-2 text-xl sm:text-2xl font-black text-white shadow-inner relative z-10 border border-white/20">
                {idx + 1}
              </div>
              <span className={`text-[11px] sm:text-xs font-black tracking-wider uppercase relative z-10 ${isOpened ? 'text-slate-500' : 'text-white'}`}>
                {isOpened ? 'Açıldı' : 'Kutu'}
              </span>
              {!isOpened && (
                <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10">
                  <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      </div>

      {/* Box Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/25 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-2xl relative text-slate-800">
            <button
              onClick={closeBox}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-xs">
              <Package className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-2">
              Kutu İçeriği
            </span>
            {activeItem.image && (
              <div className="mb-4 max-h-48 max-w-full overflow-hidden rounded-2xl border border-slate-200 shadow-md">
                <img
                  src={activeItem.image}
                  alt={activeItem.question || 'Kutu görseli'}
                  className="max-h-48 w-auto object-contain mx-auto"
                />
              </div>
            )}
            {activeItem.question && (
              <p className="text-2xl font-black text-slate-900 mb-6 leading-relaxed">
                {activeItem.question}
              </p>
            )}

            {showAnswer ? (
              <div className="p-4 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-lg font-bold animate-fade-in">
                {activeItem.answerImage && (
                  <div className="mb-3 max-h-40 max-w-full overflow-hidden rounded-xl border border-emerald-200">
                    <img
                      src={activeItem.answerImage}
                      alt={activeItem.answer || 'Cevap görseli'}
                      className="max-h-40 w-auto object-contain mx-auto"
                    />
                  </div>
                )}
                {activeItem.answer && <div>Cevap: {activeItem.answer}</div>}
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="mb-6 px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
              >
                Cevabı Göster
              </button>
            )}

            <button
              onClick={closeBox}
              className="w-full py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 cursor-pointer active:scale-95 transition-all"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
