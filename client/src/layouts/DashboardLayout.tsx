import { useState } from 'react';
import { LayoutDashboard, Package, Users, Building, Wrench, FileSpreadsheet, Settings, LogOut, Menu, X, Search } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Staff'] },
    { to: '/assets', icon: Package, label: 'Assets', roles: ['Admin'] },
    { to: '/staff', icon: Users, label: 'Staff', roles: ['Admin'] },
    { to: '/departments', icon: Building, label: 'Departments', roles: ['Admin'] },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance', roles: ['Admin', 'Staff'] },
    { to: '/reports', icon: FileSpreadsheet, label: 'Reports', roles: ['Admin'] },
    { to: '/settings', icon: Settings, label: 'Settings', roles: ['Admin', 'Staff'] },
  ];

  const visibleLinks = allLinks.filter(link => user?.role && link.roles.includes(user.role));

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-20 flex items-center justify-between md:justify-center px-4 border-b-4 border-ui-gold bg-ui-blue text-white">
        <div className="flex items-center space-x-3">
          <img src="/ui-logo.png" alt="UI Logo" className="h-10 w-auto brightness-110" />
          <h1 className="text-lg font-black tracking-wider text-white">UI ASSET MGT</h1>
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-white hover:text-gray-300">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {visibleLinks.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-ui-blue' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" /> {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 mr-3" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-ui-neutral font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="bg-white border-r border-gray-200 w-64 flex-shrink-0 hidden md:flex flex-col">
        <NavContent />
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-58 bg-white flex flex-col z-10 shadow-xl">
            <NavContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <img src="/ui-logo.png" alt="UI Logo" className="w-8 h-8" />
              <h1 className="text-lg font-bold text-gray-800 tracking-tight hidden md:block">UI Assets</h1>
            </div>
          </div>

          {/* Search Bar - Better Mobile Sizing */}
          <div className="flex-1 max-w-2xl px-2 sm:px-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full bg-gray-100/50 border border-gray-200 text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-ui-blue/30 focus:border-ui-blue transition-all shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = `/assets?search=${encodeURIComponent(e.currentTarget.value)}`;
                  }
                }}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3 group-focus-within:text-ui-blue" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ui-blue to-blue-900 text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Main Content with Watermark */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 relative">
          {/* Magic UI Watermark */}
          <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
            <img src="/ui-logo.png" alt="watermark" className="w-[30rem] h-[30rem] object-contain grayscale" />
          </div>
          
          <div className="relative z-10 p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}