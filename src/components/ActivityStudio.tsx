import { useState, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Check,
  Monitor,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Package,
  X,
} from 'lucide-react';
import type { Activity, ActivityItem, TemplateType } from '../types/game';
import { CategorizeGame, BOX_PALETTES } from '../games/CategorizeGame';
import { QuizGame } from '../games/QuizGame';
import { WheelGame } from '../games/WheelGame';
import { MemoryGame } from '../games/MemoryGame';
import { TrueFalseGame } from '../games/TrueFalseGame';
import { BoxGame } from '../games/BoxGame';
import { BalloonGame } from '../games/BalloonGame';
import { WordSearchGame } from '../games/WordSearchGame';
import { AnagramGame } from '../games/AnagramGame';
import { HangmanGame } from '../games/HangmanGame';
import { DragWordGame } from '../games/DragWordGame';
import { TimelineGame } from '../games/TimelineGame';
import { FlashcardGame } from '../games/FlashcardGame';
import { WhackGame } from '../games/WhackGame';
import { AirplaneGame } from '../games/AirplaneGame';
import { EDUCATIONAL_TEMPLATES, SAMPLE_ACTIVITIES } from './TemplateGrid';
import { TemplateCardPreview } from './TemplateCardPreview';

interface ActivityStudioProps {
  initialActivity?: Activity | null;
  onBack: () => void;
  onSave: (activity: Activity) => void;
  onPlayFullscreen: (activity: Activity) => void;
}

const CATEGORIES = [
  'Tümü',
  'Şans & Seçim',
  'Bilgi Yarışması',
  'Eşleştirme & Bellek',
  'Kelime & Mantık',
  'Hızlı Karar',
  'Sıralama & Mantık',
];

