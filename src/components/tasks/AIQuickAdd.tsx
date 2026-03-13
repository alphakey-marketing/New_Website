'use client';
import { useState } from 'react';
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
}

export default function AIQuickAdd({ projects, onCreateTask }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ParsedTask | null>(null);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleParse = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    setSuccess(false);

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
      setPreview(data.task);
      setConfidence(data.confidence);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const matchedProject = preview.project_name
        ? projects.find((p) => p.name.toLowerCase() === preview.project_name?.toLowerCase())
        : null;

      await onCreateTask({
        title: preview.title,
        description: preview.description,
        priority: preview.priority,
        due_date: preview.due_date ?? null,
        project_id: matchedProject?.id ?? null,
        status: 'todo',
      });
      setInput('');
      setPreview(null);
      setConfidence(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
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
          onChange={(e) => { setInput(e.target.value); setPreview(null); }}
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

      {error && (
        <p className="mt-2 text-xs text-red-600">⚠️ {error}</p>
      )}

      {success && (
        <p className="mt-2 text-xs text-green-600 font-medium">✅ Task created successfully!</p>
      )}

      {/* Preview card */}
      {preview && (
        <div className="mt-3 bg-white border border-indigo-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Review & confirm</span>
            {confidence && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${confidenceBadge[confidence]}`}>
                {confidence === 'high' ? '✅ High confidence' : confidence === 'medium' ? '⚠️ Medium confidence' : '❓ Low confidence — please review'}
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

          {/* Priority + Due date row */}
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

          {/* Project */}
          {preview.project_name && (
            <div className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-1.5">
              📁 Matched project: <strong>{preview.project_name}</strong>
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
              onClick={() => { setPreview(null); setConfidence(null); }}
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
