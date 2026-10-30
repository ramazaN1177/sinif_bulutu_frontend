import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface GameHudContextValue {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  totalTime: number;
  setTotalTime: React.Dispatch<React.SetStateAction<number>>;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<number | boolean | ((prev: boolean) => boolean)>>;
  questionIndex: number;
  setQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  totalQuestions: number;
  setTotalQuestions: React.Dispatch<React.SetStateAction<number>>;
  questionText?: string;
  setQuestionText: React.Dispatch<React.SetStateAction<string | undefined>>;
  questionImage?: string;
  setQuestionInfo: (index: number, total: number, text?: string, image?: string) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  isGameOver: boolean;
  stars: number;
  correctCount: number;
  finishGame: (finalScore?: number, correct?: number, total?: number) => void;
  resetHud: () => void;
  isInsideShell: boolean;
}

const GameHudContext = createContext<GameHudContextValue | null>(null);

export const useGameHud = (): GameHudContextValue => {
  const ctx = useContext(GameHudContext);
  if (!ctx) {
    throw new Error('useGameHud must be used within a GameHudContextProvider');
  }
  return ctx;
};

// Safe hook that does not throw if context is missing (for standalone preview)
export const useGameHudOptional = (): GameHudContextValue | null => {
  return useContext(GameHudContext);
};

interface GameHudContextProviderProps {
  children: React.ReactNode;
  initialTotalQuestions?: number;
  initialTime?: number;
  onFinish?: (summary: { score: number; stars: number; correct: number; total: number }) => void;
}

export const GameHudContextProvider: React.FC<GameHudContextProviderProps> = ({
  children,
  initialTotalQuestions = 10,
  initialTime = 60,
  onFinish,
}) => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [totalTime, setTotalTime] = useState(initialTime);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(initialTotalQuestions);
  const [questionText, setQuestionText] = useState<string | undefined>();
  const [questionImage, setQuestionImage] = useState<string | undefined>();
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [stars, setStars] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);

  const setSoundEnabled = useCallback((value: any) => {
    if (typeof value === 'function') {
      setSoundEnabledState(value);
    } else {
      setSoundEnabledState(Boolean(value));
    }
  }, []);

  const setQuestionInfo = useCallback((index: number, total: number, text?: string, image?: string) => {
    setQuestionIndex(index);
    if (total > 0) setTotalQuestions(total);
    setQuestionText(text);
    setQuestionImage(image);
  }, []);

  const finishGame = useCallback(
    (finalScore?: number, correct?: number, total?: number) => {
      const computedScore = finalScore !== undefined ? finalScore : score;
      const computedTotal = total !== undefined ? total : totalQuestions || 1;
      const computedCorrect = correct !== undefined ? correct : Math.min(computedTotal, Math.round((computedScore / (computedTotal * 10 || 1)) * computedTotal));

      const ratio = computedTotal > 0 ? computedCorrect / computedTotal : 0.8;
      let earnedStars = 1;
      if (ratio >= 0.85) earnedStars = 3;
      else if (ratio >= 0.55) earnedStars = 2;

      setStars(earnedStars);
      setCorrectCount(computedCorrect);
      setIsGameOver(true);

      if (onFinish) {
        onFinish({
          score: computedScore,
          stars: earnedStars,
          correct: computedCorrect,
          total: computedTotal,
        });
      }
    },
    [score, totalQuestions, onFinish]
  );

  const resetHud = useCallback(() => {
    setScore(0);
    setStreak(0);
    setTimeLeft(totalTime);
    setIsPaused(false);
    setIsGameOver(false);
    setStars(1);
    setCorrectCount(0);
  }, [totalTime]);

  const value = useMemo<GameHudContextValue>(
    () => ({
      score,
      setScore,
      streak,
      setStreak,
      timeLeft,
      setTimeLeft,
      totalTime,
      setTotalTime,
      soundEnabled,
      setSoundEnabled,
      questionIndex,
      setQuestionIndex,
      totalQuestions,
      setTotalQuestions,
      questionText,
      setQuestionText,
      questionImage,
      setQuestionInfo,
      isPaused,
      setIsPaused,
      isGameOver,
      stars,
      correctCount,
      finishGame,
      resetHud,
      isInsideShell: true,
    }),
    [
      score,
      streak,
      timeLeft,
      totalTime,
      soundEnabled,
      setSoundEnabled,
      questionIndex,
      totalQuestions,
      questionText,
      questionImage,
      setQuestionInfo,
      isPaused,
      isGameOver,
      stars,
      correctCount,
      finishGame,
      resetHud,
    ]
  );

  return <GameHudContext.Provider value={value}>{children}</GameHudContext.Provider>;
};
