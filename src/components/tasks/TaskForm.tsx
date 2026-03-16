import { useState, useEffect, FormEvent } from 'react';
import type { Task, TaskFormData } from '../../types/task';

interface TaskFormProps {
  task?: Task | null;
  allTasks?: Task[];          // needed to populate the blocked-by picker
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({ task, allTasks = [], onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    blocked_by: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDepsSection, setShowDepsSection] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        blocked_by: task.blocked_by ?? null,
      });
      if (task.blocked_by && task.blocked_by.length > 0) setShowDepsSection(true);
    }
  }, [task]);

  // Tasks eligible to be a blocker: everything except the current task being edited
  const eligibleBlockers = allTasks.filter((t) => t.id !== task?.id && t.status !== 'done');

  const toggleBlocker = (id: string) => {
    const current = formData.blocked_by ?? [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    setFormData({ ...formData, blocked_by: next.length > 0 ? next : null });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const submitData: TaskFormData = {
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        blocked_by: formData.blocked_by && formData.blocked_by.length > 0 ? formData.blocked_by : null,
      };
      await onSubmit(submitData);
      onCancel();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = formData.blocked_by?.length ?? 0;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>

          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text" id="title" required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description" rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="status"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskFormData['status'] })}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  id="priority"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskFormData['priority'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date" id="due_date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.due_date || ''}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            {/* ── Dependencies (optional, collapsible) ── */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDepsSection(!showDepsSection)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
              >
                <span>
                  🔗 Dependencies
                  {selectedCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                      {selectedCount} blocker{selectedCount > 1 ? 's' : ''}
                    </span>
                  )}
                </span>
                <span className="text-gray-400 text-xs">{showDepsSection ? '▲ hide' : '▼ set blockers (optional)'}</span>
              </button>

              {showDepsSection && (
                <div className="px-4 py-3 space-y-3">
                  <p className="text-xs text-gray-500">
                    Select tasks that must be <strong>Done</strong> before this task can start. This task will be locked until all selected blockers are completed.
                  </p>

                  {eligibleBlockers.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No other active tasks available to set as blockers.</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {eligibleBlockers.map((t) => {
                        const isSelected = formData.blocked_by?.includes(t.id) ?? false;
                        return (
                          <label
                            key={t.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                              isSelected
                                ? 'bg-orange-50 border-orange-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleBlocker(t.id)}
                              className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                              <p className="text-xs text-gray-400 capitalize">{t.status.replace('_', ' ')} · {t.priority}</p>
                            </div>
                            {isSelected && <span className="text-xs font-semibold text-orange-600">blocks ▶</span>}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, blocked_by: null })}
                      className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Clear all blockers
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button" onClick={onCancel} disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
