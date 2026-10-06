import React, { useState, useEffect } from 'react';
import { Subject, StudyMaterial, Flashcard } from '../types';
import {
  Layers,
  RotateCcw,
  Plus,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  Trash2,
  Eye,
  Check,
  List,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardModeProps {
  subjects: Subject[];
  materials: StudyMaterial[];
  initialSubjectId?: string;
  initialMaterialId?: string;
}

// Initial pre-seeded academic flashcards for core subjects and materials
const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    subjectId: 'sub-dsa',
    subjectName: 'Data Structures & Algorithms',
    topic: 'Binary Search Trees & Balancing',
    front: 'What is the search time complexity of a Balanced BST (AVL/Red-Black) vs. an unbalanced degenerate BST?',
    back: 'Balanced BST: O(log n) because height is strictly bounded by O(log n).\nUnbalanced (skewed) BST: O(n) in the worst case, as it degenerates into a singly linked list.',
    difficulty: 'Medium',
    mastered: false,
    reviewCount: 0,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'fc-2',
    subjectId: 'sub-dsa',
    subjectName: 'Data Structures & Algorithms',
    topic: 'Graph Traversal',
    front: 'When should you choose Breadth-First Search (BFS) over Depth-First Search (DFS)?',
    back: 'Use BFS when finding the shortest path in unweighted graphs or searching nodes closest to the source (uses a Queue / FIFO).\nUse DFS for cycle detection, topological sorting, and exhaustive path-finding (uses a Stack / LIFO).',
    difficulty: 'Medium',
    mastered: false,
    reviewCount: 0,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'fc-3',
    subjectId: 'sub-dsa',
    subjectName: 'Data Structures & Algorithms',
    topic: 'Tree Properties',
    front: 'What is the difference between a Full Binary Tree and a Complete Binary Tree?',
    back: '• Full Binary Tree: Every node has either 0 or 2 children.\n• Complete Binary Tree: All levels are completely filled except possibly the last level, which must be filled strictly from left to right.',
    difficulty: 'Easy',
    mastered: true,
    reviewCount: 1,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'fc-4',
    subjectId: 'sub-java',
    subjectName: 'Java Programming',
    topic: 'Multithreading & Concurrency',
    front: 'What does the `volatile` keyword guarantee in the Java Memory Model?',
    back: '1. Visibility: Reads and writes interact directly with main memory, bypassing local CPU registers/caches.\n2. Ordering: Prevents instruction reordering via a happens-before relationship.\nNote: `volatile` does NOT guarantee atomicity for compound operations (e.g. count++).',
    difficulty: 'Hard',
    mastered: false,
    reviewCount: 0,
    createdAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'fc-5',
    subjectId: 'sub-java',
    subjectName: 'Java Programming',
    topic: 'Object Contract',
    front: 'What is the critical rule between Java\'s `equals()` and `hashCode()` contract?',
    back: 'If two objects are equal according to `equals(Object)`, they MUST return the exact same integer from `hashCode()`.\nIf this contract is broken, HashMap and HashSet will fail to retrieve stored objects.',
    difficulty: 'Easy',
    mastered: true,
    reviewCount: 2,
    createdAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'fc-6',
    subjectId: 'sub-java',
    subjectName: 'Java Programming',
    topic: 'Synchronization',
    front: 'How does `ReentrantLock` differ from intrinsic `synchronized` blocks?',
    back: 'ReentrantLock offers: tryLock() with timeouts, interruptible lock acquisition, fairness policy options, and multiple Condition variables. `synchronized` is simpler, block-scoped, and handled intrinsically by JVM monitors.',
    difficulty: 'Medium',
    mastered: false,
    reviewCount: 0,
    createdAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'fc-7',
    subjectId: 'sub-dbms',
    subjectName: 'Database Management Systems',
    topic: 'Transactions',
    front: 'Define the ACID properties in relational database transactions.',
    back: '• Atomicity: Entire transaction completes or entire transaction is rolled back.\n• Consistency: Database transitions from one valid state to another, upholding all constraints.\n• Isolation: Concurrent transactions execute without dirty read interferences.\n• Durability: Committed updates survive system crashes.',
    difficulty: 'Easy',
    mastered: true,
    reviewCount: 2,
    createdAt: '2026-10-03T10:00:00.000Z',
  },
  {
    id: 'fc-8',
    subjectId: 'sub-dbms',
    subjectName: 'Database Management Systems',
    topic: 'Normalization',
    front: 'What is Boyce-Codd Normal Form (BCNF) and how does it strengthen 3NF?',
    back: 'A table is in BCNF if for every non-trivial functional dependency X → Y, X is a superkey.\n3NF permits Y to be a prime attribute (part of a candidate key), whereas BCNF eliminates this loophole completely.',
    difficulty: 'Hard',
    mastered: false,
    reviewCount: 0,
    createdAt: '2026-10-03T10:00:00.000Z',
  },
  {
    id: 'fc-9',
    subjectId: 'sub-dbms',
    subjectName: 'Database Management Systems',
    topic: 'Indexing',
    front: 'Why do relational databases use B+ Trees instead of standard Binary Trees for indexing?',
    back: 'B+ Trees have massive fan-out (order), keeping the tree height shallow (3-4 levels) to minimize expensive disk I/O seeks. All actual records reside in leaf nodes, linked in a doubly-linked list for ultra-fast range queries.',
    difficulty: 'Medium',
    mastered: false,
    reviewCount: 0,
    createdAt: '2026-10-03T10:00:00.000Z',
  },
];

