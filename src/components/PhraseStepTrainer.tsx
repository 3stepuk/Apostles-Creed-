import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Volume2,
  Square,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Mic,
  MicOff,
  Keyboard,
  ArrowRight,
  Flame,
  Check,
  X,
  Layers
} from 'lucide-react';
import { CREED_PHRASE_EXPLANATIONS } from '../data/phraseExplanationsData';
import { CreedPhraseExplanation } from '../types';
import { audio } from '../utils/audioService';
import { useSpeechRecog } from '../utils/useSpeechRecog';
import { evaluateSpokenStage } from '../utils/voiceMatcher';
import { recordActivity } from '../utils/srsEngine';

interface PhraseStepTrainerProps {
  onExploreTheology?: (phraseId: string) => void;
  onSwitchToFullPractice?: () => void;
  onRefreshStats: () => void;
}

type RevealState = 'hidden' | 'first_letters' | 'revealed';
type PracticeMode = 'flashcard' | 'typer' | 'voice';

const PHRASE_MASTERY_STORAGE_KEY = 'creed_phrase_step_mastery_v1';

export const PhraseStepTrainer: React.FC<PhraseStepTrainerProps> = ({
  onExploreTheology,
  onSwitchToFullPractice,
  onRefreshStats,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealState, setRevealState] = useState<RevealState>('hidden');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('flashcard');
  const [showLatin, setShowLatin] = useState(false);
  const [showTheologyNotes, setShowTheologyNotes] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Typer mode states
  const [typedInput, setTypedInput] = useState('');
  const [typeCheckResult, setTypeCheckResult] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const typerInputRef = useRef<HTMLInputElement>(null);

  // Phrase mastery map: phraseId -> 'mastered' | 'learning' | 'unseen'
  const [masteryMap, setMasteryMap] = useState<Record<string, 'mastered' | 'learning'>>(() => {
    try {
      const saved = localStorage.getItem(PHRASE_MASTERY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const phrases = CREED_PHRASE_EXPLANATIONS;
  const currentPhrase = phrases[currentIndex] || phrases[0];

  // Speech recognition for Voice Mode
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecog('en-US');

  // Save mastery map to localStorage
  const saveMastery = (phraseId: string, status: 'mastered' | 'learning') => {
    const updated = { ...masteryMap, [phraseId]: status };
    setMasteryMap(updated);
    try {
      localStorage.setItem(PHRASE_MASTERY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    recordActivity('first_letter', status === 'mastered' ? 100 : 60);
    onRefreshStats();
  };

  // Reset states when moving between phrases
  useEffect(() => {
    setRevealState('hidden');
    setTypedInput('');
    setTypeCheckResult('idle');
    setShowTheologyNotes(false);
    resetTranscript();
    if (isListening) {
      stopListening();
    }
    if (practiceMode === 'typer') {
      setTimeout(() => typerInputRef.current?.focus(), 50);
    }
  }, [currentIndex, practiceMode]);

  // Generate First-Letter Representation
  const firstLetterMask = useMemo(() => {
    return currentPhrase.phraseEnglish
      .split(' ')
      .map((w) => {
        const cleaned = w.replace(/[^a-zA-Z]/g, '');
        const punct = w.replace(/[a-zA-Z]/g, '');
        if (!cleaned) return w;
        return `${cleaned[0]}${'_'.repeat(Math.max(1, cleaned.length - 1))}${punct}`;
      })
      .join(' ');
  }, [currentPhrase]);

  const firstLetterInitialsOnly = useMemo(() => {
    return currentPhrase.phraseEnglish
      .split(' ')
      .map((w) => {
        const cleaned = w.replace(/[^a-zA-Z]/g, '');
        const punct = w.replace(/[a-zA-Z]/g, '');
        if (!cleaned) return w;
        return `${cleaned[0].toUpperCase()}${punct}`;
      })
      .join(' ');
  }, [currentPhrase]);

  // Voice Evaluation
  const voiceEvaluation = useMemo(() => {
    const spoken = (transcript + ' ' + interimTranscript).trim();
    if (!spoken) return null;
    return evaluateSpokenStage(
      currentPhrase.order,
      `Phrase ${currentPhrase.order}`,
      currentPhrase.phraseEnglish,
      spoken,
      currentPhrase.theologicalMeaning,
      currentPhrase.historicalContext
    );
  }, [transcript, interimTranscript, currentPhrase]);

  // Navigation handlers
  const handleNext = () => {
    audio.playSanctuaryChime('keystroke');
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    audio.playSanctuaryChime('keystroke');
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpToPhrase = (idx: number) => {
    audio.playSanctuaryChime('keystroke');
    setCurrentIndex(idx);
  };

  // Pronounce audio
  const handlePlayAudio = () => {
    if (isPlayingAudio) {
      audio.stopSpeech();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    const textToSpeak = showLatin ? currentPhrase.phraseLatin : currentPhrase.phraseEnglish;
    const lang = showLatin ? 'la' : 'en';
    audio.speakText(
      textToSpeak,
      lang,
      0.85,
      undefined,
      () => setIsPlayingAudio(false)
    );
  };

  // Self-rating handlers
  const handleMarkMastered = () => {
    audio.playSanctuaryChime('success');
    confetti({
      particleCount: 28,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff']
    });
    saveMastery(currentPhrase.id, 'mastered');
    setRevealState('revealed');
    // Auto advance after short delay
    if (currentIndex < phrases.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 700);
    }
  };

  const handleMarkNeedPractice = () => {
    audio.playSanctuaryChime('error');
    saveMastery(currentPhrase.id, 'learning');
    setRevealState('revealed');
  };

  // Check typed input
  const handleCheckTyped = (e: React.FormEvent) => {
    e.preventDefault();
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    const isMatch = normalize(typedInput) === normalize(currentPhrase.phraseEnglish);

    if (isMatch) {
      setTypeCheckResult('correct');
      audio.playSanctuaryChime('success');
      saveMastery(currentPhrase.id, 'mastered');
      setRevealState('revealed');
      if (currentIndex < phrases.length - 1) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 900);
      }
    } else {
      setTypeCheckResult('incorrect');
      audio.playSanctuaryChime('error');
      saveMastery(currentPhrase.id, 'learning');
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setRevealState((prev) => (prev === 'revealed' ? 'hidden' : 'revealed'));
        audio.playSanctuaryChime('keystroke');
      } else if (e.key === '1') {
        handleMarkNeedPractice();
      } else if (e.key === '2' || e.key === '3' || e.key === 'Enter') {
        handleMarkMastered();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentPhrase]);

  // Overall phrase mastery stats
  const masteredCount = Object.values(masteryMap).filter((v) => v === 'mastered').length;
  const progressPercent = Math.round((masteredCount / phrases.length) * 100);

  return (
    <div id="phrase-step-trainer" className="max-w-4xl mx-auto space-y-6">
      {/* Friendly Guide Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-serif-sacred font-bold text-lg">☩</span>
              <h2 className="text-base sm:text-lg font-bold text-neutral-100 font-serif-sacred">
                Step-by-Step Creed Trainer
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Phrase {currentIndex + 1} of {phrases.length}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Click through phrase-by-phrase, test your recall, and verify yourself as you advance through the Apostles' Creed.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-neutral-400">Mastered:</div>
              <div className="text-xs font-mono font-bold text-amber-300">
                {masteredCount} / {phrases.length} ({progressPercent}%)
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-neutral-800 flex items-center justify-center relative bg-neutral-950">
              <span className="text-xs font-bold text-amber-400">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Mini 21-Phrase Stepper Bar */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
            <span>Progress: {currentIndex + 1} of 21 phrases</span>
            <span className="font-mono text-amber-400/90">
              Section: {currentPhrase.trinitarianSection}
            </span>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-21 gap-1">
            {phrases.map((phrase, idx) => {
              const status = masteryMap[phrase.id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={phrase.id}
                  id={`stepper-dot-${idx + 1}`}
                  onClick={() => handleJumpToPhrase(idx)}
                  title={`Phrase ${idx + 1}: ${phrase.phraseEnglish}`}
                  className={`h-2.5 sm:h-3 rounded-full transition-all cursor-pointer relative ${
                    isCurrent
                      ? 'bg-amber-400 ring-2 ring-amber-300/80 ring-offset-2 ring-offset-neutral-950 scale-110'
                      : status === 'mastered'
                      ? 'bg-emerald-500 hover:bg-emerald-400'
                      : status === 'learning'
                      ? 'bg-amber-600/80 hover:bg-amber-500'
                      : 'bg-neutral-800 hover:bg-neutral-700'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Phrase Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        {/* Top Card Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          {/* Mode Switcher: Flashcard | Typer | Voice */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              id="phrase-mode-flashcard-btn"
              onClick={() => {
                setPracticeMode('flashcard');
                audio.playSanctuaryChime('keystroke');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                practiceMode === 'flashcard'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Prompt / Reveal</span>
            </button>

            <button
              id="phrase-mode-typer-btn"
              onClick={() => {
                setPracticeMode('typer');
                audio.playSanctuaryChime('keystroke');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                practiceMode === 'typer'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Type-Check</span>
            </button>

            {isSpeechSupported && (
              <button
                id="phrase-mode-voice-btn"
                onClick={() => {
                  setPracticeMode('voice');
                  audio.playSanctuaryChime('keystroke');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  practiceMode === 'voice'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice-Check</span>
              </button>
            )}
          </div>

          {/* Audio Pronunciation & Latin Toggle */}
          <div className="flex items-center gap-2">
            <button
              id="phrase-latin-toggle-btn"
              onClick={() => setShowLatin(!showLatin)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                showLatin
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              title="Show Traditional Latin (Symbolum Apostolorum)"
            >
              {showLatin ? 'Latin: ON' : 'Latin: OFF'}
            </button>

            <button
              id="phrase-audio-pronounce-btn"
              onClick={handlePlayAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Hear reverence recitation"
            >
              {isPlayingAudio ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
            </button>
          </div>
        </div>

        {/* Center Target Display Area */}
        <div className="text-center py-4 sm:py-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 font-mono">
            <span>Article #{currentPhrase.articleId}</span>
            <span>•</span>
            <span className="text-amber-300/90 font-semibold">{currentPhrase.trinitarianSection}</span>
            {masteryMap[currentPhrase.id] === 'mastered' && (
              <>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Mastered
                </span>
              </>
            )}
          </div>

          {/* Flashcard Prompt / Reveal Mode */}
          {practiceMode === 'flashcard' && (
            <div className="min-h-[140px] sm:min-h-[160px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {revealState === 'hidden' && (
                  <motion.div
                    key="hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <p className="text-xl sm:text-2xl md:text-3xl font-serif text-neutral-500 font-mono tracking-wide select-none">
                      {firstLetterMask}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        id="phrase-reveal-btn"
                        onClick={() => {
                          audio.playSanctuaryChime('keystroke');
                          setRevealState('revealed');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Reveal & Check Phrase</span>
                        <span className="text-xs opacity-75 font-mono hidden sm:inline">(Space)</span>
                      </button>

                      <button
                        id="phrase-first-letter-hint-btn"
                        onClick={() => {
                          audio.playSanctuaryChime('keystroke');
                          setRevealState('first_letters');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-amber-300 border border-neutral-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>First-Letter Hint</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {revealState === 'first_letters' && (
                  <motion.div
                    key="first_letters"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <p className="text-2xl sm:text-3xl font-mono text-amber-400 font-bold tracking-widest">
                      {firstLetterInitialsOnly}
                    </p>
                    <p className="text-xs text-neutral-400">
                      Try reciting aloud from these initials before revealing the full phrase!
                    </p>
                    <button
                      id="phrase-reveal-from-hint-btn"
                      onClick={() => {
                        audio.playSanctuaryChime('keystroke');
                        setRevealState('revealed');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer"
                    >
                      Show Full Text
                    </button>
                  </motion.div>
                )}

                {revealState === 'revealed' && (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="space-y-3"
                  >
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif-sacred font-bold text-amber-100 leading-tight">
                      "{currentPhrase.phraseEnglish}"
                    </h3>
                    {showLatin && (
                      <p className="text-base sm:text-lg font-serif italic text-amber-400/90 font-medium">
                        "{currentPhrase.phraseLatin}"
                      </p>
                    )}
                    <button
                      onClick={() => setRevealState('hidden')}
                      className="text-xs text-neutral-500 hover:text-neutral-300 transition underline cursor-pointer pt-1 inline-block"
                    >
                      Hide again to re-test
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Type-Check Mode */}
          {practiceMode === 'typer' && (
            <div className="min-h-[140px] max-w-xl mx-auto space-y-4">
              <p className="text-xs sm:text-sm text-neutral-400">
                Type the phrase from memory and press Enter to check:
              </p>
              <form onSubmit={handleCheckTyped} className="space-y-3">
                <div className="relative">
                  <input
                    ref={typerInputRef}
                    type="text"
                    value={typedInput}
                    onChange={(e) => {
                      setTypedInput(e.target.value);
                      setTypeCheckResult('idle');
                    }}
                    placeholder={`e.g. ${currentPhrase.phraseEnglish.slice(0, 10)}...`}
                    className={`w-full px-4 py-3 rounded-2xl bg-neutral-950 border text-neutral-100 text-base sm:text-lg focus:outline-none transition ${
                      typeCheckResult === 'correct'
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-200'
                        : typeCheckResult === 'incorrect'
                        ? 'border-red-500 bg-red-950/20 text-red-200'
                        : 'border-neutral-750 focus:border-amber-500'
                    }`}
                  />
                  {typeCheckResult === 'correct' && (
                    <div className="absolute right-3 top-3.5 text-emerald-400 flex items-center gap-1 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" /> Correct!
                    </div>
                  )}
                  {typeCheckResult === 'incorrect' && (
                    <div className="absolute right-3 top-3.5 text-red-400 flex items-center gap-1 font-bold text-xs">
                      <X className="w-4 h-4" /> Try again
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRevealState('revealed');
                      audio.playSanctuaryChime('keystroke');
                    }}
                    className="text-xs text-amber-400/80 hover:text-amber-300 underline cursor-pointer"
                  >
                    Peek answer
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition cursor-pointer"
                  >
                    Check Answer (Enter)
                  </button>
                </div>

                {revealState === 'revealed' && (
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm font-serif text-amber-200">
                    "{currentPhrase.phraseEnglish}"
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Voice-Check Mode */}
          {practiceMode === 'voice' && (
            <div className="min-h-[140px] max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-center gap-3">
                <button
                  id="phrase-voice-listen-toggle-btn"
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      resetTranscript();
                      startListening();
                    }
                  }}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                      : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Listening... (Tap to Stop)' : 'Tap & Speak Phrase Aloud'}</span>
                </button>
              </div>

              {/* Spoken Word Live Matching Feedback */}
              {(transcript || interimTranscript) && (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>What we heard:</span>
                    {voiceEvaluation && (
                      <span className={`font-mono font-bold ${
                        voiceEvaluation.isAccurate ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        Accuracy: {voiceEvaluation.accuracy}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-serif text-neutral-200">
                    "{transcript} {interimTranscript}"
                  </p>

                  {voiceEvaluation?.isAccurate && (
                    <div className="pt-2 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Excellent! Spoken accurately with fidelity.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Self-Rating & Assessment Row */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-400 text-center sm:text-left">
            <span className="font-semibold text-neutral-200 block sm:inline">Self-Check:</span> How well did you recall this phrase?
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="phrase-rate-need-practice-btn"
              onClick={handleMarkNeedPractice}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-amber-400 border border-amber-500/30 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Mark for review (Shortcut: 1)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Need Practice</span>
              <span className="text-[10px] text-neutral-500 font-mono hidden md:inline">(1)</span>
            </button>

            <button
              id="phrase-rate-got-it-btn"
              onClick={handleMarkMastered}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Mark mastered and advance (Shortcut: Enter or 2)"
            >
              <Check className="w-4 h-4" />
              <span>Got It Down!</span>
              <span className="text-xs opacity-75 font-mono hidden md:inline">(Enter)</span>
            </button>
          </div>
        </div>

        {/* Primary Stepping Buttons (Previous / Next) */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            id="phrase-prev-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed border-neutral-800 text-neutral-600'
                : 'bg-neutral-950 hover:bg-neutral-850 border-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Phrase</span>
            <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">(←)</span>
          </button>

          {/* Quick Theological Insight Toggle */}
          <button
            id="phrase-theology-notes-btn"
            onClick={() => setShowTheologyNotes(!showTheologyNotes)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              showTheologyNotes
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showTheologyNotes ? 'Hide Theological Context' : 'Why This Phrase Matters'}</span>
          </button>

          <button
            id="phrase-next-btn"
            onClick={handleNext}
            disabled={currentIndex === phrases.length - 1}
            className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentIndex === phrases.length - 1
                ? 'opacity-40 cursor-not-allowed border-neutral-800 text-neutral-600'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-transparent shadow-md shadow-amber-500/20'
            }`}
          >
            <span>Next Phrase</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[10px] opacity-80 font-mono hidden sm:inline">(→)</span>
          </button>
        </div>

        {/* Collapsible Theological Insight Card */}
        <AnimatePresence>
          {showTheologyNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-neutral-800/80 space-y-3 overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2 text-xs sm:text-sm leading-relaxed text-neutral-300">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Theological & Historical Exegesis:
                  </h4>
                  {onExploreTheology && (
                    <button
                      onClick={() => onExploreTheology(currentPhrase.id)}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>Full Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p>
                  <strong className="text-neutral-200">Theological Meaning:</strong> {currentPhrase.theologicalMeaning}
                </p>
                <p className="text-neutral-400">
                  <strong className="text-neutral-300">Historical Defense:</strong> {currentPhrase.historicalContext}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-amber-300/80 font-mono">
                  <span>Scripture: {currentPhrase.keyScripture.verse}</span>
                  {currentPhrase.cccReference && <span>• {currentPhrase.cccReference}</span>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cumulative Creed View: "The Creed So Far" */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-semibold text-neutral-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            The Creed in Progress (Cumulative Recitation):
          </h4>
          <span className="text-xs text-neutral-500 font-mono">
            Phrases 1 to {currentIndex + 1}
          </span>
        </div>

        <p className="text-sm sm:text-base font-serif leading-relaxed text-neutral-400 p-4 rounded-xl bg-neutral-950/60 border border-neutral-850">
          {phrases.slice(0, currentIndex + 1).map((p, idx) => {
            const isLatest = idx === currentIndex;
            return (
              <span
                key={p.id}
                onClick={() => handleJumpToPhrase(idx)}
                className={`transition-colors cursor-pointer mr-1.5 ${
                  isLatest
                    ? 'text-amber-200 font-bold underline decoration-amber-500 decoration-2 underline-offset-4'
                    : masteryMap[p.id] === 'mastered'
                    ? 'text-neutral-200'
                    : 'text-neutral-400'
                }`}
                title={`Click to jump to phrase ${idx + 1}`}
              >
                {p.phraseEnglish}
              </span>
            );
          })}
          {currentIndex < phrases.length - 1 && (
            <span className="text-neutral-600 italic">
              ... ({phrases.length - currentIndex - 1} remaining)
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
