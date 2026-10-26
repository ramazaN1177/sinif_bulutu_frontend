import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Package, X, RotateCcw, Sparkles, Plus } from 'lucide-react';
import type { ActivityItem } from '../types/game';

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
  isEmbed = false,
}) => {
  const [items, setItems] = useState<ActivityItem[]>(initialItems);
  const [openedBoxIds, setOpenedBoxIds] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<ActivityItem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [newBoxModalOpen, setNewBoxModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

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
      if (onFinish) onFinish(100);
    }
  };

  const resetGame = () => {
    setOpenedBoxIds([]);
    setActiveItem(null);
    setShowAnswer(false);
  };

  const handleAddNewBox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newItem: ActivityItem = {
      id: `box_${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim() || 'Doğru!',
    };

    setItems((prev) => [...prev, newItem]);
    setNewQuestion('');
    setNewAnswer('');
    setNewBoxModalOpen(false);
  };

  return (
    <div className={`flex flex-col items-center w-full max-w-4xl mx-auto ${isEmbed ? 'p-2' : 'p-6'}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-800">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold text-slate-600">
            Açılan Kutular: <strong className="text-slate-900 text-base">{openedBoxIds.length}</strong> / {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewBoxModalOpen(true)}
            className="p-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Plus size={15} />
            <span>Kutu Ekle</span>
          </button>
          <button
            onClick={resetGame}
            className="p-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Kapat</span>
          </button>
        </div>
      </div>

      {/* Boxes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
        {items.map((item, idx) => {
          const isOpened = openedBoxIds.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleOpenBox(item)}
              className={`aspect-square rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 border-2 cursor-pointer ${
                isOpened
                  ? 'bg-slate-100 border-slate-200 opacity-60 scale-95'
                  : 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 border-amber-300 hover:border-amber-200 shadow-lg hover:-translate-y-1.5 hover:shadow-orange-500/30 active:scale-95'
              }`}
            >
              {/* Ribbon cross pattern */}
              {!isOpened && (
                <>
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 bg-yellow-300/40 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2.5 bg-yellow-300/40 pointer-events-none" />
                </>
              )}

              <div className="w-14 h-14 rounded-2xl bg-black/25 backdrop-blur-xs flex items-center justify-center mb-2 text-2xl font-black text-white shadow-inner relative z-10 border border-white/20">
                {idx + 1}
              </div>
              <span className={`text-xs font-black tracking-wider uppercase relative z-10 ${isOpened ? 'text-slate-500' : 'text-white'}`}>
                {isOpened ? 'Açıldı' : 'Kutu'}
              </span>
              {!isOpened && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <Sparkles size={16} className="text-yellow-200 animate-pulse" />
                </div>
              )}
            </button>
          );
        })}

        {/* ➕ "Kutu Ekle" Button in Grid */}
        <button
          onClick={() => setNewBoxModalOpen(true)}
          className="aspect-square rounded-3xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white/70 hover:bg-white text-slate-500 hover:text-amber-600 transition-all cursor-pointer shadow-xs hover:scale-102"
          title="Yeni bir kutu ekleyin"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-2 shadow-xs">
            <Plus size={22} />
          </div>
          <span className="text-xs font-black">Kutu Ekle</span>
          <span className="text-[10px] text-slate-400">Yeni Soru Kutusu</span>
        </button>
      </div>

      {/* Modal: Yeni Kutu Ekle */}
      {newBoxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <h3 className="text-base font-black text-slate-900">Yeni Kutu Ekle</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewBoxModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNewBox} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kutunun İçindeki Soru / Görev</label>
                <textarea
                  required
                  rows={3}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Kutu açıldığında ekranda çıkacak soru veya görevi yazın..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cevap / İpucu</label>
                <input
                  type="text"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Doğru cevap (Cevabı Göster denilince açılır)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewBoxModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Kutuyu Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Box Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
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
            <p className="text-2xl font-black text-slate-900 mb-6 leading-relaxed">
              {activeItem.question}
            </p>

            {showAnswer ? (
              <div className="p-4 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-lg font-bold animate-fade-in">
                Cevap: {activeItem.answer}
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
