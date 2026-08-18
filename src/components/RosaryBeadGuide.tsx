import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Cross, 
  Sparkles, 
  BookOpen, 
  Play, 
  Square, 
  CheckCircle2, 
  ChevronRight,
  Heart,
  Shield,
  Sun
} from 'lucide-react';
import { ROSARY_OPENING_PRAYERS, FULL_APOSTLES_CREED_ENGLISH, FULL_APOSTLES_CREED_LATIN } from '../data/creedData';
import { audio } from '../utils/audioService';

interface RosaryBeadGuideProps {
  onPracticeCreed: () => void;
}

export const RosaryBeadGuide: React.FC<RosaryBeadGuideProps> = ({ onPracticeCreed }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentPrayer = ROSARY_OPENING_PRAYERS.find(p => p.order === activeStep) || ROSARY_OPENING_PRAYERS[0];

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      audio.stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      let textToSpeak = FULL_APOSTLES_CREED_ENGLISH;
      if (activeStep === 2) {
        textToSpeak = "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.";
      } else if (activeStep === 3) {
        textToSpeak = "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.";
      } else if (activeStep === 4) {
        textToSpeak = "Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen. O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those in most need of thy mercy. Amen.";
      }

      audio.speakText(
        textToSpeak,
        'en',
        0.85,
        undefined,
        () => setIsPlayingAudio(false)
      );
    }
  };

  return (
    <div id="rosary-guide-container" className="space-y-6">
      {/* Top Header */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-serif-sacred text-amber-200 flex items-center gap-2">
            <Cross className="w-5 h-5 text-amber-400" />
            <span>The Holy Rosary Opening & The Apostles' Creed</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Understand the spiritual anatomy and liturgical position of the Creed on the Crucifix.
          </p>
        </div>

        <button
          id="practice-creed-from-rosary-btn"
          onClick={onPracticeCreed}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>Practice First-Letters</span>
        </button>
      </div>

      {/* Visual Rosary Bead Diagram & Stepper */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Visual Interactive Bead Track */}
        <div className="space-y-3">
          <div className="text-center text-xs font-mono uppercase tracking-widest text-amber-400">
            Interactive Opening Bead Sequence
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto py-4 px-2">
            {ROSARY_OPENING_PRAYERS.map((step) => {
              const isSelected = step.order === activeStep;

              return (
                <button
                  key={step.order}
                  id={`rosary-step-bead-${step.order}`}
                  onClick={() => {
                    setActiveStep(step.order);
                    audio.playSanctuaryChime('keystroke');
                    if (audio.isSpeaking()) audio.stopSpeech();
                    setIsPlayingAudio(false);
                  }}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30 scale-105 shadow-xl'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Bead Visual */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                    step.order === 1
                      ? isSelected ? 'bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/30' : 'bg-neutral-800 text-amber-300'
                      : step.order === 2
                        ? isSelected ? 'bg-amber-500 text-neutral-950 shadow-lg' : 'bg-neutral-800 text-neutral-200'
                        : step.order === 3
                          ? isSelected ? 'bg-amber-500 text-neutral-950 shadow-lg' : 'bg-neutral-800 text-neutral-300'
                          : isSelected ? 'bg-amber-500 text-neutral-950 shadow-lg' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {step.order === 1 ? (
                      <span className="font-serif-sacred text-lg font-bold">☩</span>
                    ) : step.order === 3 ? (
                      <div className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      </div>
                    ) : (
                      <span className="font-mono text-sm font-bold">{step.order}</span>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-neutral-200 max-w-[90px] text-center leading-tight">
                    {step.bead}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Step Detail Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                  Step {currentPrayer.order}: {currentPrayer.bead}
                </span>
                <span className="text-xs text-neutral-400 font-medium">Opening Liturgical Flow</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif-sacred text-amber-100 mt-1">
                {currentPrayer.prayer}
              </h3>
            </div>

            <button
              id="listen-rosary-prayer-btn"
              onClick={handleToggleAudio}
              className={`px-3.5 py-2 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-neutral-900 text-neutral-200 border-neutral-800 hover:text-white'
              }`}
            >
              {isPlayingAudio ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'Stop Recitation' : 'Recite Prayer Aloud'}</span>
            </button>
          </div>

          {/* Theological Significance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <strong className="text-xs font-mono uppercase tracking-wider text-amber-300 block">
                Theological Purpose:
              </strong>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {currentPrayer.purpose}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <strong className="text-xs font-mono uppercase tracking-wider text-amber-300 block">
                Physical & Spiritual Rubric:
              </strong>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {currentPrayer.instruction}
              </p>
            </div>
          </div>

          {/* Special Focus on Crucifix & 3 Virtues */}
          {activeStep === 1 && (
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-600/30 space-y-3">
              <h4 className="font-semibold text-sm text-amber-200 flex items-center gap-2">
                <Cross className="w-4 h-4 text-amber-400" />
                Why the Apostles' Creed is Prayed at the Crucifix:
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                The Rosary is a scriptural meditation on the mysteries of the Incarnation, Redemption, and Glorification. Proclaiming the Apostles' Creed at the Crucifix anchors our intellect in orthodox apostolic truth before entering contemplative prayer. You kiss or hold the crucifix as a pledge of total fidelity to Jesus Christ.
              </p>
            </div>
          )}

          {activeStep === 3 && (
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <h4 className="font-semibold text-xs font-mono uppercase tracking-wider text-amber-300">
                The Three Theological Virtues Meditated on the Opening Hail Marys:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>1. Faith (Fides)</span>
                  </div>
                  <p className="text-neutral-400 leading-snug">
                    Belief in all truths God has revealed, grounded in the Creed.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sun className="w-3.5 h-3.5" />
                    <span>2. Hope (Spes)</span>
                  </div>
                  <p className="text-neutral-400 leading-snug">
                    Trusting in God's promises of eternal life and heavenly aid.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <Heart className="w-3.5 h-3.5" />
                    <span>3. Charity (Caritas)</span>
                  </div>
                  <p className="text-neutral-400 leading-snug">
                    Loving God above all things and our neighbor as ourselves.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
