export interface CreedPhraseExplanation {
  id: string;
  order: number;
  phraseEnglish: string;
  phraseLatin: string;
  articleId: number;
  trinitarianSection: 'Father' | 'Son' | 'Holy Spirit';
  theologicalMeaning: string;
  historicalContext: string;
  whyItMattersToday: string;
  keyScripture: {
    verse: string;
    text: string;
  };
  rosaryConnection: string;
  etymologyNotes?: { term: string; origin: string; meaning: string };
  cccReference?: string;
}

export interface CreedArticle {
  id: number;
  number: number;
  traditionalApostle: string;
  apostleSymbol: string;
  trinitarianSection: 'Father' | 'Son' | 'Holy Spirit';
  textEnglish: string;
  textLatin: string;
  phoneticBreakdown?: string;
  theologicalSummary: string;
  keyDogmas: string[];
  cccReferences: {
    section: string;
    description: string;
  }[];
  scriptureReferences: {
    verse: string;
    text: string;
  }[];
  deepExegesis: {
    historicalContext: string;
    greekLatinRoots: { term: string; origin: string; meaning: string }[];
    rosaryMeditation: string;
    memoryHook: string;
  };
  keywordsToTest: string[];
}

export interface SRSItem {
  id: string; // 'article-1', 'creed-full', etc.
  title: string;
  articleId?: number;
  interval: number; // in days
  repetition: number;
  easeFactor: number; // starts at 2.5
  dueDate: string; // ISO date string
  lastReviewedDate?: string;
  streak: number;
  totalReviews: number;
  masteryScore: number; // 0 - 100%
}

export type FadingLevel = 
  | 'full'          // Full text visible
  | 'keywords_only' // Only key theological nouns visible, others blurred
  | 'first_letters' // Every word replaced by its first letter ("I b i G, t F a...")
  | 'first_letter_interactive' // Interactive typing: press key of first letter to advance
  | 'hidden_fill'   // Dropdown/type blank words
  | 'full_hidden';  // Complete recall from memory

export type ActiveTab = 
  | 'first_letter' 
  | 'srs_review' 
  | 'deep_theology' 
  | 'cloze_quiz' 
  | 'rosary_guide';

export interface UserStats {
  streakDays: number;
  lastActiveDate: string;
  totalReviewsDone: number;
  firstLetterCompletedCount: number;
  clozeCompletedCount: number;
  averageAccuracy: number;
  masteryPercentage: number;
}
