# Task Management System Setup Guide

## Phase 1: Supabase Setup & Authentication ✅

This phase adds Supabase authentication and protected task routes to your website.

### Prerequisites

1. **Create Supabase Project**
   - Go to [https://database.new](https://database.new)
   - Create a new project (remember your database password)
   - Wait for project initialization (~2 minutes)

2. **Run Database Schema - Phase 1**
   
   Go to your Supabase project → SQL Editor → New Query, then run:

   ```sql
   -- Create profiles table (extends auth.users)
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     email TEXT,
     avatar_url TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Allow users to view their own profile
   CREATE POLICY "Users can view own profile" 
     ON profiles FOR SELECT 
     USING (auth.uid() = id);

   -- Allow users to update their own profile
   CREATE POLICY "Users can update own profile" 
     ON profiles FOR UPDATE 
     USING (auth.uid() = id);

   -- Function to automatically create profile on signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.profiles (id, email)
     VALUES (new.id, new.email);
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Trigger to create profile automatically
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

3. **Configure Email Authentication**
   - In Supabase: Authentication → Providers → Email
   - Enable "Email" provider
   - **Optional**: Disable "Confirm email" for faster testing (re-enable for production)

### Replit Setup

1. **Install Dependencies**
   
   In Replit Shell, run:
   ```bash
   npm install
   ```

2. **Add Secrets to Replit**
   
   Go to Tools → Secrets, add these two secrets:

   **Secret 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase Project URL
     (Find in Supabase → Settings → API → Project URL)

   **Secret 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase Anon Public Key
     (Find in Supabase → Settings → API → Project API keys → anon public)

3. **Restart Development Server**
   
   Click the "Run" button in Replit to start the Next.js server.

### Testing Phase 1

1. Navigate to `/tasks` in your browser
2. You should be redirected to `/tasks/login`
3. Click "Don't have an account? Sign up"
4. Enter an email and password (min 6 characters)
5. If email confirmation is enabled, check your email and click the link
6. Sign in with your credentials
7. You should see the Task Management welcome page

---

## Phase 2: Task CRUD + Database ✅

This phase adds the tasks database table and full CRUD functionality.

### Database Setup - Phase 2

1. **Run Tasks Schema**
   
   Go to Supabase → SQL Editor → New Query, then run the entire contents of `supabase_tasks_schema.sql` file from the repository root.

   This will:
   - Create the `tasks` table with proper columns
   - Set up Row Level Security (RLS) policies
   - Create indexes for performance
   - Add auto-update trigger for `updated_at` field
   - Enable Realtime for live updates

2. **Enable Realtime (if not automatic)**
   
   - Go to Database → Replication
   - Find the `tasks` table
   - Toggle it ON if it's not already enabled

### Install New Dependencies

In Replit Shell, run:
```bash
npm install date-fns
```

Then restart the server.

### Testing Phase 2

1. Navigate to `/tasks`
2. You should see:
   - Task statistics cards (To Do, In Progress, Done)
   - Search bar and status filter dropdown
   - "New Task" button
   - Empty state message if no tasks exist

3. **Create a task**:
   - Click "New Task"
   - Fill in title (required), description, status, priority, due date
   - Click "Create"
   - Task appears in the list instantly

4. **Edit a task**:
   - Click "Edit" button on any task
   - Modify fields
   - Click "Update"
   - Changes appear immediately

5. **Change status quickly**:
   - Use the status dropdown in each task card
   - Changes save automatically
   - Statistics update in real-time

6. **Delete a task**:
   - Click "Delete" button
   - Confirm deletion in the modal
   - Task is removed from the list

7. **Filter and search**:
   - Use status filter to show only specific statuses
   - Type in search box to filter by title/description
   - Filters work together

8. **Test real-time updates**:
   - Open `/tasks` in two browser tabs
   - Create/edit/delete a task in one tab
   - See it update automatically in the other tab

### Troubleshooting Phase 2

**Error: "relation 'tasks' does not exist"**
- You need to run the `supabase_tasks_schema.sql` in Supabase SQL Editor
- Make sure the query completed successfully

**Tasks not appearing**
- Check browser console for errors
- Verify RLS policies are created (Supabase → Authentication → Policies)
- Ensure you're logged in with the user who created the tasks

**Real-time not working**
- Check Database → Replication in Supabase
- Ensure `tasks` table is enabled for Realtime
- Check browser console for subscription errors

**Date formatting error**
- Make sure `date-fns` is installed: `npm install date-fns`
- Restart the server after installation

### Features Added in Phase 2

✅ Complete task CRUD operations (Create, Read, Update, Delete)
✅ Task list view with inline status changes
✅ Task creation/edit modal with full form
✅ Delete confirmation dialog
✅ Real-time synchronization across tabs
✅ Search by title/description
✅ Filter by status (To Do, In Progress, Done)
✅ Task statistics dashboard
✅ Priority and due date support
✅ Responsive design with Tailwind CSS

### What's Next?

**Phase 3** (Future) will add:
- Kanban board view with drag-and-drop
- Projects/workspaces to organize tasks
- Task labels/tags
- Calendar view for due dates
- Rich text editor for descriptions
- Subtasks support

---

## File Structure

```
New_Website/
├── supabase_tasks_schema.sql   # Database schema for tasks
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts   # Supabase client
│   ├── types/
│   │   └── task.ts             # TypeScript types
│   ├── utils/
│   │   └── taskService.ts      # Task CRUD operations
│   ├── components/
│   │   └── tasks/
│   │       ├── TaskList.tsx    # Task list component
│   │       └── TaskForm.tsx    # Task form modal
│   └── pages/
│       └── tasks/
│           ├── login.tsx        # Auth page
│           └── index.tsx        # Main tasks page
└── TASK_SETUP.md               # This file
```

### Security Notes

- Never commit `.env` or expose your `SUPABASE_SERVICE_ROLE_KEY`
- The `anon` key is safe to use client-side (rate-limited)
- Row Level Security (RLS) ensures users only see their own data
- All authentication is handled by Supabase (secure by default)
- Tasks are automatically filtered by user_id via RLS policies
