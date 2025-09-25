import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuración base de la API
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:4200/api' 
  : 'http://192.168.5.109:4200/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token agregado a la petición:', token.substring(0, 20) + '...');
      } else {
        console.log('No hay token disponible');
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log('Error en petición:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Token inválido o expirado, limpiando almacenamiento');
      // Token inválido o expirado
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      
      // Crear un error más descriptivo
      const errorMessage = error.response?.data?.message || 'Token inválido o expirado';
      error.message = errorMessage;
    }
    return Promise.reject(error);
  }
);

export default api;