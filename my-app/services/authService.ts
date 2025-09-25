import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { LoginForm, RegisterForm, AuthResponse, User } from '../types';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  // Login de usuario
  static async login(credentials: LoginForm): Promise<AuthResponse> {
    try {
      const response = await api.post('/login', credentials);
      const { token } = response.data;
      
      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      
      return { token };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  // Registro de usuario
  static async register(userData: RegisterForm): Promise<{ message: string; userId: number }> {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  }

  // Obtener datos del usuario actual
  static async getCurrentUser(): Promise<User> {
    try {
      // Obtener el token del almacenamiento
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Decodificar el token para obtener el ID del usuario
      const decoded = jwtDecode<JWTPayload>(token);
      const userId = decoded.id;

      // Hacer la llamada a la API usando el ID del usuario
      const response = await api.get(`/users/${userId}`);
      const userData = response.data;
      
      // Guardar datos del usuario
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      return userData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener datos del usuario');
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // Verificar si el usuario está autenticado
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch {
      return false;
    }
  }

  // Obtener token almacenado
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch {
      return null;
    }
  }

  // Obtener datos del usuario almacenados
  static async getStoredUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
}