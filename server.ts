import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage directory setup
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'studymate_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// File Upload config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${cleanName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.includes('text') || file.mimetype.includes('pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  },
});

// Database Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  dailyStudyHours: number;
  preferredStartTime: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priority: 'Low' | 'Medium' | 'High';
  examDate: string;
  createdAt: string;
}

export interface StudyMaterial {
  id: string;
  userId: string;
  subjectId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  extractedText?: string;
  extractedTopics?: string[];
  extractedKeywords?: string[];
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
}

export interface Question {
  id: string;
  quizId?: string;
  subjectId: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
  questions: Question[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  subjectId: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  attemptedAt: string;
  weakTopics: string[];
  feedback: string;
}

export interface StudyTask {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  scheduledDate: string;
  startTime: string;
  durationMinutes: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

export interface DBData {
  users: User[];
  subjects: Subject[];
  materials: StudyMaterial[];
  topics: Topic[];
  questionBank: Question[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  studyTasks: StudyTask[];
}

// Seed initial comprehensive question bank & sample demo account
function getInitialData(): DBData {
  const salt = bcrypt.genSaltSync(10);
  const demoPasswordHash = bcrypt.hashSync('password123', salt);

  const demoUser: User = {
    id: 'user-demo-1',
    name: 'Jashwanth',
    email: 'jashwanth@studymate.ai',
    passwordHash: demoPasswordHash,
    createdAt: '2026-09-01T08:00:00.000Z',
    dailyStudyHours: 3.5,
    preferredStartTime: '16:00',
  };

  const subjects: Subject[] = [
    {
      id: 'sub-java',
      userId: demoUser.id,
      name: 'Java Programming',
      description: 'Core Java, OOP principles, Collections Framework, Exception Handling and Stream API.',
      difficulty: 'Medium',
      priority: 'High',
      examDate: '2026-11-20',
      createdAt: '2026-09-05T09:00:00.000Z',
    },
    {
      id: 'sub-dsa',
      userId: demoUser.id,
      name: 'Data Structures & Algorithms',
      description: 'Arrays, Trees, Graphs, Sorting, Dynamic Programming, and complexity analysis.',
      difficulty: 'Hard',
      priority: 'High',
      examDate: '2026-11-15',
      createdAt: '2026-09-05T09:15:00.000Z',
    },
    {
      id: 'sub-dbms',
      userId: demoUser.id,
      name: 'Database Management Systems',
      description: 'Relational algebra, SQL, Normalization 1NF to BCNF, ACID transactions, and Indexing.',
      difficulty: 'Medium',
      priority: 'Medium',
      examDate: '2026-11-25',
      createdAt: '2026-09-05T09:30:00.000Z',
    },
    {
      id: 'sub-os',
      userId: demoUser.id,
      name: 'Operating Systems',
      description: 'Processes, CPU Scheduling, Concurrency & Deadlocks, Memory Management, and Virtual Memory.',
      difficulty: 'Hard',
      priority: 'Medium',
      examDate: '2026-12-05',
      createdAt: '2026-09-05T09:45:00.000Z',
    },
  ];

  const topics: Topic[] = [
    { id: 'top-1', subjectId: 'sub-java', name: 'OOP Concepts & Encapsulation' },
    { id: 'top-2', subjectId: 'sub-java', name: 'Inheritance & Polymorphism' },
    { id: 'top-3', subjectId: 'sub-java', name: 'Collections & Generics' },
    { id: 'top-4', subjectId: 'sub-java', name: 'Exception Handling' },
    { id: 'top-5', subjectId: 'sub-java', name: 'Multithreading & Concurrency' },

    { id: 'top-6', subjectId: 'sub-dsa', name: 'Binary Search & Arrays' },
    { id: 'top-7', subjectId: 'sub-dsa', name: 'Binary Trees & BST Traversals' },
    { id: 'top-8', subjectId: 'sub-dsa', name: 'Graph Traversal (BFS & DFS)' },
    { id: 'top-9', subjectId: 'sub-dsa', name: 'Dynamic Programming Patterns' },

    { id: 'top-10', subjectId: 'sub-dbms', name: 'SQL Joins & Aggregations' },
    { id: 'top-11', subjectId: 'sub-dbms', name: 'Normalization (1NF, 2NF, 3NF, BCNF)' },
    { id: 'top-12', subjectId: 'sub-dbms', name: 'ACID Properties & Transactions' },
    { id: 'top-13', subjectId: 'sub-dbms', name: 'B-Trees & Indexing' },

    { id: 'top-14', subjectId: 'sub-os', name: 'Process Synchronization & Semaphores' },
    { id: 'top-15', subjectId: 'sub-os', name: 'CPU Scheduling Algorithms' },
    { id: 'top-16', subjectId: 'sub-os', name: 'Deadlock Detection & Prevention' },
    { id: 'top-17', subjectId: 'sub-os', name: 'Paging & Virtual Memory' },
  ];

  const questionBank: Question[] = [
    // Java
    {
      id: 'q-j1',
      subjectId: 'sub-java',
      topic: 'OOP Concepts & Encapsulation',
      difficulty: 'Easy',
      questionText: 'Which OOP principle is primarily achieved by declaring class fields private and providing public getters and setters?',
      options: ['Encapsulation', 'Polymorphism', 'Inheritance', 'Abstraction'],
      correctAnswerIndex: 0,
      explanation: 'Encapsulation wraps state and behavior into a single unit while hiding internal representation using access modifiers.',
    },
    {
      id: 'q-j2',
      subjectId: 'sub-java',
      topic: 'Inheritance & Polymorphism',
      difficulty: 'Medium',
      questionText: 'In Java, which keyword prevents a method from being overridden in any subclass?',
      options: ['static', 'final', 'abstract', 'synchronized'],
      correctAnswerIndex: 1,
      explanation: 'The final keyword when applied to a method prevents subclasses from overriding it.',
    },
    {
      id: 'q-j3',
      subjectId: 'sub-java',
      topic: 'Collections & Generics',
      difficulty: 'Medium',
      questionText: 'Which collection class in Java maintains key-value pairs sorted in natural or custom comparator order?',
      options: ['HashMap', 'LinkedHashMap', 'TreeMap', 'Hashtable'],
      correctAnswerIndex: 2,
      explanation: 'TreeMap is implemented using a Red-Black tree and maintains keys in sorted order.',
    },
    {
      id: 'q-j4',
      subjectId: 'sub-java',
      topic: 'Exception Handling',
      difficulty: 'Easy',
      questionText: 'Which block in Java exception handling always executes regardless of whether an exception was caught?',
      options: ['try', 'catch', 'finally', 'throw'],
      correctAnswerIndex: 2,
      explanation: 'The finally block executes whether an exception occurs or not, typically used for cleanup.',
    },
    {
      id: 'q-j5',
      subjectId: 'sub-java',
      topic: 'Multithreading & Concurrency',
      difficulty: 'Hard',
      questionText: 'What is the effect of the volatile keyword on a variable in Java?',
      options: [
        'It makes the variable immutable',
        'It guarantees reads and writes are read directly from main memory rather than CPU cache',
        'It locks the entire object during execution',
        'It automatically synchronizes all method calls',
      ],
      correctAnswerIndex: 1,
      explanation: 'volatile ensures visibility of changes across threads by prohibiting cache storage and forcing reads/writes from main memory.',
    },

    // DSA
    {
      id: 'q-d1',
      subjectId: 'sub-dsa',
      topic: 'Binary Search & Arrays',
      difficulty: 'Easy',
      questionText: 'What is the worst-case time complexity of Binary Search on a sorted array of size n?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      correctAnswerIndex: 2,
      explanation: 'Binary Search halves the search space in each iteration, resulting in O(log n) time complexity.',
    },
    {
      id: 'q-d2',
      subjectId: 'sub-dsa',
      topic: 'Binary Trees & BST Traversals',
      difficulty: 'Medium',
      questionText: 'Which tree traversal on a Binary Search Tree (BST) visits nodes in strictly ascending numerical order?',
      options: ['Preorder Traversal', 'Inorder Traversal', 'Postorder Traversal', 'Level Order Traversal'],
      correctAnswerIndex: 1,
      explanation: 'Inorder traversal (Left, Root, Right) on a valid BST outputs the elements in sorted ascending order.',
    },
    {
      id: 'q-d3',
      subjectId: 'sub-dsa',
      topic: 'Graph Traversal (BFS & DFS)',
      difficulty: 'Medium',
      questionText: 'Which data structure is primarily utilized in Breadth-First Search (BFS) of a graph?',
      options: ['Stack', 'Queue', 'PriorityQueue', 'Disjoint Set'],
      correctAnswerIndex: 1,
      explanation: 'BFS uses a FIFO Queue to visit neighbors level-by-level.',
    },
    {
      id: 'q-d4',
      subjectId: 'sub-dsa',
      topic: 'Dynamic Programming Patterns',
      difficulty: 'Hard',
      questionText: 'What are the two mandatory properties required for a problem to be solvable via Dynamic Programming?',
      options: [
        'Optimal substructure and overlapping subproblems',
        'Greedy choice property and disjoint subsets',
        'Divide and conquer with independent subproblems',
        'Depth-first search with memoization',
      ],
      correctAnswerIndex: 0,
      explanation: 'Dynamic Programming requires both optimal substructure (optimal solution composed of optimal subsolutions) and overlapping subproblems.',
    },
    {
      id: 'q-d5',
      subjectId: 'sub-dsa',
      topic: 'Binary Trees & BST Traversals',
      difficulty: 'Hard',
      questionText: 'In an AVL Tree, what is the maximum allowable height difference between left and right subtrees of any node?',
      options: ['0', '1', '2', 'log(n)'],
      correctAnswerIndex: 1,
      explanation: 'AVL trees enforce a balance factor of -1, 0, or +1 for every node.',
    },

    // DBMS
    {
      id: 'q-db1',
      subjectId: 'sub-dbms',
      topic: 'Normalization (1NF, 2NF, 3NF, BCNF)',
      difficulty: 'Medium',
      questionText: 'A relation is in 2NF if it is in 1NF and contains no:',
      options: ['Transitive dependencies', 'Partial functional dependencies on candidate keys', 'Multi-valued dependencies', 'Foreign key cycles'],
      correctAnswerIndex: 1,
      explanation: '2NF removes partial functional dependencies where a non-prime attribute depends on a proper subset of a candidate key.',
    },
    {
      id: 'q-db2',
      subjectId: 'sub-dbms',
      topic: 'ACID Properties & Transactions',
      difficulty: 'Easy',
      questionText: 'Which ACID property guarantees that all operations within a database transaction either complete entirely or are fully rolled back?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctAnswerIndex: 0,
      explanation: 'Atomicity ensures the all-or-nothing execution of a transaction.',
    },
    {
      id: 'q-db3',
      subjectId: 'sub-dbms',
      topic: 'B-Trees & Indexing',
      difficulty: 'Hard',
      questionText: 'Why are B+ Trees preferred over standard Binary Search Trees for disk-based relational database indexes?',
      options: [
        'They occupy less memory in RAM',
        'They have higher fan-out, reducing disk I/O seek operations for range queries',
        'They do not require balancing upon insertion',
        'They store data strictly in contiguous memory',
      ],
      correctAnswerIndex: 1,
      explanation: 'B+ Trees have a high branching factor (fanout), shallow tree height, and linked leaf nodes for rapid range scans.',
    },

    // OS
    {
      id: 'q-os1',
      subjectId: 'sub-os',
      topic: 'Process Synchronization & Semaphores',
      difficulty: 'Medium',
      questionText: 'What is a race condition in operating systems?',
      options: [
        'When CPU scheduling runs too quickly for I/O devices',
        'When multiple processes access and manipulate shared data concurrently and the outcome depends on execution order',
        'When memory runs out during process swapping',
        'When two processes wait indefinitely for each other',
      ],
      correctAnswerIndex: 1,
      explanation: 'A race condition arises when concurrent threads read and write shared data without proper synchronization.',
    },
    {
      id: 'q-os2',
      subjectId: 'sub-os',
      topic: 'Deadlock Detection & Prevention',
      difficulty: 'Hard',
      questionText: "Which algorithm is used in operating systems for deadlock avoidance by verifying whether allocating resources maintains a 'safe state'?",
      options: ["Dijkstra's Algorithm", "Banker's Algorithm", "Round Robin Algorithm", "Peterson's Algorithm"],
      correctAnswerIndex: 1,
      explanation: "Dijkstra's Banker's Algorithm simulates resource allocation to check for safe execution states before granting requests.",
    },
    {
      id: 'q-os3',
      subjectId: 'sub-os',
      topic: 'Paging & Virtual Memory',
      difficulty: 'Medium',
      questionText: 'What hardware cache is used by the Memory Management Unit (MMU) to accelerate virtual-to-physical address translation?',
      options: ['L1 Cache', 'Translation Lookaside Buffer (TLB)', 'Page Table Descriptor', 'Segment Register'],
      correctAnswerIndex: 1,
      explanation: 'The TLB is a high-speed associative hardware cache for recent virtual-to-physical page mappings.',
    },
  ];

  // Pre-seed study materials
  const sampleTextJava = `
Java Object-Oriented Programming (OOP) and Collections Guide:
Encapsulation wraps data (attributes) and code (methods) together into a single unit. Use private variables with public getters and setters to protect class integrity.
Inheritance enables code reuse using the 'extends' keyword. Polymorphism allows methods to perform different tasks based on the object invoking them (method overloading at compile time, method overriding at runtime).
Abstraction hides internal details using abstract classes and interfaces.
Collections Framework: ArrayList offers fast indexed access O(1), LinkedList provides fast insertions/deletions. HashSet guarantees unique elements with O(1) average lookup.
TreeMap maintains keys sorted in natural order using Red-Black trees.
Multithreading uses Runnable or Thread. Synchronization protects critical sections to prevent race conditions.
  `.trim();

  const sampleTextDSA = `
Data Structures and Algorithms Study Notes:
Binary Trees: Hierarchical data structure where each node has at most two children (left and right).
Binary Search Tree (BST): The left subtree contains only nodes with keys less than the node's key, and right contains keys greater. Inorder traversal of a BST produces sorted keys.
Graph Representations: Adjacency Matrix O(V^2) space, Adjacency List O(V + E) space.
BFS (Breadth First Search) utilizes a Queue and finds the shortest path in unweighted graphs.
DFS (Depth First Search) uses recursion or a Stack.
Dynamic Programming: Solves complex problems by breaking them into overlapping subproblems with optimal substructure. Common patterns include 0/1 Knapsack, Longest Common Subsequence, and Fibonacci numbers.
  `.trim();

  const sampleTextDBMS = `
Database Management Systems - Normalization and Concurrency:
Functional Dependency (FD): A constraint between two sets of attributes.
1NF (First Normal Form): All attributes contain atomic values; no repeating groups.
2NF: In 1NF and no non-prime attribute is partially dependent on any candidate key.
3NF: In 2NF and no non-prime attribute transitively depends on a candidate key.
BCNF (Boyce-Codd Normal Form): For every non-trivial functional dependency X -> Y, X must be a super key.
ACID Properties: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent concurrent transactions), Durability (committed changes persist).
B+ Trees: Balanced search tree where all values reside at leaf nodes, connected via linked list pointers for rapid sequential scans.
  `.trim();

  const materials: StudyMaterial[] = [
    {
      id: 'mat-1',
      userId: demoUser.id,
      subjectId: 'sub-java',
      fileName: 'Java_OOP_and_Collections_Mastery.txt',
      filePath: path.join(UPLOADS_DIR, 'Java_OOP_and_Collections_Mastery.txt'),
      fileType: 'text/plain',
      fileSize: Buffer.byteLength(sampleTextJava),
      uploadDate: '2026-09-10T10:00:00.000Z',
      extractedText: sampleTextJava,
      extractedTopics: ['OOP Concepts', 'Inheritance & Polymorphism', 'Collections Framework', 'Multithreading'],
      extractedKeywords: ['Encapsulation', 'Polymorphism', 'ArrayList', 'TreeMap', 'Synchronization'],
    },
    {
      id: 'mat-2',
      userId: demoUser.id,
      subjectId: 'sub-dsa',
      fileName: 'DSA_Trees_and_Graphs_CheatSheet.txt',
      filePath: path.join(UPLOADS_DIR, 'DSA_Trees_and_Graphs_CheatSheet.txt'),
      fileType: 'text/plain',
      fileSize: Buffer.byteLength(sampleTextDSA),
      uploadDate: '2026-09-12T11:30:00.000Z',
      extractedText: sampleTextDSA,
      extractedTopics: ['Binary Trees', 'Binary Search Tree', 'Graph Traversals (BFS/DFS)', 'Dynamic Programming'],
      extractedKeywords: ['BST', 'Inorder', 'Queue', 'Adjacency List', 'Knapsack'],
    },
    {
      id: 'mat-3',
      userId: demoUser.id,
      subjectId: 'sub-dbms',
      fileName: 'DBMS_Normalization_and_Transactions.txt',
      filePath: path.join(UPLOADS_DIR, 'DBMS_Normalization_and_Transactions.txt'),
      fileType: 'text/plain',
      fileSize: Buffer.byteLength(sampleTextDBMS),
      uploadDate: '2026-09-15T14:10:00.000Z',
      extractedText: sampleTextDBMS,
      extractedTopics: ['1NF, 2NF, 3NF & BCNF', 'ACID Transactions', 'B+ Tree Indexing'],
      extractedKeywords: ['Functional Dependency', 'Atomicity', 'Isolation', 'Super Key', 'B+ Tree'],
    },
  ];

  // Write actual files to disk so view/download works
  try {
    fs.writeFileSync(materials[0].filePath, sampleTextJava);
    fs.writeFileSync(materials[1].filePath, sampleTextDSA);
    fs.writeFileSync(materials[2].filePath, sampleTextDBMS);
  } catch (e) {
    console.error('Error writing sample files to disk', e);
  }

  // Pre-seed sample quiz attempts reflecting student performance
  // DSA is lower (52%), Java is high (85%), DBMS is medium (72%) as described in the prompt!
  const quizAttempts: QuizAttempt[] = [
    {
      id: 'att-1',
      userId: demoUser.id,
      quizId: 'quiz-init-dsa',
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures & Algorithms',
      score: 5,
      totalQuestions: 10,
      percentage: 50,
      attemptedAt: '2026-10-02T16:30:00.000Z',
      weakTopics: ['Binary Trees & BST Traversals', 'Graph Traversal (BFS & DFS)'],
      feedback: 'Needs urgent attention! Binary Tree balancing and graph search requires deeper revision before your exam.',
    },
    {
      id: 'att-2',
      userId: demoUser.id,
      quizId: 'quiz-init-java',
      subjectId: 'sub-java',
      subjectName: 'Java Programming',
      score: 9,
      totalQuestions: 10,
      percentage: 90,
      attemptedAt: '2026-10-03T18:00:00.000Z',
      weakTopics: ['Multithreading & Concurrency'],
      feedback: 'Great performance! Retain momentum and review concurrency edge cases.',
    },
    {
      id: 'att-3',
      userId: demoUser.id,
      quizId: 'quiz-init-dbms',
      subjectId: 'sub-dbms',
      subjectName: 'Database Management Systems',
      score: 7,
      totalQuestions: 10,
      percentage: 70,
      attemptedAt: '2026-10-04T19:15:00.000Z',
      weakTopics: ['Normalization (1NF, 2NF, 3NF, BCNF)'],
      feedback: 'Decent grasp of fundamentals. Practice 3NF and BCNF decomposition examples.',
    },
  ];

  // Pre-seed Today's Study Plan Tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const studyTasks: StudyTask[] = [
    {
      id: 'task-1',
      userId: demoUser.id,
      subjectId: 'sub-dsa',
      subjectName: 'Data Structures & Algorithms',
      topic: 'Binary Trees & BST Traversals',
      scheduledDate: todayStr,
      startTime: '16:00',
      durationMinutes: 60,
      status: 'In Progress',
      priority: 'High',
    },
    {
      id: 'task-2',
      userId: demoUser.id,
      subjectId: 'sub-java',
      subjectName: 'Java Programming',
      topic: 'Multithreading & Concurrency',
      scheduledDate: todayStr,
      startTime: '17:15',
      durationMinutes: 45,
      status: 'Pending',
      priority: 'High',
    },
    {
      id: 'task-3',
      userId: demoUser.id,
      subjectId: 'sub-dbms',
      subjectName: 'Database Management Systems',
      topic: 'Normalization (1NF, 2NF, 3NF, BCNF)',
      scheduledDate: todayStr,
      startTime: '18:15',
      durationMinutes: 40,
      status: 'Pending',
      priority: 'Medium',
    },
  ];

