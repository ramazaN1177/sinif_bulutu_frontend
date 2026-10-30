import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Flag, Trophy, CheckCircle2, XCircle, RotateCcw, Play, Zap } from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';

interface RaceGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

// Track Geometry Percentages on bg-landscape.webp
const START_X = 2.5;       // Starting grid (far left)
const FINISH_LINE_X = 76; // The checkered line location
const FINISH_CROSS_X = 85; // Visibly crossed past the checkered banner!

export const RaceGame: React.FC<RaceGameProps> = ({
  title: _title = 'Hızlı Yarış',
  items,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  const hud = useGameHudOptional();

  // Phases: question -> racing (question hidden, car drives!) -> finished
  const [phase, setPhase] = useState<'question' | 'racing' | 'finished'>('question');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Exact Steps Count: How many correct/wrong answers each racer has made
  const totalStepsNeeded = Math.max(1, items.length);
  const [greenSteps, setGreenSteps] = useState(0);
  const [blueSteps, setBlueSteps] = useState(0);

  // Question interaction state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [isAccelerating, setIsAccelerating] = useState<'green' | 'blue' | null>(null);
  const [floatingBadge, setFloatingBadge] = useState<{
    text: string;
    color: string;
    lane: 'green' | 'blue';
  } | null>(null);
  const [winner, setWinner] = useState<'green' | 'blue' | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSfx = (type: 'correct' | 'wrong' | 'vroom' | 'win' | 'click') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'vroom') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(340, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'win') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.24);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.36);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.55);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      } else if (type === 'click') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {}
  };

  const currentItem = items[currentIdx] || items[0] || { id: '0', question: 'Soru', answer: '' };

  const options = useMemo(() => {
    if (currentItem?.options && currentItem.options.length > 0) {
      return currentItem.options;
    }
    const correct = currentItem?.answer || '';
    const otherAnswers = items.filter((i) => i.answer !== correct).map((i) => i.answer);
    const shuffledOthers = [...new Set(otherAnswers)].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
  }, [currentIdx, currentItem, items]);

  // Compute exact X coordinate on track based on steps completed
  const getCarX = (steps: number, isWinner: boolean) => {
    if (isWinner || steps >= totalStepsNeeded) {
      return FINISH_CROSS_X; // Crosses cleanly through the finish line!
    }
    if (steps <= 0) {
      return START_X;
    }
    const ratio = steps / totalStepsNeeded;
    // Approach just before the finish line banner until the final winning step
    return START_X + ratio * (FINISH_LINE_X - START_X - 4);
  };

  const greenX = getCarX(greenSteps, winner === 'green');
  const blueX = getCarX(blueSteps, winner === 'blue');

  // Sync with GameHud
  useEffect(() => {
    hud?.setScore(score);
    hud?.setStreak(streak);
    hud?.setTotalQuestions(totalStepsNeeded);
    hud?.setQuestionIndex(greenSteps);
    hud?.setQuestionText(
      phase === 'question'
        ? `Bitişe ${totalStepsNeeded - greenSteps} doğru cevap kaldı!`
        : phase === 'racing'
        ? 'Gaza basıldı! 🏎️💨'
        : 'Hızlı Yarış Başlıyor!'
    );
  }, [hud, score, streak, greenSteps, totalStepsNeeded, phase]);

  const handleStartGame = () => {
    playSfx('click');
    setPhase('question');
  };

  const handleSelectAnswer = (option: string) => {
    if (selectedAnswer !== null || winner !== null || phase !== 'question') return;

    setSelectedAnswer(option);

    const expected = currentItem.answer ?? (currentItem as any).correctAnswer ?? '';
    let isCorrect = String(option).trim().toLowerCase() === String(expected).trim().toLowerCase();

    if (!isCorrect && currentItem.options && !isNaN(Number(expected))) {
      const idx = Number(expected);
      if (idx >= 0 && idx < currentItem.options.length) {
        isCorrect = String(option).trim().toLowerCase() === String(currentItem.options[idx]).trim().toLowerCase();
      }
    }

    setAnswerStatus(isCorrect ? 'correct' : 'wrong');
    playSfx(isCorrect ? 'correct' : 'wrong');

    // 1. Brief 350ms flash of answer, THEN HIDE QUESTION CARD & START MOVEMENT!
    setTimeout(() => {
      // Hide question card completely so race track is unobstructed
      setPhase('racing');
      playSfx('vroom');

      let nextGreen = greenSteps;
      let nextBlue = blueSteps;

      if (isCorrect) {
        setIsAccelerating('green');
        const points = 100 + streak * 25;
        nextGreen = greenSteps + 1;
        setGreenSteps(nextGreen);
        setScore((s) => s + points);
        setStreak((st) => st + 1);

        const isWinningStep = nextGreen >= totalStepsNeeded;
        setFloatingBadge({
          text: isWinningStep
            ? 'BİTİŞ ÇİZGİSİ! 🏁'
            : streak > 0
            ? `+${points} SERİ!`
            : `+${points}`,
          color: '#10B981',
          lane: 'green',
        });
      } else {
        setIsAccelerating('blue');
        nextBlue = blueSteps + 1;
        setBlueSteps(nextBlue);
        setStreak(0);
        setFloatingBadge({
          text: 'RAKİP HIZLANDI!',
          color: '#EF4444',
          lane: 'blue',
        });
      }

      // 2. Allow 1300ms for car to accelerate, roar, and zoom along the road
      setTimeout(() => {
        setIsAccelerating(null);
        setFloatingBadge(null);

        // A. PLAYER REACHED THE FINISH LINE AND CROSSED IT!
        if (nextGreen >= totalStepsNeeded) {
          setWinner('green');
          setPhase('finished');
          playSfx('win');
          confetti({ particleCount: 160, spread: 90, origin: { x: 0.85, y: 0.55 } });
          hud?.finishGame(3, totalStepsNeeded);
          onFinish?.(score + 100);
          return;
        }

        // B. RIVAL REACHED THE FINISH LINE AND CROSSED IT!
        if (nextBlue >= totalStepsNeeded) {
          setWinner('blue');
          setPhase('finished');
          hud?.finishGame(1, totalStepsNeeded);
          onFinish?.(score);
          return;
        }

        // C. RACE CONTINUES: BRING IN NEXT QUESTION
        setSelectedAnswer(null);
        setAnswerStatus(null);
        // Cycle smoothly through questions so player can keep earning steps until finish
        setCurrentIdx((idx) => (idx + 1) % items.length);
        setPhase('question');
      }, 1300);
    }, 350);
  };

  const handleRestart = () => {
    playSfx('click');
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setGreenSteps(0);
    setBlueSteps(0);
    setSelectedAnswer(null);
    setAnswerStatus(null);
    setIsAccelerating(null);
    setFloatingBadge(null);
    setWinner(null);
    setPhase('question');
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-0.5 sm:p-2 select-none overflow-hidden">
      {/* 
        16:9 LANDSCAPE GAME STAGE
        If viewport is portrait, centers in the middle; on landscape mobile, scales to fit viewport height
      */}
      <div
        className="relative mx-auto rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-white/95 shadow-2xl overflow-hidden flex flex-col justify-between"
        style={{
          aspectRatio: '16 / 9',
          width: '100%',
          maxWidth: 'min(960px, calc((100dvh - 75px) * (16 / 9)))',
          maxHeight: '100%',
          backgroundImage: 'url(/games/race/bg-landscape.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* =========================================================================
            1. TOP HUD (Puan, Bitişe Kalan Adım & Yarış İlerlemesi)
            ========================================================================= */}
        <div className="relative w-full z-30 px-3 sm:px-5 pt-2.5 sm:pt-3 flex items-start justify-between pointer-events-none">
          {/* Left: Step Progress towards Finish Line */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs border-2 border-white shadow-md flex items-center gap-2">
              <Flag size={14} className="text-emerald-600 fill-emerald-600" />
              <span className="text-[11px] sm:text-xs font-black text-slate-800 tracking-wide">
                Bitişe: <span className="text-emerald-600">{greenSteps}</span> / {totalStepsNeeded}
              </span>
            </div>
            {streak > 1 && (
              <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white border border-white shadow-md flex items-center gap-1 animate-pulse">
                <Zap size={12} className="fill-white" />
                <span className="text-[10px] font-black">{streak}X SERİ!</span>
              </div>
            )}
          </div>

          {/* Right: Glossy PUAN Capsule */}
          <div className="px-4 py-1 rounded-full bg-white/95 backdrop-blur-xs border-2 border-white shadow-md flex items-center gap-2.5">
            <span className="text-[11px] sm:text-xs font-black text-[#5C381E] uppercase tracking-wide">PUAN</span>
            <span className="text-sm sm:text-base font-black text-emerald-600 font-display">{score}</span>
          </div>
        </div>

        {/* =========================================================================
            2. QUESTION CARD (ONLY VISIBLE IN 'question' PHASE - HIDES WHILE DRIVING!)
            ========================================================================= */}
        {phase === 'question' && (
          <div className="relative w-full z-20 px-3 sm:px-6 flex flex-col items-center -mt-1 sm:-mt-2 pointer-events-auto animate-fade-in">
            <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl border-2 border-white/90 shadow-xl p-2.5 sm:p-3.5 flex flex-col gap-2">
              {/* Question Goal Badge */}
              <div className="self-center px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                {greenSteps + 1}. ADIM İÇİN DOĞRU CEVAP VER
              </div>

              {/* Question Text */}
              <h3 className="text-xs sm:text-sm md:text-base font-black text-slate-800 text-center font-display leading-tight line-clamp-2">
                {currentItem.question}
              </h3>

              {/* 4 Choices Grid (2x2) */}
              <div className="w-full grid grid-cols-2 gap-1.5 sm:gap-2">
                {options.map((opt, idx) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect =
                    answerStatus === 'correct' && isSelected;
                  const isWrong =
                    answerStatus === 'wrong' && isSelected;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={selectedAnswer !== null}
                      onClick={() => handleSelectAnswer(opt)}
                      className={`py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs text-left transition-all duration-150 flex items-center justify-between border-2 shadow-xs cursor-pointer ${
                        isCorrect
                          ? 'bg-emerald-500 border-emerald-600 text-white scale-[1.02] shadow-emerald-500/30'
                          : isWrong
                          ? 'bg-red-500 border-red-600 text-white scale-95 shadow-red-500/30'
                          : selectedAnswer !== null
                          ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                          : 'bg-slate-50/90 hover:bg-emerald-50 border-slate-200 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                        <span
                          className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isCorrect || isWrong
                              ? 'bg-white/20 text-white'
                              : 'bg-white border border-slate-200 text-slate-500'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>
                      {isCorrect && <CheckCircle2 size={14} className="text-white shrink-0" />}
                      {isWrong && <XCircle size={14} className="text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. CARS ON THE ROAD (Positions dynamically calculated to cross finish line)
            ========================================================================= */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* LANE 1 (TOP ROAD): Green Player Car */}
          <div
            className="absolute transition-all duration-1200 ease-out flex items-center"
            style={{
              top: '49%',
              left: `${greenX}%`,
              transform: 'translateY(-50%)',
            }}
          >
            {/* Player Floating Badge */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[9px] font-black tracking-wider uppercase shadow-xs whitespace-nowrap">
              Sen #1 ({greenSteps}/{totalStepsNeeded})
            </div>

            {/* Floating Score Badge on Acceleration */}
            {floatingBadge && floatingBadge.lane === 'green' && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-emerald-600 border-2 border-emerald-500 text-xs font-black shadow-lg animate-bounce whitespace-nowrap z-30">
                {floatingBadge.text}
              </div>
            )}

            {/* Exhaust Nitro Boost Flame when moving */}
            {isAccelerating === 'green' && (
              <div className="absolute -left-7 sm:-left-9 top-1/2 -translate-y-1/2 flex items-center">
                <div className="w-6 sm:w-8 h-2.5 sm:h-3.5 rounded-full bg-gradient-to-l from-amber-400 via-orange-500 to-transparent animate-pulse" />
                <span className="text-[11px] sm:text-xs font-black text-amber-400 -ml-1">💨</span>
              </div>
            )}

            {/* Green Car Vector Asset */}
            <img
              src="/games/race/green_car.svg"
              alt="Yeşil Yarış Arabası"
              className={`w-20 sm:w-28 md:w-32 h-auto drop-shadow-xl transition-transform duration-300 ${
                isAccelerating === 'green' ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>

          {/* LANE 2 (BOTTOM ROAD): Blue Rival Car */}
          <div
            className="absolute transition-all duration-1200 ease-out flex items-center"
            style={{
              top: '70%',
              left: `${blueX}%`,
              transform: 'translateY(-50%)',
            }}
          >
            {/* Rival Floating Badge */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-sky-600/90 text-white text-[9px] font-black tracking-wider uppercase shadow-xs whitespace-nowrap">
              Rakip #2 ({blueSteps}/{totalStepsNeeded})
            </div>

            {/* Floating Badge for Rival */}
            {floatingBadge && floatingBadge.lane === 'blue' && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-red-600 border-2 border-red-500 text-xs font-black shadow-lg animate-bounce whitespace-nowrap z-30">
                {floatingBadge.text}
              </div>
            )}

            {/* Exhaust Boost Flame when moving */}
            {isAccelerating === 'blue' && (
              <div className="absolute -left-7 sm:-left-9 top-1/2 -translate-y-1/2 flex items-center">
                <div className="w-6 sm:w-8 h-2.5 sm:h-3.5 rounded-full bg-gradient-to-l from-orange-400 via-red-500 to-transparent animate-pulse" />
                <span className="text-[11px] sm:text-xs font-black text-orange-400 -ml-1">💨</span>
              </div>
            )}

            {/* Blue Car Vector Asset */}
            <img
              src="/games/race/blue_car.svg"
              alt="Mavi Yarış Arabası"
              className={`w-20 sm:w-28 md:w-32 h-auto drop-shadow-xl transition-transform duration-300 ${
                isAccelerating === 'blue' ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>
        </div>

        {/* Dummy bottom spacing to maintain layout flow */}
        <div className="h-2 pointer-events-none" />



        {/* =========================================================================
            5. SCREEN: FINISHED / WINNER OVERLAY
            ========================================================================= */}
        {phase === 'finished' && winner && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in pointer-events-auto">
            <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-sm w-full text-center border-4 border-white shadow-2xl animate-scale-in flex flex-col items-center gap-3">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                  winner === 'green'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-sky-100 text-sky-600'
                }`}
              >
                {winner === 'green' ? (
                  <Trophy size={36} className="text-amber-500 fill-amber-500" />
                ) : (
                  <Flag size={36} className="text-sky-500 fill-sky-500" />
                )}
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900">
                  {winner === 'green' ? 'Tebrikler! 1. Oldun!' : 'Rakip Araba Kazandı!'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {winner === 'green'
                    ? `${totalStepsNeeded} soruyu başarıyla tamamlayıp bitiş çizgisini geçtin!`
                    : 'Biraz daha pratik yaparak sonraki yarışta birinci olabilirsin!'}
                </p>
              </div>

              <div className="w-full py-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-3">
                <span className="text-xs font-black text-amber-800 uppercase">Toplam Skor</span>
                <span className="text-xl font-black text-amber-600 font-display">{score} PUAN</span>
              </div>

              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black font-display text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <RotateCcw size={18} />
                <span>Yeniden Yarış</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
