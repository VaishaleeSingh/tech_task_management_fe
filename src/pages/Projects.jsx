import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#6C63FF', '#FF6584', '#43B97F', '#FF8C42', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];
const statusLabels = { active: 'Active', completed: 'Completed', archived: 'Archived', on_hold: 'On Hold' };

function ProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
    dueDate: project?.dueDate ? project.dueDate.slice(0, 10) : '',
    color: project?.color || COLORS[0],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || undefined };
      if (project) {
        await api.put(`/api/projects/${project.id}`, payload);
        toast.success('Project updated');
      } else {
        await api.post('/api/projects', payload);
        toast.success('Project created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="My Awesome Project" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What is this project about?" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                    style={{
                      width: 32, height: 32, background: c, borderRadius: '50%', border: form.color === c ? '3px solid white' : '3px solid transparent',
                      boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer', flexShrink: 0,
                    }} />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : project ? 'Update' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const fetchProjects = async () => {
    const res = await api.get('/api/projects');
    setProjects(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project? All tasks will be lost.')) return;
    await api.delete(`/api/projects/${id}`);
    toast.success('Project deleted');
    fetchProjects();
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} total projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <div style={{ marginBottom: 24, position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input style={{ paddingLeft: 40 }} placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FolderKanban size={48} /></div>
          <div className="empty-state-title">{search ? 'No projects found' : 'No projects yet'}</div>
          <div className="empty-state-desc">Create your first project to get started</div>
          {!search && <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowModal(true)}><Plus size={16} /> Create Project</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(p => {
            const pct = p.taskCount > 0 ? Math.round((p.completedTasks / p.taskCount) * 100) : 0;
            return (
              <div key={p.id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
                <div style={{ height: 4, background: p.color, borderRadius: '12px 12px 0 0' }} />
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</h3>
                    <span className={`badge badge-${p.status}`}>{statusLabels[p.status]}</span>
                  </div>
                  {p.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>{p.description.slice(0, 80)}{p.description.length > 80 ? '…' : ''}</p>}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>{p.completedTasks}/{p.taskCount} tasks</span><span>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: p.color }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>👥 {p.memberCount} members</span>
                    {p.dueDate && <span>📅 {format(new Date(p.dueDate), 'MMM d')}</span>}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(user?.role === 'admin' || p.ownerId === user?.id) && (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setEditProject(p); setShowModal(true); }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={e => handleDelete(p.id, e)}>Del</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <ProjectModal project={editProject} onClose={() => { setShowModal(false); setEditProject(null); }} onSaved={fetchProjects} />}
    </div>
  );
}