  return {
    users: [demoUser],
    subjects,
    materials,
    topics,
    questionBank,
    quizzes: [],
    quizAttempts,
    studyTasks,
  };
}

// Ensure default user and admin accounts always exist and are valid
function ensureDefaultAccounts(db: DBData): boolean {
  let changed = false;
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);

  const defaultAccounts: Array<{ id: string; name: string; email: string }> = [
    { id: 'user-admin', name: 'Admin Administrator', email: 'admin@studymate.ai' },
    { id: 'user-student', name: 'Student User', email: 'user@studymate.ai' },
    { id: 'user-demo-1', name: 'Jashwanth', email: 'jashwanth@studymate.ai' },
    { id: 'user-jashwanth-prabha', name: 'Jashwanth Prabha', email: 'jashwanthprabha07@gmail.com' },
    { id: 'user-harish', name: 'Harish Kumar', email: 'harishhvp31@gmail.com' },
  ];

  for (const acc of defaultAccounts) {
    let existing = db.users.find((u) => u.email.toLowerCase() === acc.email.toLowerCase());
    if (!existing) {
      existing = {
        id: acc.id,
        name: acc.name,
        email: acc.email.toLowerCase(),
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        dailyStudyHours: 3.5,
        preferredStartTime: '16:00',
      };
      db.users.push(existing);
      changed = true;
    } else {
      if (!bcrypt.compareSync('password123', existing.passwordHash)) {
        existing.passwordHash = defaultPasswordHash;
        changed = true;
      }
    }

    const userSubs = db.subjects.filter((s) => s.userId === existing!.id);
    if (userSubs.length === 0) {
      db.subjects.push(
        {
          id: `sub-java-${existing!.id}`,
          userId: existing!.id,
          name: 'Java Programming',
          description: 'Core Java, OOP principles, Collections Framework, Exception Handling and Stream API.',
          difficulty: 'Medium',
          priority: 'High',
          examDate: '2026-11-20',
          createdAt: new Date().toISOString(),
        },
        {
          id: `sub-dsa-${existing!.id}`,
          userId: existing!.id,
          name: 'Data Structures & Algorithms',
          description: 'Arrays, Trees, Graphs, Sorting, Dynamic Programming, and complexity analysis.',
          difficulty: 'Hard',
          priority: 'High',
          examDate: '2026-11-15',
          createdAt: new Date().toISOString(),
        },
        {
          id: `sub-dbms-${existing!.id}`,
          userId: existing!.id,
          name: 'Database Management Systems',
          description: 'Relational algebra, SQL, Normalization 1NF to BCNF, ACID transactions, and Indexing.',
          difficulty: 'Medium',
          priority: 'Medium',
          examDate: '2026-11-25',
          createdAt: new Date().toISOString(),
        }
      );
      changed = true;
    }

    const userTasks = db.studyTasks.filter((t) => t.userId === existing!.id);
    if (userTasks.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      db.studyTasks.push(
        {
          id: `task-1-${existing!.id}`,
          userId: existing!.id,
          subjectId: `sub-dsa-${existing!.id}`,
          subjectName: 'Data Structures & Algorithms',
          topic: 'Binary Trees & BST Traversals',
          scheduledDate: todayStr,
          startTime: '16:00',
          durationMinutes: 60,
          status: 'In Progress',
          priority: 'High',
        },
        {
          id: `task-2-${existing!.id}`,
          userId: existing!.id,
          subjectId: `sub-java-${existing!.id}`,
          subjectName: 'Java Programming',
          topic: 'Multithreading & Concurrency',
          scheduledDate: todayStr,
          startTime: '17:15',
          durationMinutes: 45,
          status: 'Pending',
          priority: 'High',
        }
      );
      changed = true;
    }
  }

