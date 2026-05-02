import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CheckSquare } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' };

export default function MyTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      const pRes = await api.get('/api/projects');
      setProjects(pRes.data);
      const tasksByProject = await Promise.all(
        pRes.data.map(p => api.get(`/api/projects/${p.id}/tasks`).then(r => r.data.map(t => ({ ...t, projectName: p.name, projectColor: p.color }))))
      );
      const all = tasksByProject.flat().filter(t => t.assigneeId === user?.id || t.createdBy === user?.id);
      setAllTasks(all);
      setLoading(false);
    };
    fetchAll();
  }, [user?.id]);

  const filtered = allTasks.filter(t =>
    (!filterStatus || t.status === filterStatus) &&
    (!filterPriority || t.priority === filterPriority)
  );

  const grouped = ['todo', 'in_progress', 'in_review', 'done'].reduce((acc, s) => ({
    ...acc, [s]: filtered.filter(t => t.status === s)
  }), {});

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{allTasks.length} tasks assigned to or created by you</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select style={{ width: 140 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {['urgent', 'high', 'medium', 'low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CheckSquare size={48} /></div>
          <div className="empty-state-title">No tasks found</div>
          <div className="empty-state-desc">Tasks assigned to you will appear here</div>
        </div>
      ) : (
        ['todo', 'in_progress', 'in_review', 'done'].map(status => {
          const tasks = grouped[status];
          if (!tasks.length) return null;
          return (
            <div key={status} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>{STATUS_LABELS[status]}</h2>
                <span style={{ background: 'var(--bg-hover)', borderRadius: 99, padding: '2px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{tasks.length}</span>
              </div>
              <div className="card">
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Task</th><th>Project</th><th>Priority</th><th>Due Date</th></tr></thead>
                    <tbody>
                      {tasks.map(t => (
                        <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${t.projectId}`)}>
                          <td style={{ fontWeight: 500 }}>{t.title}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div className="color-dot" style={{ background: t.projectColor }} />
                              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.projectName}</span>
                            </div>
                          </td>
                          <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                          <td style={{ fontSize: 13, color: t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done' ? 'var(--danger)' : 'var(--text-secondary)' }}>
                            {t.dueDate ? format(new Date(t.dueDate), 'MMM d, yyyy') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
