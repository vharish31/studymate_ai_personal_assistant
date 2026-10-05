import React, { useState } from 'react';
import { Subject } from '../types';
import { Plus, Edit2, Trash2, Calendar, AlertCircle, BookOpen, Clock, Tag } from 'lucide-react';

interface SubjectsProps {
  subjects: Subject[];
  onAddSubject: (subject: Partial<Subject>) => Promise<void>;
  onUpdateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  onNavigateToQuiz: (subjectId: string) => void;
}

export const Subjects: React.FC<SubjectsProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onNavigateToQuiz,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    examDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      description: '',
      difficulty: 'Medium',
      priority: 'Medium',
      examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      difficulty: subject.difficulty,
      priority: subject.priority,
      examDate: subject.examDate,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.examDate) {
      setError('Please provide a subject name and exam date.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editingSubject) {
        await onUpdateSubject(editingSubject.id, formData);
      } else {
        await onAddSubject(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? All associated study tasks will be removed.`)) {
      try {
        await onDeleteSubject(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subject Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize syllabus modules, set exam countdown dates, and adjust academic priorities.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subjects.map((sub) => {
          const exam = new Date(sub.examDate);
          const daysRemaining = Math.round((exam.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isUrgent = daysRemaining <= 15;

          return (
            <div
              key={sub.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {sub.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id, sub.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metadata list */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80">
                    <span className="text-slate-400">Difficulty:</span>
                    <span className="font-semibold text-slate-800">{sub.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80">
                    <span className="text-slate-400">Priority:</span>
                    <span
                      className={`font-semibold ${
                        sub.priority === 'High'
                          ? 'text-rose-700'
                          : sub.priority === 'Medium'
                          ? 'text-amber-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {sub.priority}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                      isUrgent ? 'bg-rose-50 text-rose-700 font-semibold' : 'bg-slate-100/80'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{sub.examDate}</span>
                    <span>({daysRemaining > 0 ? `${daysRemaining}d left` : 'Today'})</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Adaptive Weight: {sub.priority === 'High' ? '2.5x' : '1.8x'}
                </span>
                <button
                  onClick={() => onNavigateToQuiz(sub.id)}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Generate Quiz
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Distributed Operating Systems"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Modules
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview of curriculum topics and target exam goals..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (More study slots)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                  {loading ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
