interface ArchiveUndoToastProps {
  projectName: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export default function ArchiveUndoToast({ projectName, onUndo, onDismiss }: ArchiveUndoToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">
      <span>📦 &quot;{projectName}&quot; archived</span>
      <button
        onClick={onUndo}
        className="font-semibold text-indigo-300 hover:text-white underline underline-offset-2"
      >
        Undo
      </button>
      <button
        onClick={onDismiss}
        aria-label="Dismiss archive notification"
        className="text-gray-400 hover:text-white ml-1"
      >
        &times;
      </button>
    </div>
  );
}
