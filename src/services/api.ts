import { User, Subject, StudyMaterial, Quiz, QuizAttempt, StudyTask, ProgressData } from '../types';

const TOKEN_KEY = 'studymate_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    // unauthorized
  }
  return response;
}

async function parseApiResponse(res: Response, fallbackError: string): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await res.text();
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (data && data.error) throw new Error(data.error);
    if (data && data.message) throw new Error(data.message);
    if (res.status === 401) {
      throw new Error('Invalid email or password. You can use password123 or 1-Click Demo.');
    }
    if (res.status === 404) {
      throw new Error('Service endpoint not available.');
    }
    throw new Error(fallbackError || `Server error (${res.status})`);
  }

  return data || {};
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetchWithAuth('/api/auth/me');
      if (!res.ok) return null;
      const data = await parseApiResponse(res, 'Failed to fetch current user');
      return data;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await parseApiResponse(res, 'Login failed');
      if (!data.token) throw new Error('No authentication token received');
      setAuthToken(data.token);
      return data;
    } catch (err: any) {
      if (err.message && (err.message.includes('JSON') || err.message.includes('Unexpected token') || err.message.includes('Failed to fetch'))) {
        throw new Error('Server connection was briefly interrupted. Please click "Sign In" again.');
      }
      throw err;
    }
  },

  async register(name: string, email: string, password: string, confirmPassword?: string): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, confirmPassword }),
      });
      const data = await parseApiResponse(res, 'Registration failed');
      if (!data.token) throw new Error('No authentication token received');
      setAuthToken(data.token);
      return data;
    } catch (err: any) {
      if (err.message && (err.message.includes('JSON') || err.message.includes('Unexpected token') || err.message.includes('Failed to fetch'))) {
        throw new Error('Server connection was briefly interrupted. Please click "Create Account" again.');
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    removeAuthToken();
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const res = await fetchWithAuth('/api/subjects');
    if (!res.ok) throw new Error('Failed to load subjects');
    return res.json();
  },

  async createSubject(subject: Partial<Subject>): Promise<Subject> {
    const res = await fetchWithAuth('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(subject),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create subject');
    return data;
  },

  async updateSubject(id: string, subject: Partial<Subject>): Promise<Subject> {
    const res = await fetchWithAuth(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subject),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update subject');
    return data;
  },

  async deleteSubject(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/subjects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete subject');
  },

  // Materials
  async getMaterials(): Promise<StudyMaterial[]> {
    const res = await fetchWithAuth('/api/materials');
    if (!res.ok) throw new Error('Failed to fetch materials');
    return res.json();
  },

  async uploadMaterial(file: File, subjectId: string): Promise<StudyMaterial> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', subjectId);

    const res = await fetchWithAuth('/api/materials/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload material');
    return data;
  },

  async deleteMaterial(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/materials/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete material');
  },

  // Study Plan
  async getStudyPlan(): Promise<StudyTask[]> {
    const res = await fetchWithAuth('/api/study-plan');
    if (!res.ok) throw new Error('Failed to load study plan');
    return res.json();
  },

  async generateStudyPlan(dailyHours: number, startTime: string): Promise<{ message: string; tasks: StudyTask[] }> {
    const res = await fetchWithAuth('/api/study-plan/generate', {
      method: 'POST',
      body: JSON.stringify({ dailyHours, startTime }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate study plan');
    return data;
  },

  async updateTaskStatus(id: string, status: 'Pending' | 'In Progress' | 'Completed'): Promise<StudyTask> {
    const res = await fetchWithAuth(`/api/study-tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update task status');
    return data;
  },

  // Quizzes
  async getQuizAttempts(): Promise<QuizAttempt[]> {
    const res = await fetchWithAuth('/api/quizzes');
    if (!res.ok) throw new Error('Failed to load quiz attempts');
    return res.json();
  },

  async generateQuiz(params: {
    subjectId: string;
    topic?: string;
    numberOfQuestions?: number;
    difficulty?: string;
    materialId?: string;
  }): Promise<Quiz> {
    const res = await fetchWithAuth('/api/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate quiz');
    return data;
  },

  async submitQuiz(quizId: string, answers: Record<string, number>): Promise<{
    attempt: QuizAttempt;
    questions: any[];
    userAnswers: Record<string, number>;
  }> {
    const res = await fetchWithAuth(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit quiz');
    return data;
  },

  // Progress
  async getProgress(): Promise<ProgressData> {
    const res = await fetchWithAuth('/api/progress');
    if (!res.ok) throw new Error('Failed to load progress data');
    return res.json();
  },

  // AI Study Coach
  async queryCoach(query: string): Promise<{ query: string; answer: string }> {
    const res = await fetchWithAuth('/api/coach/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to query study coach');
    return data;
  },

  // Profile
  async updateProfile(profileData: {
    name?: string;
    dailyStudyHours?: number;
    preferredStartTime?: string;
    password?: string;
  }): Promise<User> {
    const res = await fetchWithAuth('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  // Java Project Explorer
  async getJavaFiles(): Promise<Array<{ path: string; name: string; content: string }>> {
    const res = await fetchWithAuth('/api/java-files');
    if (!res.ok) throw new Error('Failed to fetch Java project files');
    const data = await res.json();
    return data.files;
  },
};
