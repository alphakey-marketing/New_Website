import { useState, useEffect } from 'react';
import type { Note } from '../../types/note';
import type { Project } from '../../types/project';

interface NoteEditorProps {
  note: Note | null;
  projects: Project[];
  onSave: (data: {
    title: string;
    content: string;
    tags: string[];
    is_favorite: boolean;
    project_id?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function NoteEditor({ note, projects, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
      setTags(note.tags || []);
      setIsFavorite(note.is_favorite);
      setProjectId(note.project_id);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setIsFavorite(false);
      setProjectId(undefined);
    }
  }, [note]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        tags,
        is_favorite: isFavorite,
        project_id: projectId,
      });
      onCancel();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">{note ? 'Edit Note' : 'New Note'}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="Note title..."
            className="text-2xl font-bold w-full border-none focus:outline-none focus:ring-0 p-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Metadata */}
        <div className="flex items-center space-x-4">
          {/* Favorite Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Favorite</span>
          </label>

          {/* Project Select */}
          <select
            value={projectId || ''}
            onChange={(e) => setProjectId(e.target.value || undefined)}
            className="block border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 inline-flex items-center justify-center"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add tag..."
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              onClick={handleAddTag}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            placeholder="Start writing..."
            className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
            rows={20}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="mt-2 text-xs text-gray-500">
            Supports Markdown-style formatting. Line breaks preserved.
          </p>
        </div>
      </div>
    </div>
  );
}
