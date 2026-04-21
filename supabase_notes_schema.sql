-- ============================================
-- TASK MANAGEMENT SYSTEM - NOTES SCHEMA
-- Phase 4: Notes/Docs System
-- ============================================

-- Create notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  project_id UUID REFERENCES projects ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own notes
CREATE POLICY "Users can view own notes" 
  ON notes FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own notes
CREATE POLICY "Users can insert own notes" 
  ON notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own notes
CREATE POLICY "Users can update own notes" 
  ON notes FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own notes
CREATE POLICY "Users can delete own notes" 
  ON notes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX notes_project_id_idx ON notes(project_id);
CREATE INDEX notes_created_at_idx ON notes(created_at DESC);
CREATE INDEX notes_is_favorite_idx ON notes(is_favorite);
CREATE INDEX notes_tags_idx ON notes USING GIN(tags);

-- Full-text search index for notes
CREATE INDEX notes_search_idx ON notes USING GIN(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- Trigger to update updated_at on note updates
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for notes table
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
