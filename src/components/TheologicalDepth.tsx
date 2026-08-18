import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Cross, 
  Sparkles, 
  Play, 
  Square, 
  Edit3, 
  Save, 
  Bookmark, 
  Search,
  History,
  Layers,
  ChevronRight,
  ChevronDown,
  Quote,
  ShieldCheck,
  Heart,
  Sun,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { CREED_ARTICLES, CREED_PHRASE_EXPLANATIONS } from '../data/creedData';
import { CreedArticle, CreedPhraseExplanation } from '../types';
import { audio } from '../utils/audioService';

interface TheologicalDepthProps {
  onPracticeArticle: (articleId?: number) => void;
}

type StudyMode = 'phrases' | 'articles' | 'history';

const NOTES_STORAGE_KEY = 'apostles_creed_article_notes_v1';

export const TheologicalDepth: React.FC<TheologicalDepthProps> = ({ onPracticeArticle }) => {
  const [studyMode, setStudyMode] = useState<StudyMode>('phrases');
  const [selectedSection, setSelectedSection] = useState<'All' | 'Father' | 'Son' | 'Holy Spirit'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Phrase mode state
  const [activePhraseId, setActivePhraseId] = useState<string>('phrase-1');

  // Article mode state
  const [activeArticleId, setActiveArticleId] = useState<number>(1);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [editingNote, setEditingNote] = useState<string>('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Load custom notes
  useEffect(() => {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch {
        // Ignore
      }
    }
  }, []);

  const currentArticle = CREED_ARTICLES.find(a => a.id === activeArticleId) || CREED_ARTICLES[0];
  const currentPhrase = CREED_PHRASE_EXPLANATIONS.find(p => p.id === activePhraseId) || CREED_PHRASE_EXPLANATIONS[0];

  useEffect(() => {
    setEditingNote(notes[currentArticle.id] || '');
    setIsEditingNote(false);
    if (audio.isSpeaking()) audio.stopSpeech();
    setIsPlayingAudio(false);
  }, [activeArticleId, notes]);

  useEffect(() => {
    if (audio.isSpeaking()) audio.stopSpeech();
    setIsPlayingAudio(false);
  }, [activePhraseId, studyMode]);

  const handleSaveNote = () => {
    const updated = {
      ...notes,
      [currentArticle.id]: editingNote
    };
    setNotes(updated);
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
    setIsEditingNote(false);
    audio.playSanctuaryChime('success');
  };

  const handleTogglePhraseAudio = (phrase: CreedPhraseExplanation) => {
    if (isPlayingAudio) {
      audio.stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      audio.speakText(
        phrase.phraseEnglish,
        'en',
        0.85,
        undefined,
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleToggleArticleAudio = (art: CreedArticle) => {
    if (isPlayingAudio) {
      audio.stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      audio.speakText(
        art.textEnglish,
        'en',
        0.85,
        undefined,
        () => setIsPlayingAudio(false)
      );
    }
  };

  // Filtered phrases based on section and search
  const filteredPhrases = useMemo(() => {
    return CREED_PHRASE_EXPLANATIONS.filter((p) => {
      const matchesSection = selectedSection === 'All' || p.trinitarianSection === selectedSection;
      if (!matchesSection) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.phraseEnglish.toLowerCase().includes(q) ||
        p.phraseLatin.toLowerCase().includes(q) ||
        p.theologicalMeaning.toLowerCase().includes(q) ||
        p.historicalContext.toLowerCase().includes(q) ||
        p.whyItMattersToday.toLowerCase().includes(q) ||
        (p.etymologyNotes && p.etymologyNotes.term.toLowerCase().includes(q))
      );
    });
  }, [selectedSection, searchQuery]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return CREED_ARTICLES.filter((a) => {
      const matchesSection = selectedSection === 'All' || a.trinitarianSection === selectedSection;
      if (!matchesSection) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.textEnglish.toLowerCase().includes(q) ||
        a.textLatin.toLowerCase().includes(q) ||
        a.theologicalSummary.toLowerCase().includes(q) ||
        a.traditionalApostle.toLowerCase().includes(q) ||
        a.deepExegesis.historicalContext.toLowerCase().includes(q)
      );
    });
  }, [selectedSection, searchQuery]);

  return (
    <div id="theological-depth-container" className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top Main Navigation Header */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif-sacred text-amber-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Theological Meaning & Historical Context</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 max-w-2xl">
              Understand the spiritual depth, early Church history, heresies refuted, and biblical anchors for every single phrase of the Apostles' Creed.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              id="study-mode-phrases-btn"
              onClick={() => {
                setStudyMode('phrases');
                audio.playSanctuaryChime('keystroke');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                studyMode === 'phrases'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Phrase-by-Phrase (21)</span>
            </button>

            <button
              id="study-mode-articles-btn"
              onClick={() => {
                setStudyMode('articles');
                audio.playSanctuaryChime('keystroke');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                studyMode === 'articles'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>12 Apostolic Articles</span>
            </button>

            <button
              id="study-mode-history-btn"
              onClick={() => {
                setStudyMode('history');
                audio.playSanctuaryChime('keystroke');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                studyMode === 'history'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Creed Origins</span>
            </button>
          </div>
        </div>

        {/* Search & Trinitarian Filters (if in phrases or articles mode) */}
        {studyMode !== 'history' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
            {/* Trinitarian Section Filters */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs overflow-x-auto">
              {(['All', 'Father', 'Son', 'Holy Spirit'] as const).map((sec) => (
                <button
                  key={sec}
                  id={`filter-theology-${sec}`}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-neutral-800 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {sec === 'All' ? 'All Sections' : sec}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phrase, Pilate, Gnosticism, Greek..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: PHRASE-BY-PHRASE STUDY                                            */}
      {/* ========================================================================= */}
      {studyMode === 'phrases' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Phrase List Navigator */}
          <div className="lg:col-span-4 space-y-2 max-h-[780px] overflow-y-auto pr-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 px-1 pb-1">
              Select a phrase ({filteredPhrases.length} available):
            </div>
            {filteredPhrases.map((phrase) => {
              const isSelected = phrase.id === activePhraseId;
              return (
                <button
                  key={phrase.id}
                  id={`phrase-nav-item-${phrase.id}`}
                  onClick={() => {
                    setActivePhraseId(phrase.id);
                    audio.playSanctuaryChime('keystroke');
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                    isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {phrase.order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-serif font-bold text-neutral-100 truncate">
                        {phrase.phraseEnglish}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        phrase.trinitarianSection === 'Father' ? 'bg-blue-950/80 text-blue-300' :
                        phrase.trinitarianSection === 'Son' ? 'bg-red-950/80 text-red-300' : 'bg-emerald-950/80 text-emerald-300'
                      }`}>
                        {phrase.trinitarianSection}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 italic line-clamp-1 font-serif">
                      {phrase.phraseLatin}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: In-Depth Phrase Meaning & History Dossier */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Phrase Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                      Phrase {currentPhrase.order} of 21
                    </span>
                    <span className="text-xs text-neutral-400">
                      Trinitarian Movement: <strong className="text-amber-200">{currentPhrase.trinitarianSection}</strong> (Article #{currentPhrase.articleId})
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif-sacred text-amber-100 mt-2">
                    "{currentPhrase.phraseEnglish}"
                  </h3>
                  <p className="text-sm font-serif italic text-amber-300/80 mt-0.5">
                    {currentPhrase.phraseLatin}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <button
                    id="listen-phrase-audio-btn"
                    onClick={() => handleTogglePhraseAudio(currentPhrase)}
                    className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {isPlayingAudio ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                  </button>

                  <button
                    id="practice-phrase-in-first-letter-btn"
                    onClick={() => onPracticeArticle(currentPhrase.articleId)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Practice Article #{currentPhrase.articleId}</span>
                  </button>
                </div>
              </div>

              {/* 1. Theological Meaning (Accessible & Plain English) */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs uppercase tracking-wider font-semibold">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Theological Meaning & Spiritual Essence</span>
                </div>
                <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
                  {currentPhrase.theologicalMeaning}
                </p>
              </div>

              {/* 2. Historical Context & Heresies Countered */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs uppercase tracking-wider font-semibold">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Historical Context & Early Church Origins</span>
                </div>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  {currentPhrase.historicalContext}
                </p>
              </div>

              {/* 3. Why It Matters Today & Rosary Connection (2 Column Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                    <Sun className="w-4 h-4 text-emerald-400" />
                    <span>Why It Matters For You Today:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {currentPhrase.whyItMattersToday}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                    <Cross className="w-4 h-4 text-amber-400" />
                    <span>Rosary Prayer Connection:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {currentPhrase.rosaryConnection}
                  </p>
                </div>
              </div>

              {/* 4. Scripture Anchor & Linguistic Roots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block font-semibold">
                    Biblical Foundation ({currentPhrase.keyScripture.verse}):
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-300 italic">
                    "{currentPhrase.keyScripture.text}"
                  </p>
                  {currentPhrase.cccReference && (
                    <div className="text-[11px] font-mono text-neutral-500 pt-1">
                      Catechism: <span className="text-amber-300">{currentPhrase.cccReference}</span>
                    </div>
                  )}
                </div>

                {currentPhrase.etymologyNotes ? (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1 text-xs">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block font-semibold">
                      Etymological Root:
                    </span>
                    <div className="flex items-center justify-between font-mono pt-1">
                      <strong className="text-amber-200 text-sm">{currentPhrase.etymologyNotes.term}</strong>
                      <span className="text-neutral-400">{currentPhrase.etymologyNotes.origin}</span>
                    </div>
                    <p className="text-neutral-300 mt-1 leading-snug">
                      {currentPhrase.etymologyNotes.meaning}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xs text-neutral-500 italic">
                    Rooted in the Apostolic Tradition
                  </div>
                )}
              </div>

              {/* Phrase Navigation Footer (Previous / Next) */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80">
                <button
                  id="prev-phrase-btn"
                  disabled={currentPhrase.order === 1}
                  onClick={() => {
                    const prev = CREED_PHRASE_EXPLANATIONS.find(p => p.order === currentPhrase.order - 1);
                    if (prev) {
                      setActivePhraseId(prev.id);
                      audio.playSanctuaryChime('keystroke');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                    currentPhrase.order === 1
                      ? 'opacity-30 border-neutral-800 text-neutral-600 cursor-not-allowed'
                      : 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <span>← Previous Phrase</span>
                </button>

                <span className="text-xs font-mono text-neutral-500">
                  {currentPhrase.order} of {CREED_PHRASE_EXPLANATIONS.length}
                </span>

                <button
                  id="next-phrase-btn"
                  disabled={currentPhrase.order === CREED_PHRASE_EXPLANATIONS.length}
                  onClick={() => {
                    const next = CREED_PHRASE_EXPLANATIONS.find(p => p.order === currentPhrase.order + 1);
                    if (next) {
                      setActivePhraseId(next.id);
                      audio.playSanctuaryChime('keystroke');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                    currentPhrase.order === CREED_PHRASE_EXPLANATIONS.length
                      ? 'opacity-30 border-neutral-800 text-neutral-600 cursor-not-allowed'
                      : 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <span>Next Phrase →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: 12 APOSTOLIC ARTICLES                                             */}
      {/* ========================================================================= */}
      {studyMode === 'articles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Article Quick Selector */}
          <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredArticles.map((art) => {
              const isSelected = art.id === activeArticleId;

              return (
                <button
                  key={art.id}
                  id={`article-list-item-${art.id}`}
                  onClick={() => {
                    setActiveArticleId(art.id);
                    audio.playSanctuaryChime('keystroke');
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                    isSelected 
                      ? 'bg-amber-500 text-neutral-950' 
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {art.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-mono text-amber-400/90 font-medium truncate">
                        {art.traditionalApostle}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                        art.trinitarianSection === 'Father' ? 'bg-blue-950/80 text-blue-300' :
                        art.trinitarianSection === 'Son' ? 'bg-red-950/80 text-red-300' : 'bg-emerald-950/80 text-emerald-300'
                      }`}>
                        {art.trinitarianSection}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-serif line-clamp-1 mt-0.5">
                      {art.textEnglish}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Deep Exegesis Dossier */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
              {/* Ambient Background Accent */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Dossier Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                      Article {currentArticle.number} of 12
                    </span>
                    <span className="text-xs text-neutral-400">
                      Attributed Apostle: <strong className="text-amber-200">{currentArticle.traditionalApostle}</strong> ({currentArticle.apostleSymbol})
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif-sacred text-amber-100 mt-2">
                    {currentArticle.traditionalApostle} — {currentArticle.trinitarianSection}
                  </h3>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    id="dossier-audio-listen-btn"
                    onClick={() => handleToggleArticleAudio(currentArticle)}
                    className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:text-white'
                    }`}
                    title="Listen to pronunciation"
                  >
                    {isPlayingAudio ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                  </button>

                  <button
                    id="practice-this-article-btn"
                    onClick={() => onPracticeArticle(currentArticle.id)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Practice First-Letters</span>
                  </button>
                </div>
              </div>

              {/* Liturgical Texts: English & Latin in Parallel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">English (Rosary Translation):</span>
                  <p className="text-base sm:text-lg font-serif text-neutral-100 leading-relaxed font-medium">
                    "{currentArticle.textEnglish}"
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Latin (Symbolum Apostolorum):</span>
                  <p className="text-base sm:text-lg font-serif italic text-amber-200/90 leading-relaxed">
                    "{currentArticle.textLatin}"
                  </p>
                </div>
              </div>

              {/* Theological Summary & Core Dogmas */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                  Theological Summary & Dogmatic Formulation:
                </h4>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {currentArticle.theologicalSummary}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentArticle.keyDogmas.map((dogma) => (
                    <span
                      key={dogma}
                      className="text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-750 text-amber-200/90 font-medium"
                    >
                      ✦ {dogma}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deep Exegesis & Historical Milieu */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Historical Context & Early Church Defense:
                  </h4>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {currentArticle.deepExegesis.historicalContext}
                  </p>
                </div>

                {/* Greek and Latin Etymology Table */}
                {currentArticle.deepExegesis.greekLatinRoots.length > 0 && (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                      Etymology & Linguistic Roots:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentArticle.deepExegesis.greekLatinRoots.map((root, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-xs">
                          <div className="flex items-center justify-between font-mono">
                            <strong className="text-amber-200">{root.term}</strong>
                            <span className="text-neutral-500 text-[10px]">{root.origin}</span>
                          </div>
                          <p className="text-neutral-400 mt-1 leading-snug">{root.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Catechism of the Catholic Church (CCC) & Scripture Anchors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CCC Citations */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                    Catechism of the Catholic Church:
                  </h4>
                  <div className="space-y-2">
                    {currentArticle.cccReferences.map((ccc, i) => (
                      <div key={i} className="text-xs p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                        <strong className="text-amber-400 block font-mono">{ccc.section}</strong>
                        <span className="text-neutral-300 leading-snug">{ccc.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scripture Foundations */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                    Scripture Foundations:
                  </h4>
                  <div className="space-y-2">
                    {currentArticle.scriptureReferences.map((scrip, i) => (
                      <div key={i} className="text-xs p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                        <strong className="text-amber-400 block font-mono">{scrip.verse}</strong>
                        <span className="text-neutral-300 italic">"{scrip.text}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rosary Meditation Connection & Memory Hook */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/30 space-y-2">
                <div className="flex items-start gap-2">
                  <Cross className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-amber-200 font-bold">
                      Rosary Prayer Meditation:
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                      {currentArticle.deepExegesis.rosaryMeditation}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-900/40 text-xs text-amber-300/90">
                  <strong>Mnemonic Memory Anchor:</strong> {currentArticle.deepExegesis.memoryHook}
                </div>
              </div>

              {/* User Custom Meditation Notes */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your Personal Reflection & Study Notes:</span>
                  </h4>
                  {!isEditingNote ? (
                    <button
                      id="edit-note-btn"
                      onClick={() => setIsEditingNote(true)}
                      className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{notes[currentArticle.id] ? 'Edit Notes' : 'Add Note'}</span>
                    </button>
                  ) : (
                    <button
                      id="save-note-btn"
                      onClick={handleSaveNote}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-amber-500 text-neutral-950 font-bold transition cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save Note</span>
                    </button>
                  )}
                </div>

                {isEditingNote ? (
                  <textarea
                    value={editingNote}
                    onChange={(e) => setEditingNote(e.target.value)}
                    placeholder="Record your spiritual insights, insights from prayer, or mnemonic notes for this article..."
                    rows={3}
                    className="w-full bg-neutral-900 border border-neutral-750 focus:border-amber-500 rounded-xl p-3 text-xs sm:text-sm text-neutral-200 focus:outline-none"
                  />
                ) : (
                  <div className="text-xs sm:text-sm text-neutral-400 italic p-2 rounded bg-neutral-900/50">
                    {notes[currentArticle.id] || "No personal notes recorded yet. Click 'Add Note' to save insights for this article."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: HISTORICAL GENESIS & ORIGINS                                      */}
      {/* ========================================================================= */}
      {studyMode === 'history' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Historical Evolution</span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-sacred text-amber-100 mt-1">
              How the Apostles' Creed Was Born & Transmitted
            </h3>
            <p className="text-sm text-neutral-300 mt-2 max-w-3xl leading-relaxed">
              The Apostles' Creed (*Symbolum Apostolorum*) is the oldest baptismal confession of the Western Church. It developed directly out of the Great Commission (Matthew 28:19) and the baptismal interrogations of the early Christian martyrs in Rome.
            </p>
          </div>

          {/* Timeline Cards */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-serif-sacred text-base font-bold text-amber-300">
                  1. The Apostolic Origin & Rule of Faith (c. 33 – 100 AD)
                </h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                  1st Century
                </span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Tradition recorded by Rufinus of Aquileia (c. 400 AD) relates that before the Twelve Apostles dispersed from Jerusalem to preach the Gospel, each contributed one article of the Creed under the inspiration of the Holy Spirit, creating a unified rule of faith (*Regula Fidei*) so that all churches would profess identical truth across the earth.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-serif-sacred text-base font-bold text-amber-300">
                  2. The Old Roman Symbol (*Romanum*, "R") (c. 150 – 215 AD)
                </h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                  2nd Century
                </span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                In the Church of Rome during the height of pagan persecutions, converts underwent three years of preparation. At the Easter Vigil baptism, the Bishop asked three questions: <em>"Do you believe in God the Father almighty? Do you believe in Jesus Christ our Savior? Do you believe in the Holy Spirit?"</em>. Answering "Credo!" before each immersion formed the direct skeletal structure of our modern Creed.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-serif-sacred text-base font-bold text-amber-300">
                  3. St. Ambrose & The Name "Symbolum Apostolorum" (c. 390 AD)
                </h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                  4th Century
                </span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                St. Ambrose of Milan is the first writer to use the exact Latin phrase <em>Symbolum Apostolorum</em> in a letter to Pope Siricius (390 AD). The Greek word <em>symbolon</em> referred to a token or password broken in half; when two people met, they fitted the halves together to prove authentic identity. The Creed is the spiritual password proving our communion in the apostolic faith.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-serif-sacred text-base font-bold text-amber-300">
                  4. The Apostles' Creed vs. The Nicene Creed (325 & 381 AD)
                </h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                  Conciliar Clarifications
                </span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                While the <strong>Nicene-Constantinopolitan Creed</strong> was written by ecumenical councils to formulate precise philosophical definitions against Arianism (e.g. <em>Homoousios</em> / "Consubstantial with the Father"), the <strong>Apostles' Creed</strong> retained the simpler, ancient baptismal language of the early Church. For this reason, the Apostles' Creed remains the beloved personal prayer of baptism and the Holy Rosary.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-600/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold font-serif-sacred text-base">
                <Cross className="w-5 h-5 text-amber-400" />
                <span>5. Liturgical Placement at the Crucifix of the Rosary</span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                When St. Dominic and subsequent Dominican traditions codified the Holy Rosary, the Apostles' Creed was intentionally affixed to the <strong>Crucifix</strong>. Before one enters the contemplative rhythm of the decades, one kisses the Crucifix and professes the Creed to anchor the soul in orthodox Catholic dogma, making the Rosary both a biblical meditation and a fortress of authentic faith.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
