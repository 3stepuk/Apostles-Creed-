import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FirstLetterPractice } from './components/FirstLetterPractice';
import { SpacedRepetitionDeck } from './components/SpacedRepetitionDeck';
import { TheologicalDepth } from './components/TheologicalDepth';
import { ClozeQuiz } from './components/ClozeQuiz';
import { RosaryBeadGuide } from './components/RosaryBeadGuide';
import { MemoryScienceModal } from './components/MemoryScienceModal';
import { ActiveTab, SRSItem, UserStats } from './types';
import { initializeSRSItems, getUserStats } from './utils/srsEngine';
import { audio } from './utils/audioService';
import { Brain, Layers, Sparkles, BookOpen, Flame, Cross } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('first_letter');
  const [srsItems, setSRSItems] = useState<Record<string, SRSItem>>({});
  const [userStats, setUserStats] = useState<UserStats>(getUserStats());
  const [isScienceModalOpen, setIsScienceModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize SRS items from localStorage on mount
  useEffect(() => {
    const items = initializeSRSItems();
    setSRSItems(items);
    setUserStats(getUserStats());
  }, []);

  const handleRefreshStats = () => {
    setUserStats(getUserStats());
    setSRSItems(initializeSRSItems());
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audio.setMuted(next);
  };

  const dueSRSCount = (Object.values(srsItems) as SRSItem[]).filter(
    (it) => new Date(it.dueDate).getTime() <= new Date().getTime()
  ).length;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0c0d10] text-[#e6e6e8] flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Sacred Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userStats={userStats}
        dueSRSCount={dueSRSCount}
        onOpenScienceModal={() => setIsScienceModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'first_letter' && (
          <FirstLetterPractice
            onArticleSelect={() => setActiveTab('deep_theology')}
            onRefreshStats={handleRefreshStats}
          />
        )}

        {activeTab === 'srs_review' && (
          <SpacedRepetitionDeck
            srsItems={srsItems}
            setSRSItems={setSRSItems}
            onRefreshStats={handleRefreshStats}
          />
        )}

        {activeTab === 'deep_theology' && (
          <TheologicalDepth
            onPracticeArticle={() => setActiveTab('first_letter')}
          />
        )}

        {activeTab === 'cloze_quiz' && (
          <ClozeQuiz onRefreshStats={handleRefreshStats} />
        )}

        {activeTab === 'rosary_guide' && (
          <RosaryBeadGuide
            onPracticeCreed={() => setActiveTab('first_letter')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-serif-sacred text-amber-300 text-sm font-bold">☩</span>
            <span className="text-neutral-400 font-medium">
              Symbolum Apostolorum — Apostles' Creed Memory & Study
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setIsScienceModalOpen(true)}
              className="hover:text-amber-300 transition cursor-pointer"
            >
              Cognitive Memory Principles
            </button>
            <span>•</span>
            <span>Holy Rosary Opening Companion</span>
          </div>
        </div>
      </footer>

      {/* Memory Science Research Modal */}
      <MemoryScienceModal
        isOpen={isScienceModalOpen}
        onClose={() => setIsScienceModalOpen(false)}
      />
    </div>
  );
}
