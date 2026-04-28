import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { resetToHome } from '../navigation/navigationRef';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('token');
      const role = await SecureStore.getItemAsync('role');
      const isAdmin = (await SecureStore.getItemAsync('isAdmin')) === 'true';
      const displayName = await SecureStore.getItemAsync('displayName');
      if (token) setUser({ token, role, isAdmin, displayName });
      setLoading(false);
    })();
  }, []);

  const login = async (token, role, displayName, isAdmin = false) => {
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('role', role);
    await SecureStore.setItemAsync('isAdmin', String(isAdmin));
    if (displayName) await SecureStore.setItemAsync('displayName', displayName);
    setUser({ token, role, isAdmin, displayName });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('role');
    await SecureStore.deleteItemAsync('isAdmin');
    await SecureStore.deleteItemAsync('displayName');
    setUser(null);
    resetToHome();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
