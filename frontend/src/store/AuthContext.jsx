import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token   = localStorage.getItem('token');
    const role    = localStorage.getItem('role');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    return token ? { token, role, isAdmin } : null;
  });

  const login = (token, role, displayName, isAdmin = false) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('isAdmin', String(isAdmin));
    if (displayName) localStorage.setItem('displayName', displayName);
    setUser({ token, role, isAdmin });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('displayName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);