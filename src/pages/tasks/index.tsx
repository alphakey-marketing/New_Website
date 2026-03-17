import { useEffect, useRef, useState } from 'react';
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
import AIDailyBriefing from '../../components/tasks/AIDailyBriefing';
import Sidebar from '../../components/tasks/Sidebar';
import ProjectForm from '../../components/tasks/ProjectForm';
import type { User } from '@supabase/supabase-js';
import type { Task, TaskFormData } from '../../types/task';
import type { Project, ProjectFormData } from '../../types/project';
import type { AISuggestion } from '../api/tasks/ai-suggest';

type ViewMode = 'list' | 'kanban' | 'focus';

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser]                           = useState<User | null>(null);
  const [loading, setLoading]                     = useState(true);
  const [tasks, setTasks]                         = useState<Task[]>([]);
  const [projects, setProjects]                   = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects]   = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode]                   = useState<ViewMode>('focus');
  const [showTaskForm, setShowTaskForm]           = useState(false);
  const [showProjectForm, setShowProjectForm]     = useState(false);
  const [showExportMenu, setShowExportMenu]       = useState(false);
  const [showAIPanel, setShowAIPanel]             = useState(false);
  const [editingTask, setEditingTask]             = useState<Task | null>(null);
  const [editingProject, setEditingProject]       = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm]         = useState<Task | null>(null);
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState<Project | null>(null);
  const [filter, setFilter]                       = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [searchQuery, setSearchQuery]             = useState('');
  const [importLoading, setImportLoading]         = useState(false);
  const [archiveToast, setArchiveToast]           = useState<{ project: Project; timer: ReturnType<typeof setTimeout> } | null>(null);
  const newTaskProjectRef                         = useRef<string | null>(null);
  const [showUserMenu, setShowUserMenu]           = useState(false);

  /**
   * Live mirrors of tasks/projects state.
   * Handlers that close over these refs always read the latest array,
   * even if the real-time subscription fired after the closure was created.
   */
  const tasksRef    = useRef<Task[]>([]);
  const projectsRef = useRef<Project[]>([]);
  useEffect(() => { tasksRef.current    = tasks;    }, [tasks]);
  useEffect(() => { projectsRef.current = projects; }, [projects]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUser(user); loadTasks(); loadProjects(); }
      else { router.push('/tasks/login'); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) { setUser(session.user); loadTasks(); loadProjects(); }
      else { router.push('/tasks/login'); }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const tasksChannel    = taskService.subscribeToTasks(user.id, () => loadTasks());
    const projectsChannel = projectService.subscribeToProjects(user.id, () => loadProjects());
    return () => { tasksChannel.unsubscribe(); projectsChannel.unsubscribe(); };
  }, [user]);

  const loadTasks = async () => {
    try { const data = await taskService.getTasks(); setTasks(data); }
    catch (error) { console.error('Failed to load tasks:', error); }
  };

  const loadProjects = async () => {
    try {
      const [active, archived] = await Promise.all([
        projectService.getProjects(),
        projectService.getArchivedProjects(),
      ]);
      setProjects(active);
      setArchivedProjects(archived);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
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

  const handleCreateTask = async (data: TaskFormData & { project_id?: string | null }) => {
    const projectId = data.project_id ?? newTaskProjectRef.current ?? selectedProjectId;
    await taskService.createTask({ ...data, project_id: projectId } as any);
    newTaskProjectRef.current = null;
    await loadTasks();
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    await taskService.updateTask(editingTask.id, data);
    await loadTasks();
    setEditingTask(null);
  };

  const cleanupBlockedBy = async (deletedId: string, currentTasks: Task[]) => {
    const affected = currentTasks.filter(
      (t) => t.id !== deletedId && Array.isArray(t.blocked_by) && t.blocked_by.includes(deletedId),
    );
    await Promise.all(
      affected.map((t) => {
        const updated = (t.blocked_by ?? []).filter((id) => id !== deletedId);
        return taskService.updateTask(t.id, { blocked_by: updated.length > 0 ? updated : null } as any);
      }),
    );
  };

  const handleDeleteTask = async (task: Task) => {
    await taskService.deleteTask(task.id);
    await cleanupBlockedBy(task.id, tasksRef.current);
    await loadTasks();
    setDeleteConfirm(null);
  };

  const handleDeleteTaskById = async (taskId: string) => {
    await taskService.deleteTask(taskId);
    await cleanupBlockedBy(taskId, tasksRef.current);
    await loadTasks();
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    await taskService.updateTask(task.id, { status: newStatus });
    await loadTasks();
  };

  const handleUpdateTaskById = async (taskId: string, update: { priority?: string; due_date?: string; status?: string }) => {
    await taskService.updateTask(taskId, update as any);
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

  const handleArchiveProject = async (project: Project) => {
    if (archiveToast) clearTimeout(archiveToast.timer);
    await projectService.archiveProject(project.id);
    await loadProjects();
    if (selectedProjectId === project.id) setSelectedProjectId(null);
    const timer = setTimeout(() => setArchiveToast(null), 5000);
    setArchiveToast({ project, timer });
  };

  const handleUndoArchive = async () => {
    if (!archiveToast) return;
    clearTimeout(archiveToast.timer);
    await projectService.unarchiveProject(archiveToast.project.id);
    await loadProjects();
    setArchiveToast(null);
  };

  const handleUnarchiveProject = async (project: Project) => {
    await projectService.unarchiveProject(project.id);
    await loadProjects();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/tasks/login');
  };

  const handleFocusNewTask = (projectId: string | null) => {
    newTaskProjectRef.current = projectId;
    setEditingTask(null);
    setShowTaskForm(true);
  };

  /**
   * Resolve a task by ID first, then fall back to title match.
   * Uses tasksRef so it always searches the freshest array regardless
   * of when the closure was created.
   */
  const resolveTask = (taskId: string, taskTitle?: string): Task | undefined => {
    const live = tasksRef.current;
    if (taskId) {
      const byId = live.find((t) => t.id === taskId);
      if (byId) return byId;
    }
    // Fallback: match by title (case-insensitive) — catches AI returning taskId: ""
    if (taskTitle) {
      return live.find((t) => t.title.trim().toLowerCase() === taskTitle.trim().toLowerCase());
    }
    return undefined;
  };

  const handleApplySuggestion = async (suggestion: AISuggestion) => {
    // ── scaffold: create (or reuse) a project then add tasks ──────────────
    if (suggestion.type === 'scaffold') {
      if (!suggestion.scaffoldProjectName) throw new Error('No project name provided by AI.');
      if (!suggestion.subTasks?.length)    throw new Error('No tasks provided by AI.');
      const existingProject = projectsRef.current.find(
        (p) => p.name.trim().toLowerCase() === suggestion.scaffoldProjectName!.trim().toLowerCase(),
      );
      const targetProjectId = existingProject
        ? existingProject.id
        : (await projectService.createProject({
            name: suggestion.scaffoldProjectName,
            description: '',
            color: suggestion.scaffoldProjectColor ?? '#6366f1',
          } as any)).id;
      for (const sub of suggestion.subTasks) {
        await taskService.createTask({
          title:       sub.title,
          description: sub.description ?? '',
          project_id:  targetProjectId,
          priority:    (sub.priority ?? 'medium') as Task['priority'],
          status:      'todo',
          due_date:    sub.due_date ? new Date(sub.due_date).toISOString() : null,
        } as any);
      }
      await loadProjects();
      await loadTasks();
      return;
    }

    // ── split: create sub-tasks inheriting the original task's project ────
    if (suggestion.type === 'split') {
      if (!suggestion.subTasks?.length) throw new Error('No sub-tasks provided by AI.');
      // Resolve via ID first, then title fallback (guards against AI returning taskId: "")
      const originalTask = resolveTask(suggestion.taskId, suggestion.taskTitle);
      for (const sub of suggestion.subTasks) {
        await taskService.createTask({
          title:       sub.title,
          description: sub.description ?? '',
          project_id:  originalTask?.project_id ?? null,
          priority:    (sub.priority ?? originalTask?.priority ?? 'medium') as Task['priority'],
          status:      'todo',
          due_date:    sub.due_date
            ? new Date(sub.due_date).toISOString()
            : (originalTask?.due_date ?? null),
        } as any);
      }
      await loadTasks();
      return;
    }

    // ── sequence / general: read-only, nothing to persist ─────────────────
    if (suggestion.type === 'sequence' || suggestion.type === 'general') return;

    // ── field updates: reprioritize / reschedule / rewrite ─────────────────
    if (!suggestion.taskId || !suggestion.field) return;
    // Use resolveTask so we always search the live array
    const task = resolveTask(suggestion.taskId, suggestion.taskTitle);
    if (!task) return;
    const update: Partial<TaskFormData> = {};
    if (suggestion.field === 'priority')    update.priority    = suggestion.proposedValue as Task['priority'];
    if (suggestion.field === 'due_date')    update.due_date    = suggestion.proposedValue;
    if (suggestion.field === 'title')       update.title       = suggestion.proposedValue;
    if (suggestion.field === 'description') update.description = suggestion.proposedValue;
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

  const openTaskCountsByProject = tasks
    .filter((t) => t.status !== 'done')
    .reduce((acc, task) => {
      if (task.project_id) acc[task.project_id] = (acc[task.project_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const totalOpenTasks = tasks.filter((t) => t.status !== 'done').length;

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';

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
          archivedProjects={archivedProjects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onNewProject={() => setShowProjectForm(true)}
          onEditProject={(project) => { setEditingProject(project); setShowProjectForm(true); }}
          onDeleteProject={setDeleteProjectConfirm}
          onArchiveProject={handleArchiveProject}
          onUnarchiveProject={handleUnarchiveProject}
          openTaskCountsByProject={openTaskCountsByProject}
          totalOpenTasks={totalOpenTasks}
        />
      )}

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14">
              <div className="flex items-center space-x-1">
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                  {(['focus', 'list', 'kanban'] as ViewMode[]).map((v) => (
                    <button key={v} onClick={() => setViewMode(v)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        viewMode === v ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {v === 'focus' ? '\uD83C\uDFAF Focus' : v === 'list' ? 'List' : 'Board'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button onClick={() => router.push('/tasks/notes')} className="px-3 py-1.5 text-sm text-gray-600 hover:text-blue-700 font-medium rounded-md hover:bg-gray-100 transition-colors">
                  \uD83D\uDCDD Notes
                </button>
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    showAIPanel ? 'bg-indigo-600 text-white border-indigo-600' : 'text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  \uD83E\uDD16 AI
                </button>
                <div className="relative">
                  <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                    \u2699\uFE0F
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button onClick={handleExport} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export</button>
                        <label className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                          Import
                          <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importLoading} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center hover:bg-indigo-700 transition-colors"
                    title={user.email ?? ''}
                  >
                    {initials}
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <p className="px-4 py-2 text-xs text-gray-500 truncate">{user.email}</p>
                        <hr className="border-gray-100" />
                        <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

            {viewMode === 'list' && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{filteredTasks.filter((t) => t.status === 'todo').length} to do</span>
                  <span>\u00b7</span>
                  <span>{filteredTasks.filter((t) => t.status === 'in_progress').length} in progress</span>
                  <span>\u00b7</span>
                  <span>{filteredTasks.filter((t) => t.status === 'done').length} done</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="text" placeholder="Search..." className="block w-48 border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <select className="block border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
                    <option value="all">All</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <button onClick={() => { newTaskProjectRef.current = selectedProjectId; setShowTaskForm(true); }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New
                  </button>
                </div>
              </div>
            )}

            {viewMode === 'kanban' && (
              <div className="mb-4 flex justify-end">
                <button onClick={() => { newTaskProjectRef.current = selectedProjectId; setShowTaskForm(true); }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Task
                </button>
              </div>
            )}

            <AIDailyBriefing tasks={tasks} projects={projects} onUpdateTask={handleUpdateTaskById} onDeleteTask={handleDeleteTaskById} />

            {viewMode === 'focus'  && <FocusList  tasks={tasks}         projects={projects} onEdit={(task) => { setEditingTask(task); setShowTaskForm(true); }} onStatusChange={handleStatusChange} onNewTask={handleFocusNewTask} />}
            {viewMode === 'list'   && <TaskList   tasks={filteredTasks} projects={projects} onEdit={(task) => { setEditingTask(task); setShowTaskForm(true); }} onDelete={setDeleteConfirm} onStatusChange={handleStatusChange} />}
            {viewMode === 'kanban' && <KanbanBoard tasks={filteredTasks} onEdit={(task) => { setEditingTask(task); setShowTaskForm(true); }} onDelete={setDeleteConfirm} onStatusChange={handleStatusChange} />}
          </div>
        </main>
      </div>

      {archiveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">
          <span>\uD83D\uDCE6 &quot;{archiveToast.project.name}&quot; archived</span>
          <button onClick={handleUndoArchive} className="font-semibold text-indigo-300 hover:text-white underline underline-offset-2">Undo</button>
          <button onClick={() => { clearTimeout(archiveToast.timer); setArchiveToast(null); }} className="text-gray-400 hover:text-white ml-1">&times;</button>
        </div>
      )}

      {showAIPanel && (
        <AISuggestionPanel
          tasks={tasks} projects={projects}
          onApplySuggestion={handleApplySuggestion}
          onCreateTask={handleCreateTask as any}
          onProjectCreated={loadProjects}
          onClose={() => setShowAIPanel(false)}
        />
      )}

      {showTaskForm && (
        <TaskForm
          task={editingTask} allTasks={tasks} projects={projects}
          initialProjectId={editingTask ? undefined : (newTaskProjectRef.current ?? selectedProjectId)}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => { setShowTaskForm(false); setEditingTask(null); newTaskProjectRef.current = null; }}
        />
      )}

      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
          onCancel={() => { setShowProjectForm(false); setEditingProject(null); }}
        />
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
