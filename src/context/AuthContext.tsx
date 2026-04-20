import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAdmin: boolean;
  token: string | null | undefined;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem('adminToken').then((t) => setToken(t ?? null));
  }, []);

  const login = async (t: string) => {
    await AsyncStorage.setItem('adminToken', t);
    setToken(t);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('adminToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAdmin: !!token, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
