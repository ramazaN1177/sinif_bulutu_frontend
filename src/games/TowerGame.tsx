import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Matter from 'matter-js';
import { Play, RotateCcw, CheckCircle2, XCircle, ArrowDown, Heart, HeartCrack, Trophy } from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';

const { Engine, Bodies, Composite, Body } = Matter;

interface TowerGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

interface StackedFloor {
  id: number;
  x: number;
  y: number;
  floorNum: number;
}

// Logical Canvas World Coordinates
const WORLD_W = 400;
const WORLD_H = 700;
const BLOCK_W = 120;
const BLOCK_H = 72;
const FLOOR_RISE = 69; // Height each floor adds to tower (72px - 3px seam overlap)
const MANSION_BASE_Y = 580; // Grounded mansion base center Y
const FIRST_FLOOR_Y = 452; // Exact resting center Y for floor 1 on mansion upper roof rim
const PIVOT_X = 200;
const PIVOT_Y = -15;
const ROPE_LENGTH = 175;
const SWING_FREQ = 1.85; // Natural pendulum swing frequency
const SWING_AMP = 0.38; // Oscillation amplitude (~22 deg)

export const TowerGame: React.FC<TowerGameProps> = ({
  title: _title = 'Kule Yapma',
  items,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  const hud = useGameHudOptional();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Gameplay state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [floors, setFloors] = useState<StackedFloor[]>([]);

  // Phase
  const [phase, setPhase] = useState<
    'question' | 'answered_correct' | 'swing' | 'falling' | 'landed' | 'missed' | 'game_over' | 'finished'
  >('question');

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);

  // Authoritative Refs (to prevent stale closures in 60fps Canvas physics render loop)
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const currentIdxRef = useRef(currentIdx);
  currentIdxRef.current = currentIdx;

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const livesRef = useRef(lives);
  livesRef.current = lives;

  const floorsRef = useRef(floors);
  floorsRef.current = floors;

  const isResolvingDropRef = useRef(false);
  const watchdogTimerRef = useRef<any>(null);

  // Matter.js Physics Engine & Animation Refs
  const engineRef = useRef<Matter.Engine | null>(null);
  const droppingBodyRef = useRef<Matter.Body | null>(null);
  const swingTimeRef = useRef(0);
  const thetaRef = useRef(0);
  const cameraYRef = useRef(0);
  const swayRef = useRef({ intensity: 0, startTime: 0 });
  const feedbackBadgeRef = useRef<{ text: string; color: string; y: number; time: number } | null>(null);

  // Preloaded Game Assets (SVG & WebP)
  const imagesRef = useRef<{
    bg: HTMLImageElement | null;
    block: HTMLImageElement | null;
    base: HTMLImageElement | null;
    hook: HTMLImageElement | null;
  }>({ bg: null, block: null, base: null, hook: null });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSfx = (type: 'correct' | 'wrong' | 'drop' | 'place' | 'perfect' | 'miss' | 'click') => {
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

      if (type === 'drop') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'place') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(450, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'perfect') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'miss') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'correct') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'wrong') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
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

  // Sync HUD
  useEffect(() => {
    hud?.setScore(score);
    hud?.setStreak(floors.length);
    hud?.setTotalQuestions(items.length);
    hud?.setQuestionIndex(currentIdx);
    hud?.setQuestionText(
      phase === 'swing'
        ? `${floors.length + 1}. Katı bırakmak için ekrana tıkla!`
        : currentItem?.question || 'Kuleyi inşa et!'
    );
  }, [hud, score, floors.length, items.length, currentIdx, phase, currentItem]);

  // Preload Game Image Assets
  useEffect(() => {
    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((res) => {
        const img = new Image();
        img.src = src;
        img.onload = () => res(img);
        img.onerror = () => res(img);
      });

    Promise.all([
      loadImg('/games/tower/bg.webp'),
      loadImg('/games/tower/block.svg'),
      loadImg('/games/tower/base.svg'),
      loadImg('/games/tower/hook.svg'),
    ]).then(([bg, block, base, hook]) => {
      imagesRef.current = { bg, block, base, hook };
    });
  }, []);

  // Initialize Matter.js Engine
  useEffect(() => {
    const engine = Engine.create({
      gravity: { x: 0, y: 1.8, scale: 0.0018 },
    });
    engineRef.current = engine;

    return () => {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  // 1. QUESTION ANSWER HANDLER
  const handleSelectAnswer = (option: string) => {
    if (selectedAnswer !== null || phaseRef.current !== 'question') return;

    setSelectedAnswer(option);

    const expected = currentItem.answer ?? (currentItem as any).correctAnswer ?? '';
    let isCorrect = String(option).trim().toLowerCase() === String(expected).trim().toLowerCase();

    if (!isCorrect && currentItem.options && !isNaN(Number(expected))) {
      const idx = Number(expected);
      if (idx >= 0 && idx < currentItem.options.length) {
        isCorrect = String(option).trim().toLowerCase() === String(currentItem.options[idx]).trim().toLowerCase();
      }
    }

    if (isCorrect) {
      playSfx('correct');
      setAnswerStatus('correct');
      phaseRef.current = 'answered_correct';
      setPhase('answered_correct');

      setTimeout(() => {
        setSelectedAnswer(null);
        setAnswerStatus(null);
        phaseRef.current = 'swing';
        setPhase('swing');
      }, 450);
    } else {
      playSfx('wrong');
      setAnswerStatus('wrong');

      setTimeout(() => {
        setSelectedAnswer(null);
        setAnswerStatus(null);
        // Cycle to next question so student can earn the next block!
        const nextIdx = (currentIdxRef.current + 1) % items.length;
        currentIdxRef.current = nextIdx;
        setCurrentIdx(nextIdx);
        phaseRef.current = 'question';
        setPhase('question');
      }, 800);
    }
  };

  // 2. INSTANT DROP TRIGGER (Zero Latency on PointerDown)
  const handleTriggerDrop = useCallback(
    (e?: React.PointerEvent | React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (phaseRef.current !== 'swing' || !engineRef.current) return;

      const theta = thetaRef.current;
      const hookX = PIVOT_X + ROPE_LENGTH * Math.sin(theta);
      const hookY = PIVOT_Y + ROPE_LENGTH * Math.cos(theta);

      // Exact pixel-perfect alignment with swinging block center
      const startX = hookX;
      const startY = hookY + 38 + BLOCK_H / 2;

      // Spawn real Matter.js rigid body
      const body = Bodies.rectangle(startX, startY, BLOCK_W, BLOCK_H, {
        friction: 0.8,
        restitution: 0.02,
        density: 0.005,
        frictionAir: 0.001,
        label: `floor_${floorsRef.current.length + 1}`,
      });

      // Pure vertical drop with initial acceleration
      Body.setVelocity(body, { x: 0, y: 3.5 });
      Body.setAngle(body, 0);

      Composite.add(engineRef.current.world, body);
      droppingBodyRef.current = body;
      isResolvingDropRef.current = false;

      phaseRef.current = 'falling';
      setPhase('falling');
      playSfx('drop');

      // Safety watchdog: ensure drop NEVER freezes indefinitely
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = setTimeout(() => {
        if (droppingBodyRef.current && engineRef.current) {
          Composite.remove(engineRef.current.world, droppingBodyRef.current);
          droppingBodyRef.current = null;
          isResolvingDropRef.current = false;
          // Advance smoothly to question
          const nextIdx = (currentIdxRef.current + 1) % items.length;
          currentIdxRef.current = nextIdx;
          setCurrentIdx(nextIdx);
          phaseRef.current = 'question';
          setPhase('question');
        }
      }, 2500);
    },
    [items.length]
  );

  // 3. MAIN PHYSICS SIMULATION & 60FPS CANVAS RENDER LOOP
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const canvas = canvasRef.current;
      const engine = engineRef.current;
      if (!canvas || !engine) {
        animId = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // High-DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const displayW = canvas.clientWidth || WORLD_W;
      const displayH = canvas.clientHeight || WORLD_H;

      if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
        canvas.width = displayW * dpr;
        canvas.height = displayH * dpr;
      }

      ctx.save();
      ctx.scale((displayW * dpr) / WORLD_W, (displayH * dpr) / WORLD_H);

      // Current gameplay references
      const currentPhase = phaseRef.current;
      const currentFloors = floorsRef.current;

      // ----------------------------------------------------
      // A. Physics & Pendulum Swing Calculations
      // ----------------------------------------------------
      if (currentPhase === 'swing' || currentPhase === 'falling' || currentPhase === 'landed') {
        swingTimeRef.current += dt * SWING_FREQ;
        thetaRef.current = SWING_AMP * Math.sin(swingTimeRef.current);
      }

      const theta = thetaRef.current;
      const hookX = PIVOT_X + ROPE_LENGTH * Math.sin(theta);
      const hookY = PIVOT_Y + ROPE_LENGTH * Math.cos(theta);

      // Smooth Camera Vertical Lerp (Scrolls smoothly down as tower grows)
      const targetCameraY = currentFloors.length >= 2 ? (currentFloors.length - 1) * FLOOR_RISE : 0;
      cameraYRef.current += (targetCameraY - cameraYRef.current) * 0.08;
      const cameraY = cameraYRef.current;

      // Elastic Tower Wobble / Sway Angle Calculation
      let currentSwayAngle = 0;
      if (swayRef.current.intensity !== 0) {
        const elapsed = (now - swayRef.current.startTime) / 1000;
        if (elapsed < 1.4) {
          currentSwayAngle =
            swayRef.current.intensity * Math.sin(elapsed * 11) * Math.exp(-elapsed * 3.0);
        } else {
          swayRef.current.intensity = 0;
        }
      }

      // Matter.js Step & Real Rigid Body Simulation
      if (droppingBodyRef.current) {
        Engine.update(engine, 1000 / 60);

        const body = droppingBodyRef.current;
        const targetRoofY =
          currentFloors.length === 0
            ? FIRST_FLOOR_Y
            : currentFloors[currentFloors.length - 1].y - FLOOR_RISE;
        const targetRoofX =
          currentFloors.length === 0 ? PIVOT_X : currentFloors[currentFloors.length - 1].x;

        // Collision Check: Once body touches landing roof level
        if (body.position.y >= targetRoofY && !isResolvingDropRef.current) {
          const diff = body.position.x - targetRoofX;
          // Generous hit window (up to 80px offset)
          const isHit = Math.abs(diff) <= 80;

          if (isHit) {
            // ========================================================
            // SUCCESSFUL LANDING - ROCK-SOLID LOCK INTO TOWER!
            // ========================================================
            isResolvingDropRef.current = true;
            if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);

            // Remove dynamic body from Matter engine so it never blocks future drops
            Composite.remove(engine.world, body);
            droppingBodyRef.current = null;

            const isCenterHit = Math.abs(diff) <= 18;
            const pts = isCenterHit ? 50 : 25;
            playSfx(isCenterHit ? 'perfect' : 'place');

            // Floating feedback badge
            feedbackBadgeRef.current = {
              text: isCenterHit ? 'MÜKEMMEL! +50' : '+25',
              color: isCenterHit ? '#F59E0B' : '#10B981',
              y: targetRoofY - 30,
              time: now,
            };

            // Trigger wobble sway
            const swayIntensity = (diff / 80) * 4.5;
            swayRef.current = { intensity: swayIntensity, startTime: now };

            const newFloor: StackedFloor = {
              id: Date.now(),
              x: body.position.x,
              y: targetRoofY,
              floorNum: currentFloors.length + 1,
            };

            floorsRef.current = [...currentFloors, newFloor];
            setFloors(floorsRef.current);

            scoreRef.current += pts;
            setScore(scoreRef.current);

            phaseRef.current = 'landed';
            setPhase('landed');

            // Advance to next question or victory finish
            setTimeout(() => {
              if (floorsRef.current.length >= items.length) {
                phaseRef.current = 'finished';
                setPhase('finished');
                confetti({ particleCount: 150, spread: 85, origin: { y: 0.5 } });
                hud?.finishGame(3, items.length);
                onFinish?.(scoreRef.current + 100);
              } else {
                const nextIdx = (currentIdxRef.current + 1) % items.length;
                currentIdxRef.current = nextIdx;
                setCurrentIdx(nextIdx);
                phaseRef.current = 'question';
                setPhase('question');
              }
            }, 550);
          } else {
            // ========================================================
            // MISSED TOWER - TUMBLE OFF CLEANLY & NEVER GET STUCK!
            // ========================================================
            isResolvingDropRef.current = true;
            if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);

            // Give realistic tilt and lateral velocity to tumble off the building
            Body.setVelocity(body, {
              x: diff > 0 ? 3.5 : -3.5,
              y: Math.max(body.velocity.y, 4.5),
            });
            Body.setAngularVelocity(body, diff > 0 ? 0.16 : -0.16);

            playSfx('miss');
            phaseRef.current = 'missed';
            setPhase('missed');

            // Quick 450ms cleanup: deduct life, check game over, or present next question
            setTimeout(() => {
              if (droppingBodyRef.current) {
                Composite.remove(engine.world, droppingBodyRef.current);
                droppingBodyRef.current = null;
              }

              const nextLives = Math.max(0, livesRef.current - 1);
              livesRef.current = nextLives;
              setLives(nextLives);

              if (nextLives <= 0) {
                phaseRef.current = 'game_over';
                setPhase('game_over');
                hud?.finishGame(floorsRef.current.length >= 2 ? 2 : 1, items.length);
                onFinish?.(scoreRef.current);
              } else {
                const nextIdx = (currentIdxRef.current + 1) % items.length;
                currentIdxRef.current = nextIdx;
                setCurrentIdx(nextIdx);
                phaseRef.current = 'question';
                setPhase('question');
              }
            }, 450);
          }
        }
      }

      // ----------------------------------------------------
      // B. CANVAS DRAWING
      // ----------------------------------------------------
      ctx.clearRect(0, 0, WORLD_W, WORLD_H);

      const { bg, block, base, hook } = imagesRef.current;

      // 1. Background Image
      if (bg) {
        ctx.drawImage(bg, 0, 0, WORLD_W, WORLD_H);
      } else {
        ctx.fillStyle = '#67C5E0';
        ctx.fillRect(0, 0, WORLD_W, WORLD_H);
      }

      // 2. Tower & Mansion Base (With Camera Scroll & Sway Wobble)
      ctx.save();
      ctx.translate(0, cameraY);

      // Sway around bottom center of mansion
      ctx.translate(PIVOT_X, MANSION_BASE_Y + 90);
      ctx.rotate((currentSwayAngle * Math.PI) / 180);
      ctx.translate(-PIVOT_X, -(MANSION_BASE_Y + 90));

      // Draw Mansion Base
      if (base) {
        ctx.drawImage(base, PIVOT_X - 170, MANSION_BASE_Y - 100, 340, 200);
      }

      // Draw Stacked Floors
      currentFloors.forEach((fl) => {
        if (block) {
          ctx.drawImage(block, fl.x - BLOCK_W / 2, fl.y - BLOCK_H / 2, BLOCK_W, BLOCK_H);
        } else {
          ctx.fillStyle = '#E25135';
          ctx.fillRect(fl.x - BLOCK_W / 2, fl.y - BLOCK_H / 2, BLOCK_W, BLOCK_H);
        }

        // Floor number badge
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = '900 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(fl.floorNum), fl.x, fl.y);
      });

      // Draw Dropping Body (Active falling Matter.js physics rigid body)
      if (droppingBodyRef.current) {
        const dBody = droppingBodyRef.current;
        ctx.save();
        ctx.translate(dBody.position.x, dBody.position.y);
        ctx.rotate(dBody.angle);

        if (block) {
          ctx.drawImage(block, -BLOCK_W / 2, -BLOCK_H / 2, BLOCK_W, BLOCK_H);
        } else {
          ctx.fillStyle = '#E25135';
          ctx.fillRect(-BLOCK_W / 2, -BLOCK_H / 2, BLOCK_W, BLOCK_H);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = '900 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(currentFloors.length + 1), 0, 0);

        ctx.restore();
      }

      ctx.restore(); // Restore camera & sway

      // 3. Crane, Cable & Hook (Fixed in Sky)
      if (currentPhase === 'swing' || currentPhase === 'falling' || currentPhase === 'landed') {
        // Main Crane Steel Cable
        ctx.beginPath();
        ctx.moveTo(PIVOT_X, PIVOT_Y);
        ctx.lineTo(hookX, hookY);
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Top Anchor Mount
        ctx.beginPath();
        ctx.arc(PIVOT_X, PIVOT_Y + 5, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#475569';
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Left & Right Suspension Wires (Only while holding block)
        if (currentPhase === 'swing') {
          ctx.beginPath();
          ctx.moveTo(hookX, hookY + 16);
          ctx.lineTo(hookX - 46, hookY + 38);
          ctx.moveTo(hookX, hookY + 16);
          ctx.lineTo(hookX + 46, hookY + 38);
          ctx.strokeStyle = '#1E293B';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Swinging Brick Room Block
          if (block) {
            ctx.drawImage(block, hookX - BLOCK_W / 2, hookY + 38, BLOCK_W, BLOCK_H);
          }

          // Floor Number Badge
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.font = '900 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(currentFloors.length + 1), hookX, hookY + 38 + BLOCK_H / 2);
        }

        // Yellow/Black Striped Crane Pulley Hook
        if (hook) {
          ctx.drawImage(hook, hookX - 15, hookY - 5, 30, 42);
        } else {
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(hookX - 12, hookY, 24, 28);
        }
      }

      // 4. Floating Feedback Badge ("MÜKEMMEL! +50" / "+25")
      if (feedbackBadgeRef.current) {
        const fb = feedbackBadgeRef.current;
        const fbElapsed = (now - fb.time) / 1000;
        if (fbElapsed < 0.9) {
          const alpha = fbElapsed > 0.6 ? 1 - (fbElapsed - 0.6) / 0.3 : 1;
          const floatY = fb.y - fbElapsed * 24 + cameraY;

          ctx.save();
          ctx.globalAlpha = Math.max(0, alpha);
          ctx.font = '900 14px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Capsule background
          const textW = ctx.measureText(fb.text).width;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.roundRect(PIVOT_X - textW / 2 - 14, floatY - 14, textW + 28, 28, 14);
          ctx.fill();
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = fb.color;
          ctx.fillText(fb.text, PIVOT_X, floatY);
          ctx.restore();
        } else {
          feedbackBadgeRef.current = null;
        }
      }

      ctx.restore(); // Restore high-DPI scaling

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(animId);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    };
  }, [items.length, onFinish, hud]);

  const handleRestartAll = () => {
    playSfx('click');
    if (engineRef.current) {
      Composite.clear(engineRef.current.world, false);
    }
    droppingBodyRef.current = null;
    isResolvingDropRef.current = false;
    cameraYRef.current = 0;
    swayRef.current = { intensity: 0, startTime: 0 };
    feedbackBadgeRef.current = null;

    currentIdxRef.current = 0;
    setCurrentIdx(0);

    scoreRef.current = 0;
    setScore(0);

    livesRef.current = 3;
    setLives(3);

    floorsRef.current = [];
    setFloors([]);

    phaseRef.current = 'question';
    setPhase('question');
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-0 sm:p-2 select-none overflow-hidden">
      <div
        ref={containerRef}
        onPointerDown={phase === 'swing' ? handleTriggerDrop : undefined}
        className="relative w-full max-w-[430px] h-full max-h-[840px] mx-auto flex flex-col justify-between select-none overflow-hidden rounded-3xl border-4 border-white shadow-2xl cursor-pointer touch-none"
        style={{
          aspectRatio: '9 / 16',
        }}
      >
        {/* =========================================================================
            1. MATTER.JS 2D PHYSICS CANVAS (Zero-Latency, Real Rigid Body Simulation)
            ========================================================================= */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block touch-none pointer-events-auto"
        />

        {/* =========================================================================
            2. TOP HUD (Kat Sayacı, Puan & Canlar)
            ========================================================================= */}
        <div className="relative w-full z-40 px-4 pt-3 flex items-start justify-between pointer-events-none">
          {/* Left: Cartoon "0 kat" / "1 kat" */}
          <div className="flex items-baseline gap-1.5 drop-shadow-md">
            <span
              className="text-4xl sm:text-5xl font-black font-display text-[#F57C00] tracking-tight"
              style={{
                WebkitTextStroke: '2px #FFFFFF',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
              }}
            >
              {floors.length}
            </span>
            <span
              className="text-lg sm:text-xl font-black font-display text-[#F57C00]"
              style={{
                WebkitTextStroke: '1px #FFFFFF',
              }}
            >
              kat
            </span>
          </div>

          {/* Right: Glossy PUAN capsule + 3 Hearts */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="px-4 py-1 rounded-full bg-white/95 backdrop-blur-xs border-2 border-white shadow-md flex items-center gap-3">
              <span className="text-xs font-black text-[#5C381E] uppercase tracking-wide">PUAN</span>
              <span className="text-sm font-black text-[#F57C00] font-display">{score}</span>
            </div>

            <div className="flex items-center gap-1.5 px-1 drop-shadow-sm">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  size={20}
                  className={`transition-all duration-300 ${
                    heartIndex <= lives
                      ? 'fill-red-500 text-red-500 scale-100 drop-shadow-xs'
                      : 'fill-slate-300 text-slate-300 scale-90 opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. PULSING "TIKLA ⬇" INDICATOR (DURING SWING PHASE)
            ========================================================================= */}
        {phase === 'swing' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 animate-bounce pointer-events-none">
            <span
              className="text-2xl sm:text-3xl font-black font-display text-white tracking-wider"
              style={{
                WebkitTextStroke: '2px #E65100',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
              }}
            >
              TIKLA
            </span>
            <div className="w-8 h-8 rounded-full bg-white/95 shadow-lg flex items-center justify-center text-[#E65100]">
              <ArrowDown size={22} className="stroke-[3]" />
            </div>
          </div>
        )}



        {/* =========================================================================
            5. QUESTION SCREEN (EDUCATIONAL QUIZ CARD)
            ========================================================================= */}
        {(phase === 'question' || phase === 'answered_correct') && currentItem && (
          <div className="absolute inset-0 z-50 bg-slate-900/35 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in pointer-events-auto">
            <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border-4 border-white/80 p-5 flex flex-col gap-4 text-center">
              <div className="inline-flex items-center justify-center self-center px-4 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-black text-amber-700 tracking-wide font-display">
                {floors.length + 1}. KAT İÇİN SORU ({currentIdx + 1} / {items.length})
              </div>

              <h3 className="text-lg font-black text-slate-800 leading-snug font-display">
                {currentItem.question}
              </h3>

              <div className="flex flex-col gap-2 mt-1">
                {options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isAnswerCorrect =
                    answerStatus === 'correct' && isSelected;
                  const isAnswerWrong =
                    answerStatus === 'wrong' && isSelected;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-left transition-all duration-150 flex items-center justify-between border-2 shadow-xs cursor-pointer ${
                        isAnswerCorrect
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 scale-[1.02]'
                          : isAnswerWrong
                          ? 'bg-red-50 border-red-500 text-red-800 scale-95'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-xs font-black text-slate-500 flex items-center justify-center">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isAnswerCorrect && <CheckCircle2 size={18} className="text-emerald-600" />}
                      {isAnswerWrong && <XCircle size={18} className="text-red-600" />}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] font-semibold text-slate-400">
                Doğru cevabı ver, kat kancada sallansın!
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            6. GAME OVER SCREEN (3 CAN TÜKENDİ)
            ========================================================================= */}
        {phase === 'game_over' && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in pointer-events-auto">
            <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border-4 border-red-100 p-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                <HeartCrack size={36} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 font-display">Oyun Bitti!</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Kule {floors.length} kata ulaştı. Tekrar denemek ister misin?
                </p>
              </div>

              <div className="px-6 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                <span className="text-xs font-black text-amber-800 uppercase">Toplam Puan</span>
                <span className="text-xl font-black text-amber-600 font-display">{score}</span>
              </div>

              <button
                onClick={handleRestartAll}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
              >
                <RotateCcw size={18} />
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            7. SUCCESS / FINISHED SCREEN
            ========================================================================= */}
        {phase === 'finished' && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in pointer-events-auto">
            <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border-4 border-amber-200 p-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                <Trophy size={36} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 font-display">Harika İş!</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Kuleyi başarıyla gökyüzüne yükselttin!
                </p>
              </div>

              <div className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col items-center gap-1">
                <span className="text-xs font-black text-amber-700 uppercase">Kule Yüksekliği</span>
                <span className="text-2xl font-black text-[#F57C00] font-display">{floors.length} Kat</span>
                <span className="text-xs font-bold text-slate-500 mt-0.5">Skor: {score} PUAN</span>
              </div>

              <button
                onClick={handleRestartAll}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
              >
                <RotateCcw size={18} />
                Yeniden Oyna
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
