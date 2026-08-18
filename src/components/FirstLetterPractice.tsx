import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Keyboard, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Play, 
  Square, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Copy,
  Check,
  Flame,
  Zap,
  ArrowRight,
  BookOpen,
  Shuffle,
  Mic
} from 'lucide-react';
import { CREED_ARTICLES, FULL_APOSTLES_CREED_ENGLISH, FULL_APOSTLES_CREED_LATIN } from '../data/creedData';
import { tokenizeText, WordToken, recordActivity } from '../utils/srsEngine';
import { audio } from '../utils/audioService';

type SubView = 'scaffolding' | 'typer' | 'scratchpad';
type Language = 'en' | 'la';

interface FirstLetterPracticeProps {
  onArticleSelect?: (articleId: number) => void;
  onSwitchToVoice?: () => void;
  onSwitchToTheology?: () => void;
  onSwitchToQuiz?: () => void;
  onRefreshStats: () => void;
}

export const FirstLetterPractice: React.FC<FirstLetterPracticeProps> = ({
  onArticleSelect,
  onSwitchToVoice,
  onSwitchToTheology,
  onSwitchToQuiz,
  onRefreshStats,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<number | 'all'>('all');
  const [language, setLanguage] = useState<Language>('en');
  const [subView, setSubView] = useState<SubView>('scaffolding');
  const [fadingLevel, setFadingLevel] = useState<number>(2); // 1 = full, 2 = first letters, 3 = keywords hidden, 4 = blanks
  const [revealedWordIndices, setRevealedWordIndices] = useState<Set<number>>(new Set());
  const [copiedAcronym, setCopiedAcronym] = useState(false);
  const [isReciting, setIsReciting] = useState(false);
  const [highlightedCharIdx, setHighlightedCharIdx] = useState<number | null>(null);

  // Typer state
  const [typerWordIndex, setTyperWordIndex] = useState(0);
  const [typerMistakes, setTyperMistakes] = useState(0);
  const [typerStartTime, setTyperStartTime] = useState<number | null>(null);
  const [typerEndTime, setTyperEndTime] = useState<number | null>(null);
  const [typerStreak, setTyperStreak] = useState(0);
  const [lastTypedKey, setLastTypedKey] = useState<string | null>(null);
  const [isKeyError, setIsKeyError] = useState(false);
  const typerContainerRef = useRef<HTMLDivElement>(null);

  // Scratchpad state
  const [scratchpadInput, setScratchpadInput] = useState('');
  const [showScratchpadDiff, setShowScratchpadDiff] = useState(false);

  // Get active text
  const currentText = useMemo(() => {
    if (selectedArticleId === 'all') {
      return language === 'en' ? FULL_APOSTLES_CREED_ENGLISH : FULL_APOSTLES_CREED_LATIN;
    }
    const art = CREED_ARTICLES.find(a => a.id === selectedArticleId);
    if (!art) return FULL_APOSTLES_CREED_ENGLISH;
    return language === 'en' ? art.textEnglish : art.textLatin;
  }, [selectedArticleId, language]);

  // Extract all keywords for the selected scope
  const activeKeywords = useMemo(() => {
    if (selectedArticleId === 'all') {
      return CREED_ARTICLES.flatMap(a => a.keywordsToTest);
    }
    const art = CREED_ARTICLES.find(a => a.id === selectedArticleId);
    return art ? art.keywordsToTest : [];
  }, [selectedArticleId]);

  // Tokenize the current text
  const tokens = useMemo(() => {
    return tokenizeText(currentText, activeKeywords);
  }, [currentText, activeKeywords]);

  // Reset typer on text change or mode switch
  useEffect(() => {
    setTyperWordIndex(0);
    setTyperMistakes(0);
    setTyperStartTime(null);
    setTyperEndTime(null);
    setTyperStreak(0);
    setRevealedWordIndices(new Set());
    setHighlightedCharIdx(null);
    if (audio.isSpeaking()) audio.stopSpeech();
    setIsReciting(false);
  }, [selectedArticleId, language, subView]);

  // Speech recitation toggle
  const handleToggleRecitation = () => {
    if (isReciting) {
      audio.stopSpeech();
      setIsReciting(false);
      setHighlightedCharIdx(null);
    } else {
      setIsReciting(true);
      audio.speakText(
        currentText,
        language,
        0.85,
        (_wordIdx, charIdx) => {
          setHighlightedCharIdx(charIdx);
        },
        () => {
          setIsReciting(false);
          setHighlightedCharIdx(null);
        }
      );
    }
  };

  // Keyboard handler for First-Letter Typer
  useEffect(() => {
    if (subView !== 'typer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys or functional keys
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Tab' || e.key === 'Escape') return;

      // Handle backspace or undo if desired
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (typerWordIndex > 0) {
          setTyperWordIndex(prev => prev - 1);
        }
        return;
      }

      // Check if pressed key matches expected first letter (case-insensitive)
      if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        e.preventDefault();
        const currentToken = tokens[typerWordIndex];
        if (!currentToken || !currentToken.firstLetter) return;

        const expectedLetter = currentToken.firstLetter.toLowerCase();
        const typedLetter = e.key.toLowerCase();

        // Start timer if not started
        if (!typerStartTime) {
          setTyperStartTime(Date.now());
        }

        if (typedLetter === expectedLetter) {
          // Correct!
          audio.playSanctuaryChime('keystroke');
          setLastTypedKey(e.key);
          setIsKeyError(false);
          setTyperStreak(prev => prev + 1);

          const nextIdx = typerWordIndex + 1;
          setTyperWordIndex(nextIdx);

          // Check if completed
          if (nextIdx >= tokens.length) {
            const end = Date.now();
            setTyperEndTime(end);
            audio.playSanctuaryChime('milestone');
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#fbbf24', '#d97706', '#ffffff']
            });

            // Calculate accuracy & record activity
            const totalChars = tokens.length;
            const accuracy = Math.max(10, Math.round(((totalChars - typerMistakes) / totalChars) * 100));
            recordActivity('first_letter', accuracy);
            onRefreshStats();
          }
        } else {
          // Error
          audio.playSanctuaryChime('error');
          setIsKeyError(true);
          setLastTypedKey(e.key);
          setTyperMistakes(prev => prev + 1);
          setTyperStreak(0);
          setTimeout(() => setIsKeyError(false), 400);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [subView, typerWordIndex, tokens, typerStartTime, typerMistakes, onRefreshStats]);

  // Handle single word click to toggle reveal in scaffolding mode
  const toggleRevealWord = (idx: number) => {
    setRevealedWordIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Copy full acronym text to clipboard
  const handleCopyAcronym = () => {
    const acronym = tokens.map(t => `${t.leadingPunctuation}${t.firstLetter}${t.trailingPunctuation}`).join(' ');
    navigator.clipboard.writeText(acronym);
    setCopiedAcronym(true);
    setTimeout(() => setCopiedAcronym(false), 2000);
  };

  // Typer calculations
  const totalWords = tokens.length;
  const isTyperCompleted = typerWordIndex >= totalWords && totalWords > 0;
  const elapsedSeconds = typerStartTime 
    ? Math.round(((typerEndTime || Date.now()) - typerStartTime) / 1000) 
    : 0;
  const wpm = elapsedSeconds > 2 
    ? Math.round((typerWordIndex / (elapsedSeconds / 60))) 
    : 0;
  const accuracyPercent = totalWords > 0 
    ? Math.max(0, Math.round(((typerWordIndex - typerMistakes) / Math.max(1, typerWordIndex)) * 100)) 
    : 100;

  return (
    <div id="first-letter-practice-container" className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Row 1: Mode Switcher & Scope Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Practice Method Sub-tabs */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              id="subview-scaffolding-btn"
              onClick={() => setSubView('scaffolding')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                subView === 'scaffolding'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fading Scaffolding</span>
            </button>
            <button
              id="subview-typer-btn"
              onClick={() => setSubView('typer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                subView === 'typer'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>First-Letter Typer</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-mono">Active</span>
            </button>
            <button
              id="subview-scratchpad-btn"
              onClick={() => setSubView('scratchpad')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                subView === 'scratchpad'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Self-Check Scratchpad</span>
            </button>
          </div>

          {/* Scope Selector: Entire Creed vs Individual Article */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium hidden sm:inline">Scope:</span>
            <select
              id="creed-article-scope-select"
              value={selectedArticleId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedArticleId(val === 'all' ? 'all' : Number(val));
              }}
              aria-label="Select Creed Article Scope"
              className="bg-neutral-950 border border-neutral-750 text-neutral-200 text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Full Creed (All 12 Articles Combined)</option>
              {CREED_ARTICLES.map((art) => (
                <option key={art.id} value={art.id}>
                  Art {art.number}: {art.traditionalApostle} — {art.textEnglish.slice(0, 32)}...
                </option>
              ))}
            </select>

            {/* Language toggle */}
            <div className="flex items-center bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
                  language === 'en' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('la')}
                className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
                  language === 'la' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                LAT
              </button>
            </div>

            {/* Audio recitation button */}
            <button
              id="recite-audio-btn"
              onClick={handleToggleRecitation}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                isReciting
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
              title="Recite aloud with speech cadence"
            >
              {isReciting ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isReciting ? 'Stop Recitation' : 'Recite Aloud'}</span>
            </button>

            {/* Switch to Voice Recitation Mode */}
            {onSwitchToVoice && (
              <button
                id="first-letter-switch-voice-btn"
                onClick={onSwitchToVoice}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                title="Switch to Voice-In Oral Reciter"
              >
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Voice & Check</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Subview Specific Controls */}
        {subView === 'scaffolding' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Fading Level:</span>
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                {[
                  { level: 1, label: '1. Full Text' },
                  { level: 2, label: '2. First Letters Only (Mnemonic)' },
                  { level: 3, label: '3. First Letters + Dogmas' },
                  { level: 4, label: '4. Blanks Mode' },
                ].map((lvl) => (
                  <button
                    key={lvl.level}
                    id={`fading-level-${lvl.level}-btn`}
                    onClick={() => {
                      setFadingLevel(lvl.level);
                      setRevealedWordIndices(new Set());
                      audio.playSanctuaryChime('keystroke');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                      fadingLevel === lvl.level
                        ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="reveal-all-words-btn"
                onClick={() => {
                  if (revealedWordIndices.size === tokens.length) {
                    setRevealedWordIndices(new Set());
                  } else {
                    setRevealedWordIndices(new Set(tokens.map((_, i) => i)));
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 transition cursor-pointer"
              >
                {revealedWordIndices.size === tokens.length ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{revealedWordIndices.size === tokens.length ? 'Hide All' : 'Reveal All'}</span>
              </button>

              <button
                id="copy-acronym-btn"
                onClick={handleCopyAcronym}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 transition cursor-pointer"
                title="Copy first-letter string to clipboard"
              >
                {copiedAcronym ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAcronym ? 'Copied' : 'Copy Acronym'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Row 2 (Typer): Live Stats Bar */}
        {subView === 'typer' && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-800/60 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Progress:</span>
                <span className="font-mono font-semibold text-amber-300">
                  {typerWordIndex} / {totalWords} words
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Speed:</span>
                <span className="font-mono font-semibold text-neutral-200">{wpm} WPM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Accuracy:</span>
                <span className={`font-mono font-semibold ${accuracyPercent >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {accuracyPercent}%
                </span>
              </div>
              {typerStreak > 3 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-3.5 h-3.5 animate-bounce" />
                  <span className="font-mono font-semibold">{typerStreak} streak!</span>
                </div>
              )}
            </div>

            <button
              id="reset-typer-btn"
              onClick={() => {
                setTyperWordIndex(0);
                setTyperMistakes(0);
                setTyperStartTime(null);
                setTyperEndTime(null);
                setTyperStreak(0);
                audio.playSanctuaryChime('keystroke');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Typer</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: Scaffolding Progressive Fading Canvas */}
      {subView === 'scaffolding' && (
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl relative">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-800/80">
            <div>
              <h2 className="text-lg font-bold font-serif-sacred text-amber-200">
                {selectedArticleId === 'all' 
                  ? "The Apostles' Creed (Symbolum Apostolorum)" 
                  : `Article ${selectedArticleId}: ${CREED_ARTICLES.find(a => a.id === selectedArticleId)?.traditionalApostle}`
                }
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {fadingLevel === 1 && "Full authoritative text for deep reading & auditory priming."}
                {fadingLevel === 2 && "First-letter mnemonic mode: Each word is represented by its initial letter. Click any word to peek."}
                {fadingLevel === 3 && "First-letter with core theological dogmas revealed for semantic anchors."}
                {fadingLevel === 4 && "Active recall blanks mode: Recall the missing words from memory."}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                {language === 'en' ? 'English Liturgical' : 'Latin Traditional'}
              </span>
            </div>
          </div>

          {/* Rendered Text with Fading Scaffolding */}
          <div className="text-base sm:text-xl sm:leading-relaxed leading-loose font-serif text-neutral-200 tracking-wide select-none">
            {tokens.map((token, index) => {
              const isRevealed = revealedWordIndices.has(index);
              const isKeyword = token.isKeyword;

              let displayText = token.originalWord;
              let isSpecialFormat = false;

              if (fadingLevel === 2) {
                // First letters only
                displayText = isRevealed 
                  ? token.originalWord 
                  : `${token.leadingPunctuation}${token.firstLetter}${token.trailingPunctuation}`;
                isSpecialFormat = !isRevealed;
              } else if (fadingLevel === 3) {
                // First letters for common words, full text for key theological nouns
                if (isKeyword) {
                  displayText = token.originalWord;
                } else {
                  displayText = isRevealed 
                    ? token.originalWord 
                    : `${token.leadingPunctuation}${token.firstLetter}${token.trailingPunctuation}`;
                  isSpecialFormat = !isRevealed;
                }
              } else if (fadingLevel === 4) {
                // Blanks
                displayText = isRevealed 
                  ? token.originalWord 
                  : `${token.leadingPunctuation}_____ ${token.trailingPunctuation}`;
                isSpecialFormat = !isRevealed;
              }

              return (
                <span
                  key={index}
                  id={`token-${index}`}
                  onClick={() => toggleRevealWord(index)}
                  className={`inline-block mr-2 my-1 px-1 py-0.5 rounded transition cursor-pointer ${
                    isSpecialFormat 
                      ? 'font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/30' 
                      : isKeyword && fadingLevel === 3
                        ? 'text-amber-200 underline decoration-amber-500/50 decoration-2 font-medium'
                        : isRevealed
                          ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30'
                          : 'text-neutral-100 hover:text-amber-300'
                  }`}
                  title="Click to peek full word"
                >
                  {displayText}
                </span>
              );
            })}
          </div>

          {/* Quick Tip Footer */}
          <div className="mt-8 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Memory Pro-Tip:</strong> Recite the creed aloud looking ONLY at the first letters. If you hesitate, click the letter to peek.
              </span>
            </div>
            <button
              onClick={() => setSubView('typer')}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              <span>Test with Interactive Typer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: Interactive First-Letter Typer Mode */}
      {subView === 'typer' && (
        <div 
          ref={typerContainerRef}
          className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden"
        >
          {/* Live Progress Bar */}
          <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-850">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
              initial={{ width: 0 }}
              animate={{ width: `${(typerWordIndex / Math.max(1, totalWords)) * 100}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>

          {/* Completion State Banner */}
          {isTyperCompleted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-center space-y-4"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif-sacred text-amber-200">
                  Deo Gratias! Recitation Completed
                </h3>
                <p className="text-sm text-neutral-300 mt-1">
                  You successfully retrieved all {totalWords} words from memory cues!
                </p>
              </div>

              <div className="flex justify-center gap-6 text-sm">
                <div className="bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 block text-xs">Time:</span>
                  <span className="font-mono font-bold text-neutral-100">{elapsedSeconds}s</span>
                </div>
                <div className="bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 block text-xs">Speed:</span>
                  <span className="font-mono font-bold text-amber-300">{wpm} WPM</span>
                </div>
                <div className="bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 block text-xs">Accuracy:</span>
                  <span className="font-mono font-bold text-emerald-400">{accuracyPercent}%</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  id="try-again-typer-btn"
                  onClick={() => {
                    setTyperWordIndex(0);
                    setTyperMistakes(0);
                    setTyperStartTime(null);
                    setTyperEndTime(null);
                    setTyperStreak(0);
                    audio.playSanctuaryChime('keystroke');
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl text-sm transition shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Practice Again
                </button>
              </div>
            </motion.div>
          ) : (
            /* Active Interactive Words Stream */
            <div className="space-y-6">
              {/* The Interactive Text Display */}
              <div className="text-lg sm:text-2xl sm:leading-relaxed leading-loose font-serif tracking-wide min-h-[160px] p-4 sm:p-6 bg-neutral-950/80 rounded-xl border border-neutral-800 select-none">
                {tokens.map((token, index) => {
                  const isPast = index < typerWordIndex;
                  const isCurrent = index === typerWordIndex;
                  const isFuture = index > typerWordIndex;

                  return (
                    <span
                      key={index}
                      id={`typer-token-${index}`}
                      className={`inline-block mr-2 my-1 px-1.5 py-0.5 rounded transition-all duration-150 ${
                        isPast
                          ? 'text-neutral-100 font-normal bg-neutral-900/60'
                          : isCurrent
                            ? `font-mono font-bold text-amber-300 bg-amber-500/20 border-2 ${
                                isKeyError ? 'border-red-500 bg-red-950/40 text-red-300 animate-pulse' : 'border-amber-400 ring-2 ring-amber-400/20'
                              } scale-110 shadow-lg`
                            : 'text-neutral-600 font-mono'
                      }`}
                    >
                      {isPast ? (
                        token.originalWord
                      ) : isCurrent ? (
                        <span className="flex items-center gap-0.5">
                          <span>{token.leadingPunctuation}</span>
                          <span className="underline decoration-amber-400 decoration-2">{token.firstLetter}</span>
                          <span className="text-neutral-500 text-sm font-sans">({token.cleanWord.slice(1)})</span>
                          <span>{token.trailingPunctuation}</span>
                        </span>
                      ) : (
                        `${token.leadingPunctuation}${token.firstLetter}${token.trailingPunctuation}`
                      )}
                    </span>
                  );
                })}
              </div>

              {/* Real-Time Cue Prompt & Virtual Mobile Buttons */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-amber-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xl text-amber-300">
                    {tokens[typerWordIndex]?.firstLetter.toUpperCase() || '—'}
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">Next Word to Type:</div>
                    <div className="text-sm font-semibold text-neutral-100">
                      Press key <strong className="font-mono text-amber-300 font-bold text-base px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700">{tokens[typerWordIndex]?.firstLetter.toUpperCase()}</strong> for <span className="italic text-amber-200">"{tokens[typerWordIndex]?.cleanWord}"</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Virtual Keystroke Button for Touch Screens */}
                <div className="flex items-center gap-2">
                  <button
                    id="virtual-type-next-key-btn"
                    onClick={() => {
                      const cur = tokens[typerWordIndex];
                      if (!cur || !cur.firstLetter) return;
                      const fakeEvent = new KeyboardEvent('keydown', { key: cur.firstLetter });
                      window.dispatchEvent(fakeEvent);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold font-mono rounded-xl text-sm transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                  >
                    <span>Tap [{tokens[typerWordIndex]?.firstLetter.toUpperCase()}]</span>
                  </button>
                </div>
              </div>

              <div className="text-center text-xs text-neutral-500">
                Type directly on your physical keyboard. The first letter of each successive word moves the cursor forward.
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Self-Check Scratchpad */}
      {subView === 'scratchpad' && (
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-bold font-serif-sacred text-amber-200">
                Self-Test Recall Scratchpad
              </h3>
              <p className="text-xs text-neutral-400">
                Type the Creed from memory without looking, then click "Compare Accuracy" to test your recall.
              </p>
            </div>
          </div>

          <textarea
            id="scratchpad-textarea"
            value={scratchpadInput}
            onChange={(e) => setScratchpadInput(e.target.value)}
            placeholder="Type the Apostles' Creed from pure memory here... (e.g. I believe in God, the Father almighty...)"
            rows={7}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-200 rounded-xl p-4 text-sm sm:text-base font-serif leading-relaxed focus:outline-none placeholder:text-neutral-600"
          />

          <div className="flex items-center justify-between gap-3">
            <button
              id="clear-scratchpad-btn"
              onClick={() => {
                setScratchpadInput('');
                setShowScratchpadDiff(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs transition cursor-pointer"
            >
              Clear
            </button>

            <button
              id="compare-scratchpad-btn"
              onClick={() => {
                setShowScratchpadDiff(true);
                audio.playSanctuaryChime('success');
              }}
              disabled={scratchpadInput.trim().length === 0}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-semibold rounded-xl text-xs sm:text-sm transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Compare with Master Text</span>
            </button>
          </div>

          {showScratchpadDiff && (
            <div className="mt-6 p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
              <h4 className="font-semibold text-sm text-neutral-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Master Reference Text:
              </h4>
              <div className="p-4 rounded-lg bg-neutral-900 text-sm font-serif text-amber-100/90 leading-relaxed border border-amber-900/30 whitespace-pre-line">
                {currentText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
