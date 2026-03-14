export interface Note {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  content?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteFormData {
  title: string;
  content?: string;
  tags: string[];
  is_favorite: boolean;
  project_id?: string;
}
