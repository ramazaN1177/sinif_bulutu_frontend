import React, { useState, useEffect, useCallback } from 'react';
import type { Activity } from '../types/game';
import { getGameTheme } from '../data/gameThemes';
import { GameStartScreen } from './game/GameStartScreen';
import { GameShell } from './game/GameShell';
import { useOrientation } from '../hooks/useOrientation';
import { DeviceFrame } from './game/DeviceFrame';

// Game implementations
import { WheelGame } from '../games/WheelGame';
import { MemoryGame } from '../games/MemoryGame';
import { QuizGame } from '../games/QuizGame';
import { AnagramGame } from '../games/AnagramGame';
import { BoxGame } from '../games/BoxGame';
import { WhackGame } from '../games/WhackGame';
import { AirplaneGame } from '../games/AirplaneGame';
import { HangmanGame } from '../games/HangmanGame';
import { TrueFalseGame } from '../games/TrueFalseGame';
import { BalloonGame } from '../games/BalloonGame';
import { FlashcardGame } from '../games/FlashcardGame';
import { CategorizeGame } from '../games/CategorizeGame';
import { WordSearchGame } from '../games/WordSearchGame';
import { TimelineGame } from '../games/TimelineGame';
import { DragWordGame } from '../games/DragWordGame';
import { RaceGame } from '../games/RaceGame';
import { TowerGame } from '../games/TowerGame';

interface GameModalProps {
  activity: Activity | null;
  onClose: () => void;
  isEmbed?: boolean;
  initialStarted?: boolean;
  isMobileGameMode?: boolean;
}

export const GameModal: React.FC<GameModalProps> = ({
  activity,
  onClose,
  isEmbed = false,
  initialStarted = false,
  isMobileGameMode = false,
}) => {
  if (!activity) return null;

  const [hasStarted, setHasStarted] = useState(initialStarted);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameKey, setGameKey] = useState(0);

  const theme = getGameTheme(activity.templateType, activity.themeId);
  const { isLandscape } = useOrientation(theme.orientation);

  // Sync initialStarted state when activity changes
  useEffect(() => {
    setHasStarted(initialStarted);
  }, [activity.id, initialStarted]);

  // Silence audio on unmount
  useEffect(() => {
    return () => {
      try {
        window.dispatchEvent(new CustomEvent('app_pause_audio'));
      } catch {}
    };
  }, []);

  const handleRestart = useCallback(() => {
    setGameKey((k) => k + 1);
  }, []);

  const renderGame = () => {
    const embedMode = isEmbed || isMobileGameMode;
    switch (activity.templateType) {
      case 'wheel':
        return <WheelGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'memory':
        return <MemoryGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'quiz':
        return <QuizGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'anagram':
        return <AnagramGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'box':
        return <BoxGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'whack':
        return <WhackGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'airplane':
        return <AirplaneGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'hangman':
        return <HangmanGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'truefalse':
        return <TrueFalseGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'balloon':
        return <BalloonGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'cardsort':
        return <FlashcardGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'categorize':
        return (
          <CategorizeGame
            key={gameKey}
            title={activity.title}
            items={activity.items}
            categories={activity.categories}
            boxColors={activity.boxColors}
            boxImages={activity.boxImages}
            isEmbed={embedMode}
          />
        );
      case 'wordsearch':
        return <WordSearchGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'timeline':
        return <TimelineGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'dragword':
        return <DragWordGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'race':
        return <RaceGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'tower':
        return <TowerGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
      default:
        return <WheelGame key={gameKey} title={activity.title} items={activity.items} isEmbed={embedMode} />;
    }
  };

  // 1. Game Start Screen (Unified for both mobile and web)
  if (!hasStarted) {
    const startScreen = (
      <GameStartScreen
        activity={activity}
        theme={theme}
        isLandscape={isLandscape}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
        onStart={() => setHasStarted(true)}
        onBack={onClose}
      />
    );

    // In desktop web teacher preview mode, display inside DeviceFrame
    if (!isEmbed && !isMobileGameMode) {
      return (
        <DeviceFrame isLandscape={theme.orientation === 'landscape'}>
          {startScreen}
        </DeviceFrame>
      );
    }

    return startScreen;
  }

  // 2. Fullscreen Active Game Shell
  return (
    <GameShell
      activity={activity}
      isEmbed={isEmbed}
      isMobileGameMode={isMobileGameMode}
      onExit={onClose}
      onHome={() => setHasStarted(false)}
      onRestartGame={handleRestart}
    >
      {renderGame()}
    </GameShell>
  );
};
