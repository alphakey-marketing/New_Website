import { useState, useEffect, FormEvent } from 'react';
import type { Task, TaskFormData } from '../../types/task';

interface TaskFormProps {
  task?: Task | null;
  allTasks?: Task[];
  projects?: { id: string; name: string; color?: string }[];
  initialProjectId?: string | null;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

/** Shared priority dropdown — used in both create and edit modes */
function PrioritySelect({
  value,
  onChange,
  className,
}: {
  value: TaskFormData['priority'];
  onChange: (v: TaskFormData['priority']) => void;
  className?: string;
}) {
  return (
    <select
      id="priority"
      className={className ?? 'mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'}
      value={value}
      onChange={(e) => onChange(e.target.value as TaskFormData['priority'])}
    >
      <option value="high">High</option>
      <option value="medium">Medium</option>
      <option value="low">Low</option>
    </select>
  );
}

export default function TaskForm({ task, allTasks = [], projects = [], initialProjectId, onSubmit, onCancel }: TaskFormProps) {
  const isEditing = !!task;

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    project_id: initialProjectId ?? null,
    blocked_by: null,
  });
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [showDepsSection, setShowDepsSection] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title:       task.title,
        description: task.description || '',
        status:      task.status,
        priority:    task.priority,
        due_date:    task.due_date ? task.due_date.split('T')[0] : '',
        project_id:  task.project_id ?? null,
        blocked_by:  task.blocked_by ?? null,
      });
      if (task.blocked_by && task.blocked_by.length > 0) setShowDepsSection(true);
    } else if (initialProjectId) {
      setFormData((prev) => ({ ...prev, project_id: initialProjectId }));
    }
  }, [task, initialProjectId]);

  const activeProjectId   = formData.project_id ?? null;
  const activeProjectName = projects.find((p) => p.id === activeProjectId)?.name;

  const eligibleBlockers = activeProjectId
    ? allTasks.filter((t) => t.id !== task?.id && t.status !== 'done' && t.project_id === activeProjectId)
    : [];

  const handleProjectChange = (newProjectId: string | null) => {
    const validBlockers = (formData.blocked_by ?? []).filter(
      (id) => allTasks.find((t) => t.id === id)?.project_id === newProjectId,
    );
    setFormData({ ...formData, project_id: newProjectId, blocked_by: validBlockers.length > 0 ? validBlockers : null });
  };

  const toggleBlocker = (id: string) => {
    const current = formData.blocked_by ?? [];
    const next    = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    setFormData({ ...formData, blocked_by: next.length > 0 ? next : null });
  };

  const handleClearBlockers = () => {
    if (!window.confirm('Remove all blockers from this task?')) return;
    setFormData({ ...formData, blocked_by: null });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const submitData: TaskFormData = {
        ...formData,
        due_date:   formData.due_date ? new Date(formData.due_date).toISOString() : null,
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
              {isEditing ? 'Edit Task' : 'Create New Task'}
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

            {/* Project */}
            {projects.length > 0 && (
              <div>
                <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">Project</label>
                <select
                  id="project_id"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.project_id ?? ''}
                  onChange={(e) => handleProjectChange(e.target.value || null)}
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status (edit only) + Priority — grid in edit, single col in create */}
            <div className={isEditing ? 'grid grid-cols-2 gap-4' : undefined}>
              {isEditing && (
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
              )}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                <PrioritySelect
                  value={formData.priority}
                  onChange={(v) => setFormData({ ...formData, priority: v })}
                />
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

            {/* Dependencies */}
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
                    Select tasks <strong>within the same project</strong> that must be <strong>Done</strong> before this task can start.
                  </p>

                  {!activeProjectId && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      ⚠️ Assign this task to a <strong>project</strong> first to set dependencies.
                    </p>
                  )}

                  {activeProjectId && eligibleBlockers.length === 0 && (
                    <p className="text-xs text-gray-400 italic">
                      No other active tasks in <strong>{activeProjectName}</strong> to set as blockers.
                    </p>
                  )}

                  {activeProjectId && eligibleBlockers.length > 0 && (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {eligibleBlockers.map((t) => {
                        const isSelected = formData.blocked_by?.includes(t.id) ?? false;
                        return (
                          <label
                            key={t.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                              isSelected ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-200 hover:bg-gray-50'
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
                      onClick={handleClearBlockers}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
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
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
