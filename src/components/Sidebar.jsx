import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export const Avatar = ({ name, color, size = 'md' }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm';
  return (
    <div className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm ${sizeClass}`} style={{ background: color || 'var(--accent)' }}>
      {initials}
    </div>
  );
};

export default function Sidebar({ collapsed, setCollapsed }) {
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
    <div className="flex flex-grow flex-col p-5 h-full relative bg-[#1e293b]">
      {/* Header & Toggle */}
      <div className={`flex items-center justify-between mb-10 transition-all duration-300 ${collapsed ? 'flex-col gap-4' : 'px-2'}`}>
        <div className="flex items-center gap-3 cursor-pointer h-10" onClick={() => navigate('/dashboard')}>
          <div className="text-3xl text-[#6366f1] shrink-0 drop-shadow-md flex items-center h-full">⚡</div>
          {!collapsed && (
            <span className="font-extrabold text-2xl tracking-tight text-white flex items-center h-full">TaskFlow</span>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sb-nav">
        {navItems.map(item => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={({ isActive }) => `sb-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0 py-3' : ''}`}
          >
            <item.icon size={collapsed ? 24 : 22} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${!collapsed && 'opacity-80'}`} />
            {!collapsed && <span className="font-bold tracking-wide">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="sb-footer">
        {collapsed ? (
          <div className="flex flex-col items-center gap-4">
            <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
            <button 
              onClick={logout} 
              className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all shadow-sm"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="sb-user-card">
            {/* Row 1: Icon and Name */}
            <div className="sb-user-row">
              <Avatar name={user?.name} color={user?.avatarColor} size="md" />
              <div className="font-extrabold text-sm text-white truncate w-full">{user?.name}</div>
            </div>
            {/* Row 2: Role */}
            <div className="flex items-center mb-4 px-1">
              <span className="sb-user-role">
                {user?.role || 'Member'}
              </span>
            </div>
            {/* Row 3: Logout */}
            <button 
              onClick={logout} 
              className="sb-logout-btn"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
