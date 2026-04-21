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
  const [title, setTitle]         = useState('');
  const [content, setContent]     = useState('');
  const [tags, setTags]           = useState<string[]>([]);
  const [tagInput, setTagInput]   = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [loading, setLoading]     = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);

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
    setSavedOnce(false);
    setShowPreview(false);
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

  /** Render a minimal Markdown-like preview (bold, italic, headings, line breaks). */
  const renderPreview = (raw: string) => {
    if (!raw.trim()) return '<p class="text-gray-400 text-sm">Nothing to preview yet.</p>';
    const escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped
      // headings
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-5 mb-1">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-2">$1</h1>')
      // bold + italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
      // line breaks -> paragraphs
      .split(/\n\n+/)
      .map((para) => `<p class="mb-3 text-sm leading-relaxed">${para.replace(/\n/g, '<br />')}</p>`)
      .join('');
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
      setSavedOnce(true);
      // Stay open after saving — only close on explicit Cancel
      // For a brand-new note, close after first save so the user sees it in the list
      if (!note) onCancel();
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
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-medium text-gray-900">{note ? 'Edit Note' : 'New Note'}</h2>
            {savedOnce && (
              <span className="text-xs text-green-600 font-medium">✓ Saved</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Markdown preview toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                showPreview
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {note ? 'Close' : 'Cancel'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Note title..."
          className="text-2xl font-bold w-full border-none focus:outline-none focus:ring-0 p-0"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Metadata row */}
        <div className="flex items-center space-x-4">
          {/* Favourite — star icon button, consistent with NotesList */}
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex items-center space-x-1.5 text-sm text-gray-600 hover:text-yellow-500 transition-colors"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`h-5 w-5 ${ isFavorite ? 'text-yellow-400' : 'text-gray-300' }`}
              fill={isFavorite ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-xs">{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>

          {/* Project select */}
          <select
            value={projectId || ''}
            onChange={(e) => setProjectId(e.target.value || undefined)}
            className="block border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">No Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {(project as any).is_archived ? `${project.name} (archived)` : project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="ml-1 inline-flex items-center justify-center">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add tag..."
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
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

        {/* Content: write or preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Content</label>
          </div>
          {showPreview ? (
            <div
              className="min-h-[300px] border border-gray-200 rounded-md px-4 py-3 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
            />
          ) : (
            <textarea
              placeholder="Start writing... (supports Markdown)"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              rows={20}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
