import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { router } from 'expo-router';
import { AuthService } from '../services/authService';
import { User, LoginForm, RegisterForm } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al iniciar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authenticated = await AuthService.isAuthenticated();
      
      if (authenticated) {
        // Intentar obtener datos del usuario almacenados
        const storedUser = await AuthService.getStoredUserData();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Si no hay datos almacenados, obtenerlos del servidor
          try {
            const userData = await AuthService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
          } catch(error){
            // Si falla, limpiar autenticación
            console.error('Error al obtener usuario del servidor:', error);
            await AuthService.logout();
            setIsAuthenticated(false);
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginForm) => {
    try {
      setIsLoading(true);
      await AuthService.login(credentials);
      
      // Obtener datos del usuario después del login
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterForm) => {
    try {
      setIsLoading(true);
      await AuthService.register(userData);
      // Después del registro, hacer login automático
      await login({ email: userData.email, password: userData.password });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      setTimeout(() => {
        try {
          router.replace('/(auth)/login');
        } catch (navError) {
          console.error('Error en navegación:', navError);
        }
        setIsLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error en logout:', error);
      setIsLoading(false);
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    }
  };

  const refreshUser = async () => {
    try {
      if (isAuthenticated) {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      // Si falla, cerrar sesión
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};