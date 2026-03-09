import { Note } from '../../types/note';
import { format } from 'date-fns';

interface NotesListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onToggleFavorite: (note: Note) => void;
  onDeleteNote: (note: Note) => void;
}

export default function NotesList({
  notes,
  selectedNoteId,
  onSelectNote,
  onToggleFavorite,
  onDeleteNote,
}: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`p-4 hover:bg-gray-50 cursor-pointer ${
            selectedNoteId === note.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
          onClick={() => onSelectNote(note)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">{note.title}</h3>
                {note.is_favorite && (
                  <svg className="h-4 w-4 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {format(new Date(note.updated_at), 'MMM d, yyyy h:mm a')}
              </p>
              {note.tags && note.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-4 flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(note);
                }}
                className="p-1 rounded hover:bg-gray-200"
                title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg
                  className={`h-5 w-5 ${
                    note.is_favorite ? 'text-yellow-400 fill-current' : 'text-gray-400'
                  }`}
                  fill={note.is_favorite ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note);
                }}
                className="p-1 rounded hover:bg-red-100"
                title="Delete note"
              >
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
