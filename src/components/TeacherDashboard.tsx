import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  BookOpen,
  Sparkles,
  Play,
  Copy,
  Check,
  Award,
  Layers,
  School,
  Clock,
  Eye,
  Trash2,
} from 'lucide-react';
import type { Activity } from '../types/game';
import { dashboardService, type ClassRoom, type Assignment } from '../services/dashboardService';

interface TeacherDashboardProps {
  onOpenStudio: (activity?: Activity) => void;
  onPlayActivity: (activity: Activity) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenStudio,
  onPlayActivity,
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'assignments' | 'activities'>('classes');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Modals
  const [createClassModalOpen, setCreateClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('Matematik');
  const [newClassGrade, setNewClassGrade] = useState('5. Sınıf');

  const [createAssignmentModalOpen, setCreateAssignmentModalOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgClassId, setAsgClassId] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');

  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassRoom | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [clsList, asgList, actList] = await Promise.all([
      dashboardService.getClasses(),
      dashboardService.getAssignments(),
      dashboardService.getActivities(),
    ]);
    setClasses(clsList);
    setAssignments(asgList);
    setActivities(actList);
    if (clsList.length > 0 && !asgClassId) {
      setAsgClassId(clsList[0].id);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    await dashboardService.createClass({
      name: newClassName.trim(),
      subject: newClassSubject,
      gradeLevel: newClassGrade,
    });

    setNewClassName('');
    setCreateClassModalOpen(false);
    loadData();
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !asgClassId) return;

    await dashboardService.createAssignment({
      title: asgTitle.trim(),
      description: asgDesc.trim() || 'Verilen ödev yönergelerini tamamlayınız.',
      classId: asgClassId,
      dueDate: asgDueDate || '2026-11-10',
      maxScore: 100,
    });

    setAsgTitle('');
    setAsgDesc('');
    setCreateAssignmentModalOpen(false);
    loadData();
  };

  const handleDeleteActivity = async (id: string, title: string) => {
    if (window.confirm(`"${title}" şablonunu/oyununu silmek istediğinizden emin misiniz?`)) {
      await dashboardService.deleteActivity(id);
      loadData();
    }
  };

  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissionCount || 0), 0);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. TOP HERO STATS & WELCOME BANNER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black mb-2">
                <School size={14} />
                <span>Öğretmen Yönetim Portalı</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                Hoş Geldiniz, Öğretmenim
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Sınıflarınızı yönetin, ödev atayın ve akıllı tahta oyun şablonlarınızı canlı stüdyoda üretin.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCreateClassModalOpen(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Yeni Sınıf Aç</span>
              </button>

              <button
                onClick={() => setCreateAssignmentModalOpen(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen size={16} />
                <span>Ödev Ver</span>
              </button>

              <button
                onClick={() => onOpenStudio()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles size={16} />
                <span>Yeni Şablon / Oyun Üret</span>
              </button>
            </div>
          </div>

          {/* 4 Core Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Aktif Sınıflar</span>
                <strong className="text-2xl font-black text-slate-900 font-display">{classes.length}</strong>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <School size={20} />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Toplam Öğrenci</span>
                <strong className="text-2xl font-black text-slate-900 font-display">{totalStudents}</strong>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Gelen Ödevler</span>
                <strong className="text-2xl font-black text-slate-900 font-display">{totalSubmissions}</strong>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Oyun Şablonları</span>
                <strong className="text-2xl font-black text-slate-900 font-display">{activities.length}</strong>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Layers size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'classes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <School size={16} />
            <span>Sınıflarım ({classes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={16} />
            <span>Ödevler ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'activities'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={16} />
            <span>Şablonlarım & Oyunlarım ({activities.length})</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: CLASSES */}
        {activeTab === 'classes' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">Açtığınız Sınıflar</h2>
                <p className="text-xs text-slate-500">
                  Öğrencileriniz aşağıdaki 6 haneli sınıf kodunu uygulamaya girerek anında sınıfa dahil olurlar.
                </p>
              </div>
              <button
                onClick={() => setCreateClassModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                <span>Sınıf Ekle</span>
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
                  <School size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Henüz Kayıtlı Bir Sınıfınız Yok</h3>
                <p className="text-xs text-slate-500 mb-6 max-w-sm">
                  Yeni bir sınıf oluşturarak öğrencilerinize katılım kodu verebilir, ders etkinlikleri ve ödevler atayabilirsiniz.
                </p>
                <button
                  onClick={() => setCreateClassModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>İlk Sınıfınızı Oluşturun</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Subject & Level badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          {cls.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{cls.gradeLevel}</span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 font-display mb-1.5">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                        {cls.description || 'Ders dökümanları ve etkinlik alanı.'}
                      </p>

                      {/* Class Code Card (Big & Highlighted for Smartboard) */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 mb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block">
                            Sınıf Katılım Kodu
                          </span>
                          <strong className="text-xl font-black text-slate-900 tracking-wider font-mono">
                            {cls.code}
                          </strong>
                        </div>

                        <button
                          onClick={() => handleCopyCode(cls.code)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                          title="Kodu Kopyala"
                        >
                          {copiedCode === cls.code ? (
                            <>
                              <Check size={14} className="text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Kopyala</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Student count & Avatars */}
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-4 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Users size={15} className="text-emerald-600" />
                          <span>{cls.studentCount || 0} Öğrenci Kayıtlı</span>
                        </div>
                      </div>
                    </div>

                    {/* Class Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedClassDetail(cls)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Users size={14} />
                        <span>Öğrencileri Gör</span>
                      </button>

                      <button
                        onClick={() => {
                          setAsgClassId(cls.id);
                          setCreateAssignmentModalOpen(true);
                        }}
                        className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Bu sınıfa ödev ata"
                      >
                        <Plus size={14} />
                        <span>Ödev Ver</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">Verilen Ödevler</h2>
                <p className="text-xs text-slate-500">
                  Öğrencilerinizin teslim ettiği ödevleri inceleyin ve not verin.
                </p>
              </div>
              <button
                onClick={() => setCreateAssignmentModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                <span>Yeni Ödev Ver</span>
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Henüz Verilmiş Bir Ödev Yok</h3>
                <p className="text-xs text-slate-500 mb-6 max-w-sm">
                  Sınıflarınıza ödevler vererek öğrencilerin çalışma ve etkinlik teslimlerini buradan toplayabilirsiniz.
                </p>
                <button
                  onClick={() => setCreateAssignmentModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Yeni Ödev Ver</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {asg.className}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {asg.subject}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                        {asg.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl mb-3">
                        {asg.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1 text-rose-600">
                          <Clock size={14} />
                          <span>Son Teslim: {asg.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <Award size={14} className="text-amber-500" />
                          <span>{asg.maxScore} Puan</span>
                        </div>
                      </div>
                    </div>

                    {/* Submission Progress & Button */}
                    <div className="flex items-center gap-4 md:border-l md:border-slate-100 md:pl-6 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-800 block">
                          {asg.submissionCount || 0} / {asg.totalStudents || 20} Teslim
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Tamamlanma Oranı: %{Math.round(((asg.submissionCount || 0) / (asg.totalStudents || 20)) * 100)}
                        </span>
                      </div>

                      <button
                        onClick={() => alert(`"${asg.title}" ödevi için teslim edilen dosyalar listeleniyor.`)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye size={15} />
                        <span>Teslimleri İncele</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACTIVITIES & TEMPLATES */}
        {activeTab === 'activities' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">
                  Şablonlarım & Etkileşimli Oyunlar ({activities.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Oluşturup kaydettiğiniz oyunları akıllı tahtada tam ekran oynatın veya split-screen stüdyoda düzenleyin.
                </p>
              </div>
              <button
                onClick={() => onOpenStudio()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                <span>Stüdyoda Yeni Üret</span>
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center max-w-2xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  Henüz Bir Şablon veya Oyun Oluşturmadınız
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  Sınıfınız için bilgi yarışması, kutu gruplama, çarkıfelek gibi 15 farklı eğitsel şablondan birini seçerek dakikalar içinde oyun tasarlayabilirsiniz.
                </p>
                <button
                  onClick={() => onOpenStudio()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-md shadow-blue-500/25 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Şablon Stüdyosu'nda Yeni Oyun Tasarla</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          {act.templateType}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{act.subject}</span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 font-display mb-1.5">
                        {act.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                        {act.description}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 font-bold mb-4 flex items-center justify-between">
                        <span>{act.items?.length || 0} Soru / Öğe</span>
                        <span className="text-slate-400 font-normal">{act.gradeLevel}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => onPlayActivity(act)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Play size={14} className="fill-current" />
                        <span>Oyunu Başlat</span>
                      </button>

                      <button
                        onClick={() => onOpenStudio(act)}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Stüdyoda Düzenle"
                      >
                        <Sparkles size={14} />
                        <span>Düzenle</span>
                      </button>

                      <button
                        onClick={() => handleDeleteActivity(act.id, act.title)}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                        title="Şablonu Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: CREATE CLASS */}
      {createClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-4 font-display">
              Yeni Sınıf Oluştur
            </h3>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sınıf Adı</label>
                <input
                  type="text"
                  placeholder="Örn: 6-C Matematik Kulübü"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Ders</label>
                  <select
                    value={newClassSubject}
                    onChange={(e) => setNewClassSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold"
                  >
                    <option value="Matematik">Matematik</option>
                    <option value="Fen Bilimleri">Fen Bilimleri</option>
                    <option value="Türkçe">Türkçe</option>
                    <option value="Sosyal Bilgiler">Sosyal Bilgiler</option>
                    <option value="İngilizce">İngilizce</option>
                    <option value="Bilişim">Bilişim & Kodlama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Seviye</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold"
                  >
                    <option value="5. Sınıf">5. Sınıf</option>
                    <option value="6. Sınıf">6. Sınıf</option>
                    <option value="7. Sınıf">7. Sınıf</option>
                    <option value="8. Sınıf">8. Sınıf</option>
                    <option value="Lise">Lise</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Sınıfı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ASSIGNMENT */}
      {createAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-4 font-display">
              Öğrencilere Ödev Ver
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ödev Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: 2. Ünite Testi ve Soru Çözümleri"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Hedef Sınıf</label>
                <select
                  value={asgClassId}
                  onChange={(e) => setAsgClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Son Teslim Tarihi</label>
                <input
                  type="date"
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ödev Yönergesi</label>
                <textarea
                  rows={3}
                  placeholder="Öğrencilerinizin yapması gerekenleri detaylıca belirtin..."
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateAssignmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Ödevi Ata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLASS STUDENTS ROSTER */}
      {selectedClassDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-black uppercase text-blue-700 block">
                  Sınıf Öğrenci Listesi
                </span>
                <h3 className="text-xl font-black text-slate-900 font-display">
                  {selectedClassDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClassDetail(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 block">Akıllı Tahtada Paylaşılacak Kod:</span>
                <strong className="text-lg font-black text-slate-900 font-mono tracking-wider">{selectedClassDetail.code}</strong>
              </div>
              <button
                onClick={() => handleCopyCode(selectedClassDetail.code)}
                className="px-3 py-1.5 rounded-lg bg-white text-blue-700 border border-blue-200 text-xs font-bold shadow-xs cursor-pointer"
              >
                {copiedCode === selectedClassDetail.code ? 'Kopyalandı!' : 'Kopyala'}
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-600 uppercase block mb-1">
                Kayıtlı Öğrenciler ({selectedClassDetail.students?.length || 0})
              </span>
              {selectedClassDetail.students && selectedClassDetail.students.length > 0 ? (
                selectedClassDetail.students.map((std, idx) => (
                  <div
                    key={std.id || idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {std.firstName.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-xs font-extrabold text-slate-900 block">
                          {std.firstName} {std.lastName}
                        </strong>
                        <span className="text-[11px] text-slate-500">{std.email}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Aktif
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">Henüz katılan öğrenci yok.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
