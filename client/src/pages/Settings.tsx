import { useState } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { KeyRound, ShieldCheck, User, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  
  // Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility Toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('https://asset-mgt-ewkj.onrender.com/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(user as any)?.token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Password successfully updated!', type: 'success' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowOld(false);
        setShowNew(false);
        setShowConfirm(false);
      } else {
        setMessage({ text: data.error || 'Failed to update password.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
        <p className="text-sm text-gray-500">Manage your profile and security preferences</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Summary Header */}
        <div className="bg-gradient-to-r from-ui-blue to-blue-900 p-6 flex items-center gap-4 text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{user?.name || 'Staff Member'}</h3>
            <p className="text-blue-100 text-sm flex items-center gap-2 mt-1">
              {user?.email} <span className="px-2 py-0.5 bg-ui-gold/90 text-blue-950 text-xs font-bold rounded-full">{user?.role}</span>
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <ShieldCheck className="w-5 h-5 text-ui-blue" />
            <h4 className="text-lg font-bold text-gray-800">Security & Password</h4>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  required
                  className="w-full border border-gray-300 rounded-xl p-3 pr-12 outline-none focus:ring-2 focus:ring-ui-blue/20 focus:border-ui-blue bg-gray-50 focus:bg-white transition-colors"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-xl p-3 pr-12 outline-none focus:ring-2 focus:ring-ui-blue/20 focus:border-ui-blue bg-gray-50 focus:bg-white transition-colors"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-xl p-3 pr-12 outline-none focus:ring-2 focus:ring-ui-blue/20 focus:border-ui-blue bg-gray-50 focus:bg-white transition-colors"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ui-blue text-white py-3 rounded-xl hover:bg-blue-900 font-bold shadow-md transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}