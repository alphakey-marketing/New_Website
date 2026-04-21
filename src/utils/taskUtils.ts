/**
 * Shared task utility helpers.
 * Import these instead of duplicating logic across TaskList / FocusList / etc.
 */
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import type { Task } from '../types/task';

/**
 * Returns true when at least one of the task's blockers is still not done.
 * A blocker that no longer exists in taskMap (i.e. was deleted) is silently
 * ignored — it will be cleaned up from the DB by handleDeleteTask.
 */
export function isBlocked(task: Task, taskMap: Record<string, Task>): boolean {
  if (!task.blocked_by || task.blocked_by.length === 0) return false;
  return task.blocked_by.some((id) => taskMap[id] != null && taskMap[id].status !== 'done');
}

/** Formatted due-date label + CSS class for urgency colouring. */
export function formatDueDate(dateStr: string): { label: string; cls: string } {
  const date = new Date(dateStr);
  if (isPast(date) && !isToday(date))
    return { label: `Overdue \u00b7 ${format(date, 'MMM d')}`, cls: 'text-red-600 font-semibold' };
  if (isToday(date))    return { label: 'Due Today',    cls: 'text-orange-600 font-semibold' };
  if (isTomorrow(date)) return { label: 'Due Tomorrow', cls: 'text-yellow-600 font-semibold' };
  return { label: format(date, 'MMM d, yyyy'), cls: 'text-gray-400' };
}
