import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb w-96 h-96 bg-primary -top-20 -left-20"></div>
        <div className="orb w-80 h-80 bg-accent-muted top-1/2 -right-20"></div>
        <div className="orb w-64 h-64 bg-slate-700 bottom-10 left-1/3"></div>
      </div>
      <div className="relative flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto z-10 custom-scrollbar bg-surface/30">
          <Outlet />
        </main>
      </div>
    </>
  );
}
