import { supabase } from '../lib/supabaseClient';
import type { Project, ProjectFormData } from '../types/project';

export const projectService = {
  // Get all active (non-archived) projects for the current user
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return data || [];
  },

  // Get all archived projects for the current user
  async getArchivedProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_archived', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching archived projects:', error);
      throw error;
    }

    return data || [];
  },

  // Get a single project by ID
  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }

    return data;
  },

  // Create a new project
  async createProject(projectData: ProjectFormData): Promise<Project> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        user_id: user.id,
        is_archived: false,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return data;
  },

  // Update an existing project
  async updateProject(id: string, projectData: Partial<ProjectFormData>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  },

  // Archive a project (soft-hide, preserves all tasks)
  async archiveProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) {
      console.error('Error archiving project:', error);
      throw error;
    }
  },

  // Restore an archived project back to active
  async unarchiveProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ is_archived: false })
      .eq('id', id);

    if (error) {
      console.error('Error unarchiving project:', error);
      throw error;
    }
  },

  // Delete a project permanently
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Subscribe to real-time changes
  subscribeToProjects(
    userId: string,
    callback: (payload: any) => void
  ) {
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  },
};