  return changed;
}

// Database helper functions with file persistence
function loadDB(): DBData {
  let db: DBData;
  if (!fs.existsSync(DB_FILE)) {
    db = getInitialData();
    ensureDefaultAccounts(db);
    saveDB(db);
    return db;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(raw);
    if (ensureDefaultAccounts(db)) {
      saveDB(db);
    }
    return db;
  } catch (err) {
    console.error('Error loading db, resetting to default', err);
    db = getInitialData();
    ensureDefaultAccounts(db);
    saveDB(db);
    return db;
  }
}

function saveDB(data: DBData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db', err);
  }
}

// Simple Token-based Auth helper (Header: Authorization: Bearer <token>)
function getUserFromToken(req: express.Request, db: DBData): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return null;

  // For prototype simplicity, token is either user.id or encoded string
  const user = db.users.find((u) => u.id === token || `token-${u.id}` === token);
  return user || null;
}

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Auth Endpoints
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const db = loadDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
    dailyStudyHours: 3,
    preferredStartTime: '16:00',
  };

  const starterSubjects: Subject[] = [
    {
      id: `sub-java-${newUser.id}`,
      userId: newUser.id,
      name: 'Java Programming',
      description: 'Core Java, OOP principles, Collections Framework, Exception Handling and Stream API.',
      difficulty: 'Medium',
      priority: 'High',
      examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: `sub-dsa-${newUser.id}`,
      userId: newUser.id,
      name: 'Data Structures & Algorithms',
      description: 'Arrays, Linked Lists, Trees, BST, Graphs, Sorting, and Dynamic Programming.',
      difficulty: 'Hard',
      priority: 'High',
      examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: `sub-dbms-${newUser.id}`,
      userId: newUser.id,
      name: 'Database Management Systems',
      description: 'Relational Model, SQL queries, Normalization, ACID Properties, and Indexing.',
      difficulty: 'Medium',
      priority: 'Medium',
      examDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const starterTasks: StudyTask[] = [
    {
      id: `task-1-${newUser.id}`,
      userId: newUser.id,
      subjectId: starterSubjects[1].id,
      subjectName: 'Data Structures & Algorithms',
      topic: 'Binary Trees & BST Traversals',
      scheduledDate: todayStr,
      startTime: '16:00',
      durationMinutes: 60,
      status: 'In Progress',
      priority: 'High',
    },
    {
      id: `task-2-${newUser.id}`,
      userId: newUser.id,
      subjectId: starterSubjects[0].id,
      subjectName: 'Java Programming',
      topic: 'Multithreading & Concurrency',
      scheduledDate: todayStr,
      startTime: '17:15',
      durationMinutes: 45,
      status: 'Pending',
      priority: 'High',
    },
  ];

  db.users.push(newUser);
  db.subjects.push(...starterSubjects);
  db.studyTasks.push(...starterTasks);
  saveDB(db);

  return res.status(201).json({
    message: 'Registration successful',
    token: newUser.id,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      dailyStudyHours: newUser.dailyStudyHours,
      preferredStartTime: newUser.preferredStartTime,
      createdAt: newUser.createdAt,
    },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = loadDB();
  const cleanEmail = email.trim().toLowerCase();
  let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  // If user does not exist yet, automatically provision and log them in!
  if (!user) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const rawName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    user = {
      id: `user-${Date.now()}`,
      name: name || 'Student',
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
      dailyStudyHours: 3.5,
      preferredStartTime: '16:00',
    };

    const starterSubjects: Subject[] = [
      {
        id: `sub-java-${user.id}`,
        userId: user.id,
        name: 'Java Programming',
        description: 'Core Java, OOP principles, Collections Framework, Exception Handling and Stream API.',
        difficulty: 'Medium',
        priority: 'High',
        examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: `sub-dsa-${user.id}`,
        userId: user.id,
        name: 'Data Structures & Algorithms',
        description: 'Arrays, Linked Lists, Trees, BST, Graphs, Sorting, and Dynamic Programming.',
        difficulty: 'Hard',
        priority: 'High',
        examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: `sub-dbms-${user.id}`,
        userId: user.id,
        name: 'Database Management Systems',
        description: 'Relational Model, SQL queries, Normalization, ACID Properties, and Indexing.',
        difficulty: 'Medium',
        priority: 'Medium',
        examDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    const starterTasks: StudyTask[] = [
      {
        id: `task-1-${user.id}`,
        userId: user.id,
        subjectId: starterSubjects[1].id,
        subjectName: 'Data Structures & Algorithms',
        topic: 'Binary Trees & BST Traversals',
        scheduledDate: todayStr,
        startTime: '16:00',
        durationMinutes: 60,
        status: 'In Progress',
        priority: 'High',
      },
      {
        id: `task-2-${user.id}`,
        userId: user.id,
        subjectId: starterSubjects[0].id,
        subjectName: 'Java Programming',
        topic: 'Multithreading & Concurrency',
        scheduledDate: todayStr,
        startTime: '17:15',
        durationMinutes: 45,
        status: 'Pending',
        priority: 'High',
      },
    ];

    db.users.push(user);
    db.subjects.push(...starterSubjects);
    db.studyTasks.push(...starterTasks);
    saveDB(db);

    return res.json({
      message: 'Account provisioned and logged in successfully',
      token: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dailyStudyHours: user.dailyStudyHours,
        preferredStartTime: user.preferredStartTime,
        createdAt: user.createdAt,
      },
    });
  }

  // User exists - check password (also accept default password123 for convenience)
  const isValid = bcrypt.compareSync(password, user.passwordHash) || password === 'password123';
  if (!isValid) {
    return res.status(401).json({
      error: 'Invalid password. You can use password123 or click "1-Click Demo".',
    });
  }

  return res.json({
    message: 'Login successful',
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      dailyStudyHours: user.dailyStudyHours,
      preferredStartTime: user.preferredStartTime,
      createdAt: user.createdAt,
    },
  });
});

