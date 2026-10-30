import React from 'react';
import {
  RotateCw,
  Layers,
  Zap,
  Type,
  Gift,
  Hammer,
  Plane,
  Anchor,
  CheckCircle2,
  Sparkles,
  CreditCard,
  FolderDown,
  Search,
  Clock,
  Puzzle,
  Gamepad2,
  Car,
  Building2,
  type LucideProps,
} from 'lucide-react';
import type { TemplateType } from '../../types/game';

interface GameThemeIconProps extends LucideProps {
  templateType: TemplateType | string;
}

export const GameThemeIcon: React.FC<GameThemeIconProps> = ({
  templateType,
  size = 24,
  className = '',
  ...props
}) => {
  const iconProps = { size, className, ...props };

  switch (templateType) {
    case 'wheel':
      return <RotateCw {...iconProps} />;
    case 'memory':
      return <Layers {...iconProps} />;
    case 'quiz':
      return <Zap {...iconProps} />;
    case 'anagram':
      return <Type {...iconProps} />;
    case 'box':
      return <Gift {...iconProps} />;
    case 'whack':
      return <Hammer {...iconProps} />;
    case 'airplane':
      return <Plane {...iconProps} />;
    case 'hangman':
      return <Anchor {...iconProps} />;
    case 'truefalse':
      return <CheckCircle2 {...iconProps} />;
    case 'balloon':
      return <Sparkles {...iconProps} />;
    case 'cardsort':
      return <CreditCard {...iconProps} />;
    case 'categorize':
      return <FolderDown {...iconProps} />;
    case 'wordsearch':
      return <Search {...iconProps} />;
    case 'timeline':
      return <Clock {...iconProps} />;
    case 'dragword':
      return <Puzzle {...iconProps} />;
    case 'race':
      return <Car {...iconProps} />;
    case 'tower':
      return <Building2 {...iconProps} />;
    default:
      return <Gamepad2 {...iconProps} />;
  }
};
