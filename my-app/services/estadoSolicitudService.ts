import api from './api';

export interface EstadoSolicitud {
  id: number;
  descripcion: string;
}

export class EstadoSolicitudService {
  // Obtener estado de solicitud por ID
  static async getEstadoSolicitudById(id: number): Promise<EstadoSolicitud> {
    try {
      const response = await api.get(`/estados-solicitud/${id}`);
      // El backend devuelve { success: true, message: "...", data: {...} }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estado de solicitud');
    }
  }

  // Obtener todos los estados de solicitud
  static async getAllEstadosSolicitud(): Promise<EstadoSolicitud[]> {
    try {
      const response = await api.get('/estados-solicitud');
      // El backend devuelve { success: true, message: "...", data: [...] }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estados de solicitud');
    }
  }
}