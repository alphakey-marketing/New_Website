export type TaskStatus   = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  project_id?: string | null;
  /** Optional: IDs of tasks that must be 'done' before this task can start */
  blocked_by?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  project_id?: string | null;
  /** Optional: IDs of tasks that must be 'done' before this task can start */
  blocked_by?: string[] | null;
}

/**
 * The shape passed to taskService.createTask from application code.
 * Omits DB-managed fields (id, user_id, created_at, updated_at).
 * Status is optional because new tasks always start as 'todo' when omitted.
 */
export type CreateTaskInput = {
  title: string;
  description?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  due_date?: string | null;
  project_id?: string | null;
  blocked_by?: string[] | null;
};
