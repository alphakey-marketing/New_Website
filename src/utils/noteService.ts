import { supabase } from '../lib/supabaseClient';
import type { Note, NoteFormData } from '../types/note';

export const noteService = {
  // Get all notes for the current user
  async getNotes(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }

    return data || [];
  },

  // Get a single note by ID
  async getNote(id: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching note:', error);
      throw error;
    }

    return data;
  },

  // Search notes by query
  async searchNotes(query: string): Promise<Note[]> {
    if (!query.trim()) {
      return this.getNotes();
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching notes:', error);
      throw error;
    }

    return data || [];
  },

  // Create a new note
  async createNote(noteData: NoteFormData): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([{
        ...noteData,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    return data;
  },

  // Update an existing note
  async updateNote(id: string, noteData: Partial<NoteFormData>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update(noteData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }

    return data;
  },

  // Toggle favorite status
  async toggleFavorite(id: string, isFavorite: boolean): Promise<Note> {
    return this.updateNote(id, { is_favorite: isFavorite });
  },

  // Delete a note
  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  // Subscribe to real-time changes
  subscribeToNotes(
    userId: string,
    callback: (payload: any) => void
  ) {
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  },
};
