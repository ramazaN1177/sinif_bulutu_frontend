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
  | 'cardsort';

export interface ActivityItem {
  id: string;
  question?: string; // Text can be optional if image is provided
  answer: string;    // Target category, solution, or correct option
  options?: string[]; // for quiz
  image?: string;    // Image URL, base64 data, or illustration
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
  creatorName?: string;
  playCount: number;
}
