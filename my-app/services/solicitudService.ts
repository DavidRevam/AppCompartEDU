import api from './api';
import { Solicitud } from '../types';

export class SolicitudService {
  // Obtener todas las solicitudes
  static async getAllSolicitudes(): Promise<Solicitud[]> {
    try {
      const response = await api.get('/solicitudes');
      // El backend devuelve { success: true, message: "...", data: [...] }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes');
    }
  }

  // Obtener solicitud por ID
  static async getSolicitudById(id: number): Promise<Solicitud> {
    try {
      const response = await api.get(`/solicitudes/${id}`);
      // El backend devuelve { success: true, message: "...", data: {...} }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitud');
    }
  }

  // Crear nueva solicitud
  static async createSolicitud(solicitudData: {
    cantidad_solicitud: number;
    id_usuario: number;
    id_publicacion: number;
  }): Promise<{ message: string; data: { id_solicitud: number } }> {
    try {
      const response = await api.post('/solicitudes', solicitudData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear solicitud');
    }
  }

  // Actualizar solicitud
  static async updateSolicitud(id: number, solicitudData: {
    cantidad_solicitud?: number;
    id_estado_solicitud?: number;
  }): Promise<{ message: string }> {
    try {
      const response = await api.put(`/solicitudes/${id}`, solicitudData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar solicitud');
    }
  }

  // Eliminar solicitud
  static async deleteSolicitud(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/solicitudes/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar solicitud');
    }
  }

  // Obtener solicitudes por usuario
  static async getSolicitudesByUser(userId: number): Promise<Solicitud[]> {
    try {
      const response = await api.get(`/solicitudes/usuario/${userId}`);
      // El backend devuelve { success: true, message: "...", data: [...] }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes del usuario');
    }
  }

  // Obtener solicitudes por publicación
  static async getSolicitudesByPublicacion(publicacionId: number): Promise<Solicitud[]> {
    try {
      const response = await api.get(`/solicitudes/publicacion/${publicacionId}`);
      // El backend devuelve { success: true, message: "...", data: [...] }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes de la publicación');
    }
  }

  // Obtener solicitudes por estado
  static async getSolicitudesByEstado(estadoId: number): Promise<Solicitud[]> {
    try {
      const response = await api.get(`/solicitudes/estado/${estadoId}`);
      // El backend devuelve { success: true, message: "...", data: [...] }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes por estado');
    }
  }

  // Cambiar estado de solicitud
  static async cambiarEstadoSolicitud(id: number, nuevoEstadoId: number): Promise<{ message: string }> {
    try {
      const response = await api.patch(`/solicitudes/${id}/estado`, {
        id_estado_solicitud: nuevoEstadoId
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar estado de solicitud');
    }
  }

  // Aceptar solicitud
  static async aceptarSolicitud(id: number): Promise<{ message: string }> {
    try {
      const response = await api.patch(`/solicitudes/${id}/aceptar`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al aceptar solicitud');
    }
  }

  // Rechazar solicitud
  static async rechazarSolicitud(id: number): Promise<{ message: string }> {
    try {
      const response = await api.patch(`/solicitudes/${id}/rechazar`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al rechazar solicitud');
    }
  }

  // Cancelar solicitud
  static async cancelarSolicitud(id: number): Promise<{ message: string }> {
    try {
      const response = await api.patch(`/solicitudes/${id}/cancelar`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cancelar solicitud');
    }
  }
}