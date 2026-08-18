import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ArrowRight, 
  Play, 
  Square, 
  Volume2, 
  BookOpen, 
  History, 
  Layers, 
  Award, 
  Quote, 
  HelpCircle,
  Eye,
  EyeOff,
  Flame,
  ChevronRight
} from 'lucide-react';
import { CREED_ARTICLES, CREED_PHRASE_EXPLANATIONS, FULL_APOSTLES_CREED_ENGLISH } from '../data/creedData';
import { VoiceStageResult, VoiceWordMatch, UserStats } from '../types';
import { useSpeechRecog } from '../utils/useSpeechRecog';
import { evaluateSpokenStage } from '../utils/voiceMatcher';
import { audio } from '../utils/audioService';
import { recordActivity } from '../utils/srsEngine';

interface VoiceStageReciterProps {
  onRefreshStats: () => void;
  onExploreTheology: (articleId?: number) => void;
}

type StageBreakdownMode = 'articles' | 'phrases' | 'trinitarian';

interface StageItem {
  stageNumber: number;
  stageTitle: string;
  subtitle?: string;
  targetEnglish: string;
  targetLatin?: string;
  theologicalInsight: string;
  historicalContext: string;
  articleId: number;
}

export const VoiceStageReciter: React.FC<VoiceStageReciterProps> = ({
  onRefreshStats,
  onExploreTheology,
}) => {
  const [breakdownMode, setBreakdownMode] = useState<StageBreakdownMode>('articles');
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageResult, setStageResult] = useState<VoiceStageResult | null>(null);
  const [showPromptHint, setShowPromptHint] = useState<boolean>(true);
  const [hintType, setHintType] = useState<'first_letters' | 'full_text' | 'none'>('first_letters');
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);
  const [isCompletedSession, setIsCompletedSession] = useState<boolean>(false);
  const [sessionResults, setSessionResults] = useState<VoiceStageResult[]>([]);
  const [isPlayingModelAudio, setIsPlayingModelAudio] = useState(false);
  const [manualInputFallback, setManualInputFallback] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Speech Recognition hook
  const {
    isListening,
    transcript,
    interimTranscript,
    fullSpokenText,
    setTranscript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecog('en-US');

  // Build the list of stages depending on the chosen mode
  const stages: StageItem[] = useMemo(() => {
    if (breakdownMode === 'articles') {
      return CREED_ARTICLES.map((art) => ({
        stageNumber: art.number,
        stageTitle: `Article ${art.number}: ${art.traditionalApostle}`,
        subtitle: `${art.trinitarianSection} • ${art.apostleSymbol}`,
        targetEnglish: art.textEnglish,
        targetLatin: art.textLatin,
        theologicalInsight: art.theologicalSummary,
        historicalContext: art.deepExegesis.historicalContext,
        articleId: art.id
      }));
    } else if (breakdownMode === 'phrases') {
      return CREED_PHRASE_EXPLANATIONS.map((phr) => ({
        stageNumber: phr.order,
        stageTitle: `Phrase ${phr.order}: ${phr.phraseEnglish}`,
        subtitle: `Article #${phr.articleId} • ${phr.trinitarianSection}`,
        targetEnglish: phr.phraseEnglish,
        targetLatin: phr.phraseLatin,
        theologicalInsight: phr.theologicalMeaning,
        historicalContext: phr.historicalContext,
        articleId: phr.articleId
      }));
    } else {
      // 3 Trinitarian movements
      return [
        {
          stageNumber: 1,
          stageTitle: 'Act I: God the Father & The Creation of the Universe',
          subtitle: 'Articles 1 (Creed Foundation)',
          targetEnglish: 'I believe in God, the Father almighty, Creator of heaven and earth,',
          targetLatin: 'Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae,',
          theologicalInsight: 'Affirms the single, supreme Godhead who is loving Father and sovereign Creator ex nihilo of all spiritual and material realities.',
          historicalContext: 'Formulated to refute pagan polytheism and Gnostic dualism, which treated the physical world as inherently corrupted or created by an inferior evil god.',
          articleId: 1
        },
        {
          stageNumber: 2,
          stageTitle: 'Act II: Jesus Christ, His Incarnation, Passion, & Resurrection',
          subtitle: 'Articles 2–7 (The Christological Mystery)',
          targetEnglish: 'and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead.',
          targetLatin: 'et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus, et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos.',
          theologicalInsight: 'The core historical and redemptive confession of the Christian faith: Christ\'s true divinity, authentic human flesh, historical execution under Pilate, victory over the grave, and future return as Judge.',
          historicalContext: 'Anchors the Christian message in real Roman history (Pilate), rejecting Docetism (the lie that Christ was just a phantom) and Arianism (the lie that Christ was merely a created being).',
          articleId: 2
        },
        {
          stageNumber: 3,
          stageTitle: 'Act III: The Holy Spirit, The Church, & Eternal Life',
          subtitle: 'Articles 8–12 (The Pneumatological & Eschatological Fulfillment)',
          targetEnglish: 'I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
          targetLatin: 'Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.',
          theologicalInsight: 'Confesses the Third Person of the Trinity sanctifying the universal Church, offering total remission of sins, and promising bodily resurrection into the Beatific Vision of eternal joy.',
          historicalContext: 'Asserted against the Novatians (who denied forgiveness for severe sins) and Platonists (who mocked bodily resurrection), ending with the Hebrew seal Amen.',
          articleId: 8
        }
      ];
    }
  }, [breakdownMode]);

  const currentStage = stages[currentStageIndex] || stages[0];

  // Helper to generate first letters string
  const firstLetterPrompt = useMemo(() => {
    if (!currentStage) return '';
    return currentStage.targetEnglish
      .split(/\s+/)
      .map(w => {
        const clean = w.replace(/[^a-zA-Z]/g, '');
        const punct = w.replace(/[a-zA-Z]/g, '');
        return clean.length > 0 ? clean[0].toUpperCase() + (punct ? punct : '') : w;
      })
      .join(' ');
  }, [currentStage]);

  // Reset stage state when switching stage
  useEffect(() => {
    resetTranscript();
    setStageResult(null);
    setIsPlayingModelAudio(false);
    setManualInputFallback('');
    if (audio.isSpeaking()) audio.stopSpeech();
  }, [currentStageIndex, breakdownMode]);

  // Toggle Voice Recording
  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      audio.playSanctuaryChime('keystroke');
    } else {
      resetTranscript();
      setStageResult(null);
      startListening();
      audio.playSanctuaryChime('keystroke');
    }
  };

  // Evaluate the voiced input against the current stage target
  const handleCheckVoicedInput = () => {
    const textToCheck = fullSpokenText.trim() || manualInputFallback.trim();
    if (!textToCheck) {
      audio.playSanctuaryChime('error');
      return;
    }

    stopListening();

    const evaluation = evaluateSpokenStage(
      currentStage.stageNumber,
      currentStage.stageTitle,
      currentStage.targetEnglish,
      textToCheck,
      currentStage.theologicalInsight,
      currentStage.historicalContext
    );

    setStageResult(evaluation);

    if (evaluation.passed) {
      audio.playSanctuaryChime('success');
      recordActivity('voice', evaluation.accuracyScore);
      onRefreshStats();

      // Check if this was the last stage
      if (currentStageIndex === stages.length - 1) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      if (autoAdvance && currentStageIndex < stages.length - 1) {
        setTimeout(() => {
          handleNextStage(evaluation);
        }, 1800);
      }
    } else {
      audio.playSanctuaryChime('error');
      recordActivity('voice', evaluation.accuracyScore);
      onRefreshStats();
    }
  };

  // Advance to next stage
  const handleNextStage = (currResult?: VoiceStageResult) => {
    const res = currResult || stageResult;
    if (res) {
      setSessionResults(prev => [...prev.filter(r => r.stageNumber !== res.stageNumber), res]);
    }

    if (currentStageIndex < stages.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
      audio.playSanctuaryChime('keystroke');
    } else {
      setIsCompletedSession(true);
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 }
      });
    }
  };

  // Play model speech for pronunciation
  const handlePlayModelSpeech = () => {
    if (isPlayingModelAudio) {
      audio.stopSpeech();
      setIsPlayingModelAudio(false);
    } else {
      setIsPlayingModelAudio(true);
      audio.speakText(
        currentStage.targetEnglish,
        'en',
        0.82,
        undefined,
        () => setIsPlayingModelAudio(false)
      );
    }
  };

  const handleRestartSession = () => {
    setCurrentStageIndex(0);
    setSessionResults([]);
    setIsCompletedSession(false);
    setStageResult(null);
    resetTranscript();
    audio.playSanctuaryChime('keystroke');
  };

  // Overall session metrics
  const sessionAvgAccuracy = useMemo(() => {
    if (sessionResults.length === 0) return 0;
    const total = sessionResults.reduce((acc, curr) => acc + curr.accuracyScore, 0);
    return Math.round(total / sessionResults.length);
  }, [sessionResults]);

  return (
    <div id="voice-stage-reciter-container" className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top Controls & Stage Selector Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <Mic className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-serif-sacred text-amber-200">
                Voice-In & Stage-by-Stage Verification
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              Speak the Creed aloud with your microphone. The app transcribes your voice, verifies your accuracy word-by-word, and reveals theological insight stage by stage.
            </p>
          </div>

          {/* Breakdown Mode Selector */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              id="voice-mode-articles-btn"
              onClick={() => {
                setBreakdownMode('articles');
                setCurrentStageIndex(0);
                audio.playSanctuaryChime('keystroke');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                breakdownMode === 'articles'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>12 Articles</span>
            </button>

            <button
              id="voice-mode-phrases-btn"
              onClick={() => {
                setBreakdownMode('phrases');
                setCurrentStageIndex(0);
                audio.playSanctuaryChime('keystroke');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                breakdownMode === 'phrases'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Quote className="w-3.5 h-3.5" />
              <span>21 Phrases</span>
            </button>

            <button
              id="voice-mode-trinitarian-btn"
              onClick={() => {
                setBreakdownMode('trinitarian');
                setCurrentStageIndex(0);
                audio.playSanctuaryChime('keystroke');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                breakdownMode === 'trinitarian'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>3 Trinitarian Acts</span>
            </button>
          </div>
        </div>

        {/* Stage Progress Bar & Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-300 font-semibold">
              Stage {currentStageIndex + 1} of {stages.length}
            </span>
            <div className="w-32 sm:w-48 h-2 rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Hint & Auto-advance controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              <span className="text-[11px] text-neutral-400 px-1.5">Scaffolding:</span>
              <button
                onClick={() => setHintType('first_letters')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  hintType === 'first_letters' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                1st Letters
              </button>
              <button
                onClick={() => setHintType('full_text')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  hintType === 'full_text' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Full Text
              </button>
              <button
                onClick={() => setHintType('none')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  hintType === 'none' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Blind Recall
              </button>
            </div>

            <label className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="rounded border-neutral-700 bg-neutral-950 text-amber-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span>Auto-advance on Pass</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Recitation & Checking Stage Container */}
      {!isCompletedSession ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Stage Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                Stage {currentStageIndex + 1}: {currentStage.subtitle || currentStage.stageTitle}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif-sacred text-amber-100 mt-2">
                {currentStage.stageTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="listen-model-stage-audio-btn"
                onClick={handlePlayModelSpeech}
                className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  isPlayingModelAudio
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:text-white'
                }`}
                title="Listen to model voice pronunciation"
              >
                {isPlayingModelAudio ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingModelAudio ? 'Stop' : 'Model Voice'}</span>
              </button>

              <button
                id="explore-theology-for-stage-btn"
                onClick={() => onExploreTheology(currentStage.articleId)}
                className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-800 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Theology Dossier</span>
              </button>
            </div>
          </div>

          {/* Memory Cue Scaffolding Display */}
          {hintType !== 'none' && (
            <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/20 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-amber-400">
                <span>{hintType === 'first_letters' ? 'First-Letter Memory Prompt:' : 'Target Liturgical Text:'}</span>
                <span className="text-neutral-500">Recite this aloud below</span>
              </div>
              <p className={`font-serif text-lg sm:text-xl leading-relaxed ${
                hintType === 'first_letters' ? 'font-mono text-amber-300 tracking-wider' : 'text-neutral-100 font-medium'
              }`}>
                {hintType === 'first_letters' ? firstLetterPrompt : `"${currentStage.targetEnglish}"`}
              </p>
            </div>
          )}

          {/* Voice Input & Live Transcript Stream */}
          <div className="p-6 rounded-3xl bg-neutral-950/80 border border-neutral-800 space-y-4 text-center">
            {/* Animated Mic Button */}
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                id="voice-mic-main-btn"
                onClick={handleToggleListening}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all transform active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white shadow-xl shadow-red-500/30 ring-8 ring-red-500/20 animate-pulse'
                    : 'bg-gradient-to-br from-amber-500 to-amber-600 text-neutral-950 shadow-xl shadow-amber-500/20 hover:scale-105'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to start speaking'}
              >
                {isListening ? (
                  <MicOff className="w-9 h-9 sm:w-10 sm:h-10 animate-bounce" />
                ) : (
                  <Mic className="w-9 h-9 sm:w-10 sm:h-10" />
                )}
              </button>

              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                  {isListening ? 'Listening to your voice... Speak the phrase now' : 'Click the microphone & recite aloud'}
                </span>
                <p className="text-[11px] text-neutral-400">
                  {isListening ? 'Click again or click "Check My Voiced Input" when done.' : 'Recite clearly in natural cadence.'}
                </p>
              </div>
            </div>

            {/* Live Audio Waves Visualizer (while listening) */}
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 py-2">
                {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50].map((height, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-amber-400 rounded-full"
                    animate={{ height: [`${Math.max(8, height * 0.2)}px`, `${height * 0.4}px`, `${Math.max(8, height * 0.15)}px`] }}
                    transition={{ repeat: Infinity, duration: 0.6 + (i % 3) * 0.2, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            )}

            {/* Live Transcript Display Box */}
            <div className="min-h-[70px] p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-left">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-1 border-b border-neutral-800/60 mb-2">
                <span>Live Voice Stream:</span>
                {fullSpokenText && (
                  <span className="text-amber-400">{fullSpokenText.split(/\s+/).filter(Boolean).length} words detected</span>
                )}
              </div>
              <p className="text-sm sm:text-base font-serif text-neutral-100 italic leading-relaxed">
                {fullSpokenText ? (
                  <span>
                    {transcript}{' '}
                    <span className="text-amber-300/80">{interimTranscript}</span>
                  </span>
                ) : (
                  <span className="text-neutral-500 font-sans text-xs">
                    {isListening ? 'Listening for speech...' : 'Your spoken words will appear here in real time.'}
                  </span>
                )}
              </p>
            </div>

            {/* Error handling / Permissions message */}
            {speechError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{speechError}</span>
                </div>
                <button
                  onClick={() => setShowManualInput(true)}
                  className="underline text-amber-300 font-medium whitespace-nowrap cursor-pointer"
                >
                  Type manually instead
                </button>
              </div>
            )}

            {/* Manual fallback input (if user prefers typing or speech API denied) */}
            {showManualInput && (
              <div className="space-y-2 text-left pt-2 border-t border-neutral-800">
                <span className="text-xs font-mono text-neutral-400">Manual text fallback:</span>
                <input
                  type="text"
                  value={manualInputFallback}
                  onChange={(e) => setManualInputFallback(e.target.value)}
                  placeholder="Type what you voiced to check recall..."
                  className="w-full bg-neutral-900 border border-neutral-750 focus:border-amber-500 rounded-xl p-3 text-xs sm:text-sm text-neutral-200 focus:outline-none"
                />
              </div>
            )}

            {/* Action Buttons: Check Voice Input or Reset */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="check-voice-input-btn"
                onClick={handleCheckVoicedInput}
                disabled={!fullSpokenText.trim() && !manualInputFallback.trim()}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                  fullSpokenText.trim() || manualInputFallback.trim()
                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Check What You Voiced In</span>
              </button>

              <button
                id="clear-voice-input-btn"
                onClick={() => {
                  resetTranscript();
                  setManualInputFallback('');
                  setStageResult(null);
                  audio.playSanctuaryChime('keystroke');
                }}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* EVALUATION & VERIFICATION RESULT DOSSIER */}
          <AnimatePresence>
            {stageResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-6 rounded-3xl border space-y-5 ${
                  stageResult.passed
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
                    : 'bg-red-950/20 border-red-500/40 shadow-xl shadow-red-950/20'
                }`}
              >
                {/* Result Score Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-neutral-950 font-bold ${
                      stageResult.passed ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}>
                      {stageResult.passed ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold font-serif-sacred text-neutral-100">
                        {stageResult.passed ? 'Stage Passed! Excellent Recall' : 'Stage Needs Another Pass'}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {stageResult.passed
                          ? 'Your oral recitation closely matched the orthodox liturgical wording.'
                          : 'Review the highlighted words below and retry to achieve greater verbal precision.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 block">Oral Accuracy:</span>
                      <span className={`text-xl sm:text-2xl font-mono font-bold ${
                        stageResult.accuracyScore >= 80 ? 'text-emerald-400' : stageResult.accuracyScore >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {stageResult.accuracyScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Word-by-Word Diff Analysis Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                    <span>Word-by-Word Analysis:</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Spoken Correctly
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Substituted / Approximate
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Omitted
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-sm sm:text-base font-serif leading-loose">
                    {stageResult.wordMatches.map((match, idx) => {
                      if (match.status === 'correct') {
                        return (
                          <span
                            key={idx}
                            className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-medium"
                          >
                            {match.word}
                          </span>
                        );
                      } else if (match.status === 'substituted') {
                        return (
                          <span
                            key={idx}
                            className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-200 border border-amber-500/40 font-medium"
                            title={`Expected "${match.word}", heard "${match.spokenWord}"`}
                          >
                            {match.word} <span className="text-[10px] font-mono text-amber-400">({match.spokenWord})</span>
                          </span>
                        );
                      } else {
                        return (
                          <span
                            key={idx}
                            className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/40 line-through opacity-80 font-medium"
                            title="Omitted word"
                          >
                            {match.word}
                          </span>
                        );
                      }
                    })}
                  </div>
                </div>

                {/* Stage Theological Meaning & Historical Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-mono font-semibold uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Theological Depth for this Stage:</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      {stageResult.theologicalInsight}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-mono font-semibold uppercase tracking-wider">
                      <History className="w-3.5 h-3.5 text-amber-400" />
                      <span>Historical Context & Heresies Refuted:</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      {stageResult.historicalContext}
                    </p>
                  </div>
                </div>

                {/* Stage Navigation & Retry Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
                  <button
                    id="retry-current-stage-btn"
                    onClick={() => {
                      resetTranscript();
                      setStageResult(null);
                      audio.playSanctuaryChime('keystroke');
                    }}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Stage Again</span>
                  </button>

                  <button
                    id="advance-stage-next-btn"
                    onClick={() => handleNextStage()}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{currentStageIndex < stages.length - 1 ? 'Advance to Next Stage' : 'Complete Session'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage Fast Switcher List */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
              Jump to any stage:
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {stages.map((stg, i) => {
                const isCurrent = i === currentStageIndex;
                const pastRes = sessionResults.find(r => r.stageNumber === stg.stageNumber);

                return (
                  <button
                    key={stg.stageNumber}
                    id={`stage-jump-btn-${stg.stageNumber}`}
                    onClick={() => {
                      setCurrentStageIndex(i);
                      audio.playSanctuaryChime('keystroke');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                        : pastRes && pastRes.passed
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    <span>#{stg.stageNumber}</span>
                    {pastRes && pastRes.passed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* FINAL SESSION SUMMARY WHEN ALL STAGES COMPLETED */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <Award className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif-sacred text-amber-100">
              Deo Gratias! Voice Recitation Mastered
            </h3>
            <p className="text-sm text-neutral-300 mt-2 max-w-xl mx-auto">
              You successfully voiced and verified all {stages.length} stages of the Apostles' Creed, combining oral retrieval fluency with deep theological reinforcement.
            </p>
          </div>

          {/* Session Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-xs text-neutral-400 block font-mono">Stages Mastered:</span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
                {sessionResults.filter(r => r.passed).length} / {stages.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-xs text-neutral-400 block font-mono">Average Accuracy:</span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-amber-300">
                {sessionAvgAccuracy}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-xs text-neutral-400 block font-mono">Mode Practiced:</span>
              <span className="text-sm sm:text-base font-serif font-bold text-neutral-100 mt-1 block capitalize">
                {breakdownMode}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              id="voice-practice-again-btn"
              onClick={handleRestartSession}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-2xl text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Another Voice Session</span>
            </button>

            <button
              id="view-full-theology-after-voice-btn"
              onClick={() => onExploreTheology()}
              className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 hover:text-white font-bold rounded-2xl text-sm transition cursor-pointer flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Explore Theological Exegesis</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
