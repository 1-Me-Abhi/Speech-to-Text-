import { NavLink } from 'react-router-dom';
import {
  Mic,
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  MoreVertical
} from 'lucide-react';

const navItems = [
  { to: '/',         label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/history',  label: 'Transcriptions',  icon: FileText },
  { to: '/upload',   label: 'Upload',          icon: Upload },
  { to: '/settings', label: 'Settings',        icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar-dark border-r border-white/5 flex flex-col z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Mic size={20} className="fill-current" />
        </div>
        <h1 className="text-xl font-bold text-soft-white tracking-tight">VoiceScribe</h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-white/5 text-soft-white border border-white/10'
                  : 'text-muted-text hover:bg-white/5 hover:text-soft-white border border-transparent'
              }`
            }
          >
            <Icon size={20} />
            <span className="font-medium text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-xs font-bold text-white">
            AR
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold truncate text-soft-white">Alex Rivera</p>
            <p className="text-[10px] text-muted-text truncate">Pro Account</p>
          </div>
          <MoreVertical size={16} className="text-muted-text" />
        </div>
      </div>
    </aside>
  );
}
