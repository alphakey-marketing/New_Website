import { useState } from 'react';
import { projectService } from '../utils/projectService';
import type { Project, ProjectFormData } from '../types/project';

interface UseProjectActionsParams {
  editingProject: Project | null;
  setEditingProject: (project: Project | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  setDeleteProjectConfirm: (project: Project | null) => void;
  loadProjects: () => Promise<void>;
}

export function useProjectActions({
  editingProject,
  setEditingProject,
  selectedProjectId,
  setSelectedProjectId,
  setDeleteProjectConfirm,
  loadProjects,
}: UseProjectActionsParams) {
  const [archiveToast, setArchiveToast] = useState<{
    project: Project;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  const handleCreateProject = async (data: ProjectFormData) => {
    await projectService.createProject(data);
    await loadProjects();
  };

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!editingProject) return;
    await projectService.updateProject(editingProject.id, data);
    await loadProjects();
    setEditingProject(null);
  };

  const handleDeleteProject = async (project: Project) => {
    await projectService.deleteProject(project.id);
    await loadProjects();
    if (selectedProjectId === project.id) setSelectedProjectId(null);
    setDeleteProjectConfirm(null);
  };

  const handleArchiveProject = async (project: Project) => {
    if (archiveToast) clearTimeout(archiveToast.timer);
    await projectService.archiveProject(project.id);
    await loadProjects();
    if (selectedProjectId === project.id) setSelectedProjectId(null);
    const timer = setTimeout(() => setArchiveToast(null), 5000);
    setArchiveToast({ project, timer });
  };

  const handleUndoArchive = async () => {
    if (!archiveToast) return;
    clearTimeout(archiveToast.timer);
    await projectService.unarchiveProject(archiveToast.project.id);
    await loadProjects();
    setArchiveToast(null);
  };

  const handleUnarchiveProject = async (project: Project) => {
    await projectService.unarchiveProject(project.id);
    await loadProjects();
  };

  return {
    archiveToast,
    setArchiveToast,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleArchiveProject,
    handleUndoArchive,
    handleUnarchiveProject,
  };
}
