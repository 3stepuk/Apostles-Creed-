import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Layers, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Calendar, 
  Volume2, 
  ChevronRight, 
  Eye, 
  Flame,
  Award,
  BookOpen
} from 'lucide-react';
import { CREED_ARTICLES, FULL_APOSTLES_CREED_ENGLISH, FULL_APOSTLES_CREED_LATIN } from '../data/creedData';
import { SRSItem, UserStats } from '../types';
import { calculateSM2, saveSRSItems, generateFirstLettersOnly, recordActivity } from '../utils/srsEngine';
import { audio } from '../utils/audioService';

interface SpacedRepetitionDeckProps {
  srsItems: Record<string, SRSItem>;
  setSRSItems: React.Dispatch<React.SetStateAction<Record<string, SRSItem>>>;
  onRefreshStats: () => void;
}

export const SpacedRepetitionDeck: React.FC<SpacedRepetitionDeckProps> = ({
  srsItems,
  setSRSItems,
  onRefreshStats,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFirstLetterHint, setShowFirstLetterHint] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'due' | 'all'>('due');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter items based on due status or all
  const activeDeck = useMemo(() => {
    const now = new Date().getTime();
    const items = Object.values(srsItems) as SRSItem[];

    if (reviewFilter === 'due') {
      const dueItems = items.filter(it => new Date(it.dueDate).getTime() <= now);
      return dueItems.length > 0 ? dueItems : items; // Fallback to all if none strictly due
    }
    return items;
  }, [srsItems, reviewFilter]);

  const currentItem = activeDeck[currentIndex] || activeDeck[0];

  // Resolve Article content
  const articleContent = useMemo(() => {
    if (!currentItem) return null;
    if (currentItem.id === 'creed-full') {
      return {
        isFull: true,
        title: "Full Apostles' Creed (Opening of Holy Rosary)",
        traditionalApostle: "The Twelve Apostles",
        textEnglish: FULL_APOSTLES_CREED_ENGLISH,
        textLatin: FULL_APOSTLES_CREED_LATIN,
        theologicalSummary: "The complete rule of Christian faith proclaimed at the foot of the Crucifix.",
        keyDogmas: ["Trinity", "Incarnation", "Paschal Mystery", "Holy Church", "Resurrection & Life Everlasting"],
        cccReferences: [{ section: "CCC 185-197", description: "The Creeds of the Church" }],
        rosaryMeditation: "Anchor of the Holy Rosary before the decade mysteries."
      };
    }

    const art = CREED_ARTICLES.find(a => a.id === currentItem.articleId);
    if (!art) return null;
    return {
      isFull: false,
      title: `Article ${art.number}: ${art.traditionalApostle}`,
      traditionalApostle: art.traditionalApostle,
      textEnglish: art.textEnglish,
      textLatin: art.textLatin,
      theologicalSummary: art.theologicalSummary,
      keyDogmas: art.keyDogmas,
      cccReferences: art.cccReferences,
      rosaryMeditation: art.deepExegesis.rosaryMeditation
    };
  }, [currentItem]);

  // First letter hint string
  const firstLetterHint = useMemo(() => {
    if (!articleContent) return '';
    return generateFirstLettersOnly(articleContent.textEnglish);
  }, [articleContent]);

  // Handle grade submission
  const handleGrade = (quality: 1 | 2 | 3 | 4) => {
    if (!currentItem) return;

    audio.playSanctuaryChime(quality >= 3 ? 'success' : 'error');

    const updatedItem = calculateSM2(currentItem, quality);
    const newItems = {
      ...srsItems,
      [currentItem.id]: updatedItem
    };

    setSRSItems(newItems);
    saveSRSItems(newItems);

    recordActivity('srs', quality * 25);
    onRefreshStats();

    // Advance or complete
    setIsFlipped(false);
    setShowFirstLetterHint(false);

    if (currentIndex + 1 < activeDeck.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed deck!
      audio.playSanctuaryChime('milestone');
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#ffffff']
      });
      setCurrentIndex(0);
    }
  };

  const dueCount = (Object.values(srsItems) as SRSItem[]).filter(
    it => new Date(it.dueDate).getTime() <= new Date().getTime()
  ).length;

  return (
    <div id="spaced-repetition-container" className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-serif-sacred text-amber-200 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Spaced Repetition Review (SM-2 Engine)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Optimized review intervals prevent forgetting before memory decay sets in.
          </p>
        </div>

        {/* Filter due vs all */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              id="srs-filter-due-btn"
              onClick={() => {
                setReviewFilter('due');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                reviewFilter === 'due'
                  ? 'bg-amber-500 text-neutral-950 font-semibold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>Due Today</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 text-amber-300">
                {dueCount}
              </span>
            </button>
            <button
              id="srs-filter-all-btn"
              onClick={() => {
                setReviewFilter('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                reviewFilter === 'all'
                  ? 'bg-amber-500 text-neutral-950 font-semibold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All 13 Cards
            </button>
          </div>
        </div>
      </div>

      {/* The Active Flashcard */}
      {articleContent && currentItem ? (
        <div className="relative">
          {/* Card Container */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden min-h-[420px] flex flex-col justify-between">
            {/* Background Sacred Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header & Metadata */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-950 text-amber-300 border border-neutral-800 font-semibold">
                  Card {currentIndex + 1} of {activeDeck.length}
                </span>
                <span className="text-xs text-neutral-400 hidden sm:inline">
                  Interval: <strong className="text-neutral-200">{currentItem.interval}d</strong> | Reps: <strong className="text-neutral-200">{currentItem.repetition}</strong> | EF: <strong className="text-neutral-200">{currentItem.easeFactor}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Mastery:</span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {currentItem.masteryScore}%
                </span>
              </div>
            </div>

            {/* Front of Card (Prompt & Retrieval Cue) */}
            {!isFlipped ? (
              <div className="space-y-6 py-6 flex-1 flex flex-col justify-center text-center">
                <div className="space-y-2">
                  <span className="text-xs font-mono tracking-widest text-amber-400/80 uppercase">
                    {articleContent.traditionalApostle}
                  </span>
                  <h3 className="text-xl sm:text-3xl font-bold font-serif-sacred text-amber-100">
                    {articleContent.title}
                  </h3>
                  <p className="text-sm text-neutral-400 max-w-lg mx-auto">
                    {articleContent.theologicalSummary}
                  </p>
                </div>

                {/* Optional First-Letter Mnemonic Hint */}
                {showFirstLetterHint ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 max-w-xl mx-auto"
                  >
                    <div className="text-xs text-neutral-400 mb-1">First-Letter Mnemonic Scaffolding:</div>
                    <div className="font-mono text-base sm:text-lg text-amber-300 tracking-wider">
                      {firstLetterHint}
                    </div>
                  </motion.div>
                ) : (
                  <button
                    id="show-first-letter-hint-btn"
                    onClick={() => setShowFirstLetterHint(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-850 text-neutral-400 hover:text-amber-300 border border-neutral-800 text-xs transition cursor-pointer mx-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Show First-Letter Hint</span>
                  </button>
                )}

                <div className="pt-4">
                  <button
                    id="flip-card-reveal-btn"
                    onClick={() => {
                      setIsFlipped(true);
                      audio.playSanctuaryChime('keystroke');
                    }}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-2xl text-sm sm:text-base transition shadow-lg shadow-amber-500/20 cursor-pointer inline-flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Reveal Answer & Check Recall</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Back of Card (Master English & Latin, Exegesis) */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 py-2 flex-1"
              >
                {/* English Master Text */}
                <div className="p-5 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                    English Liturgical Text:
                  </div>
                  <div className="text-lg sm:text-xl font-serif text-neutral-100 leading-relaxed font-medium">
                    {articleContent.textEnglish}
                  </div>
                </div>

                {/* Latin Text */}
                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                    Latin (Symbolum Apostolorum):
                  </div>
                  <div className="text-sm sm:text-base font-serif italic text-amber-200/90 leading-relaxed">
                    {articleContent.textLatin}
                  </div>
                </div>

                {/* Key Dogmas & Historical Context */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <strong className="text-amber-300 block mb-1">Theological Dogmas:</strong>
                    <ul className="text-neutral-300 list-disc list-inside space-y-0.5">
                      {articleContent.keyDogmas.map(d => <li key={d}>{d}</li>)}
                    </ul>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <strong className="text-amber-300 block mb-1">Historical Context:</strong>
                    <p className="text-neutral-300 leading-relaxed text-xs">
                      {articleContent.historicalContext || articleContent.rosaryMeditation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SRS Grading Action Footer (Visible when flipped) */}
            {isFlipped && (
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <div className="text-center text-xs text-neutral-400">
                  How accurately did you recall this from memory?
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    id="srs-grade-again-btn"
                    onClick={() => handleGrade(1)}
                    className="p-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-200 text-xs font-medium transition cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="font-bold text-sm">1. Again</span>
                    <span className="text-[11px] text-red-400 font-mono">&lt; 1 day</span>
                  </button>

                  <button
                    id="srs-grade-hard-btn"
                    onClick={() => handleGrade(2)}
                    className="p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 text-amber-200 text-xs font-medium transition cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="font-bold text-sm">2. Hard</span>
                    <span className="text-[11px] text-amber-400 font-mono">1-2 days</span>
                  </button>

                  <button
                    id="srs-grade-good-btn"
                    onClick={() => handleGrade(3)}
                    className="p-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-200 text-xs font-medium transition cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="font-bold text-sm">3. Good</span>
                    <span className="text-[11px] text-blue-400 font-mono">3-6 days</span>
                  </button>

                  <button
                    id="srs-grade-easy-btn"
                    onClick={() => handleGrade(4)}
                    className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-200 text-xs font-medium transition cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="font-bold text-sm">4. Easy</span>
                    <span className="text-[11px] text-emerald-400 font-mono">7+ days</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-neutral-900 rounded-3xl border border-neutral-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold font-serif-sacred text-neutral-100">All Due Reviews Completed!</h3>
          <p className="text-sm text-neutral-400">
            Great job! You have no cards due right now. You can switch to "All 13 Cards" above for extra practice.
          </p>
        </div>
      )}
    </div>
  );
};
