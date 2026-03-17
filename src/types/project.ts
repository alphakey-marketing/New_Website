export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  color: string;
  is_archived?: boolean;
}
