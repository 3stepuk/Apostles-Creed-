import { SRSItem, UserStats } from '../types';
import { CREED_ARTICLES } from '../data/creedData';

const SRS_STORAGE_KEY = 'apostles_creed_srs_items_v1';
const STATS_STORAGE_KEY = 'apostles_creed_user_stats_v1';

export function initializeSRSItems(): Record<string, SRSItem> {
  const saved = localStorage.getItem(SRS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }

  const initialItems: Record<string, SRSItem> = {};

  // Full Creed item
  initialItems['creed-full'] = {
    id: 'creed-full',
    title: 'The Full Apostles\' Creed (Rosary Recitation)',
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    dueDate: new Date().toISOString(),
    streak: 0,
    totalReviews: 0,
    masteryScore: 10
  };

  // 12 individual articles
  CREED_ARTICLES.forEach((art) => {
    const key = `article-${art.id}`;
    initialItems[key] = {
      id: key,
      title: `Article ${art.number}: ${art.traditionalApostle}`,
      articleId: art.id,
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
      streak: 0,
      totalReviews: 0,
      masteryScore: 15
    };
  });

  saveSRSItems(initialItems);
  return initialItems;
}

export function saveSRSItems(items: Record<string, SRSItem>) {
  localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(items));
}

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * Quality rating:
 * 1 = Blackout / Again (Incorrect recall)
 * 2 = Hard (Correct with significant hesitation/errors)
 * 3 = Good (Correct with minor hesitation)
 * 4 = Easy (Instant, effortless recall)
 */
export function calculateSM2(item: SRSItem, quality: 1 | 2 | 3 | 4): SRSItem {
  let { interval, repetition, easeFactor, streak, totalReviews } = item;

  totalReviews += 1;

  if (quality < 3) {
    // Failure / Hard reset
    repetition = 0;
    interval = 1;
    streak = 0;
  } else {
    // Success
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = quality === 4 ? 6 : 4;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
    streak += 1;
  }

  // Adjust Ease Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // We map quality 1..4 into 2..5 scale for formula
  const qScale = quality === 1 ? 2 : quality === 2 ? 3 : quality === 3 ? 4 : 5;
  easeFactor = easeFactor + (0.1 - (5 - qScale) * (0.08 + (5 - qScale) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  if (easeFactor > 3.0) easeFactor = 3.0;

  // Calculate next due date
  const now = new Date();
  const nextDueDate = new Date();
  nextDueDate.setDate(now.getDate() + interval);

  // Calculate mastery score (0-100)
  const masteryScore = Math.min(
    100,
    Math.round((repetition * 18 + (quality >= 3 ? 20 : 0) + (easeFactor - 1.3) * 20))
  );

  return {
    ...item,
    interval,
    repetition,
    easeFactor: Number(easeFactor.toFixed(2)),
    dueDate: nextDueDate.toISOString(),
    lastReviewedDate: now.toISOString(),
    streak,
    totalReviews,
    masteryScore
  };
}

export function getUserStats(): UserStats {
  const saved = localStorage.getItem(STATS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }

  const initialStats: UserStats = {
    streakDays: 1,
    lastActiveDate: new Date().toISOString(),
    totalReviewsDone: 0,
    firstLetterCompletedCount: 0,
    clozeCompletedCount: 0,
    averageAccuracy: 92,
    masteryPercentage: 20
  };

  saveUserStats(initialStats);
  return initialStats;
}

export function saveUserStats(stats: UserStats) {
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}

export function recordActivity(type: 'srs' | 'first_letter' | 'cloze', accuracy: number) {
  const stats = getUserStats();
  const today = new Date().toDateString();
  const lastActive = new Date(stats.lastActiveDate).toDateString();

  if (today !== lastActive) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === lastActive) {
      stats.streakDays += 1;
    } else {
      stats.streakDays = 1;
    }
  }

  stats.lastActiveDate = new Date().toISOString();

  if (type === 'srs') stats.totalReviewsDone += 1;
  if (type === 'first_letter') stats.firstLetterCompletedCount += 1;
  if (type === 'cloze') stats.clozeCompletedCount += 1;

  stats.averageAccuracy = Math.round((stats.averageAccuracy * 4 + accuracy) / 5);

  // Recalculate total mastery across all SRS items
  const srsItems = initializeSRSItems();
  const totalMastery = Object.values(srsItems).reduce((sum, it) => sum + it.masteryScore, 0);
  stats.masteryPercentage = Math.round(totalMastery / Object.keys(srsItems).length);

  saveUserStats(stats);
  return stats;
}

/**
 * First letter generator helper
 * Transforms: "I believe in God, the Father almighty,"
 * Into: "I b i G, t F a," or structured word tokens
 */
export interface WordToken {
  originalWord: string;
  cleanWord: string;
  firstLetter: string;
  leadingPunctuation: string;
  trailingPunctuation: string;
  isKeyword: boolean;
}

export function tokenizeText(text: string, keywords: string[] = []): WordToken[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const lowerKeywords = new Set(keywords.map(k => k.toLowerCase()));

  return words.map(raw => {
    const leadingMatch = raw.match(/^[^a-zA-Z0-9]+/);
    const trailingMatch = raw.match(/[^a-zA-Z0-9]+$/);

    const leadingPunctuation = leadingMatch ? leadingMatch[0] : '';
    const trailingPunctuation = trailingMatch ? trailingMatch[0] : '';

    const cleanWord = raw.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
    const firstLetter = cleanWord.length > 0 ? cleanWord[0] : '';
    const isKeyword = lowerKeywords.has(cleanWord.toLowerCase());

    return {
      originalWord: raw,
      cleanWord,
      firstLetter,
      leadingPunctuation,
      trailingPunctuation,
      isKeyword
    };
  });
}

export function generateFirstLettersOnly(text: string): string {
  const lines = text.split('\n');
  return lines.map(line => {
    const tokens = tokenizeText(line);
    return tokens.map(t => {
      if (!t.firstLetter) return t.originalWord;
      return `${t.leadingPunctuation}${t.firstLetter}${t.trailingPunctuation}`;
    }).join(' ');
  }).join('\n');
}
