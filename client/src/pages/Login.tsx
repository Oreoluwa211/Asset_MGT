import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://asset-mgt-ewkj.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Unable to connect to backend server');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans overflow-hidden">
      {/* Left Branding Side (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-950 via-ui-blue to-blue-900 relative items-center justify-center p-12">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-ui-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Giant Faint Watermark */}
        <img src="/ui-logo.png" alt="watermark" className="absolute w-[40rem] h-[40rem] opacity-5 grayscale pointer-events-none" />

        <div className="relative z-10 text-white max-w-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white p-2 rounded-xl">
              <img src="/ui-logo.png" alt="UI Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">UI Asset Management</h1>
          </div>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            The centralized platform for tracking, assigning, and maintaining critical infrastructure across the University of Ibadan campus.
          </p>
          <div className="flex items-center gap-3 text-sm text-blue-200/80 font-medium bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-4 h-4" /> Secure Staff Portal
          </div>
        </div>
      </div>

      {/* Right Login Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
        {/* Mobile Logo (Only shows on small screens) */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
          <img src="/ui-logo.png" alt="UI Logo" className="w-8 h-8 drop-shadow-md" />
          <span className="font-extrabold text-ui-blue text-xl tracking-tight">UI Assets</span>
        </div>

        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-2xl shadow-blue-900/5 border-t-4 border-ui-gold">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-sm text-gray-500">Sign in to access your portal</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-ui-blue transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ui-blue/20 focus:border-ui-blue focus:bg-white transition-all shadow-sm"
                  placeholder="e.g. staff@ui.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-ui-blue transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ui-blue/20 focus:border-ui-blue focus:bg-white transition-all shadow-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-ui-blue to-blue-900 text-white font-bold py-3.5 px-4 rounded-xl hover:from-blue-900 hover:to-blue-950 focus:ring-4 focus:ring-ui-blue/30 transition-all shadow-lg shadow-ui-blue/30 mt-6"
            >
              Sign In <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}