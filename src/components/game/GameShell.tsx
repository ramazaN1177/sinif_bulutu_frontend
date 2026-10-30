import React, { useState, useEffect } from 'react';
import type { Activity } from '../../types/game';
import { getGameTheme, type GameTheme } from '../../data/gameThemes';
import { useOrientation } from '../../hooks/useOrientation';
import { useGameBackground } from '../../hooks/useGameBackground';
import { GameHudContextProvider, useGameHud } from './GameHudContext';
import { GameHud } from './GameHud';
import { PauseMenu } from './PauseMenu';
import { GameResultScreen } from './GameResultScreen';
import { RotateHint } from './RotateHint';
import { DeviceFrame } from './DeviceFrame';
import { nativeBridge, subscribeNativeMessages } from '../../services/nativeBridge';

interface GameShellProps {
  activity: Activity;
  children: React.ReactNode;
  onExit: () => void;
  onRestartGame: () => void;
  onHome: () => void;
  isEmbed?: boolean;
  isMobileGameMode?: boolean;
}

const GameShellInner: React.FC<GameShellProps & { theme: GameTheme }> = ({
  activity,
  theme,
  children,
  onExit,
  onRestartGame,
  onHome,
}) => {
  const { isLandscape, isMismatch } = useOrientation(theme.orientation);
  const { bgLoaded, bgUrl, fallbackGradient } = useGameBackground(theme, isLandscape);

  const { isPaused, setIsPaused, isGameOver, score, stars, correctCount, totalQuestions, resetHud } =
    useGameHud();

  const [restartKey, setRestartKey] = useState(0);

  // Request orientation from mobile wrapper
  useEffect(() => {
    nativeBridge.requestOrientation(theme.orientation);
    nativeBridge.sendGameStarted();

    return () => {
      nativeBridge.requestOrientation('auto');
    };
  }, [theme.orientation]);

  // Subscribe to native events (back press, app pause) & ESC key
  useEffect(() => {
    const unsubscribe = subscribeNativeMessages({
      onHostBackPressed: () => {
        setIsPaused(!isPaused);
      },
      onPauseAudio: () => {
        setIsPaused(true);
      },
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPaused(!isPaused);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused, setIsPaused]);

  const handleRestart = () => {
    resetHud();
    setRestartKey((k) => k + 1);
    onRestartGame();
  };

  return (
    <div
      className={`fixed inset-0 z-40 w-screen h-[100dvh] flex flex-col justify-between select-none overflow-hidden ${
        bgLoaded ? '' : `bg-gradient-to-br ${fallbackGradient}`
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* 1. Fullscreen Illustrated Background */}
      {bgLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center z-0 animate-fade-in"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}

      {/* Light Ambient Overlay (Clean & Soft, never dark!) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-white/40 backdrop-blur-[0.5px] z-0 pointer-events-none" />

      {/* 2. Floating Top HUD */}
      <GameHud theme={theme} onPause={() => setIsPaused(true)} />

      {/* 3. The Active Game Area (Edge-to-Edge Canvas) */}
      <main
        key={restartKey}
        className="relative z-10 flex-1 w-full min-h-0 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden mobile-game-viewport"
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-0 sm:p-2 mobile-game-stage">
          {children}
        </div>
      </main>

      {/* 4. Orientation Mismatch Hint */}
      {isMismatch && <RotateHint requiredOrientation={theme.orientation} />}

      {/* 5. Pause Menu */}
      <PauseMenu
        isOpen={isPaused && !isGameOver}
        theme={theme}
        onResume={() => setIsPaused(false)}
        onRestart={handleRestart}
        onHome={onHome}
        onExit={onExit}
      />

      {/* 6. Game Results Screen */}
      {isGameOver && (
        <GameResultScreen
          theme={theme}
          score={score}
          stars={stars}
          correct={correctCount}
          total={totalQuestions}
          durationSec={activity.timeLimitSeconds || 60}
          activityId={activity.id}
          onRestart={handleRestart}
          onExit={onExit}
        />
      )}
    </div>
  );
};

export const GameShell: React.FC<GameShellProps> = (props) => {
  const theme = getGameTheme(props.activity.templateType, props.activity.themeId);
  const isLandscapeTarget = theme.orientation === 'landscape';

  const content = (
    <GameHudContextProvider
      initialTotalQuestions={props.activity.items.length}
      initialTime={props.activity.timeLimitSeconds || 60}
    >
      <GameShellInner {...props} theme={theme} />
    </GameHudContextProvider>
  );

  // If in desktop web mode (not in mobile embed or mobile test mode), wrap in DeviceFrame
  if (!props.isEmbed && !props.isMobileGameMode) {
    return <DeviceFrame isLandscape={isLandscapeTarget}>{content}</DeviceFrame>;
  }

  return content;
};
