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

export default function Sidebar({ collapsed }) {
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
    <div className="flex flex-grow flex-col p-4 h-full relative">
      <div className={`flex items-center gap-3 mb-10 px-2 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
        <div className="text-2xl text-[#6366f1] shrink-0">⚡</div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight leading-none text-white">TaskFlow</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Team Manager</span>
          </div>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {!collapsed && (
          <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-widest mb-2 px-2">Navigation</span>
        )}
        {navItems.map(item => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={({ isActive }) => `flex items-center gap-3 p-3 rounded-lg transition-all whitespace-nowrap overflow-hidden ${isActive ? 'bg-[#6366f1] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <div className={`flex items-center gap-3 p-2 rounded-xl transition-all ${collapsed ? 'justify-center px-0' : ''}`}>
          <Avatar name={user?.name} color={user?.avatarColor} size={collapsed ? 'sm' : 'md'} />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-500 capitalize">{user?.role}</div>
            </div>
          )}
          <button 
            onClick={logout} 
            className={`p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all ${collapsed ? 'hidden' : ''}`}
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
        {collapsed && (
           <button 
           onClick={logout} 
           className="mt-2 w-full flex justify-center p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
           title="Sign out"
         >
           <LogOut size={18} />
         </button>
        )}
      </div>
    </div>
  );
}
