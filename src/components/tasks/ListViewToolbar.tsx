import type { Task } from '../../types/task';

type FilterValue = 'all' | 'todo' | 'in_progress' | 'done';

interface ListViewToolbarProps {
  filteredTasks: Task[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  onNewTask: () => void;
}

export default function ListViewToolbar({
  filteredTasks,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onNewTask,
}: ListViewToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>{filteredTasks.filter((t) => t.status === 'todo').length} to do</span>
        <span>&middot;</span>
        <span>{filteredTasks.filter((t) => t.status === 'in_progress').length} in progress</span>
        <span>&middot;</span>
        <span>{filteredTasks.filter((t) => t.status === 'done').length} done</span>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search..."
          className="block w-48 border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <select
          className="block border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as FilterValue)}
        >
          <option value="all">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button
          onClick={onNewTask}
          aria-label="Create new task"
          className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
      </div>
    </div>
  );
}