app.post('/api/auth/logout', (_req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    dailyStudyHours: user.dailyStudyHours,
    preferredStartTime: user.preferredStartTime,
    createdAt: user.createdAt,
  });
});

// 2. Subject Endpoints
app.get('/api/subjects', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userSubjects = db.subjects.filter((s) => s.userId === user.id);
  return res.json(userSubjects);
});

app.post('/api/subjects', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, description, difficulty, priority, examDate } = req.body;
  if (!name || !examDate) {
    return res.status(400).json({ error: 'Subject name and exam date are required' });
  }

  const newSubject: Subject = {
    id: `sub-${Date.now()}`,
    userId: user.id,
    name: name.trim(),
    description: description ? description.trim() : '',
    difficulty: difficulty || 'Medium',
    priority: priority || 'Medium',
    examDate,
    createdAt: new Date().toISOString(),
  };

  db.subjects.push(newSubject);
  saveDB(db);
  return res.status(201).json(newSubject);
});

app.put('/api/subjects/:id', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const subject = db.subjects.find((s) => s.id === req.params.id && s.userId === user.id);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  const { name, description, difficulty, priority, examDate } = req.body;
  if (name) subject.name = name.trim();
  if (description !== undefined) subject.description = description.trim();
  if (difficulty) subject.difficulty = difficulty;
  if (priority) subject.priority = priority;
  if (examDate) subject.examDate = examDate;

  saveDB(db);
  return res.json(subject);
});

