import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';
import Users from './pages/Users';

import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="sidebar-logo" style={{ marginBottom: 0, padding: 0 }}>
          <span style={{ fontSize: 18 }}>⚡ TaskFlow</span>
        </div>
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar with mobile toggle and manual collapse classes */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <button 
          className="btn-ghost" 
          onClick={() => setCollapsed(!collapsed)}
          style={{ position: 'absolute', top: 20, right: 10, padding: 4, borderRadius: 6, zIndex: 1100 }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <Sidebar collapsed={collapsed} />
      </div>

      <main className="main-content" style={{ marginLeft: 0 }}>
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 850 }} />}
    </div>
  );
}

function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ className: 'toast-custom', style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route element={<AdminRoute />}>
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
