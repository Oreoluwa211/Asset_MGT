import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1. Check permanent storage immediately on load
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('ui_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('ui_token');
  });

  // 2. Save to permanent storage on login
  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    sessionStorage.setItem('ui_user', JSON.stringify(userData));
    sessionStorage.setItem('ui_token', authToken);
  };

  // 3. Wipe permanent storage on logout
  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('ui_user');
    sessionStorage.removeItem('ui_token');
  };

  // --- INACTIVITY AUTO-LOGOUT (20 Minutes) ---
  useEffect(() => {
    if (!user) return;

    const checkInactivity = () => {
      const lastActive = sessionStorage.getItem('last_active_time');
      // 20 minutes = 1,200,000 milliseconds
      if (lastActive && Date.now() - parseInt(lastActive) > 1200000) {
        logout();
        alert("Session expired due to inactivity. Please log in again.");
      }
    };

    const updateActivity = () => {
      sessionStorage.setItem('last_active_time', Date.now().toString());
    };

    // Set initial timestamp on load
    updateActivity();

    // Check the timer every 1 minute
    const interval = setInterval(checkInactivity, 60000);

    // Reset the timer whenever the user clicks or types
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};