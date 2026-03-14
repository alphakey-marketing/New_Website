'use client';
import { useState } from 'react';
import { projectService } from '../../utils/projectService';
import type { ParsedTask } from '../../pages/api/tasks/ai-parse-task';

interface Props {
  projects: { id: string; name: string; color?: string }[];
  onCreateTask: (task: {
    title: string;
    description?: string;
    priority: 'high' | 'medium' | 'low';
    due_date?: string | null;
    project_id?: string | null;
    status: 'todo';
  }) => Promise<void>;
  onProjectCreated?: () => Promise<void>; // called after a new project is auto-created
}

export default function AIQuickAdd({ projects, onCreateTask, onProjectCreated }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ParsedTask | null>(null);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // When AI proposes a new project name that doesn't exist yet
  const [newProjectName, setNewProjectName] = useState<string | null>(null);
  const [createNewProject, setCreateNewProject] = useState(false);

  const handleParse = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    setSuccess(null);
    setNewProjectName(null);
    setCreateNewProject(false);

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/tasks/ai-parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, today, projects }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Parse failed');
      }
      const data = await res.json();
      const parsed: ParsedTask = data.task;
      setPreview(parsed);
      setConfidence(data.confidence);

      // Check if AI proposed a project name that doesn't exist yet
      if (parsed.project_name) {
        const match = projects.find(
          (p) => p.name.toLowerCase() === parsed.project_name!.toLowerCase()
        );
        if (!match) {
          setNewProjectName(parsed.project_name);
          setCreateNewProject(true); // default: yes, create it
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      let resolvedProjectId: string | null = null;

      if (preview.project_name) {
        // Try to match existing project (case-insensitive)
        const existing = projects.find(
          (p) => p.name.toLowerCase() === preview.project_name!.toLowerCase()
        );
        if (existing) {
          resolvedProjectId = existing.id;
        } else if (createNewProject && newProjectName) {
          // Auto-create the new project
          const created = await projectService.createProject({
            name: newProjectName,
            description: '',
            color: '#6366f1', // default indigo
          } as any);
          resolvedProjectId = created.id;
          // Notify parent to refresh project list
          if (onProjectCreated) await onProjectCreated();
        }
      }

      await onCreateTask({
        title: preview.title,
        description: preview.description,
        priority: preview.priority,
        due_date: preview.due_date ?? null,
        project_id: resolvedProjectId,
        status: 'todo',
      });

      const projectNote = resolvedProjectId && newProjectName && createNewProject
        ? ` in new project "${newProjectName}"`
        : '';
      setInput('');
      setPreview(null);
      setConfidence(null);
      setNewProjectName(null);
      setCreateNewProject(false);
      setSuccess(`✅ Task created${projectNote}!`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: keyof ParsedTask, value: string) => {
    if (!preview) return;
    setPreview({ ...preview, [field]: value });
  };

  const priorityColor = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const confidenceBadge = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">⚡</span>
        <h3 className="text-sm font-bold text-indigo-900">AI Quick Add</h3>
        <span className="text-xs text-indigo-500">Type naturally — AI fills the details</span>
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setPreview(null); setNewProjectName(null); }}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleParse()}
          placeholder="e.g. Send report to Vincent by Friday, high priority"
          className="flex-1 border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          disabled={loading}
        />
        <button
          onClick={handleParse}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {loading && !preview ? '🧠 Parsing...' : '✨ Parse'}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">⚠️ {error}</p>}
      {success && <p className="mt-2 text-xs text-green-600 font-medium">{success}</p>}

      {/* Preview card */}
      {preview && (
        <div className="mt-3 bg-white border border-indigo-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Review & confirm</span>
            {confidence && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${confidenceBadge[confidence]}`}>
                {confidence === 'high' ? '✅ High confidence' : confidence === 'medium' ? '⚠️ Medium — please review' : '❓ Low — please review carefully'}
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-gray-500">Title</label>
            <input
              type="text"
              value={preview.title}
              onChange={(e) => handleEdit('title', e.target.value)}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500">Description (optional)</label>
            <input
              type="text"
              value={preview.description ?? ''}
              onChange={(e) => handleEdit('description', e.target.value)}
              placeholder="Add more detail..."
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Priority + Due date */}
          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500">Priority</label>
              <select
                value={preview.priority}
                onChange={(e) => handleEdit('priority', e.target.value)}
                className={`mt-1 w-full border rounded-lg px-2 py-1.5 text-sm font-medium focus:outline-none ${priorityColor[preview.priority]}`}
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500">Due Date</label>
              <input
                type="date"
                value={preview.due_date ?? ''}
                onChange={(e) => handleEdit('due_date', e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          {/* Project — existing match */}
          {preview.project_name && !newProjectName && (
            <div className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-1.5">
              📁 Matched project: <strong>{preview.project_name}</strong>
            </div>
          )}

          {/* Project — new project prompt */}
          {newProjectName && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-amber-800 mb-1.5">
                📁 Project &quot;{newProjectName}&quot; doesn&apos;t exist yet
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateNewProject(true)}
                  className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    createNewProject
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ✅ Create project
                </button>
                <button
                  type="button"
                  onClick={() => setCreateNewProject(false)}
                  className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    !createNewProject
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Skip — no project
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-1">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : '✅ Create Task'}
            </button>
            <button
              onClick={() => { setPreview(null); setConfidence(null); setNewProjectName(null); }}
              className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              ✏️ Edit differently
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
