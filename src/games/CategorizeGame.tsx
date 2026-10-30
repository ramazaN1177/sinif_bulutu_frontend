import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowDown,
  Hand,
  Image as ImageIcon,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';
import { triggerHaptic } from '../services/gameSettings';

interface CategorizeGameProps {
  title?: string;
  items: ActivityItem[];
  categories?: string[];
  boxColors?: Record<string, number>;
  boxImages?: Record<string, string>;
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

// 10 Distinct Color Palettes for storage boxes
export const BOX_PALETTES = [
  { id: 'blue', name: 'Mavi', bg: 'from-blue-500 to-blue-700', border: 'border-blue-400', rim: '#2563EB', inner: '#1E3A8A', dot: 'bg-blue-600' },
  { id: 'emerald', name: 'Yeşil', bg: 'from-emerald-500 to-emerald-700', border: 'border-emerald-400', rim: '#059669', inner: '#064E3B', dot: 'bg-emerald-600' },
  { id: 'purple', name: 'Mor', bg: 'from-purple-500 to-purple-700', border: 'border-purple-400', rim: '#7C3AED', inner: '#4C1D95', dot: 'bg-purple-600' },
  { id: 'amber', name: 'Sarı / Amber', bg: 'from-amber-500 to-amber-700', border: 'border-amber-400', rim: '#D97706', inner: '#78350F', dot: 'bg-amber-500' },
  { id: 'rose', name: 'Kırmızı', bg: 'from-rose-500 to-rose-700', border: 'border-rose-400', rim: '#E11D48', inner: '#881337', dot: 'bg-rose-600' },
  { id: 'sky', name: 'Açık Mavi', bg: 'from-sky-500 to-sky-700', border: 'border-sky-400', rim: '#0284C7', inner: '#075985', dot: 'bg-sky-500' },
  { id: 'pink', name: 'Pembe', bg: 'from-pink-500 to-rose-600', border: 'border-pink-400', rim: '#DB2777', inner: '#831843', dot: 'bg-pink-500' },
  { id: 'orange', name: 'Turuncu', bg: 'from-orange-500 to-orange-700', border: 'border-orange-400', rim: '#EA580C', inner: '#7C2D12', dot: 'bg-orange-500' },
  { id: 'teal', name: 'Turkuaz', bg: 'from-teal-500 to-teal-700', border: 'border-teal-400', rim: '#0D9488', inner: '#134E4A', dot: 'bg-teal-600' },
  { id: 'indigo', name: 'Lacivert', bg: 'from-indigo-600 to-indigo-800', border: 'border-indigo-400', rim: '#4F46E5', inner: '#312E81', dot: 'bg-indigo-600' },
];

export const CategorizeGame: React.FC<CategorizeGameProps> = ({
  title: _title = 'Sepetlere Düşürme & Gruplandırma',
  items,
  categories: propsCategories,
  boxColors: propsBoxColors,
  boxImages: propsBoxImages,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  // Extract unique categories (Max 10 boxes, configured in left panel)
  const [categories, setCategories] = useState<string[]>(() => {
    if (propsCategories && propsCategories.length > 0) {
      return propsCategories.slice(0, 10);
    }
    const fromItems = Array.from(new Set(items.map((it) => it.answer.trim()).filter(Boolean)));
    return (fromItems.length > 0 ? fromItems : ['Katı', 'Sıvı', 'Gaz']).slice(0, 10);
  });

  // Sync if incoming categories or items change
  useEffect(() => {
    if (propsCategories && propsCategories.length > 0) {
      setCategories(propsCategories.slice(0, 10));
    } else {
      const fromItems = Array.from(new Set(items.map((it) => it.answer.trim()).filter(Boolean)));
      if (fromItems.length > 0) {
        setCategories(fromItems.slice(0, 10));
      }
    }
  }, [propsCategories, items]);

  // Box color mapping: category -> palette index (Configured from Studio left panel)
  const [boxColors, setBoxColors] = useState<Record<string, number>>(() => {
    if (propsBoxColors) return propsBoxColors;
    const initial: Record<string, number> = {};
    categories.forEach((cat, idx) => {
      initial[cat] = idx % BOX_PALETTES.length;
    });
    return initial;
  });

  useEffect(() => {
    if (propsBoxColors) {
      setBoxColors(propsBoxColors);
    }
  }, [propsBoxColors]);

  // Box image mapping: category -> image URL / base64
  const [boxImages, setBoxImages] = useState<Record<string, string>>(() => propsBoxImages || {});

  useEffect(() => {
    if (propsBoxImages) {
      setBoxImages(propsBoxImages);
    }
  }, [propsBoxImages]);

  const [ballRotation, setBallRotation] = useState(0);

  // Shuffled items
  const [shuffledItems, setShuffledItems] = useState<ActivityItem[]>(() => {
    return [...items].sort(() => Math.random() - 0.5);
  });

  const hud = useGameHudOptional();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync state with GameHudContext
  useEffect(() => {
    if (!hud) return;
    hud.setScore(score);
    hud.setStreak(streak);
    hud.setTimeLeft(timeLeft);
    const item = shuffledItems[currentIdx];
    hud.setQuestionInfo(
      currentIdx,
      shuffledItems.length,
      item?.question || item?.answer,
      item?.image
    );
  }, [hud, score, streak, timeLeft, currentIdx, shuffledItems]);

  useEffect(() => {
    if (hud) {
      setSoundEnabled(hud.soundEnabled);
    }
  }, [hud?.soundEnabled]);

  // References to DOM elements
  const stageRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 🏀 Physics & Ball State
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 0, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPhysicsActive, setIsPhysicsActive] = useState(false);
  const [activeHoverBox, setActiveHoverBox] = useState<string | null>(null);
  const [boxFeedback, setBoxFeedback] = useState<{ cat: string; status: 'correct' | 'wrong' } | null>(null);
  const [isBallResetting, setIsBallResetting] = useState(false);
  const [activeBasketInside, setActiveBasketInside] = useState<string | null>(null);

  // Internal physics velocity & state
  const physicsRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    targetBox?: string | null;
    bounceCount: number;
  }>({
    x: 0,
    y: 30,
    vx: 0,
    vy: 0,
    targetBox: null,
    bounceCount: 0,
  });

