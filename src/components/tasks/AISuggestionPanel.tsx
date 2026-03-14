import { useState } from 'react';
import type { Task } from '../../types/task';
import type { AISuggestion, TaskSnapshot } from '../../pages/api/tasks/ai-suggest';

interface Props {
  tasks: Task[];
  projects: { id: string; name: string; color?: string }[];
  onApplySuggestion: (suggestion: AISuggestion) => Promise<void>;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { label: '🔄 Sequence my tasks', prompt: 'What is the best order to tackle my tasks today? Consider priority and due dates.' },
  { label: '🔴 Reprioritize', prompt: 'Are any of my tasks clearly set to the wrong priority? Only flag tasks where there is a specific data-backed reason such as an overdue task on low priority, or a task due within 3 days still marked low.' },
  { label: '📅 Fix deadlines', prompt: 'Which tasks are overdue or have unrealistic deadlines? Suggest better due dates.' },
  { label: '✂️ Break down a task', prompt: 'Find any large or complex tasks and break them down into smaller, logical sub-tasks I can complete step by step.' },
  { label: '✏️ Improve descriptions', prompt: 'Which task titles or descriptions are vague? Help me make them clearer and more actionable.' },
  { label: '💼 Work tasks first', prompt: 'I want to focus on work tasks only. What is the best sequence for today?' },
];

const typeConfig = {
  reprioritize: { icon: '🔴', label: 'Reprioritize',   color: 'bg-red-50 border-red-200' },
  reschedule:   { icon: '📅', label: 'Reschedule',     color: 'bg-yellow-50 border-yellow-200' },
  rewrite:      { icon: '✏️',  label: 'Rewrite',        color: 'bg-blue-50 border-blue-200' },
  sequence:     { icon: '🔢', label: 'Recommended Order', color: 'bg-purple-50 border-purple-200' },
  split:        { icon: '✂️',  label: 'Split task',     color: 'bg-orange-50 border-orange-200' },
  general:      { icon: '💡', label: 'Suggestion',     color: 'bg-gray-50 border-gray-200' },
};

// These types are read-only — no Accept button, no DB write
const READ_ONLY_TYPES = new Set(['sequence', 'general']);

