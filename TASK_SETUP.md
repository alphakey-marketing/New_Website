# Task Management System Setup Guide

## Phase 1: Supabase Setup & Authentication ✅

[Previous Phase 1 content remains the same...]

---

## Phase 2: Task CRUD + Database ✅

[Previous Phase 2 content remains the same...]

---

## Phase 3: Kanban Board + Projects/Workspaces ✅

This phase adds visual Kanban board view with drag-and-drop, plus projects for organizing tasks.

### Database Setup - Phase 3

1. **Run Projects Schema**
   
   Go to Supabase → SQL Editor → New Query, then run the entire contents of `supabase_projects_schema.sql` file from the repository root.

   This will:
   - Create the `projects` table
   - Set up Row Level Security (RLS) policies for projects
   - Add `project_id` column to tasks table
   - Create indexes for performance
   - Enable Realtime for projects

### Install New Dependencies

In Replit Shell, run:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

These packages provide drag-and-drop functionality for the Kanban board.

Then restart the server.

### Testing Phase 3

#### Test Kanban Board View

1. Navigate to `/tasks`
2. Click the **"Kanban"** toggle button at the top
3. You should see three columns:
   - **To Do** (gray)
   - **In Progress** (blue)
   - **Done** (green)

4. **Drag and drop tasks**:
   - Click and hold a task card
   - Drag it to a different column
   - Release to drop
   - Status updates automatically
   - Watch real-time sync in another tab!

5. **Task cards show**:
   - Title and description preview
   - Priority badge
   - Due date (compact format)
   - Edit/Delete buttons

#### Test Projects/Workspaces

1. **Create a project**:
   - Look at the left sidebar
   - Click **"New Project"** button
   - Enter name (e.g., "Website Redesign")
   - Add description (optional)
   - Pick a color
   - Click **"Create"**

2. **Assign tasks to project**:
   - Create a new task
   - It's automatically assigned to the selected project
   - Or edit existing tasks and move them to projects

3. **Filter by project**:
   - Click a project in the sidebar
   - Only that project's tasks show
   - Task counts update in sidebar
   - Click **"All Tasks"** to see everything

4. **Edit/Delete projects**:
   - Hover over a project in sidebar
   - Edit and delete icons appear
   - Edit: Change name, description, or color
   - Delete: Tasks remain but become unassigned

5. **Project colors**:
   - Each project has a colored dot in sidebar
   - Choose from 8 colors: Blue, Green, Red, Yellow, Purple, Pink, Indigo, Gray
   - Helps visually organize different workstreams

#### Test View Switching

1. Switch between **List** and **Kanban** views
2. Filters and search work in List view
3. Kanban shows all filtered tasks in columns
4. Both views update in real-time

### Features Added in Phase 3

✅ Kanban board with three status columns
✅ Drag-and-drop to change task status
✅ Visual task cards with compact info
✅ Projects/workspaces for organization
✅ Project sidebar with task counts
✅ Color-coded projects (8 colors)
✅ Project CRUD operations
✅ Filter tasks by project
✅ List/Kanban view toggle
✅ Real-time sync for projects and tasks
✅ Smooth drag animations

### Troubleshooting Phase 3

**Error: "relation 'projects' does not exist"**
- Run the `supabase_projects_schema.sql` in Supabase SQL Editor
- Make sure it executed successfully

**Drag-and-drop not working**
- Ensure `@dnd-kit` packages are installed: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- Restart the server
- Check browser console for errors

**Can't see sidebar**
- Make sure you're on `/tasks` page (not `/tasks/login`)
- Try refreshing the page
- Check browser width (sidebar is 256px wide)

**Project colors not showing**
- Projects have default blue color
- Edit project to change color

**Tasks not filtering by project**
- Make sure tasks have `project_id` set
- Check that you clicked a project (not "All Tasks")

### Phase 3 Complete! 🎉

You now have a **production-ready task management system** with:

**Core Features**
- ✅ Authentication & user accounts
- ✅ Complete task CRUD operations
- ✅ Real-time synchronization
- ✅ List and Kanban board views
- ✅ Drag-and-drop task management

**Organization**
- ✅ Projects/workspaces
- ✅ Color-coded projects
- ✅ Task filtering by project
- ✅ Search and status filters

**Polish**
- ✅ Responsive design
- ✅ Statistics dashboard
- ✅ Priority levels
- ✅ Due date tracking
- ✅ Delete confirmations

### What Could Come Next? (Optional Future Enhancements)

**Calendar View**
- Visualize tasks by due date
- Monthly/weekly calendar
- Drag to reschedule

**Task Labels/Tags**
- Custom tags for categorization
- Multi-select filtering
- Tag colors and icons

**Subtasks**
- Break down large tasks
- Track completion percentage
- Nested task lists

**Rich Text Editor**
- Format task descriptions
- Add images, links, code blocks
- Markdown support

**File Attachments**
- Upload files to tasks
- Supabase Storage integration
- Preview images and PDFs

**Collaboration**
- Share projects with team members
- Assign tasks to users
- Comments and mentions
- Activity feed

**Notifications**
- Email reminders for due dates
- Browser push notifications
- Supabase Edge Functions

---

## Complete File Structure

```
New_Website/
├── supabase_tasks_schema.sql      # Phase 2: Tasks table
├── supabase_projects_schema.sql   # Phase 3: Projects table
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts      # Supabase client
│   ├── types/
│   │   ├── task.ts                # Task types
│   │   └── project.ts             # Project types (Phase 3)
│   ├── utils/
│   │   ├── taskService.ts         # Task CRUD
│   │   └── projectService.ts      # Project CRUD (Phase 3)
│   ├── components/
│   │   └── tasks/
│   │       ├── TaskList.tsx       # List view
│   │       ├── TaskForm.tsx       # Task modal
│   │       ├── KanbanBoard.tsx    # Kanban view (Phase 3)
│   │       ├── KanbanColumn.tsx   # Kanban column (Phase 3)
│   │       ├── TaskCard.tsx       # Draggable card (Phase 3)
│   │       ├── Sidebar.tsx        # Project sidebar (Phase 3)
│   │       └── ProjectForm.tsx    # Project modal (Phase 3)
│   └── pages/
│       └── tasks/
│           ├── login.tsx           # Auth page
│           └── index.tsx           # Main tasks page
└── TASK_SETUP.md                   # This file
```

### Security Notes

- Never commit `.env` or expose your `SUPABASE_SERVICE_ROLE_KEY`
- The `anon` key is safe to use client-side (rate-limited)
- Row Level Security (RLS) ensures users only see their own data
- All authentication is handled by Supabase (secure by default)
- Tasks and projects are automatically filtered by user_id via RLS policies
- Deleting a project sets tasks' `project_id` to NULL (not deleted)
