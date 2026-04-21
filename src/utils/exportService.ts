import { taskService } from './taskService';
import { projectService } from './projectService';
import { noteService } from './noteService';

export interface ImportResult {
  projectsImported: number;
  tasksImported: number;
  notesImported: number;
}

export const exportService = {
  // Export all data to JSON
  async exportAllData() {
    try {
      const [tasks, projects, notes] = await Promise.all([
        taskService.getTasks(),
        projectService.getProjects(),
        noteService.getNotes(),
      ]);

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          tasks,
          projects,
          notes,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `task-management-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  // Import data from JSON file
  async importData(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);

          if (!importData.data) {
            throw new Error('Invalid backup file format');
          }

          const { tasks, projects, notes } = importData.data;

          // Import projects first (tasks may reference them)
          const projectIdMap: Record<string, string> = {};
          if (projects && projects.length > 0) {
            for (const project of projects) {
              const { id, user_id, created_at, updated_at, ...projectData } = project;
              const newProject = await projectService.createProject(projectData);
              projectIdMap[id] = newProject.id;
            }
          }

          // Import tasks
          if (tasks && tasks.length > 0) {
            for (const task of tasks) {
              const { id, user_id, created_at, updated_at, project_id, ...taskData } = task;
              // Map old project_id to new project_id if exists
              const mappedProjectId = project_id && projectIdMap[project_id] ? projectIdMap[project_id] : undefined;
              await taskService.createTask({ ...taskData, project_id: mappedProjectId } as any);
            }
          }

          // Import notes
          if (notes && notes.length > 0) {
            for (const note of notes) {
              const { id, user_id, created_at, updated_at, project_id, ...noteData } = note;
              // Map old project_id to new project_id if exists
              const mappedProjectId = project_id && projectIdMap[project_id] ? projectIdMap[project_id] : undefined;
              await noteService.createNote({ ...noteData, project_id: mappedProjectId });
            }
          }

          resolve({
            projectsImported: projects?.length || 0,
            tasksImported: tasks?.length || 0,
            notesImported: notes?.length || 0,
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};
