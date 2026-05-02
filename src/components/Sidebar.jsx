import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Zap } from 'lucide-react';

export const Avatar = ({ name, color, size = 'md' }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '';
  return (
    <div className={`avatar ${sizeClass}`} style={{ background: color || 'var(--accent)' }}>
      {initials}
    </div>
  );
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/users', label: 'Users', icon: Users });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>TaskFlow</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Team Manager</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, padding: '0 16px' }}>Navigation</span>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
          <button 
            onClick={logout} 
            className="btn-ghost" 
            style={{ padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
