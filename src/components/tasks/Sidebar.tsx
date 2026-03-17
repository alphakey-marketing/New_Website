import { useState } from 'react';
import { Project } from '../../types/project';

interface SidebarProps {
  projects: Project[];
  archivedProjects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onArchiveProject: (project: Project) => void;
  onUnarchiveProject: (project: Project) => void;
  openTaskCountsByProject: Record<string, number>;
  totalOpenTasks: number;
}

export default function Sidebar({
  projects,
  archivedProjects,
  selectedProjectId,
  onSelectProject,
  onNewProject,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onUnarchiveProject,
  openTaskCountsByProject,
  totalOpenTasks,
}: SidebarProps) {
  const [showArchived, setShowArchived] = useState(false);

  return (
    <div className="w-64 bg-white shadow-lg h-full overflow-y-auto flex flex-col">
      <nav className="px-2 pt-4 space-y-1 flex-1">
        {/* All Tasks */}
        <button
          onClick={() => onSelectProject(null)}
          className={`w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
            selectedProjectId === null
              ? 'bg-blue-100 text-blue-900'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center">
            <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            All Tasks
          </div>
          <span className="ml-auto inline-block py-0.5 px-3 text-xs font-medium rounded-full bg-gray-100">
            {totalOpenTasks}
          </span>
        </button>

        {/* Projects section heading + inline New Project button */}
        <div className="pt-4 pb-1 px-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</h3>
          <button
            onClick={onNewProject}
            title="New project"
            className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-400 italic">No projects yet — click + to add one</div>
        ) : (
          projects.map((project) => {
            const openCount = openTaskCountsByProject[project.id] ?? 0;
            return (
              <div
                key={project.id}
                className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                  selectedProjectId === project.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <button onClick={() => onSelectProject(project.id)} className="flex items-center flex-1 min-w-0">
                  <div className="mr-3 h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                  <span className="truncate">{project.name}</span>
                  {openCount > 0 ? (
                    <span className="ml-2 inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                      {openCount}
                    </span>
                  ) : (
                    <span className="ml-2 inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-gray-100 text-gray-400 flex-shrink-0">
                      \u2713
                    </span>
                  )}
                </button>

                {/* Edit / Archive / Delete — hover-reveal */}
                <div className="ml-1 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => onEditProject(project)} className="p-1 rounded hover:bg-gray-200" title="Edit project">
                    <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => onArchiveProject(project)} className="p-1 rounded hover:bg-amber-100" title="Archive project">
                    <svg className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </button>
                  <button onClick={() => onDeleteProject(project)} className="p-1 rounded hover:bg-red-100" title="Delete project">
                    <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </nav>

      {/* Archived drawer */}
      {archivedProjects.length > 0 && (
        <div className="border-t border-gray-100 px-2 pb-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {archivedProjects.length} archived
            </span>
            <svg className={`h-3.5 w-3.5 transition-transform ${showArchived ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showArchived && (
            <div className="space-y-1 mt-1">
              {archivedProjects.map((project) => (
                <div key={project.id} className="group flex items-center justify-between px-3 py-2 text-sm rounded-md text-gray-400 hover:bg-gray-50">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="mr-3 h-3 w-3 rounded-full flex-shrink-0 opacity-40" style={{ backgroundColor: project.color }} />
                    <span className="truncate italic">{project.name}</span>
                  </div>
                  <button
                    onClick={() => onUnarchiveProject(project)}
                    className="ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 text-xs font-medium rounded border border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50"
                    title="Restore project"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
