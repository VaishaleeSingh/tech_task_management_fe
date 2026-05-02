import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Sidebar';
import { formatDistanceToNow, format, isPast, parseISO } from 'date-fns';
import { AlertTriangle, TrendingUp, CheckCircle, Clock, Layers, Zap, List, Activity, BarChart3 } from 'lucide-react';

const priorityColors = { urgent: '#ff6584', high: '#ff8c42', medium: '#6c63ff', low: '#43b97f' };
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' };

function StatCard({ value, label, cls, icon, onClick, active }) {
  return (
    <div 
      className={`stat-card ${cls} ${active ? 'active-stat' : ''}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s ease' }}
    >
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-icon">{icon}</div>
      {active && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'currentColor' }} />}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, tasks, activity

  useEffect(() => {
    api.get('/api/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!data) return null;
  const { stats, overdueTasks, recentTasks, recentActivity, projectProgress } = data;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', icon: List },
    { id: 'activity', label: 'Team Activity', icon: Activity },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Workspace status for {format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 stagger-1">
        <StatCard value={stats.totalProjects} label="Projects" cls="purple" icon={<Layers size={24} />} />
        <StatCard value={stats.inProgressTasks} label="In Progress" cls="blue" icon={<Zap size={24} />} />
        <StatCard value={stats.doneTasks} label="Completed" cls="green" icon={<CheckCircle size={24} />} />
        <StatCard value={stats.overdueTasks} label="Overdue" cls="red" icon={<AlertTriangle size={24} />} />
      </div>

      {/* Dynamic Tabs Navigation */}
      <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-lg w-fit max-w-full overflow-x-auto whitespace-nowrap">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content stagger-3" style={{ animation: 'modal-in 0.3s ease' }}>
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Active Project Progress</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Completion rate of current projects</p>
              </div>
              <div className="card-body">
                {projectProgress.length === 0 ? (
                  <div className="empty-state">No active projects</div>
                ) : projectProgress.map(p => (
                  <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="card-hover" style={{ cursor: 'pointer', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="color-dot" style={{ background: p.color }} />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${p.progress}%`, background: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Task Distribution</h2>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'To Do', count: stats.todoTasks, color: 'var(--text-muted)' },
                  { label: 'In Progress', count: stats.inProgressTasks, color: '#3b82f6' },
                  { label: 'In Review', count: stats.inReviewTasks, color: '#ff8c42' },
                  { label: 'Done', count: stats.doneTasks, color: '#43b97f' }
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                    <span style={{ flex: 1, fontSize: 14 }}>{item.label}</span>
                    <span style={{ fontWeight: 700 }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {overdueTasks.length > 0 && (
              <div className="card" style={{ borderColor: 'rgba(255,101,132,0.3)' }}>
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertTriangle size={18} color="var(--danger)" />
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--danger)' }}>Overdue Critical Tasks</h2>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Task</th><th>Project</th><th>Priority</th><th>Due Date</th></tr>
                    </thead>
                    <tbody>
                      {overdueTasks.map(t => (
                        <tr key={t.id} className="overdue-row" onClick={() => navigate(`/projects/${t.projectId}`)} style={{ cursor: 'pointer' }}>
                          <td style={{ fontWeight: 600 }}>{t.title}</td>
                          <td>{t.projectName}</td>
                          <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                          <td>{format(new Date(t.dueDate), 'MMM d, yyyy')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recently Updated Tasks</h2>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due</th></tr>
                  </thead>
                  <tbody>
                    {recentTasks.map(t => (
                      <tr key={t.id} onClick={() => navigate(`/projects/${t.projectId}`)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 600 }}>{t.title}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="color-dot" style={{ background: t.projectColor }} />
                            <span style={{ fontSize: 13 }}>{t.projectName}</span>
                          </div>
                        </td>
                        <td><span className={`badge badge-${t.status}`}>{statusLabels[t.status]}</span></td>
                        <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                        <td style={{ fontSize: 13, color: t.dueDate && t.status !== 'done' && isPast(parseISO(t.dueDate)) ? 'var(--danger)' : 'var(--text-secondary)' }}>
                          {t.dueDate ? format(new Date(t.dueDate), 'MMM d') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Activity Stream</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Latest updates from your team</p>
            </div>
            <div className="card-body">
              {recentActivity.length === 0 ? (
                <div className="empty-state">No activity logged yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {recentActivity.map(a => (
                    <div key={a.id} className="activity-item" style={{ padding: '16px 0' }}>
                      <Avatar name={a.userName} color={a.userAvatarColor} size="md" />
                      <div style={{ flex: 1 }}>
                        <div className="activity-text" style={{ fontSize: 14 }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{a.userName}</strong> 
                          <span style={{ color: 'var(--text-secondary)' }}> {a.action.replace(/_/g, ' ')} </span>
                          <strong style={{ color: 'var(--accent)' }}>{a.entityName}</strong>
                          {a.entityType && <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>• {a.entityType}</span>}
                        </div>
                        <div className="activity-time" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
