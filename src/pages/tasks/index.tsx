import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { taskService } from '../../utils/taskService';
import { projectService } from '../../utils/projectService';
import { exportService } from '../../utils/exportService';
import TaskList from '../../components/tasks/TaskList';
import TaskForm from '../../components/tasks/TaskForm';
import KanbanBoard from '../../components/tasks/KanbanBoard';
import FocusList from '../../components/tasks/FocusList';
import AISuggestionPanel from '../../components/tasks/AISuggestionPanel';
import Sidebar from '../../components/tasks/Sidebar';
import ProjectForm from '../../components/tasks/ProjectForm';
import type { User } from '@supabase/supabase-js';
import type { Task, TaskFormData } from '../../types/task';
import type { Project, ProjectFormData } from '../../types/project';
import type { AISuggestion } from '../api/tasks/ai-suggest';

type ViewMode = 'list' | 'kanban' | 'focus';

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('focus');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null);
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        loadTasks();
        loadProjects();
      } else {
        router.push('/tasks/login');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadTasks();
        loadProjects();
      } else {
        router.push('/tasks/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const tasksChannel = taskService.subscribeToTasks(user.id, () => loadTasks());
    const projectsChannel = projectService.subscribeToProjects(user.id, () => loadProjects());
    return () => {
      tasksChannel.unsubscribe();
      projectsChannel.unsubscribe();
    };
  }, [user]);

  const loadTasks = async () => {
    try { const data = await taskService.getTasks(); setTasks(data); }
    catch (error) { console.error('Failed to load tasks:', error); }
  };

  const loadProjects = async () => {
    try { const data = await projectService.getProjects(); setProjects(data); }
    catch (error) { console.error('Failed to load projects:', error); }
  };

  const handleExport = async () => {
    try { await exportService.exportAllData(); setShowExportMenu(false); }
    catch { alert('Failed to export data'); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const result = await exportService.importData(file) as any;
      alert(`Import successful!\n\nProjects: ${result.projectsImported}\nTasks: ${result.tasksImported}\nNotes: ${result.notesImported}`);
      await loadTasks(); await loadProjects(); setShowExportMenu(false);
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };

  const handleCreateTask = async (data: TaskFormData) => {
    await taskService.createTask({ ...data, project_id: selectedProjectId } as any);
    await loadTasks();
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    await taskService.updateTask(editingTask.id, data);
    await loadTasks();
    setEditingTask(null);
  };

  const handleDeleteTask = async (task: Task) => {
    await taskService.deleteTask(task.id);
    await loadTasks();
    setDeleteConfirm(null);
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    await taskService.updateTask(task.id, { status: newStatus });
    await loadTasks();
  };

  const handleCreateProject = async (data: ProjectFormData) => {
    await projectService.createProject(data); await loadProjects();
  };

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!editingProject) return;
    await projectService.updateProject(editingProject.id, data);
    await loadProjects(); setEditingProject(null);
  };

  const handleDeleteProject = async (project: Project) => {
    await projectService.deleteProject(project.id);
    await loadProjects();
    if (selectedProjectId === project.id) setSelectedProjectId(null);
    setDeleteProjectConfirm(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/tasks/login');
  };

  // -------------------------------------------------------------------------
  // AI: apply a suggestion to a real task
  // -------------------------------------------------------------------------
  const handleApplySuggestion = async (suggestion: AISuggestion) => {
    if (!suggestion.taskId || !suggestion.field) return; // sequence/general suggestions are read-only
    const task = tasks.find((t) => t.id === suggestion.taskId);
    if (!task) return;

    const update: Partial<TaskFormData> = {};
    if (suggestion.field === 'priority') {
      update.priority = suggestion.proposedValue as Task['priority'];
    } else if (suggestion.field === 'due_date') {
      update.due_date = suggestion.proposedValue;
    } else if (suggestion.field === 'title') {
      update.title = suggestion.proposedValue;
    } else if (suggestion.field === 'description') {
      update.description = suggestion.proposedValue;
    }

    await taskService.updateTask(task.id, update as any);
    await loadTasks();
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesProject = selectedProjectId === null || task.project_id === selectedProjectId;
    const matchesFilter  = filter === 'all' || task.status === filter;
    const matchesSearch  =
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesFilter && matchesSearch;
  });

  const taskCountsByProject = tasks.reduce((acc, task) => {
    if (task.project_id) acc[task.project_id] = (acc[task.project_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {viewMode !== 'focus' && (
        <Sidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onNewProject={() => setShowProjectForm(true)}
          onEditProject={(project) => { setEditingProject(project); setShowProjectForm(true); }}
          onDeleteProject={setDeleteProjectConfirm}
          taskCountsByProject={taskCountsByProject}
          totalTasks={tasks.length}
        />
      )}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <nav className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-900">Task Management</h1>
                <button onClick={() => router.push('/tasks/notes')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  📝 Notes & Docs
                </button>
              </div>
              <div className="flex items-center space-x-3">
                {/* AI Assistant button */}
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                    showAIPanel
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  🤖 AI Assistant
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    ⚙️ Backup
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button onClick={handleExport} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export Data</button>
                        <label className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                          Import Data
                          <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importLoading} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-700">{user.email}</span>
                <button onClick={handleSignOut} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* View Toggle */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center bg-white border border-gray-300 rounded-md">
                <button onClick={() => setViewMode('focus')} className={`px-4 py-2 text-sm font-medium rounded-l-md ${viewMode === 'focus' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                  🎯 Focus
                </button>
                <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-medium ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                  📋 List
                </button>
                <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 text-sm font-medium rounded-r-md ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                  🗂️ Kanban
                </button>
              </div>

              {viewMode === 'list' && (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="block w-56 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select
                    className="block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                  >
                    <option value="all">All Tasks</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              )}

              <button
                onClick={() => setShowTaskForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>
            </div>

            {viewMode === 'list' && (
              <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg"><div className="px-4 py-5 sm:p-6"><dt className="text-sm font-medium text-gray-500 truncate">To Do</dt><dd className="mt-1 text-3xl font-semibold text-gray-900">{filteredTasks.filter((t) => t.status === 'todo').length}</dd></div></div>
                <div className="bg-white overflow-hidden shadow rounded-lg"><div className="px-4 py-5 sm:p-6"><dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt><dd className="mt-1 text-3xl font-semibold text-gray-900">{filteredTasks.filter((t) => t.status === 'in_progress').length}</dd></div></div>
                <div className="bg-white overflow-hidden shadow rounded-lg"><div className="px-4 py-5 sm:p-6"><dt className="text-sm font-medium text-gray-500 truncate">Done</dt><dd className="mt-1 text-3xl font-semibold text-gray-900">{filteredTasks.filter((t) => t.status === 'done').length}</dd></div></div>
              </div>
            )}

            {viewMode === 'focus'  && <FocusList tasks={tasks} projects={projects} onEdit={(task) => { setEditingTask(task); setShowTaskForm(true); }} onStatusChange={handleStatusChange} />}
            {viewMode === 'list'   && <TaskList  tasks={filteredTasks} projects={projects} onEdit={(task) => { setEditingTask(task); setShowTaskForm(true); }} onDelete={setDeleteConfirm} onStatusChange={handleStatusChange} />}
            {viewMode === 'kanban' && <KanbanBoard tasks={filteredTasks} onEdit={(task) => { setEditingTask(task); setShowTaskForm(true); }} onDelete={setDeleteConfirm} onStatusChange={handleStatusChange} />}
          </div>
        </main>
      </div>

      {/* AI Suggestion Panel */}
      {showAIPanel && (
        <AISuggestionPanel
          tasks={tasks}
          projects={projects}
          onApplySuggestion={handleApplySuggestion}
          onClose={() => setShowAIPanel(false)}
        />
      )}

      {/* Modals */}
      {showTaskForm && (
        <TaskForm task={editingTask} onSubmit={editingTask ? handleUpdateTask : handleCreateTask} onCancel={() => { setShowTaskForm(false); setEditingTask(null); }} />
      )}
      {showProjectForm && (
        <ProjectForm project={editingProject} onSubmit={editingProject ? handleUpdateProject : handleCreateProject} onCancel={() => { setShowProjectForm(false); setEditingProject(null); }} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Task</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete &quot;{deleteConfirm.title}&quot;? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDeleteTask(deleteConfirm)} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteProjectConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Project</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete &quot;{deleteProjectConfirm.name}&quot;? Tasks in this project will not be deleted but will become unassigned.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteProjectConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDeleteProject(deleteProjectConfirm)} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
