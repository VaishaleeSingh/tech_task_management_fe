import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import useTaskStore from '../store/useTaskStore';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, fetchTasks, loading, error } = useTaskStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [initialStatus, setInitialStatus] = useState('todo');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = (status = 'todo') => {
    setEditingTask(null);
    setInitialStatus(status);
    setModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <div className="page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Board</h1>
          <p className="text-sm text-[var(--text-secondary)]">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
        </div>
        
        <button onClick={() => handleAddTask('todo')} className="btn btn-primary shadow-lg shadow-[var(--accent)]/20">
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {error && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <p>{error}</p>
          <button onClick={() => fetchTasks()} className="text-sm underline cursor-pointer bg-transparent border-none text-current">Retry</button>
        </div>
      )}

      {loading && tasks.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner border-[var(--accent)]" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <KanbanBoard 
            onEditTask={handleEditTask} 
            onAddTask={handleAddTask} 
          />
        </div>
      )}

      <TaskModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        task={editingTask}
        initialStatus={initialStatus}
      />
    </div>
  );
}
