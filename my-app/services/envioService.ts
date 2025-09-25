import api from './api';

export interface Envio {
  id: number;
  direccion: string;
  barrio: string;
  localidad: string;
  solicitudId: number;
}

export interface CreateEnvioData {
  direccion: string;
  barrio: string;
  localidad: string;
  solicitudId: number;
}

export class EnvioService {
  // Crear un nuevo envío
  static async createEnvio(envioData: CreateEnvioData): Promise<{ message: string; id: number }> {
    try {
      const response = await api.post('/envios', envioData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear envío');
    }
  }

  // Obtener envío por ID
  static async getEnvioById(id: number): Promise<Envio> {
    try {
      const response = await api.get(`/envios/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener envío');
    }
  }

  // Obtener envío por ID de solicitud
  static async getEnvioBySolicitudId(solicitudId: number): Promise<Envio> {
    try {
      const response = await api.get(`/envios/solicitud/${solicitudId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener envío por solicitud');
    }
  }

  // Obtener todos los envíos
  static async getAllEnvios(): Promise<Envio[]> {
    try {
      const response = await api.get('/envios');
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener envíos');
    }
  }

  // Actualizar envío
  static async updateEnvio(id: number, envioData: Partial<CreateEnvioData>): Promise<{ message: string }> {
    try {
      const response = await api.put(`/envios/${id}`, envioData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar envío');
    }
  }

  // Eliminar envío
  static async deleteEnvio(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/envios/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar envío');
    }
  }
}