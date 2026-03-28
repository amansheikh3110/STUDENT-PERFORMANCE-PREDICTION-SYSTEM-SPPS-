import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Bell, LogOut, HeartPulse
} from 'lucide-react';

const roleNavItems: Record<string, { label: string; path: string; icon: React.ReactNode }[]> = {
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Students', path: '/students', icon: <Users size={20} /> },
    { label: 'Predictions', path: '/predictions', icon: <HeartPulse size={20} /> },
    { label: 'Interventions', path: '/interventions', icon: <Bell size={20} /> },
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Students', path: '/students', icon: <Users size={20} /> },
    { label: 'Interventions', path: '/interventions', icon: <Bell size={20} /> },
  ],
  counsellor: [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Students', path: '/students', icon: <Users size={20} /> },
    { label: 'Interventions', path: '/interventions', icon: <Bell size={20} /> },
  ],
  student: [
    { label: 'My Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const navItems = roleNavItems[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
    counsellor: 'Counsellor',
  };

  const roleColors = {
    admin: 'bg-[var(--accent)]',
    teacher: 'bg-[var(--status-info)]',
    student: 'bg-[var(--status-medium)]',
    counsellor: 'bg-[#0984e3]',
  };

  return (
    <aside className="w-[252px] min-w-[252px] bg-[var(--surface-dark)] flex flex-col relative overflow-hidden z-50">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      
      {/* Sidebar Top */}
      <div className="p-5 pb-3 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center font-mono font-bold text-[13px] text-white shadow-[0_4px_12px_rgba(255,71,87,0.4)]">
            SP
          </div>
          <div className="font-mono text-[13px] font-semibold text-white tracking-[0.06em] uppercase">SPPS</div>
        </div>
        <div className="font-mono text-[9px] text-white/35 tracking-[0.12em] uppercase ml-[46px]">Prediction System v1.0</div>
        
        <div className="flex items-center gap-1.5 mt-2.5 px-2.5 py-1.5 rounded-md bg-white/5 w-fit">
          <div className="led led-green shrink-0"></div>
          <span className="font-mono text-[9px] text-white/50 tracking-[0.1em] uppercase">System Online</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 flex flex-col gap-0.5 overflow-y-auto relative z-10">
        <div className="font-mono text-[8px] text-white/25 tracking-[0.15em] uppercase px-2.5 pt-2 pb-1">Control</div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg font-mono text-[10px] font-medium tracking-[0.06em] uppercase transition-all duration-150 group ${
                isActive
                  ? 'text-white shadow-[inset_3px_3px_7px_rgba(0,0,0,0.35),inset_-2px_-2px_5px_rgba(255,255,255,0.04)] bg-black/25'
                  : 'text-white/45 hover:text-white/85 hover:bg-white/5'
              }`
            }
          >
            {React.cloneElement(item.icon as React.ReactElement<{className?: string}>, { className: 'nav-icon opacity-70 group-[.active]:opacity-100 shrink-0' })}
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        <div className="mt-8"></div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg font-mono text-[10px] font-medium tracking-[0.06em] uppercase text-white/30 hover:text-red-400 hover:bg-white/5 transition-all duration-150 cursor-pointer text-left w-full"
        >
          <LogOut size={16} className="opacity-70 shrink-0" />
          <span>Sign Out</span>
        </button>
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${roleColors[user.role as keyof typeof roleColors] || 'bg-gray-500'}`}>
            {user.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white truncate">{user.name}</div>
            <div className="font-mono text-[8px] text-white/35 tracking-[0.1em] uppercase">{roleLabel[user.role as keyof typeof roleLabel]}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
