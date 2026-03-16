import { useState } from 'react';
import { Task } from '../../types/task';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: Task['status']) => void;
  projects?: { id: string; name: string; color?: string }[];
}

type SortKey = 'priority' | 'due_date' | 'created_at';

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
};

const priorityConfig = {
  high:   { color: 'bg-red-100 text-red-700 border border-red-200',          dot: 'bg-red-500',    label: 'High',   order: 0 },
  medium: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', dot: 'bg-yellow-400', label: 'Medium', order: 1 },
  low:    { color: 'bg-gray-100 text-gray-600 border border-gray-200',       dot: 'bg-gray-400',   label: 'Low',    order: 2 },
};

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isPast(date) && !isToday(date)) return { label: `Overdue \u00b7 ${format(date, 'MMM d')}`, cls: 'text-red-600 font-semibold' };
  if (isToday(date))    return { label: 'Due Today',    cls: 'text-orange-600 font-semibold' };
  if (isTomorrow(date)) return { label: 'Due Tomorrow', cls: 'text-yellow-600 font-semibold' };
  return { label: format(date, 'MMM d, yyyy'), cls: 'text-gray-400' };
}

function contrastColor(hex: string): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#1f2937' : '#ffffff';
}

/** Returns true if any of the task's blockers are not yet done */
function isBlocked(task: Task, taskMap: Record<string, Task>): boolean {
  if (!task.blocked_by || task.blocked_by.length === 0) return false;
  return task.blocked_by.some((id) => taskMap[id] && taskMap[id].status !== 'done');
}

export default function TaskList({ tasks, onEdit, onDelete, onStatusChange, projects = [] }: TaskListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [showGuide, setShowGuide] = useState(false);

  const taskMap = tasks.reduce((acc, t) => { acc[t.id] = t; return acc; }, {} as Record<string, Task>);

  const sorted = [...tasks].sort((a, b) => {
    // Blocked tasks always sink to the bottom
    const aBlocked = isBlocked(a, taskMap);
    const bBlocked = isBlocked(b, taskMap);
    if (aBlocked && !bBlocked) return 1;
    if (!aBlocked && bBlocked) return -1;

    if (sortKey === 'priority') {
      const diff = priorityConfig[a.priority].order - priorityConfig[b.priority].order;
      if (diff !== 0) return diff;
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    }
    if (sortKey === 'due_date') {
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const projectMap = projects.reduce(
    (acc, p) => { acc[p.id] = p; return acc; },
    {} as Record<string, typeof projects[0]>
  );

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Bar */}
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Sort:</span>
          {(['priority', 'due_date', 'created_at'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sortKey === key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {key === 'priority' ? '\uD83D\uDD34 Priority' : key === 'due_date' ? '\uD83D\uDCC5 Due Date' : '\uD83D\uDD50 Newest'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowGuide(!showGuide)} className="text-xs text-blue-500 hover:text-blue-700 underline">
          {showGuide ? 'Hide guide' : '\u2753 How to use'}
        </button>
      </div>

      {showGuide && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 space-y-1">
          <p className="font-semibold mb-2">\uD83D\uDCCB How to use the Task List</p>
          <p>\u2022 <strong>\uD83D\uDD34 Priority sort</strong> \u2014 High \u2192 Medium \u2192 Low. Blocked tasks always sort to the bottom.</p>
          <p>\u2022 <strong>\uD83D\uDCC5 Due Date sort</strong> \u2014 Nearest deadline first.</p>
          <p>\u2022 <strong>\uD83D\uDD50 Newest sort</strong> \u2014 Most recently created first.</p>
          <p>\u2022 <strong>\uD83D\uDD12 Blocked</strong> tasks cannot be started until their dependencies are done.</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <ul className="divide-y divide-gray-200">
          {sorted.map((task, index) => {
            const pc = priorityConfig[task.priority];
            const due = task.due_date ? formatDueDate(task.due_date) : null;
            const project = task.project_id ? projectMap[task.project_id] : null;
            const blocked = isBlocked(task, taskMap);
            const blockerTitles = blocked
              ? (task.blocked_by ?? []).filter((id) => taskMap[id]?.status !== 'done').map((id) => taskMap[id]?.title ?? id)
              : [];
            const isOverdue = !blocked && task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && task.status !== 'done';
            const bgColor = project?.color ?? '#6366f1';
            const textColor = contrastColor(bgColor);

            return (
              <li key={task.id} className={blocked ? 'bg-orange-50 opacity-80' : isOverdue ? 'bg-red-50' : 'bg-white hover:bg-gray-50 transition-colors'}>
                <div className="px-4 py-4 sm:px-5">
                  {/* Row 1: priority dot + title + lock badge + actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {sortKey === 'priority' && (
                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                      )}
                      <span className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${blocked ? 'bg-orange-400' : pc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-semibold leading-snug ${
                            task.status === 'done' ? 'line-through text-gray-400' : blocked ? 'text-orange-800' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          {blocked && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 border border-orange-300 text-orange-700 text-xs font-semibold">
                              \uD83D\uDD12 Blocked
                            </span>
                          )}
                        </div>
                        {/* Blocker explanation */}
                        {blocked && blockerTitles.length > 0 && (
                          <p className="mt-0.5 text-xs text-orange-600">
                            Waiting on: {blockerTitles.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1.5">
                      <button
                        onClick={() => onEdit(task)}
                        className="px-2.5 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(task)}
                        className="px-2.5 py-1 border border-red-200 rounded-md text-xs font-medium text-red-600 bg-white hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Row 2: project pill + priority + due date */}
                  <div className="mt-2 ml-7 flex flex-wrap items-center gap-2">
                    {project && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap"
                        style={{ backgroundColor: bgColor, color: textColor }}
                      >
                        <svg className="w-3 h-3 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                        {project.name}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${pc.color}`}>
                      {pc.label}
                    </span>
                    {due && <span className={`text-xs ${due.cls}`}>\u23F0 {due.label}</span>}
                  </div>

                  {/* Row 3: description */}
                  {task.description && (
                    <p className="mt-1.5 ml-7 text-xs text-gray-500 line-clamp-2 leading-relaxed">{task.description}</p>
                  )}

                  {/* Row 4: status dropdown — blocked tasks cannot move to in_progress */}
                  <div className="mt-2 ml-7">
                    <select
                      value={task.status}
                      disabled={blocked && task.status === 'todo'}
                      title={blocked ? `Blocked by: ${blockerTitles.join(', ')}` : undefined}
                      onChange={(e) => {
                        const next = e.target.value as Task['status'];
                        if (blocked && next === 'in_progress') {
                          alert(`\uD83D\uDD12 This task is blocked.\n\nComplete these first:\n${blockerTitles.map((t) => '\u2022 ' + t).join('\n')}`);
                          return;
                        }
                        onStatusChange(task, next);
                      }}
                      className={`text-xs font-medium px-2.5 py-1 rounded-md cursor-pointer border-0 outline-none focus:ring-2 focus:ring-blue-400 ${
                        blocked ? 'bg-orange-100 text-orange-700 cursor-not-allowed' : statusColors[task.status]
                      }`}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress" disabled={blocked}>In Progress {blocked ? '(blocked)' : ''}</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
