import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Assets from './pages/Assets';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Departments from './pages/Departments';
import Staff from './pages/Staff';
import Settings from './pages/Settings';

// Protect routes: Redirect to login if no user is found
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex h-64 items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
    <h2 className="text-xl text-gray-500 font-medium">{title} Page (Coming Soon)</h2>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="assets" element={<Assets />} />
        <Route path="staff" element={<Staff />} />
        <Route path="departments" element={<Departments />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;