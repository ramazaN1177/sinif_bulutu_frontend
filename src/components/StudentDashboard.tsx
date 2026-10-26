import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Send,
  Upload,
  Check,
  School,
  MessageSquare,
} from 'lucide-react';
import type { Activity } from '../types/game';
import { dashboardService, type ClassRoom, type Assignment } from '../services/dashboardService';

interface StudentDashboardProps {
  onPlayActivity: (activity: Activity) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onPlayActivity }) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'classes' | 'activities'>('assignments');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Join Class Modal
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Submit Homework Modal
  const [selectedAsgForSubmit, setSelectedAsgForSubmit] = useState<Assignment | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      await dashboardService.joinClass(joinCode.trim());
      setJoinCode('');
      setJoinModalOpen(false);
      setJoinError(null);
      loadData();
    } catch {
      setJoinError('Sınıf kodu bulunamadı. Lütfen kontrol ediniz.');
    }
  };

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgForSubmit) return;

    await dashboardService.submitAssignment({
      assignmentId: selectedAsgForSubmit.id,
      content: submitContent || 'Ödev çalışmam ektedir.',
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setSelectedAsgForSubmit(null);
      setSubmitContent('');
      loadData();
    }, 1000);
  };

  const pendingAssignments = assignments.filter((a) => !a.isSubmitted);
  const completedAssignments = assignments.filter((a) => a.isSubmitted);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-16 select-none">
      {/* 1. TOP STUDENT HEADER & STATS BANNER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black mb-2">
                <GraduationCap size={14} />
                <span>Öğrenci Portalı</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                Merhaba, İyi Dersler!
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Ödevlerinizi teslim edin, öğretmeninizin notlarını ve yorumlarını görün, sınıf oyunlarını oynayın.
              </p>
            </div>

            {/* Quick Actions */}
            <div>
              <button
                onClick={() => setJoinModalOpen(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-md shadow-emerald-500/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Plus size={16} />
                <span>Sınıf Kodu ile Katıl</span>
              </button>
            </div>
          </div>

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Kayıtlı Sınıflar</span>
                <strong className="text-2xl font-black text-slate-900 font-display">{classes.length}</strong>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <School size={20} />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Bekleyen Ödev</span>
                <strong className="text-2xl font-black text-rose-600 font-display">{pendingAssignments.length}</strong>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Teslim Edilen</span>
                <strong className="text-2xl font-black text-emerald-600 font-display">{completedAssignments.length}</strong>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Ders Oyunları</span>
                <strong className="text-2xl font-black text-purple-700 font-display">{activities.length}</strong>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={16} />
            <span>Ödevlerim ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'classes'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <School size={16} />
            <span>Sınıflarım ({classes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'activities'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={16} />
            <span>Oyunlarım & Etkinlikler ({activities.length})</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: ASSIGNMENTS (PENDING & COMPLETED) */}
        {activeTab === 'assignments' && (
          <div className="space-y-8">
            {/* Active / Pending Homeworks */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-lg font-black text-slate-900 font-display">
                  Teslim Edilmeyi Bekleyen Ödevler ({pendingAssignments.length})
                </h2>
              </div>

              {pendingAssignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingAssignments.map((asg) => (
                    <div
                      key={asg.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {asg.className}
                          </span>
                          <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                            <Clock size={13} />
                            <span>Son Teslim: {asg.dueDate}</span>
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 mb-1.5">{asg.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-4">{asg.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">{asg.maxScore} Puanlık Görev</span>
                        <button
                          onClick={() => setSelectedAsgForSubmit(asg)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send size={14} />
                          <span>Ödevi Teslim Et</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-base font-extrabold text-slate-800">Harika! Bekleyen ödeviniz yok.</h3>
                  <p className="text-xs text-slate-500">Tüm ödevlerinizi zamanında tamamladınız.</p>
                </div>
              )}
            </div>

            {/* Completed & Graded Homeworks */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900 font-display">
                  Teslim Edilenler & Öğretmen Notları ({completedAssignments.length})
                </h2>
              </div>

              <div className="space-y-4">
                {completedAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {asg.className}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <Check size={14} />
                          <span>Teslim Edildi: {asg.mySubmissionDate}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 mb-1">{asg.title}</h3>

                      {/* Teacher's Feedback Quote */}
                      {asg.myFeedback && (
                        <div className="mt-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex items-start gap-2.5">
                          <MessageSquare size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                              Öğretmeninizin Değerlendirmesi
                            </span>
                            <p className="text-xs text-slate-700 italic">"{asg.myFeedback}"</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Grade score pill */}
                    <div className="flex items-center gap-3 shrink-0 md:border-l md:border-slate-100 md:pl-6">
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center min-w-[90px]">
                        <span className="text-[10px] font-bold text-amber-700 block">Notunuz</span>
                        <strong className="text-2xl font-black text-slate-900 font-display">
                          {asg.myScore !== null ? `${asg.myScore}` : 'İnceleniyor'}
                        </strong>
                        <span className="text-[10px] text-slate-500">/ {asg.maxScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLASSES */}
        {activeTab === 'classes' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">Dahil Olduğunuz Sınıflar</h2>
                <p className="text-xs text-slate-500">
                  Öğretmenlerinizin açtığı sınıflar ve ders alanları.
                </p>
              </div>
              <button
                onClick={() => setJoinModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                <span>Kodu Gir</span>
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center max-w-2xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <School size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  Henüz Bir Sınıfa Kayıtlı Değilsiniz
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  Öğretmeninizin sizinle paylaştığı 6 haneli sınıf katılım kodunu girerek hemen sınıfınıza katılabilirsiniz.
                </p>
                <button
                  onClick={() => setJoinModalOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-md shadow-emerald-500/25 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Sınıf Kodu ile Katıl</span>
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
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {cls.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{cls.gradeLevel}</span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 font-display mb-1.5">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                        {cls.description || 'Ders etkinlikleri ve ödev bildirimleri alanı.'}
                      </p>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-4 flex items-center justify-between">
                        <span className="font-bold">Öğretmen:</span>
                        <span className="font-extrabold text-slate-900">{cls.teacherName || 'Ders Öğretmeni'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('assignments')}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BookOpen size={14} />
                      <span>Sınıf Ödevlerini Gör</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACTIVITIES & GAMES */}
        {activeTab === 'activities' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">
                  Etkileşimli Oyunlar & Etkinlikler ({activities.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Öğretmeninizin atadığı oyunları hemen oynayın, konuları eğlenerek tekrar edin.
                </p>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center max-w-2xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  Henüz Atanmış Bir Oyun veya Etkinlik Yok
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Öğretmeniniz sınıfınız için etkileşimli bir oyun yayınladığında burada listelenecektir.
                </p>
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
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                          {act.templateType}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{act.subject}</span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 font-display mb-1.5">
                        {act.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">{act.description}</p>
                    </div>

                    <button
                      onClick={() => onPlayActivity(act)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play size={14} className="fill-current" />
                      <span>Hemen Oyna</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: JOIN CLASS VIA CODE */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-2 font-display">
              Sınıf Kodu ile Katıl
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Öğretmeninizin tahtada veya mesajda paylaştığı 6 haneli sınıf katılım kodunu giriniz.
            </p>

            {joinError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoinClass} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Örn: MAT501"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-center text-xl font-mono font-black tracking-widest focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                  maxLength={8}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  Sınıfa Katıl
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT HOMEWORK */}
      {selectedAsgForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {selectedAsgForSubmit.className}
              </span>
              <button
                onClick={() => setSelectedAsgForSubmit(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <h3 className="text-lg font-black text-slate-900 font-display mb-1">
              {selectedAsgForSubmit.title}
            </h3>
            <p className="text-xs text-slate-600 mb-4">{selectedAsgForSubmit.description}</p>

            {submitSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 text-center text-emerald-800 font-bold">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-2" />
                <p>Ödeviniz başarıyla öğretmeninize iletildi!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitHomework} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ödev Çözümünüz / Yanıtınız
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Cevabınızı buraya yazınız veya açıklama ekleyiniz..."
                    value={submitContent}
                    onChange={(e) => setSubmitContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                    required
                  />
                </div>

                <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 text-center text-xs text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col items-center justify-center gap-1">
                  <Upload size={18} className="text-emerald-600" />
                  <span className="font-bold text-slate-700">Defter Fotoğrafı / Dosya Ekle (İsteğe Bağlı)</span>
                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG kabul edilir</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAsgForSubmit(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 cursor-pointer"
                  >
                    Ödevi Teslim Et
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
