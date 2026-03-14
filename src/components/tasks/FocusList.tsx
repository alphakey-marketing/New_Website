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
  high:   { color: 'bg-red-100 text-red-700 border border-red-200',    icon: '🔴', label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '🟡', label: 'Medium' },
  low:    { color: 'bg-gray-100 text-gray-600 border border-gray-200',  icon: '🟢', label: 'Low' },
};

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isPast(date) && !isToday(date)) return { label: `Overdue: ${format(date, 'MMM d')}`, cls: 'text-red-600 font-bold' };
  if (isToday(date))    return { label: 'Today',    cls: 'text-orange-500 font-semibold' };
  if (isTomorrow(date)) return { label: 'Tomorrow', cls: 'text-yellow-600 font-semibold' };
  return { label: format(date, 'MMM d'), cls: 'text-gray-400' };
}

export default function FocusList({ tasks, projects, onEdit, onStatusChange }: FocusListProps) {
  const [showGuide, setShowGuide] = useState(true);
  const [limit, setLimit] = useState(7);

  const projectMap = projects.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, typeof projects[0]>);

  // Only show non-done tasks, sorted by priority then due date
  const ranked = [...tasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    });

  const visible = ranked.slice(0, limit);
  const overdueCount = ranked.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))).length;
  const highCount = ranked.filter(t => t.priority === 'high').length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎯 Today&apos;s Focus</h2>
            <p className="text-sm text-gray-500 mt-1">
              {ranked.length} tasks remaining across all projects
              {overdueCount > 0 && <span className="ml-2 text-red-600 font-semibold">· {overdueCount} overdue!</span>}
              {highCount > 0 && <span className="ml-2 text-red-500">· {highCount} high priority</span>}
            </p>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs text-blue-500 hover:text-blue-700 underline"
          >
            {showGuide ? 'Hide guide' : '❓ How to use'}
          </button>
        </div>

        {/* Onboarding Guide */}
        {showGuide && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-900">
            <p className="font-semibold text-base mb-2">👋 How to use Today&apos;s Focus</p>
            <div className="space-y-1.5">
              <p>📌 <strong>This list ranks ALL your tasks</strong> across every project — work, home, personal — in one place.</p>
              <p>🔴 <strong>Start from the top.</strong> Tasks are sorted by priority first, then by due date. The #1 task is what needs your attention most.</p>
              <p>✅ <strong>Mark tasks done</strong> using the status dropdown inline — no need to open the edit form.</p>
              <p>📅 <strong>Overdue tasks</strong> appear in red — clear these before anything else.</p>
              <p>💡 <strong>Tip:</strong> Open this view every morning and just start with task #1. Don&apos;t overthink it!</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Pills */}
      <div className="flex items-center space-x-3 mb-5">
        {(['high', 'medium', 'low'] as const).map((p) => {
          const count = ranked.filter(t => t.priority === p).length;
          const cfg = priorityConfig[p];
          return (
            <span key={p} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
              {cfg.icon} {cfg.label}: {count}
            </span>
          );
        })}
      </div>

      {/* Task Rows */}
      {ranked.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-semibold text-gray-700">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No pending tasks. Enjoy your day!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((task, index) => {
            const pc = priorityConfig[task.priority];
            const due = task.due_date ? formatDueDate(task.due_date) : null;
            const project = task.project_id ? projectMap[task.project_id] : null;
            const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

            return (
              <div
                key={task.id}
                className={`flex items-center space-x-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                  isOverdue
                    ? 'bg-red-50 border-red-200'
                    : index === 0
                    ? 'bg-white border-blue-300 shadow-sm ring-1 ring-blue-100'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Rank number */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {index + 1}
                </div>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`font-medium text-gray-900 ${
                      index === 0 ? 'text-base' : 'text-sm'
                    }`}>
                      {task.title}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pc.color}`}>
                      {pc.icon} {pc.label}
                    </span>
                    {project && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: project.color || '#6366f1' }}
                      >
                        {project.name}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                </div>

                {/* Due date */}
                {due && (
                  <div className={`flex-shrink-0 text-xs font-medium ${due.cls}`}>
                    ⏰ {due.label}
                  </div>
                )}

                {/* Status + Edit */}
                <div className="flex-shrink-0 flex items-center space-x-2">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task, e.target.value as Task['status'])}
                    className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">✅ Done</option>
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

          {/* Show more */}
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