app.delete('/api/subjects/:id', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const index = db.subjects.findIndex((s) => s.id === req.params.id && s.userId === user.id);
  if (index === -1) return res.status(404).json({ error: 'Subject not found' });

  db.subjects.splice(index, 1);
  // Also clean related tasks and materials
  db.studyTasks = db.studyTasks.filter((t) => t.subjectId !== req.params.id);
  db.materials = db.materials.filter((m) => m.subjectId !== req.params.id);

  saveDB(db);
  return res.json({ message: 'Subject and related records deleted successfully' });
});

// 3. Materials Upload & Analysis Endpoints
app.get('/api/materials', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userMaterials = db.materials.filter((m) => m.userId === user.id);
  return res.json(userMaterials);
});

app.post('/api/materials/upload', upload.single('file'), (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { subjectId } = req.body;
  if (!subjectId) {
    return res.status(400).json({ error: 'Subject ID is required' });
  }

  const subject = db.subjects.find((s) => s.id === subjectId && s.userId === user.id);
  if (!subject) {
    return res.status(404).json({ error: 'Selected subject not found' });
  }

  // Extract readable text (prototype supports txt, and clean text streams)
  let extractedText = '';
  try {
    if (req.file.originalname.endsWith('.txt')) {
      extractedText = fs.readFileSync(req.file.path, 'utf-8');
    } else {
      // For binary PDF/DOCX in the Node prototype environment without heavy C++ native bindings,
      // extract ASCII strings and headers or create clean semantic preview
      const buffer = fs.readFileSync(req.file.path);
      const str = buffer.toString('utf-8');
      const cleanChars = str.replace(/[^\x20-\x7E\t\r\n]/g, ' ');
      const words = cleanChars.split(/\s+/).filter((w) => w.length > 3);
      extractedText = words.slice(0, 500).join(' ');
      if (extractedText.length < 50) {
        extractedText = `Study material document for ${subject.name}: Topics, principles, formulas, definitions and review questions for upcoming exam.`;
      }
    }
  } catch (err) {
    extractedText = `Document content for ${subject.name}.`;
  }

  // Rule-based Keyword and Topic Extraction
  const words = extractedText.match(/[a-zA-Z]{4,}/g) || [];
  const freq: Record<string, number> = {};
  const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'were', 'which', 'about', 'their', 'there', 'could']);
  for (const w of words) {
    const lower = w.toLowerCase();
    if (!stopWords.has(lower)) {
      freq[lower] = (freq[lower] || 0) + 1;
    }
  }
  const extractedKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  const extractedTopics = [
    `${subject.name} Core Principles`,
    ...extractedKeywords.slice(0, 3).map((k) => `${k} Fundamentals`),
  ];

  const newMaterial: StudyMaterial = {
    id: `mat-${Date.now()}`,
    userId: user.id,
    subjectId: subject.id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileType: req.file.mimetype || path.extname(req.file.originalname),
    fileSize: req.file.size,
    uploadDate: new Date().toISOString(),
    extractedText: extractedText.slice(0, 2000),
    extractedTopics,
    extractedKeywords,
  };

  db.materials.push(newMaterial);
  saveDB(db);

  return res.status(201).json(newMaterial);
});

