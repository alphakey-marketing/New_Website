import { useState } from 'react';
import type { Task } from '../../types/task';
import type { AISuggestion, TaskSnapshot } from '../../pages/api/tasks/ai-suggest';
import type { ParsedTask } from '../../pages/api/tasks/ai-parse-task';
import { projectService } from '../../utils/projectService';

interface Props {
  tasks: Task[];
  projects: { id: string; name: string; color?: string }[];
  onApplySuggestion: (suggestion: AISuggestion) => Promise<void>;
  onCreateTask: (task: {
    title: string;
    description?: string;
    priority: 'high' | 'medium' | 'low';
    due_date?: string | null;
    project_id?: string | null;
    status: 'todo';
  }) => Promise<void>;
  onProjectCreated?: () => Promise<void>;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { label: '\uD83D\uDD04 Sequence my tasks',   prompt: 'What is the best order to tackle my tasks today? Consider priority and due dates.' },
  { label: '\uD83D\uDD34 Fix priorities',       prompt: 'Are any of my tasks clearly set to the wrong priority? Only flag tasks where there is a specific data-backed reason such as an overdue task on low priority, or a task due within 3 days still marked low.' },
  { label: '\uD83D\uDCC5 Fix deadlines',        prompt: 'Which tasks are overdue or have unrealistic deadlines? Suggest better due dates.' },
  { label: '\u2702\uFE0F Break down a task',    prompt: 'Find any large or complex tasks and break them down into smaller, logical sub-tasks I can complete step by step.' },
  { label: '\u2712\uFE0F Improve descriptions', prompt: 'Which task titles or descriptions are vague? Help me make them clearer and more actionable.' },
  { label: '\uD83D\uDCC1 New project + tasks',  prompt: 'Create a new project for me with tasks inside it.' },
];

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  reprioritize: { icon: '\uD83D\uDD34', label: 'Reprioritize',        color: 'bg-red-50 border-red-200' },
  reschedule:   { icon: '\uD83D\uDCC5', label: 'Reschedule',          color: 'bg-yellow-50 border-yellow-200' },
  rewrite:      { icon: '\u270F\uFE0F', label: 'Rewrite',             color: 'bg-blue-50 border-blue-200' },
  sequence:     { icon: '\uD83D\uDD22', label: 'Recommended Order',   color: 'bg-purple-50 border-purple-200' },
  split:        { icon: '\u2702\uFE0F', label: 'Split task',          color: 'bg-orange-50 border-orange-200' },
  scaffold:     { icon: '\uD83D\uDCC1', label: 'Project + Tasks',     color: 'bg-green-50 border-green-200' },
  general:      { icon: '\uD83D\uDCA1', label: 'Suggestion',          color: 'bg-gray-50 border-gray-200' },
};

const READ_ONLY_TYPES = new Set(['sequence', 'general']);

