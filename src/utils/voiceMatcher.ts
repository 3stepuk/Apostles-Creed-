import { VoiceWordMatch, VoiceStageResult } from '../types';

// Normalize a word for robust speech comparison
export function cleanWordForComparison(word: string): string {
  if (!word) return '';
  return word
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()'"?]/g, '')
    .trim();
}

// Canonical phonetic/spelling equivalences common in speech-to-text
const HOMOPHONES_MAP: Record<string, string> = {
  'pilot': 'pilate',
  'ponshus': 'pontius',
  'ponteus': 'pontius',
  'all mighty': 'almighty',
  '3rd': 'third',
  '2nd': 'second',
  '1st': 'first',
  'savior': 'saviour',
  'saviour': 'savior',
  'who': 'who',
  'hades': 'hell',
  'dead': 'dead',
  'flesh': 'body',
};

// Levenshtein distance for fuzzy matching words
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Check if two single words are a match (exact, normalized, alias, or close Levenshtein)
export function areWordsEquivalent(target: string, spoken: string): boolean {
  const normTarget = cleanWordForComparison(target);
  const normSpoken = cleanWordForComparison(spoken);

  if (!normTarget || !normSpoken) return false;
  if (normTarget === normSpoken) return true;

  // Check homophone/alias
  if (HOMOPHONES_MAP[normSpoken] === normTarget || HOMOPHONES_MAP[normTarget] === normSpoken) {
    return true;
  }

  // Small edit tolerance for words with length > 4 (e.g., "resurrection" vs "resurection")
  if (normTarget.length >= 4) {
    const dist = levenshteinDistance(normTarget, normSpoken);
    if (normTarget.length <= 6 && dist <= 1) return true;
    if (normTarget.length > 6 && dist <= 2) return true;
  }

  return false;
}

// Compare spoken transcription with target phrase word-by-word
export function evaluateSpokenStage(
  stageNumber: number,
  stageTitle: string,
  targetText: string,
  spokenText: string,
  theologicalInsight?: string,
  historicalContext?: string
): VoiceStageResult {
  const targetWords = targetText.split(/\s+/).filter(Boolean);
  const spokenWords = spokenText.split(/\s+/).filter(Boolean);

  const wordMatches: VoiceWordMatch[] = [];
  let spokenPtr = 0;
  let correctCount = 0;

  for (let i = 0; i < targetWords.length; i++) {
    const targetWord = targetWords[i];
    const cleanTarget = cleanWordForComparison(targetWord);

    // Look ahead in spoken buffer up to 3 words to handle pauses or slight inserts
    let matchFoundIndex = -1;
    for (let s = spokenPtr; s < Math.min(spokenPtr + 3, spokenWords.length); s++) {
      if (areWordsEquivalent(cleanTarget, spokenWords[s])) {
        matchFoundIndex = s;
        break;
      }
    }

    if (matchFoundIndex !== -1) {
      // If words were skipped in spoken, we advanced
      wordMatches.push({
        word: targetWord,
        status: 'correct',
        spokenWord: spokenWords[matchFoundIndex]
      });
      spokenPtr = matchFoundIndex + 1;
      correctCount++;
    } else {
      // Check if current spoken word was an attempted substitution
      if (spokenPtr < spokenWords.length) {
        wordMatches.push({
          word: targetWord,
          status: 'substituted',
          spokenWord: spokenWords[spokenPtr]
        });
        spokenPtr++;
      } else {
        wordMatches.push({
          word: targetWord,
          status: 'missed'
        });
      }
    }
  }

  const accuracyScore = targetWords.length > 0
    ? Math.round((correctCount / targetWords.length) * 100)
    : 0;

  const passed = accuracyScore >= 70;

  return {
    stageNumber,
    stageTitle,
    targetText,
    spokenText,
    accuracyScore,
    wordMatches,
    passed,
    theologicalInsight,
    historicalContext
  };
}