const STORAGE_KEY = 'studymate_custom_flashcards';

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  subjects,
  materials,
  initialSubjectId,
  initialMaterialId,
}) => {
  // Load saved cards from localStorage or fallback to initial seeds
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_FLASHCARDS;
  });

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
    } catch {
      // ignore
    }
  }, [flashcards]);

  // Filters & State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || 'all');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(initialMaterialId || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'learning' | 'mastered'>('all');
  const [viewMode, setViewMode] = useState<'practice' | 'manage'>('practice');

  // Practice session state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState<boolean>(false);

  // New card form state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || 'sub-dsa');
  const [newMaterialId, setNewMaterialId] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // Auto-generation selected material
  const [autoGenMaterialId, setAutoGenMaterialId] = useState<string>(materials[0]?.id || '');
  const [isGeneratingCards, setIsGeneratingCards] = useState<boolean>(false);

  // Filtered cards
  const filteredCards = flashcards.filter((card) => {
    if (selectedSubjectId !== 'all' && card.subjectId !== selectedSubjectId) return false;
    if (selectedMaterialId !== 'all' && card.materialId !== selectedMaterialId) return false;
    if (statusFilter === 'learning' && card.mastered) return false;
    if (statusFilter === 'mastered' && !card.mastered) return false;
    return true;
  });

  // Reset index if out of range
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
  }, [selectedSubjectId, selectedMaterialId, statusFilter]);

  // Current active card
  const currentCard = filteredCards[currentIndex];

  // Flip card
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // Navigate cards
  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Rate card (Recall rating)
  const handleRateCard = (masteredStatus: boolean) => {
    if (!currentCard) return;

    setFlashcards((prev) =>
      prev.map((c) =>
        c.id === currentCard.id
          ? {
              ...c,
              mastered: masteredStatus,
              reviewCount: (c.reviewCount || 0) + 1,
              lastReviewed: new Date().toISOString(),
            }
          : c
      )
    );

    // Proceed to next card
    handleNext();
  };

  // Shuffle deck
  const handleShuffle = () => {
    setFlashcards((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
  };

  // Reset session
  const handleResetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
  };

  // Create new flashcard
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const sub = subjects.find((s) => s.id === newSubjectId);
    const mat = materials.find((m) => m.id === newMaterialId);

    const created: Flashcard = {
      id: `fc-custom-${Date.now()}`,
      subjectId: newSubjectId,
      subjectName: sub?.name || 'General Subject',
      materialId: newMaterialId || undefined,
      materialName: mat?.fileName,
      topic: newTopic.trim() || 'Core Concept',
      front: newFront.trim(),
      back: newBack.trim(),
      difficulty: newDifficulty,
      mastered: false,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    setFlashcards((prev) => [created, ...prev]);
    setIsCreateModalOpen(false);
    setNewFront('');
    setNewBack('');
    setNewTopic('');
  };

  // Delete flashcard
  const handleDeleteCard = (id: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== id));
  };

  // Auto-generate flashcards from material
  const handleAutoGenerateFromMaterial = () => {
    const mat = materials.find((m) => m.id === autoGenMaterialId) || materials[0];
    if (!mat) return;

    setIsGeneratingCards(true);
    setTimeout(() => {
      const sub = subjects.find((s) => s.id === mat.subjectId);
      const generatedCards: Flashcard[] = [];

      // Extract topics or text snippets into smart flashcard cards
      const sampleTopics = mat.extractedTopics && mat.extractedTopics.length > 0
        ? mat.extractedTopics
        : ['Fundamentals', 'Key Algorithms', 'Best Practices'];

      sampleTopics.forEach((t, i) => {
        generatedCards.push({
          id: `fc-gen-${Date.now()}-${i}`,
          subjectId: mat.subjectId,
          subjectName: sub?.name || 'Course Notes',
          materialId: mat.id,
          materialName: mat.fileName,
          topic: t,
          front: `Explain the fundamental principles and key edge cases of "${t}".`,
          back: `From ${mat.fileName}:\n"${t}" is a core curriculum topic. High-yield concept that reinforces critical comprehension, state consistency, and theoretical proofs tested in final exams.`,
          difficulty: i % 2 === 0 ? 'Medium' : 'Hard',
          mastered: false,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
        });
      });

      setFlashcards((prev) => [...generatedCards, ...prev]);
      setIsGeneratingCards(false);
      setIsAutoGenerateModalOpen(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }, 600);
  };

  // Key stats
  const totalInFilter = filteredCards.length;
  const masteredInFilter = filteredCards.filter((c) => c.mastered).length;
  const learningInFilter = totalInFilter - masteredInFilter;
  const masteryPercentage = totalInFilter > 0 ? Math.round((masteredInFilter / totalInFilter) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in" id="flashcard-mode-container" data-testid="flashcard-mode-container">
      {/* Top Controls & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
        {/* Left: Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">All Subjects ({flashcards.length})</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({flashcards.filter((c) => c.subjectId === s.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">All Cards</option>
              <option value="learning">Needs Practice ({learningInFilter})</option>
              <option value="mastered">Mastered ({masteredInFilter})</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => setViewMode('practice')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'practice'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Practice Deck</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('manage')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'manage'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Card List ({filteredCards.length})</span>
            </button>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoGenerateModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Auto-generate flashcards from uploaded course material"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Generate from Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Card</span>
          </button>
        </div>
      </div>

      {/* Mastery Summary Mini Banner */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-violet-50/40 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 p-4 rounded-2xl border border-indigo-100 dark:border-slate-800 flex items-center justify-between text-xs transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <Zap className="w-4 h-4 text-amber-500 fill-current" />
            <span>Deck Mastery: <strong className="text-indigo-600 dark:text-indigo-400">{masteryPercentage}%</strong></span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400">
            <strong>{masteredInFilter}</strong> mastered · <strong>{learningInFilter}</strong> need review
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1 text-[11px]"
            title="Shuffle card order"
          >
            <Shuffle className="w-3 h-3 text-slate-500" />
            <span>Shuffle</span>
          </button>
          <button
            type="button"
            onClick={handleResetSession}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1 text-[11px]"
            title="Restart session from beginning"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Main View Area: Practice Mode vs Manage Mode */}
      {viewMode === 'practice' ? (
        filteredCards.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Flashcards in this filter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Change the subject or status filter, or create a brand new digital flashcard to start practicing.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              + Create First Card
            </button>
          </div>
        ) : sessionCompleted ? (
          /* Session Completed Celebration Screen */
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Session Complete! 🎉
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                You reviewed all {totalInFilter} flashcards
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Excellent active recall session. Re-testing unmastered cards strengthens long-term synaptic retention.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-2">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                <span className="block text-xl font-bold">{masteredInFilter}</span>
                <span>Mastered</span>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300">
                <span className="block text-xl font-bold">{learningInFilter}</span>
                <span>Needs Practice</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleResetSession}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Again</span>
              </button>
              {learningInFilter > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('learning');
                    handleResetSession();
                  }}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition-colors"
                >
                  Review Only Unmastered ({learningInFilter})
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Active Flashcard Player */
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Progress counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Card {currentIndex + 1} of {filteredCards.length}
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                {Math.round(((currentIndex + 1) / filteredCards.length) * 100)}%
              </span>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
              />
            </div>

            {/* 3D Interactive Flip Card */}
            <div
              onClick={handleFlip}
              className={`relative min-h-[300px] sm:min-h-[340px] p-8 rounded-3xl border-2 transition-all duration-300 shadow-md flex flex-col justify-between cursor-pointer select-none group ${
                isFlipped
                  ? 'bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-slate-700'
              }`}
            >
              {/* Card Header Tagging */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                    {currentCard.subjectName}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {currentCard.topic}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {currentCard.mastered && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3 h-3" />
                      <span>Mastered</span>
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isFlipped
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isFlipped ? 'Answer / Back' : 'Question / Front'}
                  </span>
                </div>
              </div>

              {/* Card Center Content */}
              <div className="py-6 my-auto text-center space-y-3">
                <p
                  className={`font-semibold tracking-tight leading-relaxed transition-colors ${
                    isFlipped
                      ? 'text-base sm:text-lg text-indigo-950 dark:text-indigo-100 whitespace-pre-line text-left font-sans'
                      : 'text-lg sm:text-xl text-slate-900 dark:text-white font-medium'
                  }`}
                >
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              {/* Card Footer Hint */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>Click card to {isFlipped ? 'view question' : 'reveal answer'}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <RotateCcw className="w-3 h-3" />
                  <span>Flip</span>
                </span>
              </div>
            </div>

            {/* Recall Rating & Navigation Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Previous Button */}
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {/* Rating Actions (Shown when flipped) */}
              {isFlipped ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRateCard(false)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hard / Review</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCard(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Got it! (Mastered)</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleFlip}
                  className="px-5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Reveal Answer</span>
                </button>
              )}

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>{currentIndex === filteredCards.length - 1 ? 'Finish Deck' : 'Next Card'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      ) : (
        /* Manage / Grid View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {card.subjectName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        card.mastered
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {card.mastered ? 'Mastered' : 'Needs Practice'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                    Q: {card.front}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 font-mono">
                    A: {card.back}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Topic: {card.topic}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1 hover:text-rose-600 text-slate-400 rounded-lg transition-colors"
                    title="Delete flashcard"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Modal: Create New Flashcard */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Digital Flashcard</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Topic / Sub-Concept
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Trees, Concurrency"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Front (Question / Prompt) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. What is the difference between BFS and DFS?"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Back (Detailed Answer / Formula) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. BFS uses a Queue (FIFO) for level-order; DFS uses a Stack/recursion (LIFO)..."
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Auto-Generate Flashcards from Notes */}
      {isAutoGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Auto-Generate Deck</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select one of your uploaded course materials. We will automatically extract key concepts and definitions into ready-to-study flashcards.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source Document / Syllabus
                </label>
                <select
                  value={autoGenMaterialId}
                  onChange={(e) => setAutoGenMaterialId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fileName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-800 dark:text-indigo-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Document Topics Available:</span>
                </span>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  {materials.find((m) => m.id === autoGenMaterialId)?.extractedTopics?.join(', ') ||
                    'Core algorithms, data structures, and database principles'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAutoGenerateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGeneratingCards}
                onClick={handleAutoGenerateFromMaterial}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isGeneratingCards ? (
                  <span>Generating Deck...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Flashcards</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
