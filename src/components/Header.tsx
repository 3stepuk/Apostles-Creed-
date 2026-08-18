import React from 'react';
import { ActiveTab, UserStats } from '../types';
import { 
  Flame, 
  Brain, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  CheckCircle2,
  Cross
} from 'lucide-react';
import { audio } from '../utils/audioService';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userStats: UserStats;
  dueSRSCount: number;
  onOpenScienceModal: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userStats,
  dueSRSCount,
  onOpenScienceModal,
  isMuted,
  onToggleMute,
}) => {
  const tabs = [
    { id: 'first_letter' as ActiveTab, label: 'First-Letter Recall', icon: Sparkles, badge: 'Core' },
    { id: 'srs_review' as ActiveTab, label: 'Spaced Repetition', icon: Layers, badge: dueSRSCount > 0 ? `${dueSRSCount} due` : undefined },
    { id: 'deep_theology' as ActiveTab, label: 'Theological Depth', icon: BookOpen },
    { id: 'cloze_quiz' as ActiveTab, label: 'Cloze & Quiz', icon: CheckCircle2 },
    { id: 'rosary_guide' as ActiveTab, label: 'Rosary Guide', icon: Cross },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand & stats bar */}
        <div className="flex items-center justify-between py-3 sm:py-4 gap-2">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-neutral-900 to-amber-700/30 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-md shadow-amber-950/40">
              <span className="font-serif-sacred text-lg sm:text-xl font-bold">☩</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-serif-sacred text-amber-100 tracking-wide">
                  Symbolum Apostolorum
                </h1>
                <span className="hidden md:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Rosary Creed
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans hidden sm:block">
                Cognitive Memory Science & Theological Mastery
              </p>
            </div>
          </div>

          {/* User Metrics & Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Daily Streak */}
            <div 
              id="streak-badge"
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-neutral-200"
              title="Daily Active Memory Streak"
            >
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="font-mono font-semibold text-orange-300">{userStats.streakDays}</span>
              <span className="text-[11px] text-neutral-500 hidden sm:inline">day streak</span>
            </div>

            {/* Overall Mastery Meter */}
            <div 
              id="mastery-badge"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs"
            >
              <span className="text-neutral-400">Mastery:</span>
              <div className="w-16 h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500" 
                  style={{ width: `${userStats.masteryPercentage}%` }}
                />
              </div>
              <span className="font-mono text-amber-300 font-semibold">{userStats.masteryPercentage}%</span>
            </div>

            {/* Cognitive Science Info Button */}
            <button
              id="memory-science-info-btn"
              onClick={onOpenScienceModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-medium transition cursor-pointer"
              title="Learn about the memory research behind this app"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Memory Science</span>
            </button>

            {/* Sound Toggle */}
            <button
              id="sound-toggle-btn"
              onClick={onToggleMute}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                isMuted 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300' 
                  : 'bg-neutral-900 border-amber-500/30 text-amber-400 hover:bg-neutral-800'
              }`}
              title={isMuted ? 'Unmute audio cues & speech' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none border-t border-neutral-850/60 pt-2 sm:pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                  audio.playSanctuaryChime('keystroke');
                  setActiveTab(tab.id);
                }}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'text-amber-200 bg-neutral-900 border border-amber-500/30 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    tab.id === 'srs_review' && dueSRSCount > 0 
                      ? 'bg-amber-500 text-neutral-950 font-bold' 
                      : 'bg-neutral-800 text-neutral-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
