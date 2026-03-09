import { useDroppable } from '@dnd-kit/core';
import type { Task, TaskStatus } from '../../types/task';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function KanbanColumn({ id, title, color, tasks, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`border-2 rounded-lg ${color} ${isOver ? 'ring-2 ring-blue-400' : ''}`}>
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center justify-between">
            <span>{title}</span>
            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-600">
              {tasks.length}
            </span>
          </h3>
        </div>
        <div ref={setNodeRef} className="p-4 space-y-3 min-h-[200px]">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">Drop tasks here</div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />)
          )}
        </div>
      </div>
    </div>
  );
}
