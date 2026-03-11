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
  high:   { color: 'bg-red-100 text-red-700 border border-red-200',    icon: '🔴', label: 'High',   order: 0 },
  medium: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '🟡', label: 'Medium', order: 1 },
  low:    { color: 'bg-gray-100 text-gray-600 border border-gray-200',  icon: '🟢', label: 'Low',    order: 2 },
};

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isPast(date) && !isToday(date)) return { label: `Overdue: ${format(date, 'MMM d')}`, cls: 'text-red-600 font-semibold' };
  if (isToday(date))    return { label: 'Due Today',     cls: 'text-orange-600 font-semibold' };
  if (isTomorrow(date)) return { label: 'Due Tomorrow',  cls: 'text-yellow-600 font-semibold' };
  return { label: `Due ${format(date, 'MMM d, yyyy')}`, cls: 'text-gray-500' };
}

export default function TaskList({ tasks, onEdit, onDelete, onStatusChange, projects = [] }: TaskListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [showGuide, setShowGuide] = useState(false);

  const sorted = [...tasks].sort((a, b) => {
    if (sortKey === 'priority') {
      const diff = priorityConfig[a.priority].order - priorityConfig[b.priority].order;
      if (diff !== 0) return diff;
      // secondary sort: due date
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
    // created_at
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const projectMap = projects.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, typeof projects[0]>);

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
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Sort by:</span>
          {(['priority', 'due_date', 'created_at'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sortKey === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {key === 'priority' ? '🔴 Priority' : key === 'due_date' ? '📅 Due Date' : '🕐 Newest'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs text-blue-500 hover:text-blue-700 underline"
        >
          {showGuide ? 'Hide guide' : '❓ How to use'}
        </button>
      </div>

      {/* Inline Guide */}
      {showGuide && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 space-y-1">
          <p className="font-semibold mb-2">📋 How to use the Task List</p>
          <p>• <strong>🔴 Priority sort</strong> — Shows High → Medium → Low tasks. Within same priority, earliest due date comes first. Best for daily work.</p>
          <p>• <strong>📅 Due Date sort</strong> — Shows tasks nearest deadline first regardless of priority. Best when you have hard deadlines.</p>
          <p>• <strong>🕐 Newest sort</strong> — Shows most recently created tasks first. Best for reviewing what you just added.</p>
          <p>• <strong>Status dropdown</strong> — Change a task&apos;s status inline without opening the edit form.</p>
          <p>• <strong>Overdue</strong> tasks show in red — tackle these first!</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sorted.map((task, index) => {
            const pc = priorityConfig[task.priority];
            const due = task.due_date ? formatDueDate(task.due_date) : null;
            const project = task.project_id ? projectMap[task.project_id] : null;
            const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && task.status !== 'done';

            return (
              <li key={task.id} className={isOverdue ? 'bg-red-50' : ''}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Priority rank number */}
                      {sortKey === 'priority' && (
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h3 className={`text-base font-medium truncate ${
                            task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          {/* Priority badge */}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pc.color}`}>
                            {pc.icon} {pc.label}
                          </span>
                          {/* Project badge */}
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
                          <p className="mt-1 text-sm text-gray-500 line-clamp-1">{task.description}</p>
                        )}
                        <div className="mt-1.5 flex items-center space-x-2">
                          <select
                            value={task.status}
                            onChange={(e) => onStatusChange(task, e.target.value as Task['status'])}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${statusColors[task.status]}`}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                          {due && (
                            <span className={`text-xs ${due.cls}`}>⏰ {due.label}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => onEdit(task)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(task)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
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
