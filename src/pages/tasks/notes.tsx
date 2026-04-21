import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { noteService } from '../../utils/noteService';
import { projectService } from '../../utils/projectService';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import NotesList from '../../components/notes/NotesList';
import NoteEditor from '../../components/notes/NoteEditor';
import ConfirmModal from '../../components/tasks/ConfirmModal';
import { NotesSkeletonLoader } from '../../components/tasks/SkeletonLoader';
import type { Note, NoteFormData } from '../../types/note';
import type { Project } from '../../types/project';

export default function NotesPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load data once the user is known
  useEffect(() => {
    if (!user) return;
    loadNotes();
    loadProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const channel = noteService.subscribeToNotes(user.id, () => loadNotes());
    return () => { channel.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadNotes = async () => {
    try {
      const data = await noteService.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  // Fetch ALL projects (active + archived) so notes linked to archived
  // projects still appear in the project filter dropdown.
  const loadProjects = async () => {
    try {
      const [active, archived] = await Promise.all([
        projectService.getProjects(),
        projectService.getArchivedProjects(),
      ]);
      // Active first so they appear at the top of the dropdown
      setProjects([...active, ...archived]);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleCreateNote = async (data: NoteFormData) => {
    await noteService.createNote(data);
    await loadNotes();
  };

  const handleUpdateNote = async (data: NoteFormData) => {
    if (!editingNote) return;
    await noteService.updateNote(editingNote.id, data);
    await loadNotes();
    setEditingNote(null);
  };

  const handleDeleteNote = async (note: Note) => {
    await noteService.deleteNote(note.id);
    await loadNotes();
    if (selectedNote?.id === note.id) setSelectedNote(null);
    setDeleteConfirm(null);
  };

  const handleToggleFavorite = async (note: Note) => {
    await noteService.toggleFavorite(note.id, !note.is_favorite);
    await loadNotes();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/tasks/login');
  };

  // Memoized so tag list doesn't recompute on every keystroke
  const allTags = useMemo(
    () => Array.from(new Set(notes.flatMap((note) => note.tags || []))),
    [notes]
  );

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag     = !filterTag     || (note.tags && note.tags.includes(filterTag));
    const matchesProject = !filterProject || note.project_id === filterProject;
    const matchesFavorite = !showFavoritesOnly || note.is_favorite;
    return matchesSearch && matchesTag && matchesProject && matchesFavorite;
  });

  if (loading) return <NotesSkeletonLoader />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header — same style as tasks/index.tsx */}
      <nav className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center space-x-3">
              <span className="text-base font-bold text-gray-900 tracking-tight">📝 Notes</span>
              <span className="h-5 w-px bg-gray-200" />
              <button
                onClick={() => router.push('/tasks')}
                className="text-sm text-gray-600 hover:text-indigo-700 font-medium rounded-md px-2 py-1 hover:bg-gray-100 transition-colors"
              >
                ← Tasks
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { setShowEditor(true); setEditingNote(null); }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Note
              </button>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 space-y-3">
            <input
              type="text"
              placeholder="Search notes..."
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 font-medium">Favourites only</span>
              </label>

              <select
                value={filterProject || ''}
                onChange={(e) => setFilterProject(e.target.value || null)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm text-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}{project.is_archived ? ' (archived)' : ''}
                  </option>
                ))}
              </select>

              {allTags.length > 0 && (
                <select
                  value={filterTag || ''}
                  onChange={(e) => setFilterTag(e.target.value || null)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm text-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <NotesList
              notes={filteredNotes}
              selectedNoteId={selectedNote?.id || null}
              onSelectNote={(note) => {
                setSelectedNote(note);
                setEditingNote(note);
                setShowEditor(true);
              }}
              onToggleFavorite={handleToggleFavorite}
              onDeleteNote={setDeleteConfirm}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white">
          {showEditor ? (
            <NoteEditor
              note={editingNote}
              projects={projects}
              onSave={editingNote ? handleUpdateNote : handleCreateNote}
              onCancel={() => { setShowEditor(false); setEditingNote(null); }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm">Select a note or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <ConfirmModal
          title="Delete Note"
          message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
          onConfirm={() => handleDeleteNote(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
