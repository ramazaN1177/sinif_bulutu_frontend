import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  Plane,
  Heart,
  CheckCircle2,
  XCircle,
  Flame,
  Pencil,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';

interface AirplaneGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

interface FlyingCloud {
  id: string;
  text: string;
  isCorrect: boolean;
  topPercent: number; // 20%, 50%, 80%
  isHit: boolean;
  isWrong: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const AirplaneGame: React.FC<AirplaneGameProps> = ({
  title: _title = 'Uçakla Doğru Bulut',
  items,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  const hud = useGameHudOptional();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Plane Coordinates & Rotation
  const [planePos, setPlanePos] = useState<{ x: number; y: number; angle: number }>({
    x: 10,
    y: 50,
    angle: 0,
  });

  // Flight Path Drawing States
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPath, setDrawPath] = useState<Point[]>([]);
  const [isFlying, setIsFlying] = useState(false);
  const [clouds, setClouds] = useState<FlyingCloud[]>([]);

  const currentItem = items[currentIdx] || items[0];
  const audioCtxRef = useRef<AudioContext | null>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const playSound = (type: 'fly' | 'correct' | 'wrong' | 'win') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'fly') {
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'correct') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        [440, 554, 659, 880].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.2, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.3);
        });
      }
    } catch {
      // Audio fallback
    }
  };

  // Generate options for question
  const spawnClouds = useCallback(() => {
    const correct = currentItem.answer;
    let wrongs: string[] = [];

    if (currentItem.options && currentItem.options.length > 1) {
      wrongs = currentItem.options.filter((o) => o !== correct);
    } else {
      wrongs = items
        .filter((it) => it.id !== currentItem.id)
        .map((it) => it.answer)
        .slice(0, 3);
      if (wrongs.length === 0) {
        wrongs = ['Yanlış A', 'Yanlış B'];
      }
    }

    const picked = [correct, ...wrongs.sort(() => Math.random() - 0.5).slice(0, 2)].sort(
      () => Math.random() - 0.5
    );

    const positions = [18, 50, 82];
    const newClouds: FlyingCloud[] = picked.map((text, idx) => ({
      id: `${Date.now()}_${idx}`,
      text,
      isCorrect: text === correct,
      topPercent: positions[idx % positions.length],
      isHit: false,
      isWrong: false,
    }));

    setClouds(newClouds);
    setPlanePos({ x: 10, y: 50, angle: 0 });
    setDrawPath([]);
    setIsFlying(false);
    setIsDrawing(false);
  }, [currentItem, items]);

  // Timer
  useEffect(() => {
    if (!isPlaying || isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isFinished]);

  useEffect(() => {
    if (!isPlaying || isFinished) return;
    spawnClouds();
  }, [currentIdx, isPlaying, isFinished, spawnClouds]);

  // Cleanup animation & audio on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      try {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close().catch(() => {});
        }
      } catch {}
    };
  }, []);

  // Listen for backgrounding / tab hidden
  useEffect(() => {
    const handlePause = () => {
      setIsPlaying(false);
      try {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend().catch(() => {});
        }
      } catch {}
    };
    const handleVisibility = () => {
      if (document.hidden) handlePause();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('app_pause_audio', handlePause);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('app_pause_audio', handlePause);
    };
  }, []);

  // Sync with GameHud
  useEffect(() => {
    hud?.setScore(score);
    hud?.setStreak(streak);
    hud?.setTimeLeft(timeLeft);
    hud?.setTotalTime(60);
    hud?.setTotalQuestions(items.length);
    hud?.setQuestionIndex(currentIdx);
    hud?.setQuestionText(currentItem?.question || '');
  }, [hud, score, streak, timeLeft, items.length, currentIdx, currentItem]);

  // Pause sync with GameHud
  useEffect(() => {
    if (hud?.isPaused) {
      setIsPlaying(false);
    } else if (!isFinished) {
      setIsPlaying(true);
    }
  }, [hud?.isPaused, isFinished]);

  const finishGame = () => {
    setIsPlaying(false);
    setIsFinished(true);
    playSound('win');
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    const stars = lives >= 3 ? 3 : lives >= 2 ? 2 : 1;
    hud?.finishGame(stars, Math.min(currentIdx + 1, items.length));
    if (onFinish) onFinish(score);
    if ((window as any)?.ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'GAME_COMPLETED', score, streak })
      );
    }
  };

  // Convert client coordinates to sky area percentage (0 - 100)
  const getSkyCoords = (clientX: number, clientY: number): Point | null => {
    if (!skyRef.current) return null;
    const rect = skyRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(2, Math.min(98, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  // Handle Start of Drawing Flight Route
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isFlying || isFinished) return;
    const pt = getSkyCoords(e.clientX, e.clientY);
    if (!pt) return;

    // Start drawing either from plane's current position or pointer
    setIsDrawing(true);
    setDrawPath([{ x: planePos.x, y: planePos.y }, pt]);
    playSound('fly');
  };

  // Handle Dragging / Drawing Route
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || isFlying || isFinished) return;
    const pt = getSkyCoords(e.clientX, e.clientY);
    if (!pt) return;

    setDrawPath((prev) => {
      if (prev.length === 0) return [pt];
      const last = prev[prev.length - 1];
      const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
      if (dist >= 1.2) {
        return [...prev, pt];
      }
      return prev;
    });
  };

  // Fly along path points
  const flyAlongPath = (fullPath: Point[], targetCloud: FlyingCloud) => {
    if (fullPath.length < 2) return;
    setIsFlying(true);
    setIsDrawing(false);

    const startTime = performance.now();
    const flightDuration = 1100; // ms

    const animateFlight = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / flightDuration);

      // Find position along path
      const totalPoints = fullPath.length;
      const indexFloat = progress * (totalPoints - 1);
      const baseIndex = Math.min(totalPoints - 2, Math.floor(indexFloat));
      const t = indexFloat - baseIndex;

      const p0 = fullPath[baseIndex];
      const p1 = fullPath[baseIndex + 1] || p0;

      const curX = p0.x + (p1.x - p0.x) * t;
      const curY = p0.y + (p1.y - p0.y) * t;

      // Angle calculation
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = Math.max(-45, Math.min(45, angle));

      setPlanePos({ x: curX, y: curY, angle });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateFlight);
      } else {
        // Arrived at target cloud!
        evaluateTargetCloud(targetCloud);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateFlight);
  };

  // Handle Finish of Route Drawing
  const handlePointerUp = () => {
    if (!isDrawing || isFlying || isFinished) return;
    setIsDrawing(false);

    if (drawPath.length < 2) {
      setDrawPath([]);
      return;
    }

    const lastPt = drawPath[drawPath.length - 1];

    // Check which cloud the drawn line landed near
    let nearestCloud: FlyingCloud | null = null;
    let minDist = 35; // threshold in %

    for (const cloud of clouds) {
      // Cloud is roughly at x=78%, y=cloud.topPercent
      const cloudCenter = { x: 78, y: cloud.topPercent };
      const dist = Math.hypot(lastPt.x - cloudCenter.x, lastPt.y - cloudCenter.y);
      if (dist < minDist) {
        minDist = dist;
        nearestCloud = cloud;
      }
    }

    if (nearestCloud) {
      // Snap path end smoothly into cloud center and fly!
      const snappedPath = [...drawPath, { x: 76, y: nearestCloud.topPercent }];
      setDrawPath(snappedPath);
      flyAlongPath(snappedPath, nearestCloud);
    } else {
      // Line didn't reach any cloud, clear path so user can redraw
      setDrawPath([]);
    }
  };

  // Directly Clicking a Cloud (generates a smooth curve flight path)
  const handleCloudDirectClick = (cloud: FlyingCloud) => {
    if (isFlying || cloud.isHit || isFinished) return;

    // Create a smooth arc from plane to cloud
    const start = { x: planePos.x, y: planePos.y };
    const end = { x: 76, y: cloud.topPercent };
    const mid = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2 + (start.y > end.y ? -6 : 6),
    };

    // Subdivide into points
    const curvePoints: Point[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * mid.x + t * t * end.x;
      const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * mid.y + t * t * end.y;
      curvePoints.push({ x, y });
    }

    setDrawPath(curvePoints);
    flyAlongPath(curvePoints, cloud);
  };

  // Evaluate Answer on Reaching Cloud
  const evaluateTargetCloud = (cloud: FlyingCloud) => {
    if (cloud.isCorrect) {
      playSound('correct');
      const bonus = 100 + streak * 20;
      setScore((prev) => prev + bonus);
      setStreak((prev) => prev + 1);

      setClouds((prev) =>
        prev.map((c) => (c.id === cloud.id ? { ...c, isHit: true } : c))
      );

      setTimeout(() => {
        if (currentIdx + 1 < items.length) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          finishGame();
        }
      }, 750);
    } else {
      playSound('wrong');
      setStreak(0);
      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          finishGame();
          return 0;
        }
        return next;
      });

      setClouds((prev) =>
        prev.map((c) => (c.id === cloud.id ? { ...c, isWrong: true } : c))
      );

      // Return plane to left so player can try again
      setTimeout(() => {
        setPlanePos({ x: 10, y: 50, angle: 0 });
        setDrawPath([]);
        setIsFlying(false);
      }, 800);
    }
  };

  const resetGame = () => {
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setLives(3);
    setTimeLeft(60);
    setIsPlaying(true);
    setIsFinished(false);
    setPlanePos({ x: 10, y: 50, angle: 0 });
    setDrawPath([]);
    setIsFlying(false);
    setIsDrawing(false);
  };

  // Convert point array to SVG path string
  const svgPathD =
    drawPath.length > 1
      ? `M ${drawPath[0].x} ${drawPath[0].y} ` +
        drawPath
          .slice(1)
          .map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
          .join(' ')
      : '';

  return (
    <div className="relative w-full h-full flex flex-col items-center select-none p-1 sm:p-2 overflow-hidden">
      {/* Top HUD only when NOT inside GameShell */}
      {!hud?.isInsideShell && (
        <div className="w-full mb-2 p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-extrabold text-slate-500">
                Skor: <strong className="text-slate-900 text-base">{score}</strong>
              </span>
            </div>
            {streak > 1 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 text-xs font-black">
                <Flame size={14} className="fill-orange-500 text-orange-500" />
                <span>{streak}x</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="font-mono text-base font-extrabold text-slate-800">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              title="Ses"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={resetGame}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              title="Yeniden Başlat"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Flight Mission Question Bar with Drawing Instruction */}
      <div className="w-full max-w-4xl mb-2 px-4 py-2 sm:py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-sky-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left z-20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-black shadow-xs">
            <Pencil size={12} className="text-sky-600 stroke-[2.5]" />
            <span>Rotayı çiz!</span>
          </div>
          <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                size={14}
                className={`transition-colors ${
                  heart <= lives ? 'text-rose-500 fill-rose-500' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
        <h3 className="text-base sm:text-lg font-black text-slate-800 font-display flex-1 text-center">
          {currentItem.question}
        </h3>
      </div>

      {/* Flight Sky Arena (Interactive Drawing Canvas) */}
      <div
        ref={skyRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative flex-1 w-full min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-sky-200/80 shadow-lg p-2 select-none touch-none cursor-crosshair bg-sky-300/10 backdrop-blur-xs"
      >
        {/* Soft Ambient Sky Vignette */}
        <div className="absolute inset-0 bg-sky-900/10 pointer-events-none" />

        {/* SVG Flight Trail & Drawn Route Layer */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        >
          {svgPathD && (
            <>
              {/* Outer Cyan/Sky Glow Trail */}
              <path
                d={svgPathD}
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeDasharray="2.5 1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.9"
              />
              {/* Core White Vapor Trail */}
              <path
                d={svgPathD}
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </>
          )}

          {/* Active Drawing Pointer Indicator Dot */}
          {isDrawing && drawPath.length > 0 && (
            <circle
              cx={drawPath[drawPath.length - 1].x}
              cy={drawPath[drawPath.length - 1].y}
              r="1.4"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
          )}
        </svg>

        {/* Airplane Sprite (Animated along (X, Y) with Tilt Angle) */}
        <div
          className="absolute pointer-events-none z-30 transition-transform duration-75"
          style={{
            left: `${planePos.x}%`,
            top: `${planePos.y}%`,
            transform: `translate(-50%, -50%) rotate(${planePos.angle}deg)`,
          }}
        >
          <div
            className="w-28 sm:w-40 h-14 sm:h-20 bg-contain bg-no-repeat bg-center drop-shadow-xl"
            style={{
              backgroundImage: 'url(/games/airplane/plane.png)',
            }}
          />
        </div>

        {/* 3 Answer Clouds Floating on Right Side */}
        <div className="absolute right-4 sm:right-8 top-0 bottom-0 w-64 sm:w-84 flex flex-col justify-around py-3 z-30 pointer-events-auto">
          {clouds.map((cloud) => (
            <div
              key={cloud.id}
              onClick={() => handleCloudDirectClick(cloud)}
              className={`relative flex items-center justify-center cursor-pointer group transition-all duration-300 transform select-none w-full h-20 sm:h-26 ${
                cloud.isHit
                  ? 'scale-110 drop-shadow-[0_0_24px_rgba(34,197,94,0.7)]'
                  : cloud.isWrong
                  ? 'shake-anim opacity-60 drop-shadow-[0_0_18px_rgba(239,68,68,0.6)]'
                  : 'hover:scale-105 active:scale-95'
              }`}
            >
              {/* Cloud Asset Sprite Background */}
              <div
                className={`absolute inset-0 bg-contain bg-no-repeat bg-center transition-all duration-300 drop-shadow-md ${
                  cloud.isHit ? 'filter brightness-105' : ''
                }`}
                style={{
                  backgroundImage: 'url(/games/airplane/cloud.png)',
                }}
              />

              {/* Answer Text DIRECTLY on Cloud */}
              <div className="relative z-10 flex items-center justify-center gap-2 px-6 text-center max-w-[85%]">
                <span
                  className={`font-black tracking-tight text-sm sm:text-lg transition-all duration-200 select-none ${
                    cloud.isHit
                      ? 'text-emerald-800 scale-110'
                      : cloud.isWrong
                      ? 'text-rose-700 line-through'
                      : 'text-slate-800 group-hover:text-blue-800'
                  }`}
                  style={{
                    textShadow: '0 1px 2px rgba(255,255,255,0.95), 0 0 12px rgba(255,255,255,0.9)',
                  }}
                >
                  {cloud.text}
                </span>
                {cloud.isHit && (
                  <CheckCircle2 size={20} className="text-emerald-600 stroke-[3] drop-shadow-sm flex-shrink-0 animate-scale-in" />
                )}
                {cloud.isWrong && (
                  <XCircle size={20} className="text-rose-600 stroke-[3] drop-shadow-sm flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Over / Win Overlay */}
      {isFinished && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in shadow-2xl border-2 border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-sky-500 text-white flex items-center justify-center mb-4 shadow-xl shadow-sky-500/30">
            <Plane size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
            {lives > 0 ? 'Harika Uçuş, Görev Tamamlandı!' : 'Uçuş Sona Erdi!'}
          </h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md">
            Doğru bulutları bularak <strong className="text-sky-600 font-extrabold">{score} puan</strong> kazandınız!
          </p>

          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg flex items-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            <span>Tekrar Uç</span>
          </button>
        </div>
      )}
    </div>
  );
};
