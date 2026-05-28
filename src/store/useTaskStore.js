import { create } from 'zustand';
import api from '../api/axios';

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/my-tasks');
      set({ tasks: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch tasks', loading: false });
    }
  },

  addTask: async (taskData) => {
    try {
      const response = await api.post('/api/my-tasks', taskData);
      set((state) => ({ tasks: [response.data, ...state.tasks] }));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add task' };
    }
  },

  updateTask: async (taskId, updateData) => {
    // Optimistic update
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updateData } : t)
    }));

    try {
      const response = await api.put(`/api/my-tasks/${taskId}`, updateData);
      // Ensure backend data replaces optimistic update
      set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? response.data : t)
      }));
      return { success: true, data: response.data };
    } catch (error) {
      // Revert on failure
      set({ tasks: previousTasks });
      return { success: false, error: error.response?.data?.message || 'Failed to update task' };
    }
  },

  deleteTask: async (taskId) => {
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId)
    }));

    try {
      await api.delete(`/api/my-tasks/${taskId}`);
      return { success: true };
    } catch (error) {
      set({ tasks: previousTasks });
      return { success: false, error: error.response?.data?.message || 'Failed to delete task' };
    }
  },

  moveTask: async (taskId, newStatus) => {
    return await get().updateTask(taskId, { status: newStatus });
  }
}));

export default useTaskStore;
