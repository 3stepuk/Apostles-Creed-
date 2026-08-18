import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Brain, Zap, Sparkles, BookOpen, Layers, Clock, Award } from 'lucide-react';
import { MEMORY_SCIENCE_PRINCIPLES } from '../data/creedData';

interface MemoryScienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemoryScienceModal: React.FC<MemoryScienceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="memory-science-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="memory-science-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-neutral-900 border border-amber-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl my-8 text-neutral-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle golden ambient accent */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif-sacred text-amber-200 tracking-wide">
                  The Cognitive Science of Sacred Memory
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400">
                  How evidence-based cognitive psychology accelerates permanent retention of the Creed.
                </p>
              </div>
            </div>
            <button
              id="close-science-modal-btn"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 space-y-5 max-h-[65vh] overflow-y-auto pr-2">
            {/* Top Summary Banner */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-amber-900/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-neutral-300">
                Traditional rote repetition creates shallow, fleeting memory. This application applies five core empirical pillars from cognitive neuroscience to transform the Apostles' Creed from surface recitation into deeply encoded, lifelong semantic recall for your Rosary prayer.
              </p>
            </div>

            {/* Principles List */}
            <div className="grid grid-cols-1 gap-4">
              {MEMORY_SCIENCE_PRINCIPLES.map((principle, idx) => {
                const icons = [Zap, Layers, Clock, BookOpen, Award];
                const IconComponent = icons[idx % icons.length];

                return (
                  <div
                    key={principle.title}
                    id={`principle-card-${idx}`}
                    className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/30 transition group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-neutral-800 text-amber-400 group-hover:bg-amber-500/20 transition shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h3 className="font-semibold text-neutral-100 text-sm sm:text-base">
                            {idx + 1}. {principle.title}
                          </h3>
                          <span className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded">
                            {principle.researchers}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                          <strong className="text-neutral-300 font-medium">Cognitive Mechanism:</strong> {principle.concept}
                        </p>
                        <div className="pt-1.5 text-xs text-amber-300/90 flex items-start gap-1.5">
                          <span className="font-semibold text-amber-400 shrink-0">Applied in App:</span>
                          <span>{principle.howAppAppliesIt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Practical Guide */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-600/20 space-y-2">
              <h4 className="font-semibold text-amber-200 text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" /> Recommended Daily Memory Protocol
              </h4>
              <ol className="text-xs sm:text-sm text-neutral-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li><strong>Read with Semantic Depth:</strong> Study 1-2 articles in the Theological Depth tab to understand the roots (e.g. *ex nihilo*, *inferos*).</li>
                <li><strong>First-Letter Typer Practice:</strong> Use the First-Letter Typer mode to engage neuromuscular retrieval practice.</li>
                <li><strong>Complete SRS Review:</strong> Answer your daily Spaced Repetition queue to lock items into long-term memory before decay.</li>
                <li><strong>Pray on the Rosary:</strong> Conclude by proclaiming the creed at the Rosary crucifix with serene contemplation.</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
            <button
              id="close-science-modal-footer-btn"
              onClick={onClose}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Begin Memorizing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
