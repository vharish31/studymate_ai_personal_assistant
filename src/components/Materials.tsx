import React, { useState } from 'react';
import { StudyMaterial, Subject } from '../types';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface MaterialsProps {
  materials: StudyMaterial[];
  subjects: Subject[];
  onUploadMaterial: (file: File, subjectId: string) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
  onGenerateQuizFromMaterial: (subjectId: string, materialId: string) => void;
}

export const Materials: React.FC<MaterialsProps> = ({
  materials,
  subjects,
  onUploadMaterial,
  onDeleteMaterial,
  onGenerateQuizFromMaterial,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedMaterialId, setExpandedMaterialId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExts = ['.pdf', '.docx', '.txt'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validExts.includes(ext)) {
        setError('Please choose a valid PDF, DOCX, or TXT file.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10MB limit.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedSubjectId) {
      setError('Please select a file and a target subject.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await onUploadMaterial(selectedFile, selectedSubjectId);
      setSuccess(`"${selectedFile.name}" uploaded and parsed successfully!`);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Study Material Library</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Upload course notes, textbook chapters, or syllabus guides in PDF, DOCX, or TXT format.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Upload & Analyze Material</span>
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign to Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
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
                Choose Document (PDF, DOCX, TXT) *
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{uploading ? 'Analyzing & Uploading...' : 'Upload & Extract Concepts'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Materials List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Saved Study Materials ({materials.length})
        </h2>

        {materials.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800 transition-colors">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No study materials uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((mat) => {
              const subject = subjects.find((s) => s.id === mat.subjectId);
              const isExpanded = expandedMaterialId === mat.id;

              return (
                <div
                  key={mat.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{mat.fileName}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-400 mt-1">
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {subject?.name || 'General Subject'}
                          </span>
                          <span>·</span>
                          <span>{formatFileSize(mat.fileSize)}</span>
                          <span>·</span>
                          <span>{mat.uploadDate.split('T')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() =>
                          onGenerateQuizFromMaterial(mat.subjectId, mat.id)
                        }
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Generate Quiz</span>
                      </button>

                      <a
                        href={`/api/materials/${mat.id}/download`}
                        download
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => onDeleteMaterial(mat.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          setExpandedMaterialId(isExpanded ? null : mat.id)
                        }
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                        title="Toggle Text Analysis"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Extracted Keywords Preview */}
                  {mat.extractedKeywords && mat.extractedKeywords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Keywords:</span>
                      </span>
                      {mat.extractedKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expanded Analysis Drawer */}
                  {isExpanded && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Extracted Key Concepts & Topics:
                        </h4>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                          {mat.extractedTopics?.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          )) || <li>Core definitions parsed from document.</li>}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Extracted Text Preview:</h4>
                        <div className="max-h-40 overflow-y-auto p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {mat.extractedText || 'No text extracted.'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
