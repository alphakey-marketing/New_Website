'use client';
import { useState } from 'react';
import type { Task } from '../../types/task';
import type { FocusTask, StaleTask, DailyFocusResponse } from '../../pages/api/tasks/ai-daily-focus';

interface Props {
  tasks: Task[];
  projects: { id: string; name: string; color?: string }[];
  onUpdateTask: (taskId: string, update: { priority?: string; due_date?: string; status?: string }) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
}

export default function AIDailyBriefing({ tasks, projects, onUpdateTask, onDeleteTask }: Props) {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<DailyFocusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedStale, setAppliedStale] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(true);

  const projectMap = projects.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, typeof projects[0]>);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setBriefing(null);
    setAppliedStale(new Set());

    try {
      const today = new Date().toISOString().split('T')[0];
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

      const res = await fetch('/api/tasks/ai-daily-focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: snapshots, today }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Failed to generate briefing');
      }

      const data: DailyFocusResponse = await res.json();
      setBriefing(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyStale = async (stale: StaleTask) => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    if (stale.suggestion === 'reschedule') {
      await onUpdateTask(stale.taskId, { due_date: nextWeekStr });
    } else if (stale.suggestion === 'reprioritize') {
      await onUpdateTask(stale.taskId, { priority: 'low' });
    } else if (stale.suggestion === 'drop' && onDeleteTask) {
      await onDeleteTask(stale.taskId);
    }
    setAppliedStale((prev) => new Set(prev).add(stale.taskId));
  };

  const staleActionLabel = (s: StaleTask) => {
    if (s.suggestion === 'reschedule') return '📅 Reschedule +7 days';
    if (s.suggestion === 'reprioritize') return '🔽 Set to Low priority';
    if (s.suggestion === 'drop') return '🗑️ Delete task';
    return 'Apply';
  };

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const priorityColor: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white border border-blue-200 rounded-xl mb-4 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">🌅</span>
          <div>
            <h3 className="text-sm font-bold text-white">Daily Briefing</h3>
            <p className="text-xs text-blue-200">Your top 3 focus tasks + stale task cleanup</p>
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
          <span className="text-white text-lg">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-5 py-4 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {error}</div>
          )}

          {!briefing && !loading && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">Click <strong>Generate</strong> to get your personalised daily focus plan.</p>
              <p className="text-xs text-gray-400">AI will pick your top 3 tasks and surface any stale items needing attention.</p>
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
                        </div>
                        <button
                          onClick={() => handleApplyStale(st)}
                          disabled={appliedStale.has(st.taskId)}
                          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
                        >
                          {appliedStale.has(st.taskId) ? '✅ Done' : staleActionLabel(st)}
                        </button>
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
