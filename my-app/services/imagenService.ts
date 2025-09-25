import api from './api';
import { Imagen, ApiResponse } from '@/types';

export class ImagenService {
  static async getAllImagenes(): Promise<Imagen[]> {
    try {
      const response = await api.get<ApiResponse<Imagen[]>>('/imagen');
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener imágenes');
    }
  }

  static async getImagenById(id: number): Promise<Imagen> {
    try {
      const response = await api.get<ApiResponse<Imagen>>(`/imagen/${id}`);
      if (!response.data.data) {
        throw new Error('No se encontró la imagen');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener imagen');
    }
  }

  static async getImagenesByPublicacion(publicacionId: number): Promise<Imagen[]> {
    try {
      const response = await api.get<ApiResponse<Imagen[]>>(`/imagen/publicacion/${publicacionId}`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener imágenes de la publicación');
    }
  }

  static async createImagen(imagenData: Omit<Imagen, 'id'>): Promise<Imagen> {
    try {
      const response = await api.post<ApiResponse<Imagen>>('/imagen', imagenData);
      if (!response.data.data) {
        throw new Error('Error al crear la imagen');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear imagen');
    }
  }

  static async updateImagen(id: number, imagenData: Partial<Imagen>): Promise<Imagen> {
    try {
      const response = await api.put<ApiResponse<Imagen>>(`/imagen/${id}`, imagenData);
      if (!response.data.data) {
        throw new Error('Error al actualizar la imagen');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar imagen');
    }
  }

  static async deleteImagen(id: number): Promise<void> {
    try {
      await api.delete(`/imagen/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar imagen');
    }
  }

  static async uploadImageForPublicacion(
    publicacionId: number, 
    imageUri: string, 
    descripcion?: string
  ): Promise<Imagen> {
    try {
      // En una implementación real, aquí subirías la imagen a un servicio de almacenamiento
      // y obtendrías la URL. Por ahora, usamos la URI directamente.
      const imagenData = {
        url: imageUri,
        idPublicacion: publicacionId
      };

      return await this.createImagen(imagenData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al subir imagen');
    }
  }
}