export default function AISuggestionPanel({ tasks, projects, onApplySuggestion, onClose }: Props) {
  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [applied, setApplied]   = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  const projectMap = projects.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, typeof projects[0]>);

  const buildSnapshots = (): TaskSnapshot[] =>
    tasks
      .filter((t) => t.status !== 'done')
      .map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        due_date: t.due_date,
        project_name: t.project_id ? (projectMap[t.project_id]?.name ?? undefined) : undefined,
      }));

  const handleAsk = async (prompt?: string) => {
    const finalPrompt = prompt ?? userPrompt;
    if (!finalPrompt.trim()) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setApplied(new Set());
    setRejected(new Set());

    try {
      const res = await fetch('/api/tasks/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: buildSnapshots(),
          projects: projects.map((p) => ({ id: p.id, name: p.name })),
          userPrompt: finalPrompt,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Unknown error');
      }

      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setShowGuide(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (s: AISuggestion) => {
    setApplying(s.id);
    try {
      await onApplySuggestion(s);
      setApplied((prev) => new Set(prev).add(s.id));
    } catch (err: any) {
      setError(`Failed to apply: ${err.message}`);
    } finally {
      setApplying(null);
    }
  };

  const handleDismiss = (id: string) => {
    setRejected((prev) => new Set(prev).add(id));
  };

  const pending    = suggestions.filter((s) => !applied.has(s.id) && !rejected.has(s.id));
  const acceptedList = suggestions.filter((s) => applied.has(s.id));

  // Build a task-title lookup for sequence rendering
  const taskTitleMap = tasks.reduce((acc, t) => { acc[t.id] = t.title; return acc; }, {} as Record<string, string>);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div>
          <h2 className="text-lg font-bold text-white">🤖 AI Task Assistant</h2>
          <p className="text-xs text-indigo-200 mt-0.5">Tasks only · Notes are private</p>
        </div>
        <button onClick={onClose} className="text-white hover:text-indigo-200 text-2xl leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Onboarding guide */}
        {showGuide && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-900">
            <p className="font-semibold mb-2">👋 How this works</p>
            <p className="mb-1">• AI reads your <strong>tasks and projects only</strong>. Notes are <strong>never shared</strong>.</p>
            <p className="mb-1">• Pick a quick prompt or type your own.</p>
            <p className="mb-1">• Review each suggestion — <strong>nothing changes</strong> until you click Accept.</p>
            <p className="mb-1">• 🔢 <strong>Sequence</strong> suggestions are read-only ordered plans — no Accept needed.</p>
            <p>• ✂️ <strong>Split task</strong> creates all sub-tasks at once when you Accept.</p>
          </div>
        )}

        {/* Quick prompts */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick requests</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                onClick={() => handleAsk(qp.prompt)}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 transition-colors disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom prompt */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Or ask anything</p>
          <textarea
            rows={3}
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="e.g. What order should I do my tasks today?"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !userPrompt.trim()}
            className="mt-2 w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '🧠 Thinking...' : '✨ Get suggestions'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {error}</div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24" />)}
          </div>
        )}

        {/* Suggestions */}
        {pending.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {pending.length} suggestion{pending.length > 1 ? 's' : ''} to review
            </p>
            <div className="space-y-3">
              {pending.map((s) => {
                const cfg = typeConfig[s.type] ?? typeConfig.general;
                const isReadOnly = READ_ONLY_TYPES.has(s.type);

                return (
                  <div key={s.id} className={`rounded-xl border p-4 ${cfg.color}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">{cfg.icon} {cfg.label}</span>
                        {s.taskTitle && <p className="text-sm font-medium text-gray-900 mt-0.5">{s.taskTitle}</p>}
                      </div>
                      {isReadOnly && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Read-only</span>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{s.explanation}</p>

                    {/* Sequence: render numbered task list from orderedTaskIds */}
                    {s.type === 'sequence' && s.orderedTaskIds && s.orderedTaskIds.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {s.orderedTaskIds.map((id, i) => (
                          <div key={id} className="flex items-center space-x-2 text-xs bg-white border border-purple-200 rounded-lg px-3 py-1.5">
                            <span className="font-bold text-purple-600 w-5 text-center">{i + 1}.</span>
                            <span className="text-gray-800">{taskTitleMap[id] ?? id}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sequence: fallback to proposedValue if no orderedTaskIds */}
                    {s.type === 'sequence' && (!s.orderedTaskIds || s.orderedTaskIds.length === 0) && s.proposedValue && (
                      <div className="mb-3 text-xs bg-white border border-purple-200 rounded-lg px-3 py-2 whitespace-pre-line text-gray-700">
                        {s.proposedValue}
                      </div>
                    )}

                    {/* Sub-tasks preview for split type */}
                    {s.type === 'split' && s.subTasks && s.subTasks.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {s.subTasks.map((sub, i) => (
                          <div key={i} className="flex items-start space-x-2 text-xs bg-white border border-orange-200 rounded-lg px-3 py-2">
                            <span className="font-bold text-orange-500 mt-0.5">{i + 1}.</span>
                            <div>
                              <p className="font-medium text-gray-800">{sub.title}</p>
                              {sub.description && <p className="text-gray-500 mt-0.5">{sub.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Before → after for actionable types */}
                    {!isReadOnly && s.type !== 'split' && s.currentValue && (
                      <div className="flex items-center space-x-2 text-xs mb-3">
                        <span className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-500 line-through">{s.currentValue}</span>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-1 bg-white border border-indigo-300 rounded text-indigo-700 font-medium">{s.proposedValue}</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    {isReadOnly ? (
                      // Read-only: just a dismiss button
                      <button
                        onClick={() => handleDismiss(s.id)}
                        className="w-full py-1.5 rounded-lg border border-gray-300 text-gray-500 text-xs font-medium hover:bg-gray-50"
                      >
                        Got it — Dismiss
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAccept(s)}
                          disabled={applying === s.id}
                          className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {applying === s.id
                            ? 'Applying...'
                            : s.type === 'split'
                            ? `✅ Create ${s.subTasks?.length ?? ''} sub-tasks`
                            : '✅ Accept'}
                        </button>
                        <button
                          onClick={() => handleDismiss(s.id)}
                          className="flex-1 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Accepted summary */}
        {acceptedList.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-2">✅ Applied {acceptedList.length} change{acceptedList.length > 1 ? 's' : ''}</p>
            <ul className="space-y-1">
              {acceptedList.map((s) => (
                <li key={s.id} className="text-xs text-green-700">
                  {s.type === 'split'
                    ? `• ${s.taskTitle}: created ${s.subTasks?.length ?? 0} sub-tasks`
                    : `• ${s.taskTitle}: ${s.proposedValue}`
                  }
                </li>
              ))}
            </ul>
          </div>
        )}

        {suggestions.length > 0 && pending.length === 0 && acceptedList.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">All suggestions reviewed. Ask something else!</div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">🔒 Your Notes & Docs are <strong>never</strong> shared with AI</p>
      </div>
    </div>
  );
}
