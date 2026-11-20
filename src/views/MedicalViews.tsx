import React, { useState } from 'react';
import { anatomySystems, anatomyQuizQuestions } from '../data/anatomyData';
import { QuestionItem } from '../types';
import confetti from 'canvas-confetti';
import {
  Stethoscope,
  HeartPulse,
  Pill,
  Award,
  Droplet,
  Microscope,
  Activity,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

// 1. HUMAN ANATOMY ATLAS & QUIZ
export const AnatomyAtlasView: React.FC = () => {
  const [selectedSystemId, setSelectedSystemId] = useState<string>('skeletal');
  const [activeTab, setActiveTab] = useState<'atlas' | 'quiz'>('atlas');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const system = anatomySystems.find((s) => s.id === selectedSystemId) || anatomySystems[0];
  const question = anatomyQuizQuestions[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < anatomyQuizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <span className="text-xs uppercase font-mono text-rose-600 dark:text-rose-400 font-bold tracking-wider">Clinical Education</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Human Anatomy Atlas & Quiz</h2>
          <p className="text-slate-500 text-sm mt-0.5">High-yield clinical organ explorer, pharmacy drug targets & self-assessment.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('atlas')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'atlas'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            Atlas Explorer
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            Anatomy Quiz ({anatomyQuizQuestions.length})
          </button>
        </div>
      </div>

      {activeTab === 'atlas' ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {anatomySystems.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSystemId(s.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSystemId === s.id
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="h-64 md:h-auto bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
                <img
                  src={system.image}
                  alt={system.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="p-6 md:col-span-2 space-y-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-rose-600 dark:text-rose-400">System Blueprint</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{system.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">
                    {system.overview}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Key Organs & Clinical Pearls</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {system.parts.map((part, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-lg">{part.name}</h5>
                      <span className="text-xs font-mono text-slate-400 italic">{part.scientificName}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {part.description}
                  </p>

                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-xs">
                    <span className="font-bold text-rose-700 dark:text-rose-300 block mb-0.5">🩺 Clinical Significance:</span>
                    <span className="text-rose-900 dark:text-rose-200">{part.clinicalNotes}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">💊 Pharmacological Target:</span>
                    <span className="text-emerald-900 dark:text-emerald-200">{part.drugTargetNotes}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{part.funFact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          {!quizFinished ? (
            <>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b pb-3 dark:border-slate-700">
                <span>Question {currentQuestionIndex + 1} of {anatomyQuizQuestions.length}</span>
                <span className="text-rose-600 dark:text-rose-400">{question.category}</span>
                <span>Score: {score}</span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-relaxed">
                {question.question}
              </h3>

              <div className="space-y-2.5">
                {question.options.map((opt, idx) => {
                  let btnStyle = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100';
                  if (selectedOption === idx) {
                    btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200';
                  }
                  if (isAnswerSubmitted) {
                    if (idx === question.correctIndex) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                    } else if (selectedOption === idx) {
                      btnStyle = 'border-rose-500 bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200';
                    }
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswerSubmitted && idx === question.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerSubmitted && selectedOption === idx && idx !== question.correctIndex && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold block text-slate-900 dark:text-white">Explanation & Rationale:</span>
                  <p>{question.explanation}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-md"
                  >
                    {currentQuestionIndex + 1 < anatomyQuizQuestions.length ? 'Next Question' : 'View Results'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Sparkles className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quiz Completed!</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                You scored <span className="font-bold text-rose-600 text-lg">{score}</span> out of <span className="font-bold text-lg">{anatomyQuizQuestions.length}</span>!
              </p>
              <button
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 2. EXAM SIMULATOR
export const ExamSimulator: React.FC<{
  title: string;
  badge: string;
  questions: QuestionItem[];
  themeColor: string;
}> = ({ title, badge, questions }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index];

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    if (selected === q.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setFinished(true);
      confetti({ particleCount: 90, spread: 70 });
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400">Exam Test Prep</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
          {badge}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        {!finished ? (
          <>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b pb-3 dark:border-slate-700">
              <span>Question {index + 1} of {questions.length}</span>
              <span className="text-emerald-600">{q.category}</span>
              <span>Score: {score}</span>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-relaxed">
              {q.question}
            </h3>

            <div className="space-y-2.5">
              {q.options.map((opt, idx) => {
                let btnClass = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100';
                if (selected === idx) {
                  btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200';
                }
                if (submitted) {
                  if (idx === q.correctIndex) {
                    btnClass = 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (selected === idx) {
                    btnClass = 'border-rose-500 bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200';
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => !submitted && setSelected(idx)}
                    disabled={submitted}
                    className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between gap-3 ${btnClass}`}
                  >
                    <span>{opt}</span>
                    {submitted && idx === q.correctIndex && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    {submitted && selected === idx && idx !== q.correctIndex && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <span className="font-bold block">Clinical Rationale:</span>
                <p>{q.explanation}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected === null}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-md"
                >
                  {index + 1 < questions.length ? 'Next Question' : 'View Results'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <Sparkles className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Exam Session Finished!</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Your Result: <span className="font-bold text-emerald-600 text-xl">{score}</span> out of <span className="font-bold text-xl">{questions.length}</span> ({Math.round((score / questions.length) * 100)}%)
            </p>
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Test</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. IV INFUSION RATE
export const IvCalculatorView: React.FC = () => {
  const [volumeMl, setVolumeMl] = useState<number>(1000);
  const [hours, setHours] = useState<number>(8);
  const [dropFactor, setDropFactor] = useState<number>(20);

  const totalMinutes = hours * 60;
  const dropsPerMinute = totalMinutes > 0 ? Math.round((volumeMl * dropFactor) / totalMinutes) : 0;
  const mlPerHour = hours > 0 ? Math.round(volumeMl / hours) : 0;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <span className="text-xs uppercase font-mono text-cyan-600 dark:text-cyan-400 font-bold tracking-wider">Nursing Calculations</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">IV Infusion Rate Calculator</h2>
        <p className="text-slate-500 text-sm mt-0.5">Calculate drops per minute (gtt/min) and electronic pump flow rate (mL/hr).</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Total Infusion Volume (mL)</label>
          <input
            type="number"
            min="1"
            value={volumeMl}
            onChange={(e) => setVolumeMl(parseFloat(e.target.value) || 0)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Infusion Duration (Hours)</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">IV Giving Set Drop Factor (gtt/mL)</label>
          <select
            value={dropFactor}
            onChange={(e) => setDropFactor(parseInt(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          >
            <option value={20}>20 gtt/mL (Standard Adult Macrodrip)</option>
            <option value={15}>15 gtt/mL (Baxter Macrodrip)</option>
            <option value={10}>10 gtt/mL (Blood Administration Set)</option>
            <option value={60}>60 gtt/mL (Pediatric Microdrip / Soluset)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-center">
            <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">Gravity Drip Rate</span>
            <div className="text-3xl font-extrabold text-cyan-800 dark:text-cyan-200 mt-1">
              {dropsPerMinute}
            </div>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400">drops / minute (gtt/min)</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Infusion Pump Speed</span>
            <div className="text-3xl font-extrabold text-blue-800 dark:text-blue-200 mt-1">
              {mlPerHour}
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400">mL / hour</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. DRUG DOSAGE
export const DosageCalculatorView: React.FC = () => {
  const [weightKg, setWeightKg] = useState<number>(15);
  const [dosePerKg, setDosePerKg] = useState<number>(20);
  const [syrupConcentrationMg, setSyrupConcentrationMg] = useState<number>(250);
  const [syrupVolumeMl, setSyrupVolumeMl] = useState<number>(5);

  const totalDoseMg = weightKg * dosePerKg;
  const volumeToAdminister = syrupConcentrationMg > 0 ? ((totalDoseMg * syrupVolumeMl) / syrupConcentrationMg).toFixed(1) : '0';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <span className="text-xs uppercase font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">Clinical Pharmacology</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Drug Dosage Calculator</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Patient Weight (kg)</label>
            <input
              type="number"
              min="1"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Desired Dose (mg / kg)</label>
            <input
              type="number"
              min="0.1"
              value={dosePerKg}
              onChange={(e) => setDosePerKg(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Available Drug (mg)</label>
            <input
              type="number"
              min="1"
              value={syrupConcentrationMg}
              onChange={(e) => setSyrupConcentrationMg(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">In Vehicle (mL)</label>
            <input
              type="number"
              min="1"
              value={syrupVolumeMl}
              onChange={(e) => setSyrupVolumeMl(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white shadow-md text-center space-y-2 mt-4">
          <span className="text-xs uppercase tracking-wider text-emerald-100">Calculated Required Volume</span>
          <div className="text-4xl font-black">
            {volumeToAdminister} mL
          </div>
          <span className="text-xs text-emerald-100 block">
            Equals {totalDoseMg} mg active drug dose
          </span>
        </div>
      </div>
    </div>
  );
};

// 5. GFR RENAL SOLVER
export const GfrCalculatorView: React.FC = () => {
  const [age, setAge] = useState<number>(45);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [creatinine, setCreatinine] = useState<number>(1.1);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  const baseGfr = creatinine > 0 ? ((140 - age) * weightKg) / (72 * creatinine) : 0;
  const gfr = gender === 'Female' ? baseGfr * 0.85 : baseGfr;
  const roundedGfr = Math.round(gfr);

  const getCkdStage = (val: number): { stage: string; desc: string; color: string } => {
    if (val >= 90) return { stage: 'Stage 1', desc: 'Normal kidney function with minimal proteinuria', color: 'text-emerald-600' };
    if (val >= 60) return { stage: 'Stage 2', desc: 'Mild decrease in GFR', color: 'text-teal-600' };
    if (val >= 45) return { stage: 'Stage 3A', desc: 'Mild to moderate loss of kidney function', color: 'text-amber-500' };
    if (val >= 30) return { stage: 'Stage 3B', desc: 'Moderate to severe loss of kidney function', color: 'text-orange-600' };
    if (val >= 15) return { stage: 'Stage 4', desc: 'Severe reduction in GFR (Prepare for RRT)', color: 'text-rose-600' };
    return { stage: 'Stage 5', desc: 'Kidney failure (ESRD - Dialysis needed)', color: 'text-red-700' };
  };

  const ckd = getCkdStage(roundedGfr);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <span className="text-xs uppercase font-mono text-amber-600 dark:text-amber-400 font-bold tracking-wider">Renal Function Solver</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cockcroft-Gault GFR Calculator</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            >
              <option value="Male">Male</option>
              <option value="Female">Female (0.85 multiplier)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Age (Years)</label>
            <input
              type="number"
              min="18"
              max="110"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Weight (kg)</label>
            <input
              type="number"
              min="20"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Serum Creatinine (mg/dL)</label>
            <input
              type="number"
              step="0.1"
              min="0.2"
              value={creatinine}
              onChange={(e) => setCreatinine(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center space-y-2 mt-4">
          <span className="text-xs uppercase tracking-wider text-slate-500">Estimated Creatinine Clearance</span>
          <div className="text-4xl font-black text-slate-900 dark:text-white">
            {roundedGfr} <span className="text-base font-normal text-slate-500">mL/min</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className={`font-bold text-sm ${ckd.color}`}>{ckd.stage}</span>
            <p className="text-xs text-slate-500 mt-0.5">{ckd.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
