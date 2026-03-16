import { useState } from 'react';
import { Task } from '../../types/task';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface FocusListProps {
  tasks: Task[];
  projects: { id: string; name: string; color?: string }[];
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: Task['status']) => void;
}

const priorityOrder = { high: 0, medium: 1, low: 2 };

const priorityConfig = {
  high:   { color: 'bg-red-100 text-red-700 border border-red-200',    icon: '\uD83D\uDD34', label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '\uD83D\uDFE1', label: 'Medium' },
  low:    { color: 'bg-gray-100 text-gray-600 border border-gray-200',  icon: '\uD83D\uDFE2', label: 'Low' },
};

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isPast(date) && !isToday(date)) return { label: `Overdue: ${format(date, 'MMM d')}`, cls: 'text-red-600 font-bold' };
  if (isToday(date))    return { label: 'Today',    cls: 'text-orange-500 font-semibold' };
  if (isTomorrow(date)) return { label: 'Tomorrow', cls: 'text-yellow-600 font-semibold' };
  return { label: format(date, 'MMM d'), cls: 'text-gray-400' };
}

function isBlocked(task: Task, taskMap: Record<string, Task>): boolean {
  if (!task.blocked_by || task.blocked_by.length === 0) return false;
  return task.blocked_by.some((id) => taskMap[id] && taskMap[id].status !== 'done');
}

