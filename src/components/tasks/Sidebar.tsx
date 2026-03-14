import { Project } from '../../types/project';

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  taskCountsByProject: Record<string, number>;
  totalTasks: number;
}

export default function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onNewProject,
  onEditProject,
  onDeleteProject,
  taskCountsByProject,
  totalTasks,
}: SidebarProps) {
  return (
    <div className="w-64 bg-white shadow-lg h-full overflow-y-auto">
      <div className="p-4">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      <nav className="px-2 space-y-1">
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
            <svg
              className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            All Tasks
          </div>
          <span className="ml-auto inline-block py-0.5 px-3 text-xs font-medium rounded-full bg-gray-100">
            {totalTasks}
          </span>
        </button>

        {/* Projects */}
        <div className="pt-4 pb-2 px-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</h3>
        </div>

        {projects.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500 italic">No projects yet</div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                selectedProjectId === project.id
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <button
                onClick={() => onSelectProject(project.id)}
                className="flex items-center flex-1 min-w-0"
              >
                <div
                  className="mr-3 h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate">{project.name}</span>
                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-gray-100">
                  {taskCountsByProject[project.id] || 0}
                </span>
              </button>
              <div className="ml-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditProject(project)}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Edit project"
                >
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteProject(project)}
                  className="p-1 rounded hover:bg-red-100"
                  title="Delete project"
                >
                  <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          ))
        )}
      </nav>
    </div>
  );
}
