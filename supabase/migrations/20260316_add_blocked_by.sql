-- Add optional blocked_by column to tasks table
-- blocked_by is a nullable array of task IDs that must be 'done' before this task can start
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS blocked_by text[] DEFAULT NULL;

COMMENT ON COLUMN tasks.blocked_by IS
  'Optional list of task IDs that must be completed before this task can start. NULL means no dependencies.';
