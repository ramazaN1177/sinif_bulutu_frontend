import { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  PlusCircle,
  RotateCw,
  Layers,
  Zap,
  CaseSensitive,
  Package,
  CheckCircle2,
  FolderTree,
  Search,
  Heart,
  Hammer,
  Plane,
  Clock,
  FileText,
  BookOpen,
} from 'lucide-react';
import type { Activity, ActivityItem, TemplateType } from '../types/game';

interface ActivityBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (activity: Activity) => void;
  initialTemplate?: TemplateType;
}

const TEMPLATES: {
  type: TemplateType;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  desc: string;
}[] = [
  { type: 'wheel', name: 'Çarkıfelek', icon: RotateCw, desc: 'Soru veya öğrenci seçimi için dönen çark' },
  { type: 'memory', name: 'Hafıza Kartları', icon: Layers, desc: '3D kartları eşleştirme' },
  { type: 'quiz', name: 'Hızlı Quiz', icon: Zap, desc: 'Zamanlı çoktan seçmeli yarışma' },
  { type: 'box', name: 'Kutu Açma', icon: Package, desc: 'Gizemli kutuları açma' },
  { type: 'anagram', name: 'Anagram', icon: CaseSensitive, desc: 'Karışık harfleri sıraya dizme' },
  { type: 'truefalse', name: 'Doğru mu Yanlış mı?', icon: CheckCircle2, desc: 'Hızlı karar ve seri önerme testi' },
  { type: 'categorize', name: 'Gruplandırma', icon: FolderTree, desc: 'Kavramları sepetlere ayırma' },
  { type: 'wordsearch', name: 'Kelime Avı', icon: Search, desc: 'Harf tablosunda gizli kelimeler' },
  { type: 'hangman', name: 'Gizli Kelime', icon: Heart, desc: 'Harf tahmin ve kelime kurtarma' },
  { type: 'whack', name: 'Köstebek Vurmaca', icon: Hammer, desc: 'Doğru hedeflere dokunma' },
  { type: 'airplane', name: 'Uçakla Bulut', icon: Plane, desc: 'Uçağı doğru buluta yönlendirme' },
  { type: 'balloon', name: 'Balon Patlatma', icon: Sparkles, desc: 'Uçan doğru balona dokunma' },
  { type: 'timeline', name: 'Zaman Çizelgesi', icon: Clock, desc: 'Olayları kronolojik sıralama' },
  { type: 'dragword', name: 'Boşluk Doldurma', icon: FileText, desc: 'Eksik kelimeleri yerleştirme' },
  { type: 'cardsort', name: 'Bilgi Kartı Destesi', icon: BookOpen, desc: 'Ön-arka bilgi kartları tekrarı' },
];

export const ActivityBuilderModal: React.FC<ActivityBuilderModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  initialTemplate = 'wheel',
}) => {
  if (!isOpen) return null;

  const [templateType, setTemplateType] = useState<TemplateType>(initialTemplate);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Genel');
  const [gradeLevel] = useState('Tüm Kademeler');
  const [items, setItems] = useState<ActivityItem[]>([
    { id: '1', question: '', answer: '' },
    { id: '2', question: '', answer: '' },
    { id: '3', question: '', answer: '' },
    { id: '4', question: '', answer: '' },
  ]);
  const [error, setError] = useState<string | null>(null);

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), question: '', answer: '', image: '' },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 2) {
      setError('En az 2 soru/öğe eklemelisiniz.');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateItem = (index: number, field: 'question' | 'answer' | 'image', value: string) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCreate = () => {
    setError(null);
    if (!title.trim()) {
      setError('Lütfen etkinliğe bir başlık veriniz.');
      return;
    }

    // Must have an answer AND either a question or an image (or both)
    const filledItems = items.filter(
      (item) => ((item.question && item.question.trim().length > 0) || (item.image && item.image.trim().length > 0)) && item.answer.trim().length > 0
    );

    if (filledItems.length < 2) {
      setError('Lütfen en az 2 adet geçerli öğe doldurunuz (Yazı, görsel veya her ikisi + Cevap).');
      return;
    }

    const newActivity: Activity = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      description: `${subject} dersi için özel ${TEMPLATES.find((t) => t.type === templateType)?.name} etkinliği.`,
      templateType,
      subject,
      gradeLevel,
      items: filledItems,
      playCount: 1,
    };

    onCreated(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 font-display">
              <Sparkles className="w-6 h-6 text-amber-500" />
              Yeni Etkinlik Oluştur
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Sorularınızı ve cevaplarınızı yazın, 1 dakikada sınıf içi oyununuz hazır olsun.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 1. Template Selection */}
        <div className="mb-6">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            1. Şablon Türü Seçin
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {TEMPLATES.map((tmpl) => {
              const isSelected = templateType === tmpl.type;
              return (
                <button
                  key={tmpl.type}
                  type="button"
                  onClick={() => setTemplateType(tmpl.type)}
                  className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    <tmpl.icon size={18} />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{tmpl.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Metadata: Title & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Etkinlik Başlığı
            </label>
            <input
              type="text"
              placeholder="Örn: 4. Sınıf Fen Bilgisi Maddeyi Tanıyalım"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Ders / Konu
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="Türkçe">Türkçe</option>
              <option value="Matematik">Matematik</option>
              <option value="Fen Bilimleri">Fen Bilimleri</option>
              <option value="Sosyal Bilgiler">Sosyal Bilgiler</option>
              <option value="İngilizce">İngilizce</option>
              <option value="Genel">Genel Kültür / Diğer</option>
            </select>
          </div>
        </div>

        {/* 3. Items list */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Sorular ve Cevaplar ({items.length} Öğe)
            </label>
            <button
              type="button"
              onClick={addItemRow}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={14} /> Yeni Satır Ekle
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-5 text-center text-xs font-bold text-slate-400">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="Soru / Yazı (Opsiyonel)"
                    value={item.question || ''}
                    onChange={(e) => updateItem(idx, 'question', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Görsel URL / Emoji (Opsiyonel)"
                    value={item.image || ''}
                    onChange={(e) => updateItem(idx, 'image', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Cevap / Sepet Kategorisi"
                    value={item.answer}
                    onChange={(e) => updateItem(idx, 'answer', e.target.value)}
                    className="w-36 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-bold text-blue-700 focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="btn-primary text-sm py-2.5 px-6 shadow-md shadow-blue-500/25 flex items-center gap-1.5"
          >
            <PlusCircle size={16} />
            <span>Etkinliği Oluştur</span>
          </button>
        </div>
      </div>
    </div>
  );
};
