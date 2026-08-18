import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  Award, 
  AlertCircle, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { CREED_ARTICLES, FULL_APOSTLES_CREED_ENGLISH } from '../data/creedData';
import { recordActivity } from '../utils/srsEngine';
import { audio } from '../utils/audioService';

interface ClozeQuestion {
  id: number;
  articleNumber: number;
  apostle: string;
  originalSentence: string;
  maskedSentence: string;
  correctWord: string;
  distractors: string[];
  theologicalContext: string;
}

interface ClozeQuizProps {
  onRefreshStats: () => void;
}

export const ClozeQuiz: React.FC<ClozeQuizProps> = ({ onRefreshStats }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Generate cloze question pool from articles
  const questions: ClozeQuestion[] = useMemo(() => [
    {
      id: 1,
      articleNumber: 1,
      apostle: 'St. Peter',
      originalSentence: 'I believe in God, the Father almighty, Creator of heaven and earth,',
      maskedSentence: 'I believe in God, the Father almighty, [_____] of heaven and earth,',
      correctWord: 'Creator',
      distractors: ['Ruler', 'Architect', 'Master', 'Lord'],
      theologicalContext: 'Affirms creation ex nihilo (out of nothing) by God alone, distinguishing God from pantheistic or pagan creation myths.'
    },
    {
      id: 2,
      articleNumber: 2,
      apostle: 'St. Andrew',
      originalSentence: 'and in Jesus Christ, his only Son, our Lord,',
      maskedSentence: 'and in Jesus Christ, his only [_____], our Lord,',
      correctWord: 'Son',
      distractors: ['Prophet', 'Servant', 'Angel', 'Disciple'],
      theologicalContext: 'Confesses the divine identity and eternal Sonship (Monogenes) within the Holy Trinity.'
    },
    {
      id: 3,
      articleNumber: 3,
      apostle: 'St. James the Greater',
      originalSentence: 'who was conceived by the Holy Spirit, born of the Virgin Mary,',
      maskedSentence: 'who was [_____] by the Holy Spirit, born of the Virgin Mary,',
      correctWord: 'conceived',
      distractors: ['created', 'chosen', 'sent', 'anointed'],
      theologicalContext: 'The Incarnation occurred by the divine overshadowing of the Holy Spirit, without an earthly biological father.'
    },
    {
      id: 4,
      articleNumber: 4,
      apostle: 'St. John',
      originalSentence: 'suffered under Pontius Pilate, was crucified, died and was buried;',
      maskedSentence: 'suffered under Pontius Pilate, was [_____], died and was buried;',
      correctWord: 'crucified',
      distractors: ['persecuted', 'mocked', 'condemned', 'exiled'],
      theologicalContext: 'Crucifixion was the highest Roman penalty, fulfilling the sacrificial Paschal lamb prophecy on the Wood of the Cross.'
    },
    {
      id: 5,
      articleNumber: 5,
      apostle: 'St. Thomas',
      originalSentence: 'he descended into hell; on the third day he rose again from the dead;',
      maskedSentence: 'he [_____] into hell; on the third day he rose again from the dead;',
      correctWord: 'descended',
      distractors: ['entered', 'looked', 'vanished', 'triumphed'],
      theologicalContext: 'Christ descended to the realm of the dead (Sheol/Hades) to deliver the holy patriarchs and righteous souls awaiting redemption.'
    },
    {
      id: 6,
      articleNumber: 6,
      apostle: 'St. James the Lesser',
      originalSentence: 'he ascended into heaven, and is seated at the right hand of God the Father almighty;',
      maskedSentence: 'he ascended into heaven, and is [_____] at the right hand of God the Father almighty;',
      correctWord: 'seated',
      distractors: ['standing', 'reigning', 'ruling', 'praying'],
      theologicalContext: 'Sitting at the right hand signifies the definitive installation of the Messiah in sovereign power and supreme intercession.'
    },
    {
      id: 7,
      articleNumber: 7,
      apostle: 'St. Philip',
      originalSentence: 'from there he will come to judge the living and the dead.',
      maskedSentence: 'from there he will come to [_____] the living and the dead.',
      correctWord: 'judge',
      distractors: ['save', 'gather', 'call', 'crown'],
      theologicalContext: 'The Parousia brings universal and particular judgment, fulfilling cosmic justice and vindicating God\'s holiness.'
    },
    {
      id: 8,
      articleNumber: 8,
      apostle: 'St. Bartholomew',
      originalSentence: 'I believe in the Holy Spirit,',
      maskedSentence: 'I believe in the [_____] Spirit,',
      correctWord: 'Holy',
      distractors: ['Eternal', 'Divine', 'Living', 'Mighty'],
      theologicalContext: 'The third person of the Blessed Trinity, who with the Father and Son is adored and glorified.'
    },
    {
      id: 9,
      articleNumber: 9,
      apostle: 'St. Matthew',
      originalSentence: 'the holy catholic Church, the communion of saints,',
      maskedSentence: 'the holy catholic Church, the [_____] of saints,',
      correctWord: 'communion',
      distractors: ['assembly', 'kingdom', 'company', 'gathering'],
      theologicalContext: 'Sanctorum Communio: spiritual solidarity uniting the Church on earth (Militant), in Purgatory (Penitent), and in Heaven (Triumphant).'
    },
    {
      id: 10,
      articleNumber: 10,
      apostle: 'St. Simon the Zealot',
      originalSentence: 'the forgiveness of sins,',
      maskedSentence: 'the [_____] of sins,',
      correctWord: 'forgiveness',
      distractors: ['cleansing', 'remembrance', 'punishment', 'covering'],
      theologicalContext: 'The sacramental power entrusted to the Church to remit sins through the precious Blood of Jesus.'
    },
    {
      id: 11,
      articleNumber: 11,
      apostle: 'St. Jude Thaddaeus',
      originalSentence: 'the resurrection of the body,',
      maskedSentence: 'the resurrection of the [_____],',
      correctWord: 'body',
      distractors: ['soul', 'spirit', 'saints', 'elect'],
      theologicalContext: 'Latin *carnis resurrectionem* (resurrection of the FLESH). Not a mere ghost or disembodied state, but real transfigured physical embodiment.'
    },
    {
      id: 12,
      articleNumber: 12,
      apostle: 'St. Matthias',
      originalSentence: 'and life everlasting. Amen.',
      maskedSentence: 'and life [_____]. Amen.',
      correctWord: 'everlasting',
      distractors: ['eternal', 'heavenly', 'glorious', 'peaceful'],
      theologicalContext: 'The unceasing Beatific Vision and eternal joy in communion with the Trinity.'
    }
  ], []);

  const currentQ = questions[currentQuestionIndex];

  // Options shuffled
  const options = useMemo(() => {
    if (!currentQ) return [];
    const list = [currentQ.correctWord, ...currentQ.distractors];
    // Deterministic or stable shuffle based on question id
    return list.sort(() => (currentQ.id % 2 === 0 ? 0.5 - Math.random() : Math.random() - 0.5));
  }, [currentQ]);

  const handleSelectOption = (word: string) => {
    if (isAnswerChecked) return;
    setSelectedWord(word);
  };

  const handleCheckAnswer = () => {
    if (!selectedWord || isAnswerChecked) return;

    setIsAnswerChecked(true);
    setAnsweredCount(prev => prev + 1);

    const isCorrect = selectedWord.toLowerCase() === currentQ.correctWord.toLowerCase();
    if (isCorrect) {
      audio.playSanctuaryChime('success');
      setScore(prev => prev + 1);
    } else {
      audio.playSanctuaryChime('error');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedWord(null);
      setIsAnswerChecked(false);
      audio.playSanctuaryChime('keystroke');
    } else {
      // Completed quiz!
      audio.playSanctuaryChime('milestone');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#ffffff']
      });
      const finalAccuracy = Math.round(((score + (selectedWord === currentQ.correctWord ? 1 : 0)) / questions.length) * 100);
      recordActivity('cloze', finalAccuracy);
      onRefreshStats();
      setCurrentQuestionIndex(questions.length); // Marks complete
    }
  };

  const isQuizFinished = currentQuestionIndex >= questions.length;

  return (
    <div id="cloze-quiz-container" className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-serif-sacred text-amber-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Active Recall Cloze Test</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Test precision knowledge of core theological terms across all 12 Articles.
          </p>
        </div>

        {!isQuizFinished && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-neutral-400">Score:</span>
            <span className="font-mono font-bold text-amber-300 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
              {score} / {answeredCount}
            </span>
            <span className="text-neutral-400">Question:</span>
            <span className="font-mono font-semibold text-neutral-200">
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        )}
      </div>

      {/* Main Question Card */}
      {!isQuizFinished && currentQ ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Question Article Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                Article {currentQ.articleNumber}
              </span>
              <span className="text-xs text-neutral-400">
                Apostle: <strong className="text-neutral-200">{currentQ.apostle}</strong>
              </span>
            </div>
            <span className="text-xs text-neutral-500 font-mono">Fill in the theological term</span>
          </div>

          {/* Masked Sentence Display */}
          <div className="p-6 rounded-2xl bg-neutral-950 border border-amber-500/30 text-center space-y-4">
            <div className="text-lg sm:text-2xl font-serif text-neutral-100 leading-relaxed">
              {currentQ.maskedSentence.split('[_____]').map((segment, idx, arr) => (
                <React.Fragment key={idx}>
                  {segment}
                  {idx < arr.length - 1 && (
                    <span className={`inline-block px-3 py-1 mx-1.5 rounded-xl font-mono font-bold text-base sm:text-xl border-2 transition ${
                      selectedWord 
                        ? isAnswerChecked
                          ? selectedWord.toLowerCase() === currentQ.correctWord.toLowerCase()
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500'
                            : 'bg-red-950/60 text-red-300 border-red-500'
                          : 'bg-amber-500/20 text-amber-300 border-amber-400'
                        : 'bg-neutral-850 text-neutral-500 border-dashed border-neutral-700'
                    }`}>
                      {selectedWord || '______'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Options Word Bank */}
          <div className="space-y-3">
            <div className="text-xs text-neutral-400 text-center font-medium">
              Choose the exact liturgical and theological term:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {options.map((option) => {
                const isSelected = selectedWord === option;
                const isCorrect = option === currentQ.correctWord;

                let btnStyles = 'bg-neutral-950 hover:bg-neutral-850 text-neutral-200 border-neutral-800';

                if (isSelected) {
                  btnStyles = 'bg-amber-500/20 text-amber-200 border-amber-400 ring-2 ring-amber-400/20';
                }

                if (isAnswerChecked) {
                  if (isCorrect) {
                    btnStyles = 'bg-emerald-950/70 text-emerald-200 border-emerald-500 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isCorrect) {
                    btnStyles = 'bg-red-950/70 text-red-200 border-red-500 line-through';
                  }
                }

                return (
                  <button
                    key={option}
                    id={`cloze-option-${option}`}
                    onClick={() => handleSelectOption(option)}
                    disabled={isAnswerChecked}
                    className={`p-3.5 rounded-xl border text-sm font-semibold transition cursor-pointer text-left flex items-center justify-between ${btnStyles}`}
                  >
                    <span>{option}</span>
                    {isAnswerChecked && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Answer Checked Explanation Banner */}
          {isAnswerChecked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border space-y-2 ${
                selectedWord?.toLowerCase() === currentQ.correctWord.toLowerCase()
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Theological Context & Catechetical Significance:</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {currentQ.theologicalContext}
              </p>
            </motion.div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-neutral-800 flex justify-end">
            {!isAnswerChecked ? (
              <button
                id="cloze-verify-answer-btn"
                onClick={handleCheckAnswer}
                disabled={!selectedWord}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-sm transition shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Verify Answer
              </button>
            ) : (
              <button
                id="cloze-next-question-btn"
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-sm transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-2"
              >
                <span>{currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'View Final Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Final Quiz Summary Card */
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-500/30">
            <Award className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-serif-sacred text-amber-100">
              Cloze Recall Mastery Test Completed!
            </h3>
            <p className="text-sm text-neutral-300">
              You scored <strong className="text-amber-300 text-lg font-mono">{score}</strong> out of <strong className="text-neutral-100 text-lg font-mono">{questions.length}</strong> ({Math.round((score / questions.length) * 100)}% accuracy).
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              id="retake-cloze-quiz-btn"
              onClick={() => {
                setCurrentQuestionIndex(0);
                setSelectedWord(null);
                setIsAnswerChecked(false);
                setScore(0);
                setAnsweredCount(0);
                audio.playSanctuaryChime('keystroke');
              }}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-sm transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Cloze Test</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