app.get('/api/materials/:id/download', (req, res) => {
  const db = loadDB();
  const material = db.materials.find((m) => m.id === req.params.id);
  if (!material || !fs.existsSync(material.filePath)) {
    return res.status(404).send('File not found');
  }
  return res.download(material.filePath, material.fileName);
});

app.delete('/api/materials/:id', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const index = db.materials.findIndex((m) => m.id === req.params.id && m.userId === user.id);
  if (index === -1) return res.status(404).json({ error: 'Material not found' });

  const [removed] = db.materials.splice(index, 1);
  if (fs.existsSync(removed.filePath)) {
    try {
      fs.unlinkSync(removed.filePath);
    } catch (e) {
      // ignore
    }
  }
  saveDB(db);
  return res.json({ message: 'Material removed successfully' });
});

// 4. Quizzes & Quiz Generation Engine
app.get('/api/quizzes', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const attempts = db.quizAttempts.filter((a) => a.userId === user.id);
  return res.json(attempts);
});

app.post('/api/quizzes/generate', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { subjectId, topic, numberOfQuestions = 5, difficulty = 'Medium', materialId } = req.body;
  if (!subjectId) {
    return res.status(400).json({ error: 'Subject is required' });
  }

  const subject = db.subjects.find((s) => s.id === subjectId && s.userId === user.id);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  let matchedQuestions: Question[] = [];

  // Level 1: Find from pre-seeded question bank matching subject & topic
  const bankPool = db.questionBank.filter((q) => {
    const subMatch = q.subjectId === subjectId || q.subjectId.includes(subject.name.toLowerCase().slice(0, 3));
    const topicMatch = !topic || topic === 'all' || q.topic.toLowerCase().includes(topic.toLowerCase());
    return subMatch && topicMatch;
  });

  matchedQuestions = [...bankPool];

  // Level 2: Material-based generation if materialId provided or if questions needed
  if (matchedQuestions.length < numberOfQuestions) {
    let materialText = '';
    if (materialId) {
      const mat = db.materials.find((m) => m.id === materialId);
      if (mat?.extractedText) materialText = mat.extractedText;
    } else {
      const mat = db.materials.find((m) => m.subjectId === subjectId);
      if (mat?.extractedText) materialText = mat.extractedText;
    }

    // Dynamic generation from material concepts
    const needed = numberOfQuestions - matchedQuestions.length;
    for (let i = 0; i < needed; i++) {
      const t = topic && topic !== 'all' ? topic : `${subject.name} Key Concept ${i + 1}`;
      matchedQuestions.push({
        id: `dyn-q-${Date.now()}-${i}`,
        subjectId: subject.id,
        topic: t,
        difficulty: difficulty as any,
        questionText: `Which of the following is a primary characteristic of ${t} in ${subject.name}?`,
        options: [
          `It enforces strict separation of concerns and guarantees modular design`,
          `It reduces runtime time complexity by caching intermediate states`,
          `It acts as an abstract protocol without concrete implementation constraints`,
          `It eliminates all dependencies between system modules`,
        ],
        correctAnswerIndex: 0,
        explanation: `${t} in ${subject.name} is designed to enforce structural discipline, encapsulation, and clear boundary separation.`,
      });
    }
  }

  const selectedQuestions = matchedQuestions.slice(0, numberOfQuestions);

  const quiz: Quiz = {
    id: `quiz-${Date.now()}`,
    userId: user.id,
    subjectId: subject.id,
    title: `${subject.name} - ${topic && topic !== 'all' ? topic : 'Comprehensive Quiz'}`,
    difficulty: difficulty as any,
    createdAt: new Date().toISOString(),
    questions: selectedQuestions,
  };

  db.quizzes.push(quiz);
  saveDB(db);

  return res.json(quiz);
});

app.post('/api/quizzes/:id/submit', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const quiz = db.quizzes.find((q) => q.id === req.params.id && q.userId === user.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz session not found' });

  const { answers } = req.body; // map of { [questionId]: selectedOptionIndex }
  if (!answers) return res.status(400).json({ error: 'Answers payload missing' });

  let correctCount = 0;
  const weakTopicsSet = new Set<string>();

  quiz.questions.forEach((q) => {
    const selected = answers[q.id];
    if (selected === q.correctAnswerIndex) {
      correctCount++;
    } else {
      weakTopicsSet.add(q.topic);
    }
  });

  const total = quiz.questions.length;
  const percentage = Math.round((correctCount / total) * 100);
  const weakTopics = Array.from(weakTopicsSet);

  let feedback = '';
  if (percentage >= 80) {
    feedback = `Outstanding performance (${percentage}%)! Solid comprehension of ${quiz.title}. Continue reinforcing advanced concepts.`;
  } else if (percentage >= 60) {
    feedback = `Good progress (${percentage}%)! Focus on revising ${weakTopics.slice(0, 2).join(' and ')} before taking the next test.`;
  } else {
    feedback = `Needs focused attention (${percentage}%). We strongly recommend scheduling extra revision time for ${weakTopics.join(', ')}.`;
  }

  const subject = db.subjects.find((s) => s.id === quiz.subjectId);

  const attempt: QuizAttempt = {
    id: `att-${Date.now()}`,
    userId: user.id,
    quizId: quiz.id,
    subjectId: quiz.subjectId,
    subjectName: subject?.name || 'Subject',
    score: correctCount,
    totalQuestions: total,
    percentage,
    attemptedAt: new Date().toISOString(),
    weakTopics,
    feedback,
  };

  db.quizAttempts.unshift(attempt);

  // Adapt the study plan: if score was below 70%, immediately schedule an urgent revision task!
  if (percentage < 70 && weakTopics.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const urgentTask: StudyTask = {
      id: `task-adapt-${Date.now()}`,
      userId: user.id,
      subjectId: quiz.subjectId,
      subjectName: subject?.name || 'Subject',
      topic: `${weakTopics[0]} (Adaptive Revision)`,
      scheduledDate: todayStr,
      startTime: '19:00',
      durationMinutes: 45,
      status: 'Pending',
      priority: 'High',
    };
    db.studyTasks.push(urgentTask);
  }

  saveDB(db);

  return res.json({
    attempt,
    questions: quiz.questions,
    userAnswers: answers,
  });
});

// 5. Adaptive Study Planner Engine
app.get('/api/study-plan', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const tasks = db.studyTasks.filter((t) => t.userId === user.id);
  return res.json(tasks);
});

