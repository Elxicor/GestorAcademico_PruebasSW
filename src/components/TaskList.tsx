import { useState } from 'react';
import { Task } from '../types';
import { CheckCircle2, Circle, Flag, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface TaskListProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onTaskCreate: (task: Task) => void;
}

type SortField = 'dueDate' | 'priority' | 'subject';
type SortDirection = 'asc' | 'desc';

export default function TaskList({ tasks, onTaskComplete, onDeleteTask, onEditTask, onTaskCreate }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);

  // Filter tasks
  const filteredTasks = tasks;

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'priority': {
        const priorityWeight = { low: 0, medium: 1, high: 2 };
        comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
        break;
      }
      case 'subject':
        comparison = a.subject.localeCompare(b.subject);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const priorityColor = {
    low: 'text-gray-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

    try {
      setIsDeleting(taskId);
      const taskToDelete = tasks.find(task => task.id === taskId);
      if (!taskToDelete) {
        throw new Error('Task not found');
      }
      
      await onDeleteTask(taskId);
      setDeletedTasks([taskToDelete]);
      
      toast.success(
        <div className="flex items-center space-x-2">
          <span>Tarea eliminada</span>
          <button
            onClick={() => handleUndoBulkDelete()}
            className="px-2 py-1 text-sm bg-white rounded-md shadow-sm hover:bg-gray-50"
          >
            Deshacer
          </button>
        </div>,
        { duration: 5000 }
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la tarea');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const tasksToDelete = tasks.filter(task => selectedTasks.has(task.id));
      if (tasksToDelete.length === 0) {
        toast.error('No hay tareas seleccionadas');
        return;
      }

      setDeletedTasks(tasksToDelete);
      
      // Delete all selected tasks
      await Promise.all([...selectedTasks].map(taskId => onDeleteTask(taskId)));
      
      toast.success(
        <div className="flex items-center space-x-2">
          <span>{selectedTasks.size} tareas eliminadas</span>
          <button
            onClick={handleUndoBulkDelete}
            className="px-2 py-1 text-sm bg-white rounded-md shadow-sm hover:bg-gray-50"
          >
            Deshacer
          </button>
        </div>,
        { duration: 5000 }
      );
      
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Error deleting tasks:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar las tareas');
    }
  };

  const handleUndoBulkDelete = async () => {
    if (!deletedTasks.length) return;
    
    try {
      // Restore all deleted tasks
      await Promise.all(deletedTasks.map(task => onTaskCreate(task)));
      toast.success(`${deletedTasks.length} tarea${deletedTasks.length > 1 ? 's' : ''} restaurada${deletedTasks.length > 1 ? 's' : ''}`);
      setDeletedTasks([]);
    } catch (error) {
      console.error('Error restoring tasks:', error);
      toast.error(error instanceof Error ? error.message : 'Error al restaurar las tareas');
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  return (
    <div className="w-full">
      {selectedTasks.size > 0 && (
        <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedTasks.size === filteredTasks.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {selectedTasks.size} seleccionadas
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md"
          >
            Eliminar Seleccionadas
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[auto,1fr,auto,auto] gap-4 p-4 bg-gray-50 border-b border-gray-100">
          <div className="w-8"></div>
          <button
            onClick={() => toggleSort('subject')}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Materia <SortIcon field="subject" />
          </button>
          <button
            onClick={() => toggleSort('dueDate')}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Fecha Límite <SortIcon field="dueDate" />
          </button>
          <button
            onClick={() => toggleSort('priority')}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Prioridad <SortIcon field="priority" />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {sortedTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 ${
                task.completed
                  ? 'bg-gray-50'
                  : 'bg-white'
              }`}
            >
              {/* Mobile layout: vertical stack */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={() => toggleTaskSelection(task.id)}
                  className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0"
                />
                <button
                  onClick={() => onTaskComplete(task.id)}
                  className="text-gray-400 hover:text-indigo-600 transition-colors mt-0.5 flex-shrink-0"
                >
                  {task.completed ? <CheckCircle2 className="text-green-500" size={20} /> : <Circle size={20} />}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">{task.subject}</span>
                    <span className="text-xs text-gray-400">{format(new Date(task.dueDate), 'MMM d')}</span>
                    <Flag className={`${priorityColor[task.priority]}`} size={12} />
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {onEditTask && (
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 hover:bg-gray-100 rounded-full"
                    >
                      <Pencil size={14} className="text-gray-500" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={isDeleting === task.id}
                    className={`p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ${
                      isDeleting === task.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}