  const dragStartRef = useRef<{ startX: number; startY: number; ballStartX: number; ballStartY: number; lastTime: number }>({
    startX: 0,
    startY: 0,
    ballStartX: 0,
    ballStartY: 0,
    lastTime: 0,
  });

  const currentItem = shuffledItems[currentIdx] || shuffledItems[0];

  // Sound generator
  const playSound = useCallback((type: 'swish' | 'bounce' | 'win' | 'thud' | 'rim_clank') => {
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

      if (type === 'swish') {
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'rim_clank') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.14);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'bounce') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.12);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'thud') {
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.2);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        [523, 659, 784, 1046].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.25, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.3);
        });
      }
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  // Center the ball at the top of the stage initially
  const resetBallToTop = useCallback(() => {
    if (!stageRef.current) return;
    const stageWidth = stageRef.current.clientWidth;
    const initialX = stageWidth / 2;
    const initialY = 70; // Fixed top altitude

    physicsRef.current = {
      x: initialX,
      y: initialY,
      vx: 0,
      vy: 0,
      targetBox: null,
      bounceCount: 0,
    };
    setBallPos({ x: initialX, y: initialY });
    setIsDragging(false);
    setIsPhysicsActive(false);
    setIsBallResetting(false);
    setActiveHoverBox(null);
    setActiveBasketInside(null);
  }, []);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      try {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close().catch(() => {});
        }
      } catch {}
    };
  }, []);

  // Listen for mobile backgrounding or tab hidden
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

  useEffect(() => {
    resetBallToTop();
    const handleResize = () => resetBallToTop();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resetBallToTop]);

  // Countdown timer
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

  const finishGame = () => {
    setIsPlaying(false);
    setIsFinished(true);
    playSound('win');
    confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 } });
    if (onFinish) onFinish(score);
    if (hud) {
      hud.finishGame(score, correctCount, shuffledItems.length);
    }
  };

  // Find which box is under coordinate (x, y)
  const getBoxUnderPoint = (x: number, y: number): { cat: string; rect: DOMRect } | null => {
    if (!stageRef.current) return null;
    const stageRect = stageRef.current.getBoundingClientRect();

    for (const [cat, el] of boxesRef.current.entries()) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const relLeft = r.left - stageRect.left;
      const relRight = r.right - stageRect.left;
      const relTop = r.top - stageRect.top;
      const relBottom = r.bottom - stageRect.top;

      if (x >= relLeft && x <= relRight && y >= relTop - 60 && y <= relBottom) {
        return { cat, rect: r };
      }
    }
    return null;
  };

  // 🎯 Handle result when ball lands in a box
  const handleBoxLanded = useCallback((cat: string) => {
    const isCorrect = cat.trim().toLowerCase() === currentItem.answer.trim().toLowerCase();

    if (isCorrect) {
      triggerHaptic('success');
      playSound('swish');
      const bonus = 100 + streak * 25;
      setScore((s) => s + bonus);
      setStreak((st) => st + 1);
      setCorrectCount((c) => c + 1);
      setBoxFeedback({ cat, status: 'correct' });

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });

      setTimeout(() => {
        setBoxFeedback(null);
        if (currentIdx + 1 < shuffledItems.length) {
          setCurrentIdx((idx) => idx + 1);
          resetBallToTop();
        } else {
          finishGame();
        }
      }, 700);
    } else {
      triggerHaptic('error');
      playSound('thud');
      setStreak(0);
      setBoxFeedback({ cat, status: 'wrong' });

      // Animate wobble and spring back to top
      setTimeout(() => {
        setBoxFeedback(null);
        setIsBallResetting(true);
        setTimeout(() => {
          resetBallToTop();
        }, 300);
      }, 650);
    }
  }, [currentItem, currentIdx, shuffledItems.length, streak, resetBallToTop]);

  // 🚀 Real Physics Simulation Loop (Gravity, Velocity, Rim Collisions & Inside-Net Funneling)
  useEffect(() => {
    if (!isPhysicsActive || !stageRef.current) return;

    let animId: number;
    let lastTimestamp = performance.now();
    const stageRect = stageRef.current.getBoundingClientRect();
    const stageHeight = stageRect.height;
    const floorY = stageHeight - 75; // Ground floor altitude
    const gravity = 1850; // px/s^2

    const tick = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.04); // cap delta
      lastTimestamp = now;

      const p = physicsRef.current;

      // 1. Gravity & Air Friction
      p.vy += gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.985;

      // 2. Stage Side Wall Collisions
      if (p.x < 45) {
        p.x = 45;
        p.vx = -p.vx * 0.55;
        playSound('bounce');
      } else if (p.x > stageRect.width - 45) {
        p.x = stageRect.width - 45;
        p.vx = -p.vx * 0.55;
        playSound('bounce');
      }

      // 3. Collision with Baskets (Rims, Outer Walls, and Inner Net)
      let inAnyBasket = false;
      for (const [cat, el] of boxesRef.current.entries()) {
        if (!el) continue;
        const bRect = el.getBoundingClientRect();
        const bLeft = bRect.left - stageRect.left;
        const bRight = bRect.right - stageRect.left;
        const bTop = bRect.top - stageRect.top;
        const bBottom = bRect.bottom - stageRect.top;

        // --- A. Rim Lip Collisions ("Kenarlarına Çarpmalı") ---
        // Top rim lip hit plane: when ball strikes near the rim height
        if (p.y >= bTop - 18 && p.y <= bTop + 24) {
          // Left Rim Lip Hit (near bLeft + 10)
          if (p.x >= bLeft - 10 && p.x <= bLeft + 26) {
            p.y = bTop - 20; // Reposition above rim
            p.vy = -Math.abs(p.vy) * 0.6 - 130; // Rebound upward
            if (p.x < bLeft + 10) {
              // Outer lip corner -> deflects outwards to the left
              p.vx = -Math.abs(p.vx) * 0.75 - 130;
            } else {
              // Inner lip corner -> glances inward towards center
              p.vx = Math.abs(p.vx) * 0.55 + 90;
            }
            p.bounceCount += 1;
            playSound('rim_clank');
            setBallRotation((r) => r - 45);
            break;
          }

          // Right Rim Lip Hit (near bRight - 10)
          if (p.x >= bRight - 26 && p.x <= bRight + 10) {
            p.y = bTop - 20; // Reposition above rim
            p.vy = -Math.abs(p.vy) * 0.6 - 130; // Rebound upward
            if (p.x > bRight - 10) {
              // Outer lip corner -> deflects outwards to the right
              p.vx = Math.abs(p.vx) * 0.75 + 130;
            } else {
              // Inner lip corner -> glances inward towards center
              p.vx = -Math.abs(p.vx) * 0.55 - 90;
            }
            p.bounceCount += 1;
            playSound('rim_clank');
            setBallRotation((r) => r + 45);
            break;
          }
        }

        // --- B. Outer Basket Wall Bounces ---
        if (p.y > bTop + 24 && p.y < bBottom - 10) {
          if (p.x >= bLeft - 25 && p.x < bLeft + 15 && p.vx > 0) {
            p.x = bLeft - 26;
            p.vx = -Math.abs(p.vx) * 0.6 - 40;
            playSound('bounce');
            break;
          }
          if (p.x <= bRight + 25 && p.x > bRight - 15 && p.vx < 0) {
            p.x = bRight + 26;
            p.vx = Math.abs(p.vx) * 0.6 + 40;
            playSound('bounce');
            break;
          }
        }

        // --- C. Clean Entry Through Basket Mouth ("Top Gerçekten İçine Girmeli") ---
        if (p.x > bLeft + 24 && p.x < bRight - 24 && p.y >= bTop + 4 && p.y <= bBottom) {
          inAnyBasket = true;
          setActiveBasketInside(cat);

          // Funnel towards center of basket
          const basketCenter = (bLeft + bRight) / 2;
          p.x += (basketCenter - p.x) * 0.08;

          // Net Mesh Friction: air & cord resistance slows ball down
          p.vx *= 0.82;
          p.vy *= 0.94;

          // Bottom of the net floor
          const netFloor = bBottom - 38;
          if (p.y >= netFloor) {
            p.y = netFloor;
            p.bounceCount += 1;

            if (p.bounceCount < 2 && Math.abs(p.vy) > 70) {
              p.vy = -p.vy * 0.3; // Soft cushioned net bounce
              playSound('bounce');
            } else {
              // Ball settled peacefully inside the basket!
              p.vy = 0;
              p.vx = 0;
              setIsPhysicsActive(false);
              setBallPos({ x: p.x, y: p.y });
              handleBoxLanded(cat);
              return;
            }
          }
          break;
        }
      }

      // 4. Floor shelf bounce if ball missed all baskets
      if (!inAnyBasket && p.y >= floorY) {
        p.y = floorY;
        p.bounceCount += 1;
        if (p.bounceCount < 2 && Math.abs(p.vy) > 100) {
          p.vy = -p.vy * 0.35;
          playSound('bounce');
        } else {
          // Settled on gym floor -> reset to top
          p.vy = 0;
          p.vx = 0;
          setIsPhysicsActive(false);
          setBallPos({ x: p.x, y: p.y });
          setIsBallResetting(true);
          setTimeout(() => resetBallToTop(), 400);
          return;
        }
      }

      setBallRotation((r) => r + p.vx * dt * 0.4);
      setBallPos({ x: p.x, y: p.y });
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPhysicsActive, handleBoxLanded, resetBallToTop, playSound]);

  // 🖐️ Pointer Drag Handlers (Mouse & Touch & Smartboard)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPhysicsActive || isFinished || !stageRef.current) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      ballStartX: ballPos.x,
      ballStartY: ballPos.y,
      lastTime: performance.now(),
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !stageRef.current) return;

    const stageRect = stageRef.current.getBoundingClientRect();
    const currentX = Math.max(50, Math.min(stageRect.width - 50, e.clientX - stageRect.left));
    const currentY = Math.max(40, Math.min(stageRect.height - 70, e.clientY - stageRect.top));

    // Calculate instant velocity for realistic throw physics on release
    const now = performance.now();
    const dt = Math.max((now - dragStartRef.current.lastTime) / 1000, 0.016);
    const vx = (currentX - ballPos.x) / dt;
    const vy = (currentY - ballPos.y) / dt;

    physicsRef.current.vx = Math.max(-600, Math.min(600, vx * 0.3));
    physicsRef.current.vy = Math.max(-200, Math.min(800, vy * 0.4));
    dragStartRef.current.lastTime = now;

    setBallRotation((r) => r + (currentX - ballPos.x) * 0.4);
    setBallPos({ x: currentX, y: currentY });

    // Highlight box under ball if hovering over
    const hovered = getBoxUnderPoint(currentX, currentY);
    setActiveHoverBox(hovered ? hovered.cat : null);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setIsDragging(false);

    // Initialize physics coordinates from current drop spot
    physicsRef.current.x = ballPos.x;
    physicsRef.current.y = ballPos.y;
    physicsRef.current.bounceCount = 0;

    // Start gravity fall
    setIsPhysicsActive(true);
  };

  // 🎯 Click/Tap box fallback: Launch ball in an arc directly to that box
  const handleDirectBoxClick = (cat: string) => {
    if (isDragging || isPhysicsActive || isFinished || !stageRef.current) return;

    const el = boxesRef.current.get(cat);
    if (!el) return;

    const stageRect = stageRef.current.getBoundingClientRect();
    const bRect = el.getBoundingClientRect();
    const targetX = bRect.left - stageRect.left + bRect.width / 2;
    const bTop = bRect.top - stageRect.top;

    // Launch with calculated smooth basketball trajectory arc right into the basket mouth
    const timeToTarget = 0.58;
    const gravity = 1850;
    const dx = targetX - ballPos.x;
    const dy = bTop + 10 - ballPos.y;
    const vx = dx / timeToTarget;
    const vy = (dy - 0.5 * gravity * (timeToTarget * timeToTarget)) / timeToTarget;

    physicsRef.current = {
      x: ballPos.x,
      y: ballPos.y,
      vx,
      vy,
      targetBox: cat,
      bounceCount: 0,
    };

    setIsPhysicsActive(true);
  };

  const resetGame = () => {
    setShuffledItems([...items].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setBoxFeedback(null);
    setIsPlaying(true);
    setIsFinished(false);
    resetBallToTop();
  };

  return (
    <div className="relative w-full h-full flex-1 min-h-0 flex flex-col justify-between items-center select-none overflow-hidden p-1.5 sm:p-3">
      {/* Question / Instruction Bar */}
      <div className="w-full max-w-xl mx-auto px-4 py-2 sm:py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-white shadow-sm flex items-center justify-between text-slate-800 mb-2 shrink-0">
        <span className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-700">
          <Hand size={15} className="text-orange-500" />
          <span>Topu doğru sepete bırak!</span>
        </span>
        <span className="bg-orange-50 border border-orange-200 text-orange-700 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shrink-0">
          {currentIdx + 1} / {shuffledItems.length}
        </span>
      </div>

      {/* 🏀 Interactive Physics Stage (Ball at Top, Boxes at Bottom - Spanning All Remaining Height) */}
      <div
        ref={stageRef}
        className="w-full flex-1 min-h-0 relative z-10 flex flex-col justify-between rounded-3xl overflow-hidden bg-white/40 backdrop-blur-[2px] p-2 sm:p-4 touch-none border-2 border-white/80 shadow-sm"
      >
        {/* Subtle drop guide / ceiling beam */}
        <div className="absolute top-0 inset-x-8 h-2 bg-gradient-to-r from-transparent via-sky-400/30 to-transparent rounded-full" />

        {/* Dynamic drop guideline when dragging */}
        {isDragging && (
          <div
            className="absolute top-0 bottom-24 w-[2px] bg-gradient-to-b from-amber-400/60 via-amber-400/20 to-transparent pointer-events-none border-dashed border-l border-amber-300/50"
            style={{ left: `${ballPos.x}px` }}
          />
        )}

        {/* 🏀 1. The Interactive Basketball (Positioned with Physics Coordinates) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: `translate3d(${ballPos.x}px, ${ballPos.y}px, 0px) translate(-50%, -50%) scale(${
              activeBasketInside ? 0.8 : isDragging ? 1.08 : isBallResetting ? 0.72 : 1
            })`,
            zIndex: activeBasketInside ? 20 : 35,
            transition: isDragging || isPhysicsActive ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          className={`absolute left-0 top-0 touch-none flex flex-col items-center select-none ${
            isDragging ? 'filter drop-shadow-2xl' : ''
          }`}
        >
          {/* Subtle Ground / Drop Shadow below the ball */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-3 sm:h-4 bg-black/40 rounded-full blur-sm pointer-events-none" />

          {/* 3D Realistic Orange Basketball with Authentic Curved Seams */}
          <div
            className="relative w-20 sm:w-28 h-20 sm:h-28 rounded-full border-2 sm:border-3 border-amber-950/80 shadow-2xl flex flex-col items-center justify-center p-1 sm:p-2 text-center overflow-hidden transition-transform"
            style={{
              background: 'radial-gradient(circle at 30% 25%, #FED7AA 0%, #FB923C 28%, #EA580C 60%, #9A3412 88%, #431407 100%)',
              boxShadow: 'inset -8px -8px 14px rgba(0,0,0,0.6), inset 5px 5px 12px rgba(255,255,255,0.45), 0 12px 20px rgba(0,0,0,0.45)',
              transform: `rotate(${ballRotation}deg)`,
            }}
          >
            {/* SVG Authentic Basketball Ribs / Seams */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
            >
              {/* Outer perimeter groove */}
              <circle cx="50" cy="50" r="48.5" fill="none" stroke="#270b03" strokeWidth="2.2" opacity="0.8" />
              {/* Horizontal equator seam */}
              <line x1="2" y1="50" x2="98" y2="50" stroke="#270b03" strokeWidth="2.4" />
              {/* Vertical meridian seam */}
              <line x1="50" y1="2" x2="50" y2="98" stroke="#270b03" strokeWidth="2.4" />
              {/* Left iconic curved seam */}
              <path d="M 18,8 C 42,32 42,68 18,92" fill="none" stroke="#270b03" strokeWidth="2.4" />
              {/* Right iconic curved seam */}
              <path d="M 82,8 C 58,32 58,68 82,92" fill="none" stroke="#270b03" strokeWidth="2.4" />
            </svg>

            {/* Subtle Pebble Leather Sheen */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_32%_22%,rgba(255,255,255,0.4)_0%,transparent_55%)] pointer-events-none" />

            {/* 🎯 Content on Top of the Ball (Text, Image, or Both) */}
            <div
              className="relative z-10 max-w-[94%] flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-1 rounded-xl bg-black/50 backdrop-blur-md border border-white/30 shadow-lg"
              style={{ transform: `rotate(${-ballRotation}deg)` }}
            >
              {/* Image if present */}
              {currentItem.image && (
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-md sm:rounded-lg overflow-hidden bg-white/95 p-0.5 shadow-sm">
                  <img
                    src={currentItem.image}
                    alt={currentItem.question || 'Görsel'}
                    className="w-full h-full object-contain pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Text question/word if present */}
              {currentItem.question && (
                <span className="text-[10px] sm:text-xs font-black text-white leading-tight drop-shadow-md font-display text-center line-clamp-2 px-0.5">
                  {currentItem.question}
                </span>
              )}

              {/* Fallback if neither exists */}
              {!currentItem.question && !currentItem.image && (
                <div className="text-white text-[10px] font-bold flex items-center gap-1">
                  <ImageIcon size={11} />
                  <span>Öğe #{currentIdx + 1}</span>
                </div>
              )}
            </div>
          </div>

          {/* Drag instruction cue pill below ball when hovering at top */}
          {!isDragging && !isPhysicsActive && (
            <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/80 border border-white/20 text-[9px] sm:text-[10px] font-extrabold text-amber-300 flex items-center gap-1 backdrop-blur-xs shadow-md animate-pulse">
              <ArrowDown size={10} />
              <span>Sepete Bırak</span>
            </div>
          )}
        </div>

        {/* Spacer to push Boxes to the bottom */}
        <div className="flex-1" />

        {/* 📦 2. Category Storage Boxes (Kutular / Sepetler) at the Bottom */}
        <div className="w-full relative pb-1 pointer-events-none">
          {/* Wooden Shelf / Gym Floor Surface */}
          <div className="w-full h-2.5 sm:h-3 rounded-full bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 border-t border-amber-500/40 shadow-lg mb-2" />

          {/* Strictly Side-by-Side (flex-nowrap) Row of Baskets (Max 10) */}
          <div className="flex flex-nowrap items-end justify-start sm:justify-center gap-2.5 sm:gap-4 overflow-x-auto pb-2 px-2 sm:px-4 scrollbar-thin max-w-full mx-auto pointer-events-auto">
            {categories.slice(0, 10).map((cat, cIdx) => {
              const palIdx = boxColors[cat] ?? (cIdx % BOX_PALETTES.length);
              const style = BOX_PALETTES[palIdx] || BOX_PALETTES[0];
              const isHoveredByBall = activeHoverBox === cat;
              const feedback = boxFeedback?.cat === cat ? boxFeedback.status : null;
              const weaveId = `weave-${cIdx}-${style.id}`;

              return (
                <div
                  key={cat}
                  ref={(el) => {
                    if (el) boxesRef.current.set(cat, el);
                    else boxesRef.current.delete(cat);
                  }}
                  onClick={() => handleDirectBoxClick(cat)}
                  className={`relative flex flex-col items-center shrink-0 w-24 sm:w-36 min-h-[135px] sm:min-h-[185px] select-none cursor-pointer transition-all duration-200 group ${
                    feedback === 'correct'
                      ? 'scale-105'
                      : feedback === 'wrong'
                      ? 'animate-shake'
                      : isHoveredByBall
                      ? 'scale-105'
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  {/* LAYER 1: BACK BASKET CAVITY (Behind Basketball - z-10) */}
                  <div
                    className="absolute inset-0 z-10 rounded-b-[2rem] sm:rounded-b-[2.5rem] rounded-t-xl sm:rounded-t-2xl overflow-hidden border-2 border-slate-700/40 flex flex-col items-center justify-between pointer-events-none shadow-lg"
                    style={{
                      background: `radial-gradient(ellipse at 50% 15%, ${style.inner}EE 0%, #0F172A 100%)`,
                      borderTopColor: style.rim,
                      borderTopWidth: '3px',
                    }}
                  >
                    {/* Back Net Cross-Hatch Shadow */}
                    <div className="w-full flex-1 opacity-25 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px] mt-1.5" />

                    {/* Inner Floor Shadow */}
                    <div className="w-12 sm:w-16 h-2.5 rounded-full bg-black/60 blur-xs mb-1.5" />
                  </div>

                  {/* LAYER 2: THE BASKETBALL SITS HERE AT z-20 WHEN INSIDE BASKET */}

                  {/* LAYER 3: FRONT BASKET NET & CATEGORY PLAQUE (In Front of Basketball - z-30) */}
                  <div
                    className={`relative z-30 w-full h-full min-h-[135px] sm:min-h-[185px] rounded-b-[2rem] sm:rounded-b-[2.5rem] rounded-t-xl sm:rounded-t-2xl border-2 flex flex-col items-center justify-between p-1.5 sm:p-2.5 overflow-hidden pointer-events-none transition-all ${
                      feedback === 'correct'
                        ? 'border-emerald-400 ring-4 ring-emerald-400/50 shadow-emerald-500/30 shadow-2xl'
                        : feedback === 'wrong'
                        ? 'border-rose-400 ring-4 ring-rose-400/50 shadow-rose-500/30 shadow-2xl'
                        : isHoveredByBall
                        ? 'border-amber-400 ring-4 ring-amber-400/50 shadow-amber-500/30 shadow-2xl'
                        : 'border-white/40 shadow-xl'
                    }`}
                    style={{
                      // Translucent front mesh gradient so the basketball is clearly visible inside!
                      background: `linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 25%, ${style.rim}28 50%, ${style.rim}55 100%)`,
                      borderTopColor: style.rim,
                      borderTopWidth: '3px',
                    }}
                  >

                    {/* 2. Semi-Transparent Front Net Mesh */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-50 mix-blend-overlay z-20"
                      viewBox="0 0 100 120"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <pattern id={weaveId} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                          <line x1="0" y1="0" x2="0" y2="14" stroke="#FFFFFF" strokeWidth="2" />
                          <line x1="0" y1="0" x2="14" y2="0" stroke="#000000" strokeWidth="1.4" />
                        </pattern>
                      </defs>
                      <rect width="100" height="120" fill={`url(#${weaveId})`} />
                      <path d="M 0,26 Q 50,38 100,26" fill="none" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.7" />
                      <path d="M 4,60 Q 50,74 96,60" fill="none" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.7" />
                      <path d="M 8,94 Q 50,105 92,94" fill="none" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.7" />
                    </svg>

                    {/* 3. Category Plaque / Sepet İsimliği & Görsel */}
                    {(() => {
                      const boxImg = boxImages[cat];
                      return (
                        <div className="relative z-30 w-full max-w-[96%] py-1 px-1.5 sm:py-1.5 sm:px-2 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs text-center text-white bg-slate-950/85 backdrop-blur-md border border-white/35 shadow-lg my-auto tracking-wide pointer-events-auto flex flex-col items-center justify-center gap-0.5 sm:gap-1">
                          {boxImg && (
                            <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-md sm:rounded-lg overflow-hidden border border-white/40 shadow-xs shrink-0">
                              <img
                                src={boxImg}
                                alt={cat}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="truncate max-w-full">{cat}</span>
                        </div>
                      );
                    })()}

                    {/* 4. Bottom Reinforced Foot */}
                    <div
                      className="w-10 sm:w-16 h-1 sm:h-1.5 rounded-full z-30 shadow-sm"
                      style={{ backgroundColor: style.rim }}
                    />

                    {/* Interactive Feedback Icons */}
                    {feedback === 'correct' && (
                      <div className="absolute inset-0 bg-emerald-500/25 backdrop-blur-xs rounded-b-[2rem] sm:rounded-b-[2.5rem] rounded-t-xl sm:rounded-t-2xl flex items-center justify-center animate-scale-in z-30">
                        <CheckCircle2 size={36} className="text-emerald-500 stroke-[3] drop-shadow-md" />
                      </div>
                    )}
                    {feedback === 'wrong' && (
                      <div className="absolute inset-0 bg-rose-500/25 backdrop-blur-xs rounded-b-[2rem] sm:rounded-b-[2.5rem] rounded-t-xl sm:rounded-t-2xl flex items-center justify-center animate-scale-in z-30">
                        <XCircle size={36} className="text-rose-500 stroke-[3] drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* Soft Ground Shadow Under Each Basket */}
                  <div className="w-20 sm:w-26 h-2 bg-amber-950/30 rounded-full blur-xs mx-auto -mt-1 pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Finished Game Overlay */}
      {isFinished && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-slate-800 border border-slate-200">
          <div className="w-20 h-20 rounded-3xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-xl shadow-amber-500/20">
            <Trophy size={44} className="fill-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 font-display">
            Tebrikler, Tüm Topları Grupladınız!
          </h2>
          <p className="text-slate-600 text-base mb-6 max-w-md">
            Kutulara doğru düşürerek <strong className="text-blue-600 text-xl font-black">{score} puan</strong> kazandınız!
          </p>

          <button
            onClick={resetGame}
            className="py-3.5 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-lg shadow-blue-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>Tekrar Oyna</span>
          </button>
        </div>
      )}
    </div>
  );
};
