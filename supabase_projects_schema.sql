-- ============================================
-- TASK MANAGEMENT SYSTEM - PROJECTS SCHEMA
-- Phase 3: Projects/Workspaces
-- ============================================

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own projects
CREATE POLICY "Users can view own projects" 
  ON projects FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own projects
CREATE POLICY "Users can insert own projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own projects
CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own projects
CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX projects_user_id_idx ON projects(user_id);
CREATE INDEX projects_created_at_idx ON projects(created_at DESC);

-- Add project_id column to tasks table
ALTER TABLE tasks ADD COLUMN project_id UUID REFERENCES projects ON DELETE SET NULL;

-- Create index for tasks by project
CREATE INDEX tasks_project_id_idx ON tasks(project_id);

-- Trigger to update updated_at on project updates
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for projects table
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
