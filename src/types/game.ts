export type TemplateType =
  | 'wheel'
  | 'memory'
  | 'quiz'
  | 'anagram'
  | 'box'
  | 'truefalse'
  | 'categorize'
  | 'wordsearch'
  | 'hangman'
  | 'whack'
  | 'airplane'
  | 'balloon'
  | 'timeline'
  | 'dragword'
  | 'cardsort'
  | 'race'
  | 'tower';

export interface ActivityItem {
  id: string;
  question?: string; // Text can be optional if image is provided
  answer: string;    // Target category, solution, or correct option
  options?: string[]; // for quiz
  image?: string;    // Image URL, base64 data, or illustration for question
  answerImage?: string; // Image for answer/target if applicable
  category?: string; // Explicit category if used
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  templateType: TemplateType;
  subject: string;
  gradeLevel: string;
  items: ActivityItem[];
  timeLimitSeconds?: number;
  maxScore?: number;
  categories?: string[];
  boxColors?: Record<string, number>;
  boxImages?: Record<string, string>; // Category/Basket image mapping: category -> image URL/Base64
  creatorName?: string;
  playCount: number;
  themeId?: string; // Optional custom theme ID (default matches templateType)
}
