import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Zap,
  Play,
  Volume2,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';

interface BalloonGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

interface BalloonOption {
  id: string;
  text: string;
  isCorrect: boolean;
  colorName: string;
  baseColor: string;
  highlightColor: string;
  shadowColor: string;
  rimColor: string;
  isPopped: boolean;
  isBursting: boolean; // 40ms puncture expansion flash
  xPercent: number;    // horizontal percentage
  yPercent: number;    // vertical percentage
  floatSpeed: number;
  floatOffset: number;
  swayDistance: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  width?: number;
  height?: number;
  rotation: number;
  vRot: number;
  alpha: number;
  decay: number;
  scale?: number;
  scaleGrowth?: number;
  shape: 'shred' | 'sparkle' | 'smoke' | 'shockwave';
}

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

// Curated realistic metallic & pearl latex palettes
const REALISTIC_BALLOON_PALETTES = [
  {
    name: 'ruby',
    base: '#E11D48',
    highlight: '#FDA4AF',
    shadow: '#881337',
    rim: '#FFF1F2',
  },
  {
    name: 'sapphire',
    base: '#0284C7',
    highlight: '#7DD3FC',
    shadow: '#0C4A6E',
    rim: '#F0F9FF',
  },
  {
    name: 'amber',
    base: '#D97706',
    highlight: '#FDE68A',
    shadow: '#78350F',
    rim: '#FFFBEB',
  },
  {
    name: 'emerald',
    base: '#059669',
    highlight: '#6EE7B7',
    shadow: '#064E3B',
    rim: '#ECFDF5',
  },
  {
    name: 'amethyst',
    base: '#7C3AED',
    highlight: '#DDD6FE',
    shadow: '#4C1D95',
    rim: '#F5F3FF',
  },
  {
    name: 'tangerine',
    base: '#EA580C',
    highlight: '#FDBA74',
    shadow: '#7C2D12',
    rim: '#FFF7ED',
  },
  {
    name: 'fuchsia',
    base: '#C026D3',
    highlight: '#F5D0FE',
    shadow: '#701A75',
    rim: '#FDF4FF',
  },
];

// Stylized Needle / Dart Cursor
const PIN_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28' fill='none'%3E%3Cpath d='M3 3L11 11M11 11L15 8L22 15L19 19L11 11Z' stroke='%231E293B' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='21' cy='7' r='5' fill='%23E11D48' stroke='%23FFFFFF' stroke-width='1.8'/%3E%3Cpath d='M3 3L7 7' stroke='%23E2E8F0' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 3 3, crosshair`;

