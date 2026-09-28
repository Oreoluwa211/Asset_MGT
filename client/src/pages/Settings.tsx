import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { Shield, Bell, Key, Check } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    assignmentAlerts: true,
  });
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ui_notifications_pref');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  const handleToggle = (key: 'emailAlerts' | 'assignmentAlerts') => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('ui_notifications_pref', JSON.stringify(updated));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
        <p className="text-sm text-gray-500">Manage your profile and application preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-ui-blue text-white flex items-center justify-center font-bold text-2xl border-2 border-ui-gold shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h3>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <Shield className="w-4 h-4 mr-1 text-ui-gold" />
              {user?.role} Account
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" disabled value={user?.name || ''} className="mt-1 w-full border border-gray-200 rounded-md p-2.5 bg-gray-50 text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" disabled value={user?.email || ''} className="mt-1 w-full border border-gray-200 rounded-md p-2.5 bg-gray-50 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
            <Key className="w-4 h-4 mr-2 text-gray-400" /> Security
          </h4>
          <p className="text-sm text-gray-500 mb-4">Account credentials are managed by central directory services.</p>
          <button
            onClick={() => alert("Password changes are restricted to Central University IT Helpdesk for this demo environment.")}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors w-full cursor-pointer"
          >
            Request Password Reset
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
              <Bell className="w-4 h-4 mr-2 text-gray-400" /> Notifications
            </h4>
            {savedNotice && (
              <span className="text-xs font-semibold text-green-600 flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> Saved
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">Manage your alert preferences across the application.</p>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={() => handleToggle('emailAlerts')}
                className="rounded text-ui-blue focus:ring-ui-blue h-4 w-4 cursor-pointer"
              />
              <span className="text-sm text-gray-700">Email alerts for maintenance updates</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.assignmentAlerts}
                onChange={() => handleToggle('assignmentAlerts')}
                className="rounded text-ui-blue focus:ring-ui-blue h-4 w-4 cursor-pointer"
              />
              <span className="text-sm text-gray-700">New asset assignment notifications</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}