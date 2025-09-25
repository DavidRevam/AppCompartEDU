import api from './api';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  usuario_activo: number;
}

export class UserService {
  // Obtener usuario por ID
  static async getUserById(id: number): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      // El backend devuelve { success: true, message: "...", data: {...} }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  }

  // Obtener todos los usuarios
  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users');
      // El backend devuelve { success: true, message: "...", data: [...] }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  }

  // Obtener usuario por email
  static async getUserByEmail(email: string): Promise<User> {
    try {
      const response = await api.get(`/users/email/${email}`);
      // El backend devuelve { success: true, message: "...", data: {...} }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario por email');
    }
  }

  // Actualizar usuario
  static async updateUser(id: number, userData: Partial<User>): Promise<void> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  }

  // Eliminar usuario (eliminado lógico)
  static async deleteUser(id: number): Promise<void> {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  }
}