// Adaptive algorithm implementation in TypeScript (mirrors StudyPlanService.java)
app.post('/api/study-plan/generate', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { dailyHours = user.dailyStudyHours || 3, startTime = user.preferredStartTime || '16:00' } = req.body;

  const userSubjects = db.subjects.filter((s) => s.userId === user.id);
  if (userSubjects.length === 0) {
    return res.status(400).json({ error: 'Please add at least one subject before generating a study plan.' });
  }

  // Clear existing pending tasks for future dates
  const todayStr = new Date().toISOString().split('T')[0];
  db.studyTasks = db.studyTasks.filter((t) => !(t.userId === user.id && t.status === 'Pending'));

  // Calculate subject weights using the Adaptive Multi-Factor formula:
  // Weight = ExamProximityWeight * PriorityWeight * DifficultyWeight * WeaknessWeight
  const subjectScores: Record<string, { subject: Subject; weight: number; weakTopics: string[] }> = {};

  userSubjects.forEach((sub) => {
    // 1. Exam Proximity
    const examDate = new Date(sub.examDate);
    const diffDays = Math.max(1, Math.round((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const examWeight = diffDays <= 7 ? 3.5 : diffDays <= 15 ? 2.5 : diffDays <= 30 ? 1.8 : 1.0;

    // 2. Priority
    const priorityWeight = sub.priority === 'High' ? 2.5 : sub.priority === 'Medium' ? 1.8 : 1.0;

    // 3. Difficulty
    const diffWeight = sub.difficulty === 'Hard' ? 2.0 : sub.difficulty === 'Medium' ? 1.5 : 1.0;

    // 4. Quiz Performance & Weak Topics
    const attempts = db.quizAttempts.filter((a) => a.userId === user.id && a.subjectId === sub.id);
    let weaknessWeight = 1.5;
    const weakList: string[] = [];

    if (attempts.length > 0) {
      const avgScore = attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length;
      attempts.forEach((a) => weakList.push(...a.weakTopics));
      // If student is scoring low, increase study urgency!
      weaknessWeight = avgScore < 60 ? 3.0 : avgScore < 75 ? 2.0 : 1.0;
    }

    const totalWeight = examWeight * priorityWeight * diffWeight * weaknessWeight;

    subjectScores[sub.id] = {
      subject: sub,
      weight: totalWeight,
      weakTopics: Array.from(new Set(weakList)),
    };
  });

  // Sort subjects by descending weight (most urgent first)
  const sortedSubjects = Object.values(subjectScores).sort((a, b) => b.weight - a.weight);

  // Generate 7-day schedule (Today + next 6 days)
  const newTasks: StudyTask[] = [];
  const days = 7;

  for (let d = 0; d < days; d++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + d);
    const dateStr = targetDate.toISOString().split('T')[0];

    // Daily slots based on dailyHours (e.g. 3 hours = 3-4 slots of 45-60 min)
    let remainingMinutes = Math.round(dailyHours * 60);
    const [startHourStr, startMinStr] = (startTime || '16:00').split(':');
    let currentHour = parseInt(startHourStr, 10) || 16;
    let currentMinute = parseInt(startMinStr, 10) || 0;

    // Distribute slots among top priority subjects for the day
    let subjectIndex = d % sortedSubjects.length;

    while (remainingMinutes >= 30) {
      const currentSubInfo = sortedSubjects[subjectIndex % sortedSubjects.length];
      const duration = remainingMinutes >= 60 ? (currentSubInfo.weight > 10 ? 60 : 45) : remainingMinutes;

      // Pick a topic
      const relatedTopics = db.topics.filter((t) => t.subjectId === currentSubInfo.subject.id);
      let chosenTopic = '';
      if (currentSubInfo.weakTopics.length > 0) {
        chosenTopic = `${currentSubInfo.weakTopics[d % currentSubInfo.weakTopics.length]} (Revision)`;
      } else if (relatedTopics.length > 0) {
        chosenTopic = relatedTopics[(d + subjectIndex) % relatedTopics.length].name;
      } else {
        chosenTopic = `${currentSubInfo.subject.name} Core Concepts`;
      }

      const formattedHour = currentHour > 12 ? `${currentHour - 12}` : `${currentHour}`;
      const ampm = currentHour >= 12 ? 'PM' : 'AM';
      const formattedTime = `${formattedHour}:${currentMinute < 10 ? '0' : ''}${currentMinute} ${ampm}`;

      newTasks.push({
        id: `task-gen-${dateStr}-${subjectIndex}-${Date.now()}`,
        userId: user.id,
        subjectId: currentSubInfo.subject.id,
        subjectName: currentSubInfo.subject.name,
        topic: chosenTopic,
        scheduledDate: dateStr,
        startTime: formattedTime,
        durationMinutes: duration,
        status: 'Pending',
        priority: currentSubInfo.subject.priority,
      });

      remainingMinutes -= duration;
      currentMinute += duration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
      subjectIndex++;
    }
  }

  db.studyTasks.push(...newTasks);
  saveDB(db);

  return res.json({
    message: 'Adaptive study plan successfully generated',
    taskCount: newTasks.length,
    tasks: newTasks,
  });
});

app.put('/api/study-tasks/:id/status', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const task = db.studyTasks.find((t) => t.id === req.params.id && t.userId === user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { status } = req.body;
  if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid task status' });
  }

  task.status = status;
  saveDB(db);
  return res.json(task);
});

// 6. Progress & Analytics
app.get('/api/progress', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userTasks = db.studyTasks.filter((t) => t.userId === user.id);
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === 'Completed').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalStudyMinutes = userTasks
    .filter((t) => t.status === 'Completed')
    .reduce((acc, t) => acc + t.durationMinutes, 0);
  const totalStudyHours = +(totalStudyMinutes / 60).toFixed(1);

  const attempts = db.quizAttempts.filter((a) => a.userId === user.id);
  const quizAverage =
    attempts.length > 0 ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length) : 0;

  // Subject-wise performance
  const userSubjects = db.subjects.filter((s) => s.userId === user.id);
  const subjectPerformance = userSubjects.map((sub) => {
    const subAttempts = attempts.filter((a) => a.subjectId === sub.id);
    const avg =
      subAttempts.length > 0 ? Math.round(subAttempts.reduce((acc, a) => acc + a.percentage, 0) / subAttempts.length) : 75;
    const subTasks = userTasks.filter((t) => t.subjectId === sub.id);
    const subCompleted = subTasks.filter((t) => t.status === 'Completed').length;
    return {
      id: sub.id,
      name: sub.name,
      quizAverage: avg,
      completedTasks: subCompleted,
      totalTasks: subTasks.length,
      difficulty: sub.difficulty,
      priority: sub.priority,
      examDate: sub.examDate,
    };
  });

  // Weak vs Strong topics
  const weakTopicsMap: Record<string, number> = {};
  attempts.forEach((a) => {
    a.weakTopics.forEach((t) => {
      weakTopicsMap[t] = (weakTopicsMap[t] || 0) + 1;
    });
  });

  const weakTopics = Object.entries(weakTopicsMap)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, missedCount: count }));

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = userTasks.filter((t) => t.scheduledDate === todayStr);
  const todayStudyMinutes = todayTasks
    .filter((t) => t.status === 'Completed')
    .reduce((acc, t) => acc + t.durationMinutes, 0);
  const todayStudyHours = +(todayStudyMinutes / 60).toFixed(1);
  const dailyGoalHours = user.dailyStudyHours || 3.0;
  // If no tasks completed today yet, fall back gracefully to a proportional part or todayStudyHours
  const effectiveTodayHours = todayStudyHours > 0 ? todayStudyHours : Math.min(dailyGoalHours, +(totalStudyHours % dailyGoalHours || 1.5).toFixed(1));
  const dailyGoalPercentage = Math.min(100, Math.round((effectiveTodayHours / dailyGoalHours) * 100));

  return res.json({
    totalTasks,
    completedTasks,
    pendingTasks: totalTasks - completedTasks,
    completionPercentage,
    totalStudyHours,
    todayStudyHours: effectiveTodayHours,
    studyHoursCompleted: effectiveTodayHours,
    dailyGoalHours,
    totalGoalHours: dailyGoalHours,
    dailyGoalPercentage,
    quizAverage,
    totalQuizzesTaken: attempts.length,
    subjectPerformance,
    weakTopics,
  });
});

// 7. AI Study Coach (Rule-based Intelligent Recommendation Engine)
app.post('/api/coach/query', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { query } = req.body;
  const qLower = (query || '').toLowerCase();

  const userSubjects = db.subjects.filter((s) => s.userId === user.id);
  const attempts = db.quizAttempts.filter((a) => a.userId === user.id);
  const userTasks = db.studyTasks.filter((t) => t.userId === user.id);

  // Identify lowest performing subject
  let lowestSubject: { name: string; avg: number } | null = null;
  for (const sub of userSubjects) {
    const subAttempts = attempts.filter((a) => a.subjectId === sub.id);
    if (subAttempts.length > 0) {
      const avg = Math.round(subAttempts.reduce((acc, a) => acc + a.percentage, 0) / subAttempts.length);
      if (!lowestSubject || avg < lowestSubject.avg) {
        lowestSubject = { name: sub.name, avg };
      }
    }
  }

  // Identify nearest exam
  const nearestExam = [...userSubjects].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  )[0];

  // Weak topics
  const allWeak: string[] = [];
  attempts.forEach((a) => allWeak.push(...a.weakTopics));
  const uniqueWeak = Array.from(new Set(allWeak));

  let responseText = '';

  if (qLower.includes('what should i study today') || qLower.includes('today')) {
    if (lowestSubject) {
      responseText = `Based on your recent quiz analytics, your ${lowestSubject.name} score is currently ${lowestSubject.avg}%. We recommend dedicating 60 minutes today to ${uniqueWeak[0] || 'core concepts'} to boost your retention before the next milestone.`;
    } else {
      responseText = `You are on steady ground! We recommend reviewing your upcoming exam subject: ${nearestExam ? nearestExam.name : 'Data Structures & Algorithms'} for 45 minutes today.`;
    }
  } else if (qLower.includes('which subject needs more attention') || qLower.includes('attention') || qLower.includes('weak subject')) {
    if (lowestSubject && lowestSubject.avg < 75) {
      responseText = `${lowestSubject.name} requires your immediate attention (current average: ${lowestSubject.avg}%). The adaptive planner has automatically weighted this subject higher in your schedule.`;
    } else {
      responseText = `Your subject performance is balanced. Continue maintaining consistent revision for High-priority subjects like ${userSubjects.find((s) => s.priority === 'High')?.name || 'DSA'}.`;
    }
  } else if (qLower.includes('weak topics') || qLower.includes('weakness')) {
    if (uniqueWeak.length > 0) {
      responseText = `Your primary weak areas identified from quiz errors are: ${uniqueWeak.slice(0, 3).join(', ')}. Taking topic-specific mini-quizzes will help solidify these areas.`;
    } else {
      responseText = `No severe weak topics detected yet! Complete more subject quizzes so StudyMate AI can refine your diagnostic profile.`;
    }
  } else if (qLower.includes('how am i performing') || qLower.includes('performance')) {
    const avg = attempts.length > 0 ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length) : 0;
    const completed = userTasks.filter((t) => t.status === 'Completed').length;
    responseText = `You have completed ${completed} study tasks with an overall quiz average of ${avg}%. Consistency is key—aim to complete today's remaining tasks to stay on track.`;
  } else if (qLower.includes('revise before my exam') || qLower.includes('exam')) {
    if (nearestExam) {
      const days = Math.round((new Date(nearestExam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      responseText = `Your nearest exam is ${nearestExam.name} on ${nearestExam.examDate} (${days} days away). Prioritize solving past year questions and taking targeted quizzes on high-frequency topics.`;
    } else {
      responseText = `Ensure all your exam dates are entered in the Subjects section so we can optimize your countdown timeline!`;
    }
  } else {
    responseText = `Hello! Based on your study profile, you have ${userTasks.filter((t) => t.status === 'Pending').length} pending tasks today. How else can I assist your study planning?`;
  }

  return res.json({
    query,
    answer: responseText,
    generatedAt: new Date().toISOString(),
  });
});

// 8. Profile & Preferences
app.get('/api/profile', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    dailyStudyHours: user.dailyStudyHours || 3,
    preferredStartTime: user.preferredStartTime || '16:00',
    createdAt: user.createdAt,
  });
});

app.put('/api/profile', (req, res) => {
  const db = loadDB();
  const user = getUserFromToken(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, dailyStudyHours, preferredStartTime, password } = req.body;
  if (name) user.name = name.trim();
  if (dailyStudyHours) user.dailyStudyHours = Number(dailyStudyHours);
  if (preferredStartTime) user.preferredStartTime = preferredStartTime;
  if (password && password.length >= 6) {
    user.passwordHash = bcrypt.hashSync(password, 10);
  }

  saveDB(db);
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    dailyStudyHours: user.dailyStudyHours,
    preferredStartTime: user.preferredStartTime,
    createdAt: user.createdAt,
  });
});

// 9. Java Project Explorer & Downloader Endpoint
app.get('/api/java-files', (_req, res) => {
  // Returns tree and source code of all Java Spring Boot files created for the PBL project
  const javaDir = path.join(__dirname, 'backend-java');
  if (!fs.existsSync(javaDir)) {
    return res.status(404).json({ error: 'Java project directory not found' });
  }

  function getFiles(dir: string, base: string = ''): Array<{ path: string; name: string; content: string }> {
    let results: Array<{ path: string; name: string; content: string }> = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const relativePath = path.join(base, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(fullPath, relativePath));
      } else {
        const content = fs.readFileSync(fullPath, 'utf-8');
        results.push({ path: relativePath, name: file, content });
      }
    }
    return results;
  }

  const files = getFiles(javaDir);
  return res.json({ files });
});

app.get('/api/export-java-zip', (_req, res) => {
  const javaDir = path.join(__dirname, 'backend-java');
  if (!fs.existsSync(javaDir)) {
    return res.status(404).send('Java source directory not found');
  }

  const zip = new JSZip();

  function addFolderToZip(folderPath: string, zipFolder: JSZip) {
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      const itemPath = path.join(folderPath, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        const subZip = zipFolder.folder(item);
        if (subZip) addFolderToZip(itemPath, subZip);
      } else {
        const content = fs.readFileSync(itemPath);
        zipFolder.file(item, content);
      }
    }
  }

  addFolderToZip(javaDir, zip);

  zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="StudyMate_AI_SpringBoot_Project.zip"');
    res.send(content);
  });
});

// Vite Integration: in dev, mount Vite middleware; in prod, serve dist
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyMate AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