export default function AISuggestionPanel({ tasks, projects, onApplySuggestion, onCreateTask, onProjectCreated, onClose }: Props) {
  // Tab: 'quick-add' | 'suggest'
  const [activeTab, setActiveTab] = useState<'quick-add' | 'suggest'>('quick-add');

  // Quick-add state
  const [qaInput, setQaInput] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaPreview, setQaPreview] = useState<ParsedTask | null>(null);
  const [qaConfidence, setQaConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);
  const [qaSuccess, setQaSuccess] = useState<string | null>(null);
  const [qaNewProjectName, setQaNewProjectName] = useState<string | null>(null);
  const [qaCreateNewProject, setQaCreateNewProject] = useState(false);

  // Suggest state
  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading]       = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [applied, setApplied]   = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const [error, setError]       = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  const projectMap = projects.reduce(
    (acc, p) => { acc[p.id] = p; return acc; },
    {} as Record<string, typeof projects[0]>
  );

  // ── Quick Add logic ──
  const handleQaParse = async () => {
    if (!qaInput.trim()) return;
    setQaLoading(true);
    setQaError(null);
    setQaPreview(null);
    setQaSuccess(null);
    setQaNewProjectName(null);
    setQaCreateNewProject(false);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/tasks/ai-parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: qaInput, today, projects }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Parse failed'); }
      const data = await res.json();
      const parsed: ParsedTask = data.task;
      setQaPreview(parsed);
      setQaConfidence(data.confidence);
      if (parsed.project_name) {
        const match = projects.find((p) => p.name.toLowerCase() === parsed.project_name!.toLowerCase());
        if (!match) { setQaNewProjectName(parsed.project_name); setQaCreateNewProject(true); }
      }
    } catch (err: any) {
      setQaError(err.message);
    } finally {
      setQaLoading(false);
    }
  };

  const handleQaConfirm = async () => {
    if (!qaPreview) return;
    setQaLoading(true);
    setQaError(null);
    try {
      let resolvedProjectId: string | null = null;
      if (qaPreview.project_name) {
        const existing = projects.find((p) => p.name.toLowerCase() === qaPreview.project_name!.toLowerCase());
        if (existing) {
          resolvedProjectId = existing.id;
        } else if (qaCreateNewProject && qaNewProjectName) {
          const created = await projectService.createProject({ name: qaNewProjectName, description: '', color: '#6366f1' } as any);
          resolvedProjectId = created.id;
          if (onProjectCreated) await onProjectCreated();
        }
      }
      await onCreateTask({
        title: qaPreview.title,
        description: qaPreview.description,
        priority: qaPreview.priority,
        due_date: qaPreview.due_date ?? null,
        project_id: resolvedProjectId,
        status: 'todo',
      });
      const note = resolvedProjectId && qaNewProjectName && qaCreateNewProject ? ` in new project "${qaNewProjectName}"` : '';
      setQaInput(''); setQaPreview(null); setQaConfidence(null); setQaNewProjectName(null); setQaCreateNewProject(false);
      setQaSuccess(`\u2705 Task created${note}!`);
      setTimeout(() => setQaSuccess(null), 4000);
    } catch (err: any) {
      setQaError(err.message);
    } finally {
      setQaLoading(false);
    }
  };

  const handleQaEdit = (field: keyof ParsedTask, value: string) => {
    if (!qaPreview) return;
    setQaPreview({ ...qaPreview, [field]: value });
  };

  // ── AI Suggest logic ──
  const buildSnapshots = (): TaskSnapshot[] =>
    tasks.filter((t) => t.status !== 'done').map((t) => ({
      id: t.id, title: t.title, description: t.description,
      status: t.status, priority: t.priority, due_date: t.due_date,
      project_name: t.project_id ? (projectMap[t.project_id]?.name ?? undefined) : undefined,
    }));

  const handleAsk = async (prompt?: string) => {
    const finalPrompt = prompt ?? userPrompt;
    if (!finalPrompt.trim()) return;
    setLoading(true); setError(null); setSuggestions([]); setApplied(new Set()); setRejected(new Set());
    try {
      const res = await fetch('/api/tasks/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: buildSnapshots(), projects: projects.map((p) => ({ id: p.id, name: p.name })), userPrompt: finalPrompt }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error ?? 'Unknown error'); }
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (s: AISuggestion) => {
    setApplying(s.id);
    try { await onApplySuggestion(s); setApplied((prev) => new Set(prev).add(s.id)); }
    catch (err: any) { setError(`Failed to apply: ${err.message}`); }
    finally { setApplying(null); }
  };

  const handleDismiss = (id: string) => setRejected((prev) => new Set(prev).add(id));

  const pending      = suggestions.filter((s) => !applied.has(s.id) && !rejected.has(s.id));
  const acceptedList = suggestions.filter((s) => applied.has(s.id) && !READ_ONLY_TYPES.has(s.type));
  const taskTitleMap = tasks.reduce((acc, t) => { acc[t.id] = t.title; return acc; }, {} as Record<string, string>);

  const scaffoldMatchesExisting = (s: AISuggestion) =>
    !!s.scaffoldProjectName && projects.some((p) => p.name.trim().toLowerCase() === s.scaffoldProjectName!.trim().toLowerCase());

  const acceptedSummaryLabel = (s: AISuggestion): string => {
    if (s.type === 'scaffold') {
      return scaffoldMatchesExisting(s)
        ? `Added ${s.subTasks?.length ?? 0} tasks to "${s.scaffoldProjectName}"`
        : `Created project "${s.scaffoldProjectName}" with ${s.subTasks?.length ?? 0} tasks`;
    }
    if (s.type === 'split') return `${s.taskTitle}: split into ${s.subTasks?.length ?? 0} sub-tasks`;
    if (s.taskTitle && s.proposedValue) return `${s.taskTitle}: ${s.proposedValue}`;
    return s.proposedValue || s.explanation;
  };

  const priorityColor = { high: 'bg-red-100 text-red-700 border-red-200', medium: 'bg-yellow-100 text-yellow-700 border-yellow-200', low: 'bg-gray-100 text-gray-600 border-gray-200' };
  const confidenceBadge = { high: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-red-100 text-red-700' };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-600">
        <h2 className="text-lg font-bold text-white">\uD83E\uDD16 AI Assistant</h2>
        <button onClick={onClose} className="text-white hover:text-indigo-200 text-2xl leading-none">&times;</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('quick-add')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'quick-add' ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          \u26A1 Quick Add Task
        </button>
        <button
          onClick={() => setActiveTab('suggest')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'suggest' ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          \u2728 Suggestions
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* ── QUICK ADD TAB ── */}
        {activeTab === 'quick-add' && (
          <>
            <p className="text-xs text-gray-500">Type naturally \u2014 AI extracts the title, priority, due date and project.</p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={qaInput}
                onChange={(e) => { setQaInput(e.target.value); setQaPreview(null); setQaNewProjectName(null); }}
                onKeyDown={(e) => e.key === 'Enter' && !qaLoading && handleQaParse()}
                placeholder='e.g. "Send report by Friday, high priority, for VPN project"'
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={qaLoading}
              />
              <button
                onClick={handleQaParse}
                disabled={qaLoading || !qaInput.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {qaLoading && !qaPreview ? '\uD83E\uDDE0...' : 'Parse'}
              </button>
            </div>

            {qaError && <p className="text-xs text-red-600">\u26A0\uFE0F {qaError}</p>}
            {qaSuccess && <p className="text-xs text-green-600 font-medium">{qaSuccess}</p>}

            {qaPreview && (
              <div className="bg-white border border-indigo-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Review & confirm</span>
                  {qaConfidence && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${confidenceBadge[qaConfidence]}`}>
                      {qaConfidence === 'high' ? '\u2705 High confidence' : qaConfidence === 'medium' ? '\u26A0\uFE0F Review' : '\u2753 Review carefully'}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Title</label>
                  <input type="text" value={qaPreview.title} onChange={(e) => handleQaEdit('title', e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Description (optional)</label>
                  <input type="text" value={qaPreview.description ?? ''} onChange={(e) => handleQaEdit('description', e.target.value)}
                    placeholder="Add more detail..."
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500">Priority</label>
                    <select value={qaPreview.priority} onChange={(e) => handleQaEdit('priority', e.target.value)}
                      className={`mt-1 w-full border rounded-lg px-2 py-1.5 text-sm font-medium focus:outline-none ${priorityColor[qaPreview.priority]}`}>
                      <option value="high">\uD83D\uDD34 High</option>
                      <option value="medium">\uD83D\uDFE1 Medium</option>
                      <option value="low">\uD83D\uDFE2 Low</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500">Due Date</label>
                    <input type="date" value={qaPreview.due_date ?? ''} onChange={(e) => handleQaEdit('due_date', e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                </div>
                {qaPreview.project_name && !qaNewProjectName && (
                  <div className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-1.5">
                    \uD83D\uDCC1 Matched project: <strong>{qaPreview.project_name}</strong>
                  </div>
                )}
                {qaNewProjectName && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <p className="text-xs font-semibold text-amber-800 mb-1.5">\uD83D\uDCC1 &quot;{qaNewProjectName}&quot; doesn&apos;t exist yet</p>
                    <div className="flex space-x-2">
                      <button type="button" onClick={() => setQaCreateNewProject(true)}
                        className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-colors ${ qaCreateNewProject ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50' }`}>
                        \u2705 Create project
                      </button>
                      <button type="button" onClick={() => setQaCreateNewProject(false)}
                        className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-colors ${ !qaCreateNewProject ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50' }`}>
                        Skip
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex space-x-2 pt-1">
                  <button onClick={handleQaConfirm} disabled={qaLoading}
                    className="flex-1 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {qaLoading ? 'Creating...' : '\u2705 Create Task'}
                  </button>
                  <button onClick={() => { setQaPreview(null); setQaConfidence(null); setQaNewProjectName(null); }}
                    className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
                    Edit
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── SUGGESTIONS TAB ── */}
        {activeTab === 'suggest' && (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick requests</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((qp) => (
                  <button key={qp.label} onClick={() => handleAsk(qp.prompt)} disabled={loading}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 transition-colors disabled:opacity-50">
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Or ask anything</p>
              <textarea rows={3} value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)}
                placeholder={'e.g. Create tasks in my "invesbot" project: get the API, put to code, UAT'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              <button onClick={() => handleAsk()} disabled={loading || !userPrompt.trim()}
                className="mt-2 w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                {loading ? '\uD83E\uDDE0 Thinking...' : '\u2728 Get suggestions'}
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">\u26A0\uFE0F {error}</div>}
            {loading && <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24" />)}</div>}

            {pending.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {pending.length} suggestion{pending.length > 1 ? 's' : ''} to review
                </p>
                <div className="space-y-3">
                  {pending.map((s) => {
                    const cfg = typeConfig[s.type] ?? typeConfig.general;
                    const isReadOnly = READ_ONLY_TYPES.has(s.type);
                    const isExistingProject = s.type === 'scaffold' && scaffoldMatchesExisting(s);
                    return (
                      <div key={s.id} className={`rounded-xl border p-4 ${cfg.color}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">{cfg.icon} {cfg.label}</span>
                            {s.taskTitle && <p className="text-sm font-medium text-gray-900 mt-0.5">{s.taskTitle}</p>}
                          </div>
                          {isReadOnly && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Read-only</span>}
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{s.explanation}</p>
                        {s.type === 'scaffold' && (
                          <div className="mb-3 space-y-2">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${ isExistingProject ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200' }`}>
                              <span>{isExistingProject ? '\uD83D\uDCC2' : '\uD83D\uDCC1'}</span>
                              <span>{isExistingProject ? `Adding to: "${s.scaffoldProjectName}"` : `New project: "${s.scaffoldProjectName}"`}</span>
                            </div>
                            {s.subTasks && s.subTasks.map((sub, i) => (
                              <div key={i} className="flex items-start space-x-2 text-xs bg-white border border-green-200 rounded-lg px-3 py-2">
                                <span className="font-bold text-green-600 mt-0.5 w-4">{i + 1}.</span>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{sub.title}</p>
                                  {sub.description && <p className="text-gray-500 mt-0.5">{sub.description}</p>}
                                  {sub.due_date && <p className="text-indigo-500 mt-0.5">\uD83D\uDCC5 {sub.due_date}</p>}
                                </div>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ sub.priority === 'high' ? 'bg-red-100 text-red-700' : sub.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600' }`}>{sub.priority ?? 'medium'}</span>
                              </div>
                            ))}
                          </div>
                        )}
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
                        {s.type === 'sequence' && (!s.orderedTaskIds || s.orderedTaskIds.length === 0) && s.proposedValue && (
                          <div className="mb-3 text-xs bg-white border border-purple-200 rounded-lg px-3 py-2 whitespace-pre-line text-gray-700">{s.proposedValue}</div>
                        )}
                        {s.type === 'split' && s.subTasks && s.subTasks.length > 0 && (
                          <div className="mb-3 space-y-1">
                            {s.subTasks.map((sub, i) => (
                              <div key={i} className="flex items-start space-x-2 text-xs bg-white border border-orange-200 rounded-lg px-3 py-2">
                                <span className="font-bold text-orange-500 mt-0.5">{i + 1}.</span>
                                <div><p className="font-medium text-gray-800">{sub.title}</p>{sub.description && <p className="text-gray-500 mt-0.5">{sub.description}</p>}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {!isReadOnly && s.type !== 'split' && s.type !== 'scaffold' && s.currentValue && (
                          <div className="flex items-center space-x-2 text-xs mb-3">
                            <span className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-500 line-through">{s.currentValue}</span>
                            <span className="text-gray-400">\u2192</span>
                            <span className="px-2 py-1 bg-white border border-indigo-300 rounded text-indigo-700 font-medium">{s.proposedValue}</span>
                          </div>
                        )}
                        {isReadOnly ? (
                          <button onClick={() => handleDismiss(s.id)} className="w-full py-1.5 rounded-lg border border-gray-300 text-gray-500 text-xs font-medium hover:bg-gray-50">Got it — Dismiss</button>
                        ) : (
                          <div className="flex space-x-2">
                            <button onClick={() => handleAccept(s)} disabled={applying === s.id}
                              className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50">
                              {applying === s.id ? 'Creating...' :
                                s.type === 'scaffold' ? (isExistingProject ? `\u2705 Add ${s.subTasks?.length ?? 0} tasks` : `\u2705 Create project + ${s.subTasks?.length ?? 0} tasks`) :
                                s.type === 'split' ? `\u2705 Create ${s.subTasks?.length ?? ''} sub-tasks` : '\u2705 Accept'}
                            </button>
                            <button onClick={() => handleDismiss(s.id)} className="flex-1 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50">\u274C Reject</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {acceptedList.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-800 mb-2">\u2705 Applied {acceptedList.length} change{acceptedList.length > 1 ? 's' : ''}</p>
                <ul className="space-y-1">
                  {acceptedList.map((s) => <li key={s.id} className="text-xs text-green-700">\u2022 {acceptedSummaryLabel(s)}</li>)}
                </ul>
              </div>
            )}

            {suggestions.length > 0 && pending.length === 0 && acceptedList.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">All reviewed. Ask something else!</div>
            )}
          </>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">\uD83D\uDD12 Notes & Docs are <strong>never</strong> shared with AI</p>
      </div>
    </div>
  );
}
