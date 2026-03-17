import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isDragging?: boolean;
}

const priorityColors = {
  low:    'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-800',
  high:   'bg-red-100 text-red-800',
};

const priorityLabels = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
};

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isPast(date) && !isToday(date)) return { label: `Overdue \u00b7 ${format(date, 'MMM d')}`, cls: 'text-red-600 font-semibold' };
  if (isToday(date))    return { label: 'Due today',    cls: 'text-orange-600 font-semibold' };
  if (isTomorrow(date)) return { label: 'Due tomorrow', cls: 'text-yellow-600 font-semibold' };
  return { label: format(date, 'MMM d'), cls: 'text-gray-500' };
}

export default function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });

  const style = { transform: CSS.Translate.toString(transform) };
  const due   = task.due_date ? formatDueDate(task.due_date) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group bg-white rounded-lg shadow p-4 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-gray-400 mb-2 line-clamp-1">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
            {priorityLabels[task.priority]}
          </span>
          {due && (
            <span className={`text-xs ${due.cls}`}>\u23F0 {due.label}</span>
          )}
        </div>

        {/* Action buttons — hover-reveal, pointer-events isolated from drag */}
        <div
          className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1 rounded hover:bg-gray-100"
            title="Edit"
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
            className="p-1 rounded hover:bg-red-100"
            title="Delete"
          >
            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