export default function FocusList({ tasks, projects, onEdit, onStatusChange }: FocusListProps) {
  const [showGuide, setShowGuide] = useState(true);
  const [limit, setLimit] = useState(7);

  const projectMap = projects.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, typeof projects[0]>);
  const taskMap    = tasks.reduce((acc, t) => { acc[t.id] = t; return acc; }, {} as Record<string, Task>);

  const ranked = [...tasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      // Blocked tasks sink to bottom
      const aB = isBlocked(a, taskMap);
      const bB = isBlocked(b, taskMap);
      if (aB && !bB) return 1;
      if (!aB && bB) return -1;
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    });

  const visible = ranked.slice(0, limit);
  const overdueCount  = ranked.filter(t => !isBlocked(t, taskMap) && t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))).length;
  const highCount     = ranked.filter(t => !isBlocked(t, taskMap) && t.priority === 'high').length;
  const blockedCount  = ranked.filter(t => isBlocked(t, taskMap)).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">\uD83C\uDFAF Today&apos;s Focus</h2>
            <p className="text-sm text-gray-500 mt-1">
              {ranked.length} tasks remaining
              {overdueCount > 0 && <span className="ml-2 text-red-600 font-semibold">\u00b7 {overdueCount} overdue!</span>}
              {highCount > 0    && <span className="ml-2 text-red-500">\u00b7 {highCount} high priority</span>}
              {blockedCount > 0 && <span className="ml-2 text-orange-500">\u00b7 {blockedCount} blocked</span>}
            </p>
          </div>
          <button onClick={() => setShowGuide(!showGuide)} className="text-xs text-blue-500 hover:text-blue-700 underline">
            {showGuide ? 'Hide guide' : '\u2753 How to use'}
          </button>
        </div>

        {showGuide && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-900">
            <p className="font-semibold text-base mb-2">\uD83D\uDC4B How to use Today&apos;s Focus</p>
            <div className="space-y-1.5">
              <p>\uD83D\uDCCC <strong>This list ranks ALL your tasks</strong> across every project in one place.</p>
              <p>\uD83D\uDD34 <strong>Start from the top.</strong> Sorted by priority, then due date. Task #1 needs your attention most.</p>
              <p>\uD83D\uDD12 <strong>Blocked tasks</strong> appear at the bottom \u2014 you can&apos;t start them until their dependencies are done.</p>
              <p>\u2705 <strong>Mark tasks done</strong> inline to automatically unblock dependent tasks.</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary pills */}
      <div className="flex items-center flex-wrap gap-2 mb-5">
        {(['high', 'medium', 'low'] as const).map((p) => {
          const count = ranked.filter(t => !isBlocked(t, taskMap) && t.priority === p).length;
          const cfg = priorityConfig[p];
          return (
            <span key={p} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
              {cfg.icon} {cfg.label}: {count}
            </span>
          );
        })}
        {blockedCount > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
            \uD83D\uDD12 Blocked: {blockedCount}
          </span>
        )}
      </div>

      {ranked.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-4xl mb-3">\uD83C\uDF89</p>
          <p className="text-lg font-semibold text-gray-700">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No pending tasks. Enjoy your day!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((task, index) => {
            const pc = priorityConfig[task.priority];
            const due = task.due_date ? formatDueDate(task.due_date) : null;
            const project = task.project_id ? projectMap[task.project_id] : null;
            const blocked = isBlocked(task, taskMap);
            const blockerTitles = blocked
              ? (task.blocked_by ?? []).filter((id) => taskMap[id]?.status !== 'done').map((id) => taskMap[id]?.title ?? id)
              : [];
            const isOverdue = !blocked && task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

            return (
              <div
                key={task.id}
                className={`flex items-center space-x-4 p-4 rounded-xl border transition-all ${
                  blocked
                    ? 'bg-orange-50 border-orange-200 opacity-75'
                    : isOverdue
                    ? 'bg-red-50 border-red-200'
                    : index === 0
                    ? 'bg-white border-blue-300 shadow-sm ring-1 ring-blue-100 hover:shadow-md'
                    : 'bg-white border-gray-200 hover:shadow-sm'
                }`}
              >
                {/* Rank */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  blocked ? 'bg-orange-200 text-orange-600' : index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {blocked ? '\uD83D\uDD12' : index + 1}
                </div>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`font-medium ${
                      blocked ? 'text-orange-800 text-sm' : index === 0 ? 'text-base text-gray-900' : 'text-sm text-gray-900'
                    }`}>
                      {task.title}
                    </span>
                    {blocked ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 border border-orange-300 text-orange-700">
                        \uD83D\uDD12 Blocked
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pc.color}`}>
                        {pc.icon} {pc.label}
                      </span>
                    )}
                    {project && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: project.color || '#6366f1' }}
                      >
                        {project.name}
                      </span>
                    )}
                  </div>
                  {blocked && blockerTitles.length > 0 && (
                    <p className="text-xs text-orange-500 mt-0.5">Waiting on: {blockerTitles.join(', ')}</p>
                  )}
                  {task.description && !blocked && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                </div>

                {/* Due */}
                {due && !blocked && (
                  <div className={`flex-shrink-0 text-xs font-medium ${due.cls}`}>\u23F0 {due.label}</div>
                )}

                {/* Status + Edit */}
                <div className="flex-shrink-0 flex items-center space-x-2">
                  <select
                    value={task.status}
                    disabled={blocked}
                    title={blocked ? `Blocked by: ${blockerTitles.join(', ')}` : undefined}
                    onChange={(e) => {
                      const next = e.target.value as Task['status'];
                      if (blocked && next === 'in_progress') {
                        alert(`\uD83D\uDD12 This task is blocked.\n\nComplete these first:\n${blockerTitles.map((t) => '\u2022 ' + t).join('\n')}`);
                        return;
                      }
                      onStatusChange(task, next);
                    }}
                    className={`text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      blocked ? 'bg-orange-100 border-orange-200 text-orange-600 cursor-not-allowed' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress" disabled={blocked}>In Progress</option>
                    <option value="done">\u2705 Done</option>
                  </select>
                  <button
                    onClick={() => onEdit(task)}
                    className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded border border-gray-200 hover:border-blue-300"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}

          {ranked.length > limit && (
            <button
              onClick={() => setLimit(limit + 7)}
              className="w-full py-3 text-sm text-blue-600 hover:text-blue-800 border border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Show {Math.min(7, ranked.length - limit)} more tasks ({ranked.length - limit} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
