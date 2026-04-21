import { taskService } from '../utils/taskService';
import { projectService } from '../utils/projectService';
import type { Task, TaskFormData, TaskPriority, TaskStatus } from '../types/task';
import type { Project } from '../types/project';
import type { AISuggestion } from '../pages/api/tasks/ai-suggest';

interface UseTaskActionsParams {
  tasksRef: React.MutableRefObject<Task[]>;
  projectsRef: React.MutableRefObject<Project[]>;
  newTaskProjectRef: React.MutableRefObject<string | null>;
  selectedProjectId: string | null;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  setDeleteConfirm: (task: Task | null) => void;
  loadTasks: () => Promise<void>;
  loadProjects: () => Promise<void>;
}

export function useTaskActions({
  tasksRef,
  projectsRef,
  newTaskProjectRef,
  selectedProjectId,
  editingTask,
  setEditingTask,
  setDeleteConfirm,
  loadTasks,
  loadProjects,
}: UseTaskActionsParams) {
  const cleanupBlockedBy = async (deletedId: string, currentTasks: Task[]) => {
    const affected = currentTasks.filter(
      (t) => t.id !== deletedId && Array.isArray(t.blocked_by) && t.blocked_by.includes(deletedId),
    );
    await Promise.all(
      affected.map((t) => {
        const updated = (t.blocked_by ?? []).filter((id) => id !== deletedId);
        return taskService.updateTask(t.id, { blocked_by: updated.length > 0 ? updated : null });
      }),
    );
  };

  const handleCreateTask = async (data: TaskFormData) => {
    const projectId = data.project_id ?? newTaskProjectRef.current ?? selectedProjectId;
    await taskService.createTask({ ...data, project_id: projectId });
    newTaskProjectRef.current = null;
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
    await cleanupBlockedBy(task.id, tasksRef.current);
    await loadTasks();
    setDeleteConfirm(null);
  };

  const handleDeleteTaskById = async (taskId: string) => {
    await taskService.deleteTask(taskId);
    await cleanupBlockedBy(taskId, tasksRef.current);
    await loadTasks();
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    await taskService.updateTask(task.id, { status: newStatus });
    await loadTasks();
  };

  const handleUpdateTaskById = async (
    taskId: string,
    update: { priority?: TaskPriority; due_date?: string; status?: TaskStatus },
  ) => {
    await taskService.updateTask(taskId, update);
    await loadTasks();
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
          })).id;
      for (const sub of suggestion.subTasks) {
        await taskService.createTask({
          title:       sub.title,
          description: sub.description ?? '',
          project_id:  targetProjectId,
          priority:    (sub.priority ?? 'medium') as TaskPriority,
          status:      'todo',
          due_date:    sub.due_date ? new Date(sub.due_date).toISOString() : null,
        });
      }
      await loadProjects();
      await loadTasks();
      return;
    }

    // ── split: create sub-tasks inheriting the original task's project ────
    if (suggestion.type === 'split') {
      if (!suggestion.subTasks?.length) throw new Error('No sub-tasks provided by AI.');
      const originalTask = resolveTask(suggestion.taskId, suggestion.taskTitle);
      for (const sub of suggestion.subTasks) {
        await taskService.createTask({
          title:       sub.title,
          description: sub.description ?? '',
          project_id:  originalTask?.project_id ?? null,
          priority:    (sub.priority ?? originalTask?.priority ?? 'medium') as TaskPriority,
          status:      'todo',
          due_date:    sub.due_date
            ? new Date(sub.due_date).toISOString()
            : (originalTask?.due_date ?? null),
        });
      }
      await loadTasks();
      return;
    }

    // ── sequence / general: read-only, nothing to persist ─────────────────
    if (suggestion.type === 'sequence' || suggestion.type === 'general') return;

    // ── field updates: reprioritize / reschedule / rewrite ─────────────────
    if (!suggestion.taskId || !suggestion.field) return;
    const task = resolveTask(suggestion.taskId, suggestion.taskTitle);
    if (!task) return;
    const update: Partial<TaskFormData> = {};
    if (suggestion.field === 'priority')    update.priority    = suggestion.proposedValue as TaskPriority;
    if (suggestion.field === 'due_date')    update.due_date    = suggestion.proposedValue;
    if (suggestion.field === 'title')       update.title       = suggestion.proposedValue;
    if (suggestion.field === 'description') update.description = suggestion.proposedValue;
    await taskService.updateTask(task.id, update);
    await loadTasks();
  };

  return {
    cleanupBlockedBy,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDeleteTaskById,
    handleStatusChange,
    handleUpdateTaskById,
    handleApplySuggestion,
  };
}
