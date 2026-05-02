import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Sidebar';
import { Plus, ArrowLeft, UserPlus, X, MessageSquare } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['todo', 'in_progress', 'in_review', 'done'];
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' };
const STATUS_COLORS = { todo: 'var(--text-muted)', in_progress: '#3b82f6', in_review: '#ff8c42', done: '#43b97f' };

function TaskModal({ task, projectId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    assigneeId: task?.assigneeId || '',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    estimatedHours: task?.estimatedHours || '',
    tags: task?.tags?.join(', ') || '',
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/auth/users').then(res => setUsers(res.data)).catch(() => toast.error('Failed to load users'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
        estimatedHours: form.estimatedHours || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (task) {
        await api.put(`/api/projects/${projectId}/tasks/${task.id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post(`/api/projects/${projectId}/tasks`, payload);
        toast.success('Task created!');
      }
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title..." required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the task..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                  {['urgent', 'high', 'medium', 'low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select value={form.assigneeId} onChange={e => setForm(p => ({ ...p, assigneeId: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Est. Hours</label>
                <input type="number" min="0" max="9999" step="0.5" value={form.estimatedHours} onChange={e => setForm(p => ({ ...p, estimatedHours: e.target.value }))} placeholder="e.g. 4.5" />
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="bug, frontend, api" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskDetailModal({ task, projectId, onClose, onUpdated }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/api/projects/${projectId}/tasks/${task.id}/comments`, { content: comment });
      setComment('');
      onUpdated();
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
              <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
            </div>
            <h2 className="modal-title" style={{ fontSize: 20 }}>{task.title}</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {task.description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>{task.description}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {task.assigneeName && (
              <div>
                <div className="form-label" style={{ marginBottom: 6 }}>Assignee</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar name={task.assigneeName} color={task.assigneeAvatarColor} size="sm" />
                  <span style={{ fontSize: 13 }}>{task.assigneeName}</span>
                </div>
              </div>
            )}
            {task.dueDate && (
              <div>
                <div className="form-label" style={{ marginBottom: 6 }}>Due Date</div>
                <span style={{ fontSize: 13, color: isPast(parseISO(task.dueDate)) && task.status !== 'done' ? 'var(--danger)' : 'var(--text-primary)' }}>
                  📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {task.estimatedHours && (
              <div>
                <div className="form-label" style={{ marginBottom: 6 }}>Estimated</div>
                <span style={{ fontSize: 13 }}>⏱ {task.estimatedHours}h</span>
              </div>
            )}
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Created by</div>
              <span style={{ fontSize: 13 }}>{task.creatorName}</span>
            </div>
          </div>
          {task.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {task.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MessageSquare size={16} color="var(--text-muted)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Comments ({task.comments?.length || 0})</span>
            </div>
            {task.comments?.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <Avatar name={c.authorName} color={c.authorAvatarColor} size="sm" />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{c.authorName} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span></div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.content}</div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment()} />
                <button className="btn btn-primary btn-sm" onClick={submitComment} disabled={submitting || !comment.trim()}>Post</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [view, setView] = useState('kanban');
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [userSearch, setUserSearch] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  const fetchAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/api/projects/${projectId}`),
        api.get(`/api/projects/${projectId}/tasks`),
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
    } catch { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  const fetchTaskDetail = async (taskId) => {
    const res = await api.get(`/api/projects/${projectId}/tasks/${taskId}`);
    setViewTask(res.data);
  };

  useEffect(() => { fetchAll(); }, [projectId]);

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
    toast.success('Task deleted');
    fetchAll();
  };

  const searchUsers = async (q) => {
    if (q.length < 2) { setUserSearch([]); return; }
    const res = await api.get(`/api/users/search?q=${q}`);
    setUserSearch(res.data);
  };

  const addMember = async (userId) => {
    try {
      await api.post(`/api/projects/${projectId}/members`, { userId });
      toast.success('Member added');
      fetchAll(); setAddMemberEmail(''); setUserSearch([]);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    await api.delete(`/api/projects/${projectId}/members/${userId}`);
    toast.success('Member removed');
    fetchAll();
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!project) return null;

  const tasksByStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t => t.status === s) }), {});
  const isOwnerOrAdmin = project.ownerId === user?.id || user?.role === 'admin';

  return (
    <div className="page" style={{ maxWidth: 'none' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/projects')}><ArrowLeft size={20} /></button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="color-dot" style={{ width: 14, height: 14, background: project.color }} />
              <h1 className="page-title" style={{ fontSize: 22 }}>{project.name}</h1>
            </div>
            {project.description && <p className="page-subtitle">{project.description}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowMembers(s => !s)}>
            <UserPlus size={14} /> Members ({project.members?.length})
          </button>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {['kanban', 'list'].map(v => (
              <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: 0 }} onClick={() => setView(v)}>
                {v === 'kanban' ? '▦' : '☰'} {v}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowTaskModal(true); }}>
            <Plus size={14} /> Add Task
          </button>
        </div>
      </div>

      {/* Members Panel */}
      {showMembers && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>Team Members</h3>
              {isOwnerOrAdmin && (
                <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
                  <input style={{ width: 220 }} placeholder="Search user to add..." onChange={e => { setAddMemberEmail(e.target.value); searchUsers(e.target.value); }} value={addMemberEmail} />
                  {userSearch.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', zIndex: 100, marginTop: 4 }}>
                      {userSearch.map(u => (
                        <div key={u.id} onClick={() => addMember(u.id)}
                          style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Avatar name={u.name} color={u.avatarColor} size="sm" />{u.name} <span style={{ color: 'var(--text-muted)' }}>{u.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {project.members?.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
                  <Avatar name={m.name} color={m.avatarColor} size="sm" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.role}</div>
                  </div>
                  {isOwnerOrAdmin && m.id !== project.ownerId && (
                    <button className="btn btn-ghost btn-icon" style={{ padding: 4, marginLeft: 4 }} onClick={() => removeMember(m.id)}><X size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="kanban-board">
          {STATUSES.map(status => (
            <div key={status} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title" style={{ color: STATUS_COLORS[status] }}>{STATUS_LABELS[status]}</span>
                <span className="kanban-col-count">{tasksByStatus[status].length}</span>
              </div>
              {tasksByStatus[status].map(task => (
                <div key={task.id} className="task-card" onClick={() => fetchTaskDetail(task.id).then(() => {})}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: { urgent: '#ff6584', high: '#ff8c42', medium: '#6c63ff', low: '#43b97f' }[task.priority], borderRadius: '8px 8px 0 0' }} />
                  <div className="task-card-title">{task.title}</div>
                  {task.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                      {task.tags.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  )}
                  <div className="task-card-meta">
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {task.commentCount > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>💬{task.commentCount}</span>}
                      {task.dueDate && <span style={{ fontSize: 11, color: isPast(parseISO(task.dueDate)) && task.status !== 'done' ? 'var(--danger)' : 'var(--text-muted)' }}>{format(new Date(task.dueDate), 'MMM d')}</span>}
                      {task.assigneeAvatarColor && <Avatar name={task.assigneeName} color={task.assigneeAvatarColor} size="sm" />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => { setEditTask(task); setShowTaskModal(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" style={{ fontSize: 11 }} onClick={() => handleDeleteTask(task.id)}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due</th><th>Actions</th></tr></thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => fetchTaskDetail(task.id)}>
                    <td style={{ fontWeight: 500 }}>{task.title}</td>
                    <td><span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span></td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td>{task.assigneeName ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar name={task.assigneeName} color={task.assigneeAvatarColor} size="sm" /><span style={{ fontSize: 13 }}>{task.assigneeName}</span></div> : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}</td>
                    <td style={{ fontSize: 13, color: task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done' ? 'var(--danger)' : 'var(--text-secondary)' }}>{task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditTask(task); setShowTaskModal(true); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No tasks yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showTaskModal && (
        <TaskModal task={editTask} projectId={projectId}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }} onSaved={fetchAll} />
      )}
      {viewTask && (
        <TaskDetailModal task={viewTask} projectId={projectId}
          onClose={() => setViewTask(null)} onUpdated={() => fetchTaskDetail(viewTask.id)} />
      )}
    </div>
  );
}
