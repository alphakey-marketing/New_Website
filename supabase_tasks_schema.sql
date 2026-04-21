-- ============================================
-- TASK MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Phase 2: Tasks Table with Row Level Security
-- ============================================

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own tasks
CREATE POLICY "Users can view own tasks" 
  ON tasks FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own tasks
CREATE POLICY "Users can insert own tasks" 
  ON tasks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own tasks
CREATE POLICY "Users can update own tasks" 
  ON tasks FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own tasks
CREATE POLICY "Users can delete own tasks" 
  ON tasks FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_priority_idx ON tasks(priority);
CREATE INDEX tasks_due_date_idx ON tasks(due_date);
CREATE INDEX tasks_created_at_idx ON tasks(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on task updates
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for tasks table (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
