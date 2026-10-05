import React, { useState } from 'react';
import { Subject, StudyMaterial, Quiz, QuizAttempt, Question } from '../types';
import {
  HelpCircle,
  Play,
  CheckCircle,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizViewProps {
  subjects: Subject[];
  materials: StudyMaterial[];
  quizAttempts: QuizAttempt[];
  onGenerateQuiz: (params: {
    subjectId: string;
    topic?: string;
    numberOfQuestions?: number;
    difficulty?: string;
    materialId?: string;
  }) => Promise<Quiz>;
  onSubmitQuiz: (quizId: string, answers: Record<string, number>) => Promise<{
    attempt: QuizAttempt;
    questions: Question[];
    userAnswers: Record<string, number>;
  }>;
  onRefreshAdaptivePlan: () => void;
  preselectedSubjectId?: string;
  preselectedMaterialId?: string;
}

export const QuizView: React.FC<QuizViewProps> = ({
  subjects,
  materials,
  quizAttempts,
  onGenerateQuiz,
  onSubmitQuiz,
  onRefreshAdaptivePlan,
  preselectedSubjectId,
  preselectedMaterialId,
}) => {
  // Generation state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    preselectedSubjectId || subjects[0]?.id || ''
  );
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    preselectedMaterialId || ''
  );
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Result state
  const [quizResult, setQuizResult] = useState<{
    attempt: QuizAttempt;
    questions: Question[];
    userAnswers: Record<string, number>;
  } | null>(null);

  // Generate quiz
  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      setGenError('Please select a subject');
      return;
    }

    setGenerating(true);
    setGenError(null);

    try {
      const quiz = await onGenerateQuiz({
        subjectId: selectedSubjectId,
        topic: selectedTopic === 'all' ? undefined : selectedTopic,
        numberOfQuestions: numQuestions,
        difficulty,
        materialId: selectedMaterialId || undefined,
      });

      setActiveQuiz(quiz);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setQuizResult(null);
    } catch (err: any) {
      setGenError(err.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  // Option selection
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Submit
  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);

    try {
      const result = await onSubmitQuiz(activeQuiz.id, userAnswers);
      setQuizResult(result);
      setActiveQuiz(null);

      // Celebrate high score
      if (result.attempt.percentage >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Notify parent to refresh study plan if low score adapted schedule
      if (result.attempt.percentage < 70) {
        onRefreshAdaptivePlan();
      }
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Result View
  if (quizResult) {
    const { attempt, questions, userAnswers: submittedAnswers } = quizResult;
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-scale-in">
        {/* Score Header Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white ${
              attempt.percentage >= 80
                ? 'bg-emerald-500'
                : attempt.percentage >= 60
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Quiz Completed · {attempt.subjectName}
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {attempt.score} / {attempt.totalQuestions}
            </h2>
            <div className="text-lg font-bold text-indigo-600 mt-0.5 tabular-nums">
              {attempt.percentage}% Score
            </div>
          </div>

          <p className="text-sm text-slate-600 max-w-lg mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            {attempt.feedback}
          </p>

          {attempt.weakTopics && attempt.weakTopics.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-1.5">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Adaptive Attention Triggered:</span>
              </h4>
              <p className="text-xs text-amber-800">
                Missed topics (
                <span className="font-semibold">{attempt.weakTopics.join(', ')}</span>) have been
                automatically scheduled for targeted revision in your Study Planner!
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setQuizResult(null);
                setActiveQuiz(null);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Another Quiz</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Question-by-Question Review</h3>
          {questions.map((q, idx) => {
            const userPick = submittedAnswers[q.id];
            const isCorrect = userPick === q.correctAnswerIndex;

            return (
              <div
                key={q.id}
                className={`p-6 rounded-3xl bg-white border shadow-sm space-y-3 ${
                  isCorrect ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-bold text-slate-400">
                    Question {idx + 1} · {q.topic}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {isCorrect ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-800">{q.questionText}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isUserChoice = userPick === optIdx;
                    const isTheCorrectAnswer = q.correctAnswerIndex === optIdx;

                    let optStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isTheCorrectAnswer) {
                      optStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                    } else if (isUserChoice && !isCorrect) {
                      optStyle = 'bg-rose-50 border-rose-300 text-rose-800 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {isTheCorrectAnswer && (
                          <span className="text-[10px] font-bold text-emerald-700 ml-2">
                            (Correct)
                          </span>
                        )}
                        {isUserChoice && !isTheCorrectAnswer && (
                          <span className="text-[10px] font-bold text-rose-700 ml-2">
                            (Your choice)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-700">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Active Quiz Taking View
  if (activeQuiz) {
    const q = activeQuiz.questions[currentQuestionIndex];
    const totalQ = activeQuiz.questions.length;
    const isAnswered = userAnswers[q?.id] !== undefined;
    const allAnswered = activeQuiz.questions.every((item) => userAnswers[item.id] !== undefined);

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-indigo-600">{activeQuiz.title}</span>
              <h2 className="text-sm font-bold text-slate-700 mt-0.5">
                Question {currentQuestionIndex + 1} of {totalQ}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-mono text-slate-600">
              <span>{Math.round(((currentQuestionIndex + 1) / totalQ) * 100)}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQ) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Topic: {q.topic}
            </span>
            <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
              {q.questionText}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((opt, optIndex) => {
              const isSelected = userAnswers[q.id] === optIndex;
              return (
                <button
                  key={optIndex}
                  onClick={() => handleSelectOption(q.id, optIndex)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <span>{opt}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentQuestionIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Quiz Hub & Generator View (Default)
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Subject-Wise Quizzes & Practice
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Reinforce understanding through curated question banks or dynamically generated quizzes from uploaded materials.
        </p>
      </div>

      {/* Generator Configuration Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Generate New Diagnostic Quiz</span>
        </h2>

        {genError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {genError}
          </div>
        )}

        <form onSubmit={handleStartQuiz} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Material source */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2. Source Material
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Curated Question Bank (Level 1)</option>
                {materials
                  .filter((m) => !selectedSubjectId || m.subjectId === selectedSubjectId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fileName} (Parsed doc)
                    </option>
                  ))}
              </select>
            </div>

            {/* Questions count */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                3. Number of Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value={3}>3 Questions (Quick check)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Comprehensive)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                4. Target Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Easy">Easy (Fundamentals)</option>
                <option value="Medium">Medium (Application)</option>
                <option value="Hard">Hard (Deep analysis)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{generating ? 'Compiling Questions...' : 'Start Quiz Session'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quiz History / Past Attempts */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Quiz Performance</h2>
            <p className="text-xs text-slate-500">
              Quiz results update your adaptive study weights and diagnose weak topics.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {quizAttempts.length} Total Attempts
          </span>
        </div>

        {quizAttempts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No quiz attempts recorded yet. Take your first quiz above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Percentage</th>
                  <th className="px-6 py-3.5">Diagnosed Weak Topics</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {att.subjectName}
                    </td>
                    <td className="px-6 py-4 tabular-nums text-slate-600">
                      {att.score} / {att.totalQuestions}
                    </td>
                    <td className="px-6 py-4 tabular-nums">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          att.percentage >= 80
                            ? 'bg-emerald-50 text-emerald-700'
                            : att.percentage >= 60
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {att.weakTopics && att.weakTopics.length > 0 ? (
                        <span className="text-rose-600 font-medium">
                          {att.weakTopics.join(', ')}
                        </span>
                      ) : (
                        <span className="text-emerald-600">None detected (Mastered)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {att.attemptedAt.split('T')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
