import { Note } from '../../types/note';
import { format } from 'date-fns';

interface NotesListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onToggleFavorite: (note: Note) => void;
  onDeleteNote: (note: Note) => void;
}

const MAX_VISIBLE_TAGS = 3;

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
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {notes.map((note) => {
        const isSelected = selectedNoteId === note.id;
        const visibleTags = (note.tags || []).slice(0, MAX_VISIBLE_TAGS);
        const overflowCount = (note.tags || []).length - MAX_VISIBLE_TAGS;
        // Content snippet: strip newlines, cap at 80 chars
        const snippet = note.content
          ? note.content.replace(/\n+/g, ' ').trim().slice(0, 80) +
            (note.content.length > 80 ? '\u2026' : '')
          : null;

        return (
          <div
            key={note.id}
            className={`group relative p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'
            }`}
            onClick={() => onSelectNote(note)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                {/* Title + favourite star */}
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{note.title}</h3>
                  {note.is_favorite && (
                    <svg className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                </div>

                {/* Content snippet */}
                {snippet && (
                  <p className="mt-0.5 text-xs text-gray-600 truncate">{snippet}</p>
                )}

                {/* Timestamp */}
                <p className="mt-1 text-xs text-gray-500">
                  {format(new Date(note.updated_at), 'MMM d, yyyy h:mm a')}
                </p>

                {/* Tags with overflow */}
                {visibleTags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {visibleTags.map((tag, index) => (
                      <span key={index}
                       className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        {tag}
                      </span>
                    ))}
                    {overflowCount > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        +{overflowCount} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons — hover-reveal only */}
              <div className="flex items-center space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(note); }}
                  className="p-1 rounded hover:bg-gray-200"
                  title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg
                    className={`h-4 w-4 ${ note.is_favorite ? 'text-yellow-400' : 'text-gray-400' }`}
                    fill={note.is_favorite ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteNote(note); }}
                  className="p-1 rounded hover:bg-red-100"
                  title="Delete note"
                >
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
