import React, { useState, useEffect } from 'react';
import useTaskStore from '../store/useTaskStore';
import toast from 'react-hot-toast';

export default function TaskModal({ isOpen, onClose, task, initialStatus = 'todo' }) {
  const { addTask, updateTask } = useTaskStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium',
    due_date: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          due_date: task.dueDate ? task.dueDate.split('T')[0] : ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: initialStatus,
          priority: 'medium',
          due_date: ''
        });
      }
    }
  }, [isOpen, task, initialStatus]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required');
    
    setLoading(true);
    let res;
    
    if (task) {
      res = await updateTask(task.id, formData);
    } else {
      res = await addTask(formData);
    }
    
    setLoading(false);
    
    if (res.success) {
      toast.success(`Task ${task ? 'updated' : 'created'} successfully`);
      onClose();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'Create Task'}</h2>
          <button onClick={onClose} className="p-1 rounded bg-transparent border-none text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="modal-body">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--text-secondary)]">Title *</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--text-secondary)]">Description</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Add more details..."
                rows={3}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">Status</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">Priority</label>
                <select 
                  value={formData.priority} 
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--text-secondary)]">Due Date (Optional)</label>
              <input 
                type="date" 
                value={formData.due_date} 
                onChange={e => setFormData({...formData, due_date: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
