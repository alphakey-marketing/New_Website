export type TaskStatus = 'todo' | 'in_progress' | 'done';
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
