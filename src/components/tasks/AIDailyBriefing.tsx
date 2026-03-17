import { useState } from 'react';
import type { Task } from '../../types/task';
import type { FocusTask, StaleTask, DailyFocusResponse } from '../../pages/api/tasks/ai-daily-focus';
import { aiRequest } from '../../utils/aiRequest';

interface Props {
  tasks: Task[];
  projects: { id: string; name: string; color?: string }[];
  onUpdateTask: (taskId: string, update: { priority?: string; due_date?: string; status?: string }) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
}

export default function AIDailyBriefing({ tasks, projects, onUpdateTask, onDeleteTask }: Props) {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<DailyFocusResponse | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedStale, setAppliedStale] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const projectMap = projects.reduce(
    (acc, p) => { acc[p.id] = p; return acc; },
    {} as Record<string, typeof projects[0]>
  );

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setBriefing(null);
    setAppliedStale(new Set());
    setPendingDeleteId(null);
    setExpanded(true);
    try {
      const snapshots = tasks
        .filter((t) => t.status !== 'done')
        .map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          due_date: t.due_date,
          project_name: t.project_id ? projectMap[t.project_id]?.name : undefined,
        }));
      const data = await aiRequest<DailyFocusResponse>('/api/tasks/ai-daily-focus', { tasks: snapshots });
      setBriefing(data);
      setGeneratedAt(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyStale = async (stale: StaleTask) => {
    if (stale.suggestion === 'drop') {
      if (pendingDeleteId !== stale.taskId) {
        setPendingDeleteId(stale.taskId);
        return;
      }
      // Only mark applied if the handler actually exists and runs
      if (onDeleteTask) {
        await onDeleteTask(stale.taskId);
        setPendingDeleteId(null);
        setAppliedStale((prev) => new Set(prev).add(stale.taskId));
      } else {
        // Prop missing — reset the confirm state without silently swallowing
        setPendingDeleteId(null);
        console.warn('AIDailyBriefing: onDeleteTask prop not provided; cannot delete task', stale.taskId);
      }
      return;
    }
    if (stale.suggestion === 'reschedule') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      await onUpdateTask(stale.taskId, { due_date: nextWeek.toISOString().split('T')[0] });
    } else if (stale.suggestion === 'reprioritize') {
      await onUpdateTask(stale.taskId, { priority: 'low' });
    }
    setPendingDeleteId(null);
    setAppliedStale((prev) => new Set(prev).add(stale.taskId));
  };

  const staleActionLabel = (s: StaleTask) => {
    if (appliedStale.has(s.taskId)) return '✅ Done';
    if (s.suggestion === 'reschedule') return '📅 Reschedule +7 days';
    if (s.suggestion === 'reprioritize') return '🔽 Set to Low priority';
    if (s.suggestion === 'drop') {
      return pendingDeleteId === s.taskId ? '⚠️ Confirm delete' : '🗑️ Delete task';
    }
    return 'Apply';
  };

  const staleActionClass = (s: StaleTask) => {
    const base = 'flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap disabled:opacity-50 transition-colors';
    if (appliedStale.has(s.taskId)) return `${base} bg-white border-gray-200 text-gray-400`;
    if (s.suggestion === 'drop' && pendingDeleteId === s.taskId)
      return `${base} bg-red-600 border-red-600 text-white hover:bg-red-700`;
    return `${base} bg-white border-gray-300 text-gray-700 hover:bg-gray-50`;
  };

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const formatGeneratedAt = (d: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const priorityColor: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white border border-blue-200 rounded-xl mb-4 overflow-hidden">
      {/* Header — always visible */}
      <div
        className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">🌅</span>
          <div>
            <h3 className="text-sm font-bold text-white">Daily Briefing</h3>
            <p className="text-xs text-blue-200">
              {generatedAt
                ? `Last generated ${formatGeneratedAt(generatedAt)}`
                : 'Top 3 focus tasks + stale cleanup'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
            disabled={loading}
            className="px-3 py-1.5 bg-white text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {loading ? '🧠 Analysing...' : briefing ? '🔄 Refresh' : '✨ Generate'}
          </button>
          <span className="text-white text-lg select-none">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Body — only rendered when expanded */}
      {expanded && (
        <div className="px-5 py-4 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {error}</div>
          )}

          {!briefing && !loading && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">
                Click <strong>Generate</strong> to get your personalised daily focus plan.
              </p>
              <p className="text-xs text-gray-400">
                AI will pick your top 3 tasks and surface any stale items needing attention.
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-16" />)}
            </div>
          )}

          {briefing && (
            <>
              {/* Motivational note */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-sm text-blue-800 font-medium">💬 {briefing.motivationalNote}</p>
              </div>

              {/* Overload warning */}
              {briefing.overloadWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-amber-800">⚠️ {briefing.overloadWarning}</p>
                </div>
              )}

              {/* Top 3 focus tasks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">🎯 Top 3 Focus Tasks Today</p>
                  <span className="text-xs text-gray-400">Est. total: {formatMinutes(briefing.totalEstimatedMinutes)}</span>
                </div>
                <div className="space-y-2">
                  {briefing.topTasks.map((ft: FocusTask) => {
                    const task = tasks.find((t) => t.id === ft.taskId);
                    return (
                      <div key={ft.taskId} className="flex items-start space-x-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                          {ft.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <p className="text-sm font-semibold text-gray-900">{ft.taskTitle}</p>
                            {task && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>
                                {task.priority}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">~{formatMinutes(ft.estimatedMinutes)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{ft.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stale tasks */}
              {briefing.staleTasks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🕸️ Stale Tasks — Needs Attention</p>
                  <div className="space-y-2">
                    {briefing.staleTasks.map((st: StaleTask) => (
                      <div
                        key={st.taskId}
                        className={`flex items-start justify-between bg-gray-50 border rounded-xl px-4 py-3 transition-opacity ${
                          appliedStale.has(st.taskId) ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm font-medium text-gray-800">{st.taskTitle}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{st.reason}</p>
                          <p className="text-xs text-orange-600 mt-0.5">Stale for {st.daysStale} days</p>
                          {st.suggestion === 'drop' && pendingDeleteId === st.taskId && (
                            <p className="text-xs text-red-600 mt-1 font-medium">Click again to permanently delete this task.</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => handleApplyStale(st)}
                            disabled={appliedStale.has(st.taskId)}
                            className={staleActionClass(st)}
                          >
                            {staleActionLabel(st)}
                          </button>
                          {pendingDeleteId === st.taskId && (
                            <button
                              onClick={() => setPendingDeleteId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
