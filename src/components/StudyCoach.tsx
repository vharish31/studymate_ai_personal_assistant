import React, { useState } from 'react';
import { User, Subject } from '../types';
import { Bot, Send, Sparkles, User as UserIcon, HelpCircle } from 'lucide-react';

interface StudyCoachProps {
  user: User;
  subjects: Subject[];
  onQueryCoach: (query: string) => Promise<{ query: string; answer: string }>;
}

export const StudyCoach: React.FC<StudyCoachProps> = ({
  user,
  subjects,
  onQueryCoach,
}) => {
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'coach'; text: string; time: string }>
  >([
    {
      sender: 'coach',
      text: `Hello ${user.name}! I am your StudyMate AI Coach. I analyze your quiz scores, exam dates, and task history to give you personalized academic guidance. What would you like to plan or review today?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'What should I study today?',
    'Which subject needs more attention?',
    'What are my weak topics?',
    'How am I performing?',
    'What should I revise before my exam?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q) return;

    const userMsg = {
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await onQueryCoach(q);
      const coachMsg = {
        sender: 'coach' as const,
        text: res.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: 'I encountered an issue analyzing your records. Please try again.',
          time: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="w-7 h-7 text-indigo-600" />
          <span>AI Study Coach & Academic Advisor</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Ask questions about your study priorities, syllabus weaknesses, and exam countdowns.
        </p>
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Frequently Asked Prompts:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(q)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-medium text-slate-700 transition-colors border border-slate-200/70"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col h-[500px]">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, index) => {
            const isCoach = m.sender === 'coach';
            return (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  isCoach ? 'justify-start' : 'justify-end'
                }`}
              >
                {isCoach && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                <div
                  className={`max-w-lg p-4 rounded-2xl text-sm leading-relaxed ${
                    isCoach
                      ? 'bg-slate-50 text-slate-800 border border-slate-200/80'
                      : 'bg-indigo-600 text-white shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[10px] mt-2 text-right ${
                      isCoach ? 'text-slate-400' : 'text-indigo-200'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>

                {!isCoach && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <Bot className="w-4 h-4 animate-bounce text-indigo-500" />
              <span>Analyzing your quiz analytics & subject priorities...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Which topics should I revise before my DSA exam?"
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