export const BalloonGame: React.FC<BalloonGameProps> = ({
  title: _title = 'Balon Patlatma',
  items,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  const hud = useGameHudOptional();

  const [phase, setPhase] = useState<'playing' | 'finished'>('playing');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const [balloons, setBalloons] = useState<BalloonOption[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentItem = items[currentIdx] || items[0] || { id: '0', question: 'Soru', answer: '' };

  // Sync with GameHud
  useEffect(() => {
    hud?.setScore(score);
    hud?.setStreak(streak);
    hud?.setTotalQuestions(items.length);
    hud?.setQuestionIndex(currentIdx);
    hud?.setQuestionText(
      phase === 'playing'
        ? currentItem?.question || 'Doğru cevabın olduğu balona dokunarak patlat!'
        : 'Balon Patlatma Başlıyor!'
    );
  }, [hud, score, streak, items.length, currentIdx, currentItem, phase]);

  // Realistic Acoustic Synthesizer (Multi-layered real latex pop)
  const playSound = (type: 'pop' | 'wrong' | 'win' | 'click') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      if (type === 'pop') {
        // LAYER 1: White noise burst - Microsecond sudden shockwave snap
        const noiseLen = ctx.sampleRate * 0.045;
        const noiseBuffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseLen; i++) {
          const decay = Math.exp(-i / (noiseLen * 0.22));
          noiseData[i] = (Math.random() * 2 - 1) * decay;
        }
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1400, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.045);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseNode.start(now);

        // LAYER 2: Air Cavity Decompression Impulse (falling rapidly from 340Hz to 50Hz)
        const airOsc = ctx.createOscillator();
        const airGain = ctx.createGain();
        airOsc.type = 'sine';
        airOsc.frequency.setValueAtTime(340, now);
        airOsc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
        airGain.gain.setValueAtTime(0.55, now);
        airGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        airOsc.connect(airGain);
        airGain.connect(ctx.destination);
        airOsc.start(now);
        airOsc.stop(now + 0.09);

        // LAYER 3: Low Acoustic Body Thump (triangle resonance)
        const thudOsc = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(150, now);
        thudOsc.frequency.exponentialRampToValueAtTime(30, now + 0.13);
        thudGain.gain.setValueAtTime(0.45, now);
        thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
        thudOsc.connect(thudGain);
        thudGain.connect(ctx.destination);
        thudOsc.start(now);
        thudOsc.stop(now + 0.13);
      } else if (type === 'wrong') {
        // Sputtering deflating rubber squeak
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.25, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.35);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.35);
        });
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {}
  };

  // Spawn Balloons for Current Question
  const spawnBalloons = () => {
    const correct = currentItem.answer;
    let wrongs: string[] = [];

    if (currentItem.options && currentItem.options.length > 1) {
      wrongs = currentItem.options.filter((o) => o !== correct);
    } else {
      wrongs = items
        .filter((it) => it.id !== currentItem.id)
        .map((it) => it.answer)
        .slice(0, 3);
      if (wrongs.length === 0) wrongs = ['Yanlış 1', 'Yanlış 2'];
    }

    const shuffledChoices = [
      correct,
      ...wrongs.sort(() => Math.random() - 0.5).slice(0, 3),
    ].sort(() => Math.random() - 0.5);

    const count = shuffledChoices.length;
    // Spacing across the horizontal sky
    const xOffsets =
      count === 3 ? [22, 50, 78] : [14, 38, 62, 86];

    const shuffledPalettes = [...REALISTIC_BALLOON_PALETTES].sort(
      () => Math.random() - 0.5
    );

    const newBalloons: BalloonOption[] = shuffledChoices.map((text, idx) => {
      const palette = shuffledPalettes[idx % shuffledPalettes.length];
      return {
        id: `${Date.now()}_${idx}`,
        text,
        isCorrect: text === correct,
        colorName: palette.name,
        baseColor: palette.base,
        highlightColor: palette.highlight,
        shadowColor: palette.shadow,
        rimColor: palette.rim,
        isPopped: false,
        isBursting: false,
        xPercent: xOffsets[idx] || 50,
        yPercent: 48 + (idx % 2 === 0 ? -4 : 4), // Centered inside sky playfield below question
        floatSpeed: 2.2 + (idx % 3) * 0.4,
        floatOffset: idx * 1.4,
        swayDistance: 8 + (idx % 3) * 3,
      };
    });

    setBalloons(newBalloons);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    spawnBalloons();
  }, [currentIdx, phase]);

  // High-fidelity Particle Physics Loop (Rubber Shards, Talcum Mist, Shockwave)
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      setParticles((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((p) => {
            if (p.shape === 'shockwave') {
              return {
                ...p,
                scale: (p.scale || 0.2) + (p.scaleGrowth || 6) * dt,
                alpha: Math.max(0, p.alpha - p.decay * dt * 60),
              };
            }
            if (p.shape === 'smoke') {
              return {
                ...p,
                x: p.x + p.vx * dt * 60,
                y: p.y + p.vy * dt * 60,
                vx: p.vx * 0.94, // Air resistance drag
                vy: p.vy * 0.94,
                scale: (p.scale || 1) + 0.8 * dt,
                alpha: Math.max(0, p.alpha - p.decay * dt * 60),
              };
            }
            // Rubber Shards & Sparkles
            return {
              ...p,
              x: p.x + p.vx * dt * 60,
              y: p.y + p.vy * dt * 60,
              vy: p.vy + 0.42 * dt * 60, // Realistic gravity acceleration
              vx: p.vx * 0.985,          // Air drag
              rotation: p.rotation + p.vRot * dt * 60,
              alpha: Math.max(0, p.alpha - p.decay * dt * 60),
            };
          })
          .filter((p) => p.alpha > 0.04);
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Multi-Element Explosion Spawner (Shockwave + Talc Mist Cloud + Flying Rubber Shards + Sparkles)
  const spawnPopExplosion = (
    clientX: number,
    clientY: number,
    baseColor: string,
    highlightColor: string,
    shadowColor: string
  ) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const originX = clientX - rect.left;
    const originY = clientY - rect.top;

    const newParticles: Particle[] = [];

    // 1. Expanding Shockwave Ring
    newParticles.push({
      id: Date.now() + 1000,
      x: originX,
      y: originY,
      vx: 0,
      vy: 0,
      color: highlightColor,
      size: 110,
      rotation: 0,
      vRot: 0,
      alpha: 0.9,
      decay: 0.075,
      scale: 0.2,
      scaleGrowth: 7.5,
      shape: 'shockwave',
    });

    // 2. Talcum Powder / Air Mist Puff (8 soft circular clouds that billow & fade)
    for (let s = 0; s < 8; s++) {
      const angle = (Math.PI * 2 * s) / 8 + (Math.random() - 0.5) * 0.5;
      const speed = 1.2 + Math.random() * 2.2;
      newParticles.push({
        id: Date.now() + 2000 + s,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        color: '#FFFFFF',
        size: 26 + Math.random() * 22,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 3,
        alpha: 0.45,
        decay: 0.035,
        scale: 0.8,
        shape: 'smoke',
      });
    }

    // 3. 20 Realistic Torn Latex Rubber Shards (Curved strips, varying aspect ratios)
    const latexColors = [baseColor, highlightColor, shadowColor, '#FFFFFF'];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.35;
      const speed = 4.8 + Math.random() * 7.5;
      newParticles.push({
        id: Date.now() + 3000 + i,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2, // Sudden upward rupture burst
        color: latexColors[i % latexColors.length],
        size: 8 + Math.random() * 10,
        width: 6 + Math.random() * 8,
        height: 14 + Math.random() * 16,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 32,
        alpha: 1,
        decay: 0.024,
        shape: 'shred',
      });
    }

    // 4. Sparkle & Light Flash Specks
    for (let k = 0; k < 8; k++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.0;
      newParticles.push({
        id: Date.now() + 4000 + k,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#FDE047',
        size: 7 + Math.random() * 5,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 20,
        alpha: 1,
        decay: 0.04,
        shape: 'sparkle',
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Pop Action
  const handlePop = (balloon: BalloonOption, e: React.MouseEvent) => {
    if (balloon.isPopped || balloon.isBursting || phase !== 'playing') return;

    // Trigger instant camera micro-shake
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 180);

    // Play ultra-crisp acoustic pop
    playSound('pop');

    // Spawn rich particle explosion at the exact click coordinate
    spawnPopExplosion(
      e.clientX,
      e.clientY,
      balloon.baseColor,
      balloon.highlightColor,
      balloon.shadowColor
    );

    // Split-second puncture flash
    setBalloons((prev) =>
      prev.map((b) => (b.id === balloon.id ? { ...b, isBursting: true } : b))
    );

    setTimeout(() => {
      setBalloons((prev) =>
        prev.map((b) => (b.id === balloon.id ? { ...b, isPopped: true, isBursting: false } : b))
      );
    }, 40);

    if (balloon.isCorrect) {
      const bonus = 100 + streak * 25;
      setScore((prev) => prev + bonus);
      setStreak((prev) => prev + 1);

      // Trigger floating score indicator
      setFloatingScores((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: balloon.xPercent,
          y: balloon.yPercent,
          text: streak > 0 ? `+${bonus} SERİ!` : `+${bonus}`,
          color: '#10B981',
        },
      ]);

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { x: balloon.xPercent / 100, y: balloon.yPercent / 100 },
      });

      // Next Question after satisfying burst
      setTimeout(() => {
        setFloatingScores([]);
        if (currentIdx + 1 < items.length) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          // Finished Game!
          setPhase('finished');
          playSound('win');
          confetti({ particleCount: 150, spread: 85, origin: { y: 0.6 } });
          hud?.finishGame(3, items.length);
          onFinish?.(score + 100);
        }
      }, 750);
    } else {
      playSound('wrong');
      setStreak(0);

      // Wrong feedback badge
      setFloatingScores((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: balloon.xPercent,
          y: balloon.yPercent,
          text: 'TEKRAR DENE!',
          color: '#EF4444',
        },
      ]);

      setTimeout(() => {
        setFloatingScores([]);
      }, 800);
    }
  };

  const handleRestart = () => {
    playSound('click');
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setParticles([]);
    setFloatingScores([]);
    setPhase('playing');
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-0.5 sm:p-2 select-none overflow-hidden">
      {/* 
        16:9 LANDSCAPE BALLOON STAGE
        Auto-scales to strictly fit viewport height AND width (never cut off behind GameHud on landscape mobile)
      */}
      <div
        ref={containerRef}
        className={`relative mx-auto rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-white/95 shadow-2xl overflow-hidden flex flex-col justify-between transition-transform duration-75 ${
          isShaking ? 'animate-game-shake' : ''
        }`}
        style={{
          aspectRatio: '16 / 9',
          width: '100%',
          maxWidth: 'min(960px, calc((100dvh - 75px) * (16 / 9)))',
          maxHeight: '100%',
          backgroundImage: 'url(/games/balloon/bg-landscape.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: phase === 'playing' ? PIN_CURSOR : 'default',
        }}
      >
        {/* =========================================================================
            1. TOP QUESTION BANNER (Dedicated Top Row, Completely Separated)
            ========================================================================= */}
        <div className="relative w-full z-30 px-3 sm:px-6 pt-2 pb-1 shrink-0 flex flex-col items-center pointer-events-none">
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl border-2 border-white shadow-xl px-4 py-1.5 sm:py-2 text-center pointer-events-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] sm:text-[11px] font-black text-rose-600 uppercase tracking-wider mb-0.5">
              <span>DOĞRU BALONA DOKUNARAK PATLAT</span>
            </div>
            <h2 className="text-xs sm:text-sm md:text-base font-black text-slate-800 font-display leading-snug line-clamp-2">
              {currentItem.question}
            </h2>
          </div>
        </div>

        {/* =========================================================================
            2. BALLOON PLAYFIELD (Below Question - Balloons Cannot Overlap Question)
            ========================================================================= */}
        {phase === 'playing' && (
          <div className="relative flex-1 w-full min-h-0 overflow-hidden pointer-events-none">
            {balloons.map((b) => {
              if (b.isPopped) return null;

              return (
                <div
                  key={b.id}
                  onClick={(e) => handlePop(b, e)}
                  className={`absolute pointer-events-auto group transition-transform duration-100 ${
                    b.isBursting ? 'scale-125 opacity-70' : ''
                  }`}
                  style={{
                    left: `${b.xPercent}%`,
                    top: `${b.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    animation: `balloonFloat ${b.floatSpeed + 1.2}s ease-in-out infinite alternate`,
                    animationDelay: `${b.floatOffset}s`,
                    cursor: PIN_CURSOR,
                  }}
                >
                  {/* Floating Container with Hover Dynamic Elasticity */}
                  <div className="relative flex flex-col items-center group-hover:scale-108 active:scale-95 transition-transform duration-200 select-none">
                    {/* REALISTIC SVG 3D VOLUMETRIC LATEX BALLOON */}
                    <div className="relative w-20 sm:w-26 md:w-30 h-30 sm:h-38 md:h-42 filter drop-shadow-[0_14px_18px_rgba(0,0,0,0.3)] flex items-center justify-center">
                      <svg
                        viewBox="0 0 130 180"
                        className="w-full h-full overflow-visible"
                      >
                        <defs>
                          {/* 3D Latex Volumetric Spherical Radial Gradient */}
                          <radialGradient
                            id={`latexGrad_${b.id}`}
                            cx="38%"
                            cy="32%"
                            r="62%"
                          >
                            <stop offset="0%" stopColor={b.rimColor} stopOpacity="0.9" />
                            <stop offset="15%" stopColor={b.highlightColor} />
                            <stop offset="55%" stopColor={b.baseColor} />
                            <stop offset="88%" stopColor={b.shadowColor} />
                            <stop offset="100%" stopColor="#0B132B" stopOpacity="0.85" />
                          </radialGradient>

                          {/* Primary Specular Curved Sunlight Crescent */}
                          <linearGradient
                            id={`specularCrescent_${b.id}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                          </linearGradient>

                          {/* Secondary Ambient Rim Bounce Light (Reflecting ground/sky) */}
                          <linearGradient
                            id={`rimLight_${b.id}`}
                            x1="100%"
                            y1="60%"
                            x2="0%"
                            y2="60%"
                          >
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                          </linearGradient>

                          {/* Subtle Inner Translucency */}
                          <radialGradient
                            id={`translucency_${b.id}`}
                            cx="65%"
                            cy="65%"
                            r="50%"
                          >
                            <stop offset="0%" stopColor={b.highlightColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={b.shadowColor} stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* Physics Dangling Ribbon / String (Underneath) */}
                        <path
                          d="M 65 152 Q 54 175, 72 195 T 58 228"
                          fill="none"
                          stroke="#F1F5F9"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          opacity="0.9"
                          filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
                        />

                        {/* Main Organic Latex Teardrop Balloon Volume */}
                        <path
                          d="M 65 8
                             C 102 8, 124 38, 124 80
                             C 124 118, 86 146, 68 151
                             L 62 151
                             C 44 146, 6 118, 6 80
                             C 6 38, 28 8, 65 8
                             Z"
                          fill={`url(#latexGrad_${b.id})`}
                        />

                        {/* Inner Translucency Layer */}
                        <path
                          d="M 65 14
                             C 98 14, 118 42, 118 80
                             C 118 114, 84 140, 67 145
                             L 63 145
                             C 46 140, 12 114, 12 80
                             C 12 42, 32 14, 65 14
                             Z"
                          fill={`url(#translucency_${b.id})`}
                        />

                        {/* Curved Primary Specular Sunlight Reflection */}
                        <path
                          d="M 34 22
                             C 52 16, 78 18, 86 24
                             C 80 30, 46 32, 30 52
                             C 26 42, 28 28, 34 22
                             Z"
                          fill={`url(#specularCrescent_${b.id})`}
                        />

                        {/* Crisp Pinpoint Sunlight Glare Spot */}
                        <ellipse
                          cx="42"
                          cy="30"
                          rx="4.5"
                          ry="2.8"
                          transform="rotate(-25 42 30)"
                          fill="#FFFFFF"
                          opacity="0.95"
                        />

                        {/* Right-Side Ambient Rim Light */}
                        <path
                          d="M 106 54
                             C 119 76, 117 106, 100 128
                             C 104 108, 110 82, 106 54
                             Z"
                          fill={`url(#rimLight_${b.id})`}
                        />

                        {/* Tied Balloon Neck & Wrinkles */}
                        <path
                          d="M 59 148 L 71 148 L 68 154 L 62 154 Z"
                          fill={b.shadowColor}
                        />
                        {/* Tied Knot Sphere */}
                        <circle cx="65" cy="154" r="4.2" fill={b.baseColor} stroke={b.shadowColor} strokeWidth="1" />
                        <ellipse cx="64" cy="153" rx="1.8" ry="0.9" fill="#FFFFFF" opacity="0.6" />
                      </svg>

                      {/* Clean High-Contrast Glassmorphic Answer Badge */}
                      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[84%] px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-xs border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.22)] text-center pointer-events-none group-hover:bg-white group-hover:scale-103 transition-all duration-150">
                        <span className="font-extrabold text-slate-800 text-[11px] sm:text-xs md:text-sm tracking-tight leading-snug select-none line-clamp-3 block font-sans">
                          {b.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Floating Score Badges (+100 SERİ! / TEKRAR DENE!) */}
            {floatingScores.map((fs) => (
              <div
                key={fs.id}
                className="absolute z-30 font-black text-sm sm:text-base px-3.5 py-1 rounded-full bg-white shadow-2xl border-2 animate-bounce pointer-events-none whitespace-nowrap"
                style={{
                  left: `${fs.x}%`,
                  top: `${fs.y - 12}%`,
                  transform: 'translate(-50%, -50%)',
                  borderColor: fs.color,
                  color: fs.color,
                }}
              >
                {fs.text}
              </div>
            ))}

            {/* Particle Canvas Overlay: Rubber Shards, Talc Mist, Shockwave & Sparkles */}
            {particles.map((p) => {
              if (p.shape === 'shockwave') {
                return (
                  <div
                    key={p.id}
                    className="absolute pointer-events-none rounded-full border-4"
                    style={{
                      left: `${p.x}px`,
                      top: `${p.y}px`,
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      borderColor: p.color,
                      transform: `translate(-50%, -50%) scale(${p.scale || 1})`,
                      opacity: p.alpha,
                      boxShadow: `0 0 16px ${p.color}`,
                    }}
                  />
                );
              }

              if (p.shape === 'smoke') {
                return (
                  <div
                    key={p.id}
                    className="absolute pointer-events-none rounded-full filter blur-xs"
                    style={{
                      left: `${p.x}px`,
                      top: `${p.y}px`,
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      transform: `translate(-50%, -50%) scale(${p.scale || 1})`,
                      opacity: p.alpha,
                    }}
                  />
                );
              }

              if (p.shape === 'sparkle') {
                return (
                  <div
                    key={p.id}
                    className="absolute pointer-events-none rounded-full"
                    style={{
                      left: `${p.x}px`,
                      top: `${p.y}px`,
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      backgroundColor: p.color,
                      transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
                      opacity: p.alpha,
                      boxShadow: `0 0 8px ${p.color}`,
                    }}
                  />
                );
              }

              // 'shred' - Torn latex strip with dynamic 3D spin
              return (
                <div
                  key={p.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                    width: `${p.width || p.size}px`,
                    height: `${p.height || p.size * 1.8}px`,
                    backgroundColor: p.color,
                    borderRadius: '2px 8px 3px 6px',
                    transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
                    opacity: p.alpha,
                    boxShadow: `0 2px 6px rgba(0,0,0,0.35)`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Bottom spacing for landscape layout */}
        <div className="h-2 pointer-events-none" />

        {/* =========================================================================
            4. SCREEN: START SCREEN (Wooden Sign + Glossy BAŞLA)
            ========================================================================= */}


        {/* =========================================================================
            5. SCREEN: FINISHED OVERLAY (Confetti, Trophy & Restart)
            ========================================================================= */}
        {phase === 'finished' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in pointer-events-auto">
            <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-sm w-full text-center border-4 border-white shadow-2xl animate-scale-in flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-lg">
                <Trophy size={36} className="text-amber-500 fill-amber-500" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900">
                  Tebrikler, Harika İş!
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Tüm soruları bilip gökyüzündeki balonları ustaca patlattın!
                </p>
              </div>

              <div className="w-full py-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-3">
                <span className="text-xs font-black text-amber-800 uppercase">Toplam Skor</span>
                <span className="text-xl font-black text-amber-600 font-display">{score} PUAN</span>
              </div>

              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black font-display text-sm sm:text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <RotateCcw size={18} />
                <span>Tekrar Oyna</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating & Screen Shake CSS Keyframes */}
      <style>{`
        @keyframes balloonFloat {
          0% {
            transform: translate(-50%, -50%) translateY(-7px) rotate(-2.5deg);
          }
          100% {
            transform: translate(-50%, -50%) translateY(9px) rotate(2.5deg);
          }
        }
        @keyframes gameShake {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-3px, 2px); }
          50% { transform: translate(3px, -2px); }
          75% { transform: translate(-2px, 1px); }
          100% { transform: translate(0, 0); }
        }
        .animate-game-shake {
          animation: gameShake 0.18s ease-in-out;
        }
      `}</style>
    </div>
  );
};
