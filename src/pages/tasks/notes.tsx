import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { noteService } from '../../utils/noteService';
import { projectService } from '../../utils/projectService';
import NotesList from '../../components/notes/NotesList';
import NoteEditor from '../../components/notes/NoteEditor';
import type { User } from '@supabase/supabase-js';
import type { Note, NoteFormData } from '../../types/note';
import type { Project } from '../../types/project';

export default function NotesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        loadNotes();
        loadProjects();
      } else {
        router.push('/tasks/login');
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadNotes();
        loadProjects();
      } else {
        router.push('/tasks/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const channel = noteService.subscribeToNotes(user.id, () => loadNotes());
    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const loadNotes = async () => {
    try {
      const data = await noteService.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
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
    if (selectedNote?.id === note.id) {
      setSelectedNote(null);
    }
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

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || (note.tags && note.tags.includes(filterTag));
    const matchesProject = !filterProject || note.project_id === filterProject;
    const matchesFavorite = !showFavoritesOnly || note.is_favorite;
    return matchesSearch && matchesTag && matchesProject && matchesFavorite;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Notes & Docs</h1>
              <button
                onClick={() => router.push('/tasks')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Tasks
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
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
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <button
              onClick={() => {
                setShowEditor(true);
                setEditingNote(null);
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </button>

            {/* Search */}
            <input
              type="text"
              placeholder="Search notes..."
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Filters */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Favorites only</span>
              </label>

              <select
                value={filterProject || ''}
                onChange={(e) => setFilterProject(e.target.value || null)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {allTags.length > 0 && (
                <select
                  value={filterTag || ''}
                  onChange={(e) => setFilterTag(e.target.value || null)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Notes List */}
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
              onCancel={() => {
                setShowEditor(false);
                setEditingNote(null);
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2 text-sm">Select a note or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Note</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(deleteConfirm)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
