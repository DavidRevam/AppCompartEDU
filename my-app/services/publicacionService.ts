import api from './api';
import { Publicacion, PublicacionForm } from '../types';

export class PublicacionService {
  // Obtener todas las publicaciones
  static async getAllPublicaciones(): Promise<Publicacion[]> {
    try {
      const response = await api.get('/publicaciones');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener publicaciones');
    }
  }

  // Obtener publicaciones con stock e imágenes
  static async getPublicacionesWithDetails(): Promise<Publicacion[]> {
    try {
      const response = await api.get('/publicaciones/complete/all');
      // El backend devuelve { data: [...], message: "...", total: ... }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener publicaciones con detalles');
    }
  }

  // Obtener publicación por ID
  static async getPublicacionById(id: number): Promise<Publicacion> {
    try {
      const response = await api.get(`/publicaciones/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener publicación');
    }
  }

  // Obtener publicación con detalles por ID
  static async getPublicacionWithDetailsById(id: number): Promise<Publicacion> {
    try {
      const response = await api.get(`/publicaciones/complete/${id}`);
      // El backend devuelve { data: {...}, message: "..." }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener publicación con detalles');
    }
  }

  // Crear nueva publicación
  static async createPublicacion(publicacionData: PublicacionForm): Promise<{ message: string; publicacionId: number }> {
    try {
      const response = await api.post('/publicaciones', publicacionData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear publicación');
    }
  }

  // Actualizar publicación
  static async updatePublicacion(id: number, publicacionData: Partial<PublicacionForm>): Promise<{ message: string }> {
    try {
      const response = await api.put(`/publicaciones/${id}`, publicacionData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar publicación');
    }
  }

  // Eliminar publicación
  static async deletePublicacion(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/publicaciones/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar publicación');
    }
  }

  // Obtener publicaciones por usuario
  static async getPublicacionesByUser(userId: number): Promise<Publicacion[]> {
    try {
      const response = await api.get(`/publicaciones/usuario/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener publicaciones del usuario');
    }
  }
}