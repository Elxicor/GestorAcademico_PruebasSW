import { useState, useEffect } from 'react';
import { Task as UITask, Subject } from '../types';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTasks, createTask as apiCreateTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask, getFromStorage } from '../utils/storage';

export default function Tasks() {
  const [tasks, setTasks] = useState<UITask[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<UITask | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar tareas y materias desde la base de datos
  useEffect(() => {
    async function loadData() {
      try {
        const dbTasks = await getTasks();
        const formattedTasks: UITask[] = dbTasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          dueDate: t.due_date || new Date().toISOString(),
          priority: 'medium',
          completed: t.completed,
          subject: 'General',
          estimatedMinutes: 30
        }));
        setTasks(formattedTasks);

        // Cargar las materias para el selector
        const dbSubjects = await getFromStorage<Subject[]>('subjects', []);
        setSubjects(dbSubjects);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    
    try {
      await apiUpdateTask(taskId, { completed: !task.completed });
    } catch (error) {
      toast.error('Failed to update task status');
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: task.completed } : t));
    }
  };

  const handleCreateTask = async (taskData: Omit<UITask, 'id' | 'completed'>) => {
    try {
      const dbTask = await apiCreateTask(taskData.title, taskData.description, taskData.dueDate);
      const newTask: UITask = {
        ...taskData,
        id: dbTask.id,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData: Omit<UITask, 'id' | 'completed'>) => {
    if (!editingTask) return;
    try {
      await apiUpdateTask(editingTask.id, { 
        title: taskData.title, 
        description: taskData.description, 
        due_date: taskData.dueDate 
      });
      setTasks(tasks.map(task =>
        task.id === editingTask.id
          ? { ...task, ...taskData, completed: task.completed }
          : task
      ));
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleEditTask = (task: UITask) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiDeleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      <TaskList
        tasks={tasks}
        onTaskComplete={handleTaskComplete}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onTaskCreate={handleCreateTask}
      />

      {showForm && (
        <TaskForm
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          initialData={editingTask || undefined}
          subjects={subjects}
        />
      )}
    </div>
  );
}