export const ActivityStudio: React.FC<ActivityStudioProps> = ({
  initialActivity,
  onBack,
  onSave,
  onPlayFullscreen,
}) => {
  // Activity state
  const [templateType, setTemplateType] = useState<TemplateType>(
    initialActivity?.templateType || 'categorize'
  );
  const [title, setTitle] = useState(
    initialActivity?.title || 'Maddenin Halleri (Kutulara Düşürme)'
  );
  const [description, setDescription] = useState(
    initialActivity?.description || 'Verilen maddeleri doğru kutulara yerçekimiyle düşürün.'
  );
  const [subject, setSubject] = useState(initialActivity?.subject || 'Fen Bilimleri');
  const [gradeLevel, setGradeLevel] = useState(initialActivity?.gradeLevel || '5. Sınıf');

  // Template catalog filters & UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredType, setHoveredType] = useState<TemplateType | null>(null);
  const [isPickerCollapsed, setIsPickerCollapsed] = useState(false);

  // Horizontal scroller ref
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Items / questions list
  const [items, setItems] = useState<ActivityItem[]>(
    initialActivity?.items && initialActivity.items.length > 0
      ? initialActivity.items
      : [
          { id: '1', question: 'Buz', answer: 'Katı' },
          { id: '2', question: 'Su', answer: 'Sıvı' },
          { id: '3', question: 'Su Buharı', answer: 'Gaz' },
          { id: '4', question: 'Demir Çivi', answer: 'Katı' },
          { id: '5', question: 'Zeytinyağı', answer: 'Sıvı' },
          { id: '6', question: 'Helyum Balonu', answer: 'Gaz' },
        ]
  );

  // Categorize specific: box categories & colors (Max 10 boxes)
  const [categories, setCategories] = useState<string[]>(() => {
    if (initialActivity?.categories && initialActivity.categories.length > 0) {
      return initialActivity.categories.slice(0, 10);
    }
    const fromItems = initialActivity?.items
      ? Array.from(new Set(initialActivity.items.map((it) => it.answer.trim()).filter(Boolean)))
      : [];
    return (fromItems.length > 0 ? fromItems : ['Katı', 'Sıvı', 'Gaz']).slice(0, 10);
  });

  const [boxColors, setBoxColors] = useState<Record<string, number>>(() => {
    if (initialActivity?.boxColors) {
      return initialActivity.boxColors;
    }
    const initial: Record<string, number> = {};
    ['Katı', 'Sıvı', 'Gaz'].forEach((cat, idx) => {
      initial[cat] = idx % BOX_PALETTES.length;
    });
    return initial;
  });

  const [colorPickerCat, setColorPickerCat] = useState<string | null>(null);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Preview key to force re-render/reset the live game
  const [previewKey, setPreviewKey] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Scroll left/right helper
  const scrollTrack = (direction: 'left' | 'right') => {
    if (scrollerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Active template metadata
  const activeTemplateDef = useMemo(() => {
    return (
      EDUCATIONAL_TEMPLATES.find((t) => t.type === templateType) ||
      EDUCATIONAL_TEMPLATES[0]
    );
  }, [templateType]);

  // Filtered templates matching category & search query
  const filteredTemplates = useMemo(() => {
    return EDUCATIONAL_TEMPLATES.filter((tmpl) => {
      const matchesCat =
        selectedCategory === 'Tümü' || tmpl.category === selectedCategory;
      const matchesSearch =
        tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Construct active activity for live play
  const currentActivity: Activity = useMemo(() => {
    return {
      id: initialActivity?.id || `studio_${templateType}`,
      title,
      description,
      templateType,
      subject,
      gradeLevel,
      items,
      categories: categories.slice(0, 10),
      boxColors,
      playCount: initialActivity?.playCount || 0,
    };
  }, [initialActivity, title, description, templateType, subject, gradeLevel, items, categories, boxColors]);

  // Load sample questions for the selected template
  const handleLoadSample = (type: TemplateType) => {
    const sample = SAMPLE_ACTIVITIES.find((a) => a.templateType === type);
    if (sample) {
      setTitle(sample.title);
      setDescription(sample.description);
      setSubject(sample.subject);
      setGradeLevel(sample.gradeLevel);
      setItems([...sample.items]);
      if (type === 'categorize') {
        const uniqueAnswers = Array.from(new Set(sample.items.map((i) => i.answer)));
        const cats = (uniqueAnswers.length > 0 ? uniqueAnswers : ['Grup A', 'Grup B']).slice(0, 10);
        setCategories(cats);
        const colMap: Record<string, number> = {};
        cats.forEach((c, idx) => {
          colMap[c] = idx % BOX_PALETTES.length;
        });
        setBoxColors(colMap);
      }
    } else {
      setItems([
        { id: '1', question: 'Örnek Soru 1', answer: 'Doğru Cevap 1', options: ['A', 'B', 'C', 'D'] },
        { id: '2', question: 'Örnek Soru 2', answer: 'Doğru Cevap 2', options: ['A', 'B', 'C', 'D'] },
      ]);
    }
    setPreviewKey((k) => k + 1);
  };

  const handleTemplateChange = (newType: TemplateType) => {
    setTemplateType(newType);
    handleLoadSample(newType);
  };

  // Add new item
  const handleAddItem = () => {
    const newItem: ActivityItem = {
      id: `${Date.now()}`,
      question: `Yeni Soru ${items.length + 1}`,
      answer: templateType === 'categorize' && categories.length > 0 ? categories[0] : 'Doğru Cevap',
      options: templateType === 'quiz' ? ['Seçenek A', 'Seçenek B', 'Seçenek C', 'Doğru Cevap'] : undefined,
    };
    setItems((prev) => [...prev, newItem]);
    setPreviewKey((k) => k + 1);
  };

  // Update item
  const handleUpdateItem = (idx: number, patch: Partial<ActivityItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  // Delete item
  const handleDeleteItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setPreviewKey((k) => k + 1);
  };

  // Save activity
  const handleSaveActivity = () => {
    onSave(currentActivity);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Render the real interactive game engine based on template
  const renderInteractiveGame = () => {
    switch (templateType) {
      case 'categorize':
        return (
          <CategorizeGame
            title={title}
            items={items}
            categories={categories}
            boxColors={boxColors}
            isEmbed={true}
          />
        );
      case 'quiz':
        return <QuizGame title={title} items={items} isEmbed={true} />;
      case 'wheel':
        return <WheelGame title={title} items={items} isEmbed={true} />;
      case 'memory':
        return <MemoryGame title={title} items={items} isEmbed={true} />;
      case 'truefalse':
        return <TrueFalseGame title={title} items={items} isEmbed={true} />;
      case 'box':
        return <BoxGame title={title} items={items} isEmbed={true} />;
      case 'balloon':
        return <BalloonGame title={title} items={items} isEmbed={true} />;
      case 'wordsearch':
        return <WordSearchGame title={title} items={items} isEmbed={true} />;
      case 'anagram':
        return <AnagramGame title={title} items={items} isEmbed={true} />;
      case 'hangman':
        return <HangmanGame title={title} items={items} isEmbed={true} />;
      case 'dragword':
        return <DragWordGame title={title} items={items} isEmbed={true} />;
      case 'timeline':
        return <TimelineGame title={title} items={items} isEmbed={true} />;
      case 'cardsort':
        return <FlashcardGame title={title} items={items} isEmbed={true} />;
      case 'whack':
        return <WhackGame title={title} items={items} isEmbed={true} />;
      case 'airplane':
        return <AirplaneGame title={title} items={items} isEmbed={true} />;
      default:
        return <QuizGame title={title} items={items} isEmbed={true} />;
    }
  };

  const ActiveIconComp = activeTemplateDef.icon;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col select-none">
      {/* 1. STUDIO HEADER BAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-xs"
          >
            <ArrowLeft size={16} />
            <span>Panele Dön</span>
          </button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm sm:text-base">
                Şablon & Oyun Üretim Stüdyosu
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase">
                {activeTemplateDef.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Sol taraftan şablonunuzu ve sorularınızı düzenleyin, sağ tarafta anlık olarak test edin.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPlayFullscreen(currentActivity)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play size={14} className="fill-current" />
            <span className="hidden sm:inline">Tam Ekran</span> Önizle
          </button>

          <button
            onClick={handleSaveActivity}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              savedSuccess
                ? 'bg-emerald-600 shadow-emerald-500/25'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
            }`}
          >
            {savedSuccess ? <Check size={14} /> : <Save size={14} />}
            <span>{savedSuccess ? 'Kaydedildi!' : 'Taslağı Kaydet'}</span>
          </button>
        </div>
      </header>

      {/* 2. SPLIT SCREEN LAYOUT: Left Form (Editor) | Right Live Preview (Game) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANEL: Form & Question Editor */}
        <div className="w-full lg:w-[48%] xl:w-[46%] bg-white border-r border-slate-200 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-61px)]">
          {/* SEÇİLEN TASLAK (AKTİF ŞABLON) - KÜÇÜLTÜLMÜŞ KOMPAKT BİLGİ KARTI */}
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-50/90 via-slate-50 to-white border border-blue-200/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Kompakt Küçük Resim */}
              <div className="w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden border border-slate-200/90 shrink-0 shadow-2xs relative bg-slate-100">
                <TemplateCardPreview templateType={templateType} isHovered={false} className="h-full w-full rounded-xl border-0" />
              </div>

              {/* Kompakt Başlık ve Bilgiler */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                    Aktif Şablon
                  </span>
                  <span className={`px-2 py-0.2 rounded-md text-[9px] font-extrabold border ${activeTemplateDef.badgeBg}`}>
                    {activeTemplateDef.category}
                  </span>
                  <div className="hidden sm:flex items-center gap-1 text-slate-400">
                    <span title="Akıllı Tahta"><Monitor size={11} className="text-blue-500" /></span>
                    <span title="Mobil"><Smartphone size={11} className="text-emerald-500" /></span>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 truncate">
                  <ActiveIconComp size={16} className={activeTemplateDef.accentColor} />
                  <span>{activeTemplateDef.name}</span>
                </h3>

                <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                  {activeTemplateDef.description}
                </p>
              </div>
            </div>

            {/* Hızlı Aksiyon: Örnek Soruları Doldur */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample(templateType)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Bu şablon için hazırlanmış örnek soruları ve içeriği tek tıkla yükleyin"
              >
                <Sparkles size={12} />
                <span className="hidden sm:inline">Örnekleri Doldur</span>
                <span className="sm:hidden">Örnek</span>
              </button>
            </div>
          </div>

          {/* YANA DOĞRU KAYDIRILABİLİR ŞABLON LİSTESİ (DARALTILABİLİR / COLLAPSIBLE) */}
          <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden transition-all duration-200">
            {/* Header bar - Clickable to toggle or use button */}
            <div
              onClick={() => setIsPickerCollapsed(!isPickerCollapsed)}
              className="p-3 bg-white hover:bg-slate-50/80 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  1. Şablon Değiştir
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {filteredTemplates.length} Şablon
                </span>
                {isPickerCollapsed && (
                  <span className="text-[11px] text-blue-600 font-semibold hidden sm:inline">
                    (Seçili: {activeTemplateDef.name})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {/* Kaydırma Okları - Sadece açıkken görünür */}
                {!isPickerCollapsed && (
                  <div className="flex items-center gap-1 mr-1">
                    <button
                      type="button"
                      onClick={() => scrollTrack('left')}
                      className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors cursor-pointer"
                      title="Sola Kaydır"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollTrack('right')}
                      className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors cursor-pointer"
                      title="Sağa Kaydır"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* Daralt / Genişlet Toggle Butonu */}
                <button
                  type="button"
                  onClick={() => setIsPickerCollapsed(!isPickerCollapsed)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  {isPickerCollapsed ? (
                    <>
                      <span>Şablonları Göster</span>
                      <ChevronDown size={14} />
                    </>
                  ) : (
                    <>
                      <span>Alanı Daralt</span>
                      <ChevronUp size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Content */}
            {!isPickerCollapsed && (
              <div className="p-3 pt-2.5">
                {/* Arama & Kategori Filtre Hapları */}
                <div className="flex flex-col gap-2 mb-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Şablon ara (çark, quiz, hafıza, anagram...)"
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Temizle
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Yana Kaydırılan Şablon Kartları (Horizontal Scroller with Mouse Wheel Support) */}
                <div
                  ref={scrollerRef}
                  onWheel={(e) => {
                    if (scrollerRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                      scrollerRef.current.scrollLeft += e.deltaY;
                    }
                  }}
                  className="flex overflow-x-auto gap-3 pb-2 scroll-smooth snap-x snap-mandatory scrollbar-thin"
                >
                  {filteredTemplates.map((tmpl) => {
                    const isSelected = tmpl.type === templateType;
                    const isHovered = isSelected || hoveredType === tmpl.type;
                    const IconComp = tmpl.icon;

                    return (
                      <div
                        key={tmpl.type}
                        onClick={() => handleTemplateChange(tmpl.type)}
                        onMouseEnter={() => setHoveredType(tmpl.type)}
                        onMouseLeave={() => setHoveredType(null)}
                        className={`w-[220px] sm:w-[240px] shrink-0 snap-start rounded-2xl p-2.5 flex flex-col justify-between border transition-all duration-200 cursor-pointer text-left group ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Visual Thumbnail Artwork */}
                        <div className="relative mb-2">
                          <TemplateCardPreview
                            templateType={tmpl.type}
                            isHovered={isHovered}
                            className="h-28 sm:h-30"
                          />
                          {isSelected && (
                            <div className="absolute top-2 left-2 z-20">
                              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center gap-1 shadow-sm">
                                <Check size={10} strokeWidth={3} />
                                <span>Seçildi</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Category & Device Icons */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${tmpl.badgeBg}`}>
                            {tmpl.category}
                          </span>
                          <div className="flex items-center gap-1 text-slate-400">
                            <span title="Akıllı Tahta">
                              <Monitor size={12} className="text-blue-500" />
                            </span>
                            <span title="Mobil">
                              <Smartphone size={12} className="text-emerald-500" />
                            </span>
                          </div>
                        </div>

                        {/* Title with Icon */}
                        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 mb-1 group-hover:text-blue-600 transition-colors">
                          <IconComp size={15} className={`${tmpl.accentColor} shrink-0`} />
                          <span className="truncate">{tmpl.name}</span>
                        </h4>

                        {/* Description */}
                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                          {tmpl.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section B: Activity General Info */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                2. Temel Ders Bilgileri
              </span>
              <button
                type="button"
                onClick={() => handleLoadSample(templateType)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} />
                <span>Örnek Doldur</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Etkinlik Başlığı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Maddenin Halleri ve Özellikleri"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Ders / Alan</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  <option value="Fen Bilimleri">Fen Bilimleri</option>
                  <option value="Matematik">Matematik</option>
                  <option value="Türkçe">Türkçe</option>
                  <option value="Sosyal Bilgiler">Sosyal Bilgiler</option>
                  <option value="İngilizce">İngilizce</option>
                  <option value="Din Kültürü">Din Kültürü</option>
                  <option value="Genel Kültür">Genel Kültür</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Sınıf Düzeyi</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  <option value="1. Sınıf">1. Sınıf</option>
                  <option value="2. Sınıf">2. Sınıf</option>
                  <option value="3. Sınıf">3. Sınıf</option>
                  <option value="4. Sınıf">4. Sınıf</option>
                  <option value="5. Sınıf">5. Sınıf</option>
                  <option value="6. Sınıf">6. Sınıf</option>
                  <option value="7. Sınıf">7. Sınıf</option>
                  <option value="8. Sınıf">8. Sınıf</option>
                  <option value="Lise (9-12)">Lise (9-12)</option>
                  <option value="Tüm Seviyeler">Tüm Seviyeler</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Öğrenci Yönergesi</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: Topu tutup doğru kutuya yerçekimiyle bırakın."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Hedef Sepetleri (Kategoriler) & Renkleri Yönetimi - Sadece Sepet / Gruplandırma şablonunda (Max 10) */}
          {templateType === 'categorize' && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Package size={16} className="text-amber-600" />
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                    Hedef Sepetleri ({categories.length} / 10 Sepet)
                  </span>
                </div>
                {categories.length >= 10 && (
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    Maksimum 10 Sepet
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-800/80 mb-3">
                Topların düşeceği hedef sepetlerini buradan yönetin ve her sepetin rengini renk simgesine dokunarak belirleyin (maksimum 10 sepet yan yana konulur).
              </p>

              {/* Sepet Rozetleri & Renk Seçicileri */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {categories.map((cat, cIdx) => {
                  const palIdx = boxColors[cat] ?? (cIdx % BOX_PALETTES.length);
                  const pal = BOX_PALETTES[palIdx] || BOX_PALETTES[0];
                  const isPickerOpen = colorPickerCat === cat;

                  return (
                    <div
                      key={cat}
                      className="relative px-3 py-1.5 rounded-xl bg-white border border-amber-300 shadow-2xs flex items-center gap-2"
                    >
                      {/* Renk Seçici Tetikleyici */}
                      <button
                        type="button"
                        onClick={() => setColorPickerCat(isPickerOpen ? null : cat)}
                        className={`w-4 h-4 rounded-full bg-gradient-to-br ${pal.bg} border border-slate-300 hover:scale-115 transition-transform cursor-pointer shadow-xs shrink-0`}
                        title={`Renk: ${pal.name} (Değiştirmek için tıklayın)`}
                      />

                      {/* Açılır Renk Menüsü */}
                      {isPickerOpen && (
                        <div className="absolute top-9 left-0 z-50 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-wrap gap-1.5 w-48 animate-scale-in">
                          <span className="w-full text-[10px] font-black text-slate-500 mb-1">Sepet Rengi Seç:</span>
                          {BOX_PALETTES.map((p, pIdx) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setBoxColors((prev) => ({ ...prev, [cat]: pIdx }));
                                setColorPickerCat(null);
                                setPreviewKey((k) => k + 1);
                              }}
                              className={`w-6 h-6 rounded-lg bg-gradient-to-br ${p.bg} border-2 transition-transform hover:scale-115 cursor-pointer ${
                                palIdx === pIdx ? 'border-slate-800 shadow-md ring-2 ring-blue-400' : 'border-transparent'
                              }`}
                              title={p.name}
                            />
                          ))}
                        </div>
                      )}

                      <span className="text-xs font-black text-slate-800">{cat}</span>

                      {/* Sil Butonu (En az 2 sepet kalmalı) */}
                      {categories.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = categories.filter((_, i) => i !== cIdx);
                            setCategories(next);
                            setPreviewKey((k) => k + 1);
                          }}
                          className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Sepeti Sil"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Yeni Sepet Ekleme Satırı (Max 10 Sepet Kontrolü) */}
              {categories.length < 10 ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = newCategoryInput.trim();
                        if (trimmed && !categories.includes(trimmed) && categories.length < 10) {
                          const next = [...categories, trimmed];
                          setCategories(next);
                          setBoxColors((prev) => ({
                            ...prev,
                            [trimmed]: (next.length - 1) % BOX_PALETTES.length,
                          }));
                          setNewCategoryInput('');
                          setPreviewKey((k) => k + 1);
                        }
                      }
                    }}
                    placeholder="Yeni sepet adı yazın (Örn: Plazma)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newCategoryInput.trim();
                      if (trimmed && !categories.includes(trimmed) && categories.length < 10) {
                        const next = [...categories, trimmed];
                        setCategories(next);
                        setBoxColors((prev) => ({
                          ...prev,
                          [trimmed]: (next.length - 1) % BOX_PALETTES.length,
                        }));
                        setNewCategoryInput('');
                        setPreviewKey((k) => k + 1);
                      }
                    }}
                    disabled={!newCategoryInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Sepet Ekle</span>
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-bold text-center">
                  Maksimum 10 sepet limitine ulaşıldı. Yeni sepet eklemek için mevcut sepetlerden birini silebilirsiniz.
                </div>
              )}
            </div>
          )}

          {/* Section C: Dynamic Items / Questions Form */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                3. Sorular & Öğeler ({items.length} Adet)
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Madde Ekle</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-black text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                        title="Bu soruyu sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Soru Metni */}
                  <div className="mb-2">
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => handleUpdateItem(idx, { question: e.target.value })}
                      placeholder="Soru veya terim yazın..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* Cevap / Kategori Seçimi */}
                  {templateType === 'categorize' ? (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Cevap Kutusu</label>
                      <select
                        value={item.answer}
                        onChange={(e) => handleUpdateItem(idx, { answer: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            Kutu: {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : templateType === 'quiz' ? (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">Seçenekler & Doğru Cevap</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(item.options || ['A', 'B', 'C', 'D']).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`quiz_correct_${idx}`}
                              checked={item.answer === opt}
                              onChange={() => handleUpdateItem(idx, { answer: opt })}
                              className="accent-blue-600 cursor-pointer"
                              title="Doğru cevap olarak işaretle"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(item.options || [])];
                                newOpts[optIdx] = e.target.value;
                                const isCurrentAnswer = item.answer === opt;
                                handleUpdateItem(idx, {
                                  options: newOpts,
                                  answer: isCurrentAnswer ? e.target.value : item.answer,
                                });
                              }}
                              className="w-full px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Doğru Cevap / Eşleşen Terim</label>
                      <input
                        type="text"
                        value={item.answer}
                        onChange={(e) => handleUpdateItem(idx, { answer: e.target.value })}
                        placeholder="Doğru cevabı girin..."
                        className="w-full px-3 py-1.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs font-bold text-emerald-900 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live Interactive Playable Game Engine Preview */}
        <div className="flex-1 bg-slate-100/70 p-4 sm:p-6 flex flex-col items-center justify-start overflow-y-auto max-h-[calc(100vh-61px)]">
          <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600">Canlı İnteraktif Önizleme</span>
            </div>
            <button
              onClick={() => setPreviewKey((k) => k + 1)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Yeniden Başlat</span>
            </button>
          </div>

          {/* Interactive Game Render Screen */}
          <div
            key={previewKey}
            className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-md p-4 sm:p-6 min-h-[560px] flex flex-col justify-center"
          >
            {renderInteractiveGame()}
          </div>
        </div>
      </div>
    </div>
  );
};
