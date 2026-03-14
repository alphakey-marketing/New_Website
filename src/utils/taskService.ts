import { supabase } from '../lib/supabaseClient';
import type { Task, TaskFormData } from '../types/task';

export const taskService = {
  // Get all tasks for the current user
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return data || [];
  },

  // Get a single task by ID
  async getTask(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      throw error;
    }

    return data;
  },

  // Create a new task
  async createTask(taskData: TaskFormData): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...taskData,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return data;
  },

  // Update an existing task
  async updateTask(id: string, taskData: Partial<TaskFormData>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return data;
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Subscribe to real-time changes
  subscribeToTasks(
    userId: string,
    callback: (payload: any) => void
  ) {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  },
};
