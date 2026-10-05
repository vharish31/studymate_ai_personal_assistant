import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Code2,
  Download,
  Folder,
  FileCode,
  CheckCircle,
  Copy,
  ExternalLink,
  BookOpen,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';

export const JavaProjectHub: React.FC = () => {
  const [files, setFiles] = useState<Array<{ path: string; name: string; content: string }>>([]);
  const [selectedFile, setSelectedFile] = useState<{ path: string; name: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await api.getJavaFiles();
      setFiles(data);
      if (data.length > 0) {
        // default select StudyPlanService.java or StudyMateApplication.java
        const defaultPick =
          data.find((f) => f.name.includes('StudyPlanService.java')) ||
          data.find((f) => f.name.includes('StudyMateApplication.java')) ||
          data[0];
        setSelectedFile(defaultPick);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-400">
            <Code2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              College PBL Project Architecture
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Full-Stack Java Spring Boot 3 & MySQL
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Directly runnable in IntelliJ IDEA or Eclipse. Clean layered architecture: Controllers, Services (Adaptive Planner Algorithm), JPA Repositories, Entities, BCrypt Security, and MySQL schema.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="/api/export-java-zip"
            download="StudyMate_AI_SpringBoot_Project.zip"
            className="w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Maven Project (.zip)</span>
          </a>
        </div>
      </div>

      {/* College Viva & Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Clean Layered Architecture</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Controller → Service → Repository → Entity. DTOs and global exception handling isolate business logic.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>StudyPlanService.java</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Implements the adaptive multi-factor formula: Exam proximity, subject difficulty, priority, and quiz weakness multiplier.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>MySQL Schema & JPA</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            DDL in <code>schema.sql</code> includes normalized relational tables, foreign key constraints, and user data isolation.
          </p>
        </div>
      </div>

      {/* Code Explorer */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row h-[600px]">
        {/* Left: File Tree */}
        <div className="w-full md:w-80 border-r border-slate-200/80 bg-slate-50/70 p-4 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">
            Spring Boot Project Files ({files.length})
          </div>
          <div className="space-y-1">
            {files.map((file) => {
              const isSelected = selectedFile?.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-200/60 text-slate-700'
                  }`}
                >
                  <FileCode
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-emerald-400">{selectedFile?.path}</span>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-300 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <div className="flex-1 overflow-auto p-6 font-mono text-xs text-slate-200 leading-relaxed">
            <pre className="whitespace-pre">{selectedFile?.content || '// Select a file from the left to inspect'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
