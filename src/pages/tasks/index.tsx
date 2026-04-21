import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { taskService } from '../../utils/taskService';
import { projectService } from '../../utils/projectService';
import { exportService } from '../../utils/exportService';
import type { ImportResult } from '../../utils/exportService';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../hooks/useToast';
import { useTaskActions } from '../../hooks/useTaskActions';
import { useProjectActions } from '../../hooks/useProjectActions';
import TaskList from '../../components/tasks/TaskList';
import TaskForm from '../../components/tasks/TaskForm';
import KanbanBoard from '../../components/tasks/KanbanBoard';
import FocusList from '../../components/tasks/FocusList';
import AISuggestionPanel from '../../components/tasks/AISuggestionPanel';
import AIDailyBriefing from '../../components/tasks/AIDailyBriefing';
import Sidebar from '../../components/tasks/Sidebar';
import ProjectForm from '../../components/tasks/ProjectForm';
import ConfirmModal from '../../components/tasks/ConfirmModal';
import ToastContainer from '../../components/tasks/ToastContainer';
import TasksSkeletonLoader from '../../components/tasks/SkeletonLoader';
import TasksNavbar from '../../components/tasks/TasksNavbar';
import ListViewToolbar from '../../components/tasks/ListViewToolbar';
import ArchiveUndoToast from '../../components/tasks/ArchiveUndoToast';
import type { ViewMode } from '../../components/tasks/TasksNavbar';
import type { Task } from '../../types/task';
import type { Project } from '../../types/project';

export default function TasksPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const { toasts, addToast, removeToast } = useToast();

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
  const [showUserMenu, setShowUserMenu]           = useState(false);
  const newTaskProjectRef                         = useRef<string | null>(null);

  /**
   * Live mirrors of tasks/projects state.
   * Handlers that close over these refs always read the latest array,
   * even if the real-time subscription fired after the closure was created.
   */
  const tasksRef    = useRef<Task[]>([]);
  const projectsRef = useRef<Project[]>([]);
  useEffect(() => { tasksRef.current    = tasks;    }, [tasks]);
  useEffect(() => { projectsRef.current = projects; }, [projects]);

  // Load data once the user is known
  useEffect(() => {
    if (!user) return;
    loadTasks();
    loadProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;
    const tasksChannel    = taskService.subscribeToTasks(user.id, () => loadTasks());
    const projectsChannel = projectService.subscribeToProjects(user.id, () => loadProjects());
    return () => { tasksChannel.unsubscribe(); projectsChannel.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
    catch { addToast('Failed to export data. Please try again.', 'error'); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const result = await exportService.importData(file) as ImportResult;
      addToast(
        `Import successful — ${result.projectsImported} projects, ${result.tasksImported} tasks, ${result.notesImported} notes`,
        'success',
      );
      await loadTasks(); await loadProjects(); setShowExportMenu(false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addToast(`Import failed: ${msg}`, 'error');
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };

  const {
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDeleteTaskById,
    handleStatusChange,
    handleUpdateTaskById,
    handleApplySuggestion,
  } = useTaskActions({
    tasksRef,
    projectsRef,
    newTaskProjectRef,
    selectedProjectId,
    editingTask,
    setEditingTask,
    setDeleteConfirm,
    loadTasks,
    loadProjects,
  });

  const {
    archiveToast,
    setArchiveToast,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleArchiveProject,
    handleUndoArchive,
    handleUnarchiveProject,
  } = useProjectActions({
    editingProject,
    setEditingProject,
    selectedProjectId,
    setSelectedProjectId,
    setDeleteProjectConfirm,
    loadProjects,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/tasks/login');
  };

  const handleFocusNewTask = (projectId: string | null) => {
    newTaskProjectRef.current = projectId;
    setEditingTask(null);
    setShowTaskForm(true);
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

  if (loading) return <TasksSkeletonLoader />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
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

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <TasksNavbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showAIPanel={showAIPanel}
          onToggleAIPanel={() => setShowAIPanel(!showAIPanel)}
          showExportMenu={showExportMenu}
          onToggleExportMenu={() => setShowExportMenu(!showExportMenu)}
          showUserMenu={showUserMenu}
          onToggleUserMenu={() => setShowUserMenu(!showUserMenu)}
          userEmail={user.email ?? ''}
          userInitials={initials}
          onSignOut={handleSignOut}
          onExport={handleExport}
          onImport={handleImport}
          importLoading={importLoading}
          onNavigateToNotes={() => router.push('/tasks/notes')}
        />

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

            {viewMode === 'list' && (
              <ListViewToolbar
                filteredTasks={filteredTasks}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filter={filter}
                onFilterChange={setFilter}
                onNewTask={() => { newTaskProjectRef.current = selectedProjectId; setShowTaskForm(true); }}
              />
            )}

            {viewMode === 'kanban' && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => { newTaskProjectRef.current = selectedProjectId; setShowTaskForm(true); }}
                  aria-label="Create new task"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <svg className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <ArchiveUndoToast
          projectName={archiveToast.project.name}
          onUndo={handleUndoArchive}
          onDismiss={() => { clearTimeout(archiveToast.timer); setArchiveToast(null); }}
        />
      )}

      {showAIPanel && (
        <AISuggestionPanel
          tasks={tasks} projects={projects}
          onApplySuggestion={handleApplySuggestion}
          onCreateTask={handleCreateTask}
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
        <ConfirmModal
          title="Delete Task"
          message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
          onConfirm={() => handleDeleteTask(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {deleteProjectConfirm && (
        <ConfirmModal
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteProjectConfirm.name}"? Tasks in this project will not be deleted but will become unassigned.`}
          onConfirm={() => handleDeleteProject(deleteProjectConfirm)}
          onCancel={() => setDeleteProjectConfirm(null)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
