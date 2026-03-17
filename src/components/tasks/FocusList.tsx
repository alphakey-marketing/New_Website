import { useState } from 'react';
import { Task } from '../../types/task';
import { isPast, isToday } from 'date-fns';
import { isBlocked, formatDueDate } from '../../utils/taskUtils';

interface FocusListProps {
  tasks: Task[];
  projects: { id: string; name: string; color?: string }[];
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: Task['status']) => void;
  onNewTask?: (projectId: string | null) => void;
}

const priorityOrder = { high: 0, medium: 1, low: 2 };

const priorityConfig = {
  high:   { color: 'bg-red-100 text-red-700 border border-red-200',          icon: '🔴', label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '🟡', label: 'Medium' },
  low:    { color: 'bg-gray-100 text-gray-600 border border-gray-200',        icon: '🟢', label: 'Low' },
};

export default function FocusList({ tasks, projects, onEdit, onStatusChange, onNewTask }: FocusListProps) {
  const [limit, setLimit] = useState(7);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const projectMap = projects.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, typeof projects[0]>);
  const taskMap    = tasks.reduce((acc, t) => { acc[t.id] = t; return acc; }, {} as Record<string, Task>);

  const ranked = [...tasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
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
  const overdueCount = ranked.filter(t => !isBlocked(t, taskMap) && t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))).length;
  const blockedCount = ranked.filter(t => isBlocked(t, taskMap)).length;

  const handleNewTask = (projectId: string | null) => {
    setShowProjectPicker(false);
    onNewTask?.(projectId);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎯 Today&apos;s Focus</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {ranked.length} tasks remaining
            {overdueCount > 0 && <span className="ml-2 text-red-600 font-semibold">&middot; {overdueCount} overdue</span>}
            {blockedCount > 0 && <span className="ml-2 text-orange-500">&middot; {blockedCount} blocked</span>}
          </p>
        </div>

        {onNewTask && (
          <div className="relative">
            <button
              onClick={() => setShowProjectPicker(!showProjectPicker)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Task
            </button>
            {showProjectPicker && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Add to project</p>
                  <button
                    onClick={() => handleNewTask(null)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    📂 No project
                  </button>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleNewTask(p.id)}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 gap-2"
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.color || '#6366f1' }}
                      />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  blocked ? 'bg-orange-200 text-orange-600' : index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {blocked ? '🔒' : index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`font-medium ${
                      blocked ? 'text-orange-800 text-sm' : index === 0 ? 'text-base text-gray-900' : 'text-sm text-gray-900'
                    }`}>
                      {task.title}
                    </span>
                    {blocked ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 border border-orange-300 text-orange-700">
                        🔒 Blocked
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

                {due && !blocked && (
                  <div className={`flex-shrink-0 text-xs font-medium ${due.cls}`}>⏰ {due.label}</div>
                )}

                <div className="flex-shrink-0 flex items-center space-x-2">
                  <select
                    value={task.status}
                    disabled={blocked}
                    title={blocked ? `Blocked by: ${blockerTitles.join(', ')}` : undefined}
                    onChange={(e) => {
                      const next = e.target.value as Task['status'];
                      if (blocked && next === 'in_progress') {
                        alert(`🔒 This task is blocked.\n\nComplete these first:\n${blockerTitles.map((t) => '• ' + t).join('\n')}`);
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
