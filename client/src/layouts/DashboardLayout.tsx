import { useState } from 'react';
import { LayoutDashboard, Package, Users, Building, Wrench, FileSpreadsheet, Settings, LogOut, Menu, X } from 'lucide-react';
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
          <div className="relative w-64 bg-white flex flex-col z-10 shadow-xl">
            <NavContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white h-20 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">
              University of Ibadan Asset Management
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500">{user?.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-ui-blue text-white flex items-center justify-center font-bold text-lg border-2 border-ui-gold flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}