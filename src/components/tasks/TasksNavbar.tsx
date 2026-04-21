export type ViewMode = 'list' | 'kanban' | 'focus';

interface TasksNavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showAIPanel: boolean;
  onToggleAIPanel: () => void;
  showExportMenu: boolean;
  onToggleExportMenu: () => void;
  showUserMenu: boolean;
  onToggleUserMenu: () => void;
  userEmail: string;
  userInitials: string;
  onSignOut: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importLoading: boolean;
  onNavigateToNotes: () => void;
}

export default function TasksNavbar({
  viewMode,
  onViewModeChange,
  showAIPanel,
  onToggleAIPanel,
  showExportMenu,
  onToggleExportMenu,
  showUserMenu,
  onToggleUserMenu,
  userEmail,
  userInitials,
  onSignOut,
  onExport,
  onImport,
  importLoading,
  onNavigateToNotes,
}: TasksNavbarProps) {
  return (
    <nav className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center space-x-1">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              {(['focus', 'list', 'kanban'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => onViewModeChange(v)}
                  aria-label={`Switch to ${v} view`}
                  aria-pressed={viewMode === v}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === v
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v === 'focus' ? '🎯 Focus' : v === 'list' ? 'List' : 'Board'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onNavigateToNotes}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-blue-700 font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              📝 Notes
            </button>

            <button
              onClick={onToggleAIPanel}
              aria-label="Toggle AI suggestion panel"
              aria-expanded={showAIPanel}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                showAIPanel
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'text-indigo-600 border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              🤖 AI
            </button>

            {/* Export / Import menu */}
            <div className="relative">
              <button
                onClick={onToggleExportMenu}
                aria-label="Open settings and data export menu"
                aria-expanded={showExportMenu}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ⚙️
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button
                      onClick={onExport}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export
                    </button>
                    <label className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      {importLoading ? 'Importing…' : 'Import'}
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={onImport}
                        disabled={importLoading}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={onToggleUserMenu}
                aria-label={`User menu — ${userEmail || 'account'}`}
                aria-expanded={showUserMenu}
                className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center hover:bg-indigo-700 transition-colors"
                title={userEmail}
              >
                {userInitials}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <p className="px-4 py-2 text-xs text-gray-500 truncate">{userEmail}</p>
                    <hr className="border-gray-100" />
                    <button
                      onClick={onSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
