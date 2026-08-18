import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Layers, Award, Clock } from 'lucide-react';
import { ClozeQuiz } from './ClozeQuiz';
import { SpacedRepetitionDeck } from './SpacedRepetitionDeck';
import { SRSItem } from '../types';
import { audio } from '../utils/audioService';

interface QuizAndReviewHubProps {
  srsItems: Record<string, SRSItem>;
  setSRSItems: React.Dispatch<React.SetStateAction<Record<string, SRSItem>>>;
  onRefreshStats: () => void;
  defaultSubTab?: 'cloze' | 'srs';
}

export const QuizAndReviewHub: React.FC<QuizAndReviewHubProps> = ({
  srsItems,
  setSRSItems,
  onRefreshStats,
  defaultSubTab = 'cloze',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cloze' | 'srs'>(defaultSubTab);

  // Count due SRS items
  const now = new Date().getTime();
  const dueCount = (Object.values(srsItems) as SRSItem[]).filter(
    (it) => new Date(it.dueDate).getTime() <= now
  ).length;

  return (
    <div id="quiz-review-hub-container" className="space-y-6 w-full max-w-full">
      {/* Sub-navigation Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 p-2 sm:p-2.5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            id="hub-tab-cloze"
            onClick={() => {
              setActiveSubTab('cloze');
              audio.playSanctuaryChime('keystroke');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeSubTab === 'cloze'
                ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Fill-in-the-Blank (Cloze) Quiz</span>
          </button>

          <button
            id="hub-tab-srs"
            onClick={() => {
              setActiveSubTab('srs');
              audio.playSanctuaryChime('keystroke');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer relative ${
              activeSubTab === 'srs'
                ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Spaced Repetition (SRS)</span>
            {dueCount > 0 && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeSubTab === 'srs'
                    ? 'bg-neutral-950 text-amber-300'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {dueCount} due
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-neutral-400 font-mono hidden md:block px-2">
          {activeSubTab === 'cloze' ? 'Test instant keyword recall' : 'SM-2 long-term memory scheduler'}
        </div>
      </div>

      {/* Active Sub-Tab Content */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'cloze' ? (
          <motion.div
            key="cloze"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <ClozeQuiz onRefreshStats={onRefreshStats} />
          </motion.div>
        ) : (
          <motion.div
            key="srs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <SpacedRepetitionDeck
              srsItems={srsItems}
              setSRSItems={setSRSItems}
              onRefreshStats={onRefreshStats}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
