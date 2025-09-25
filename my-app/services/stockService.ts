import api from './api';
import { Stock, ApiResponse } from '@/types';

export class StockService {
  static async getAllStock(): Promise<Stock[]> {
    try {
      const response = await api.get<ApiResponse<Stock[]>>('/stock');
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener stock');
    }
  }

  static async getStockById(id: number): Promise<Stock> {
    try {
      const response = await api.get<ApiResponse<Stock>>(`/stock/${id}`);
      if (!response.data.data) {
        throw new Error('No se encontró el stock');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener stock');
    }
  }

  static async createStock(stockData: Omit<Stock, 'id'>): Promise<Stock> {
    try {
      const response = await api.post<ApiResponse<Stock>>('/stock', stockData);
      if (!response.data.data) {
        throw new Error('Error al crear stock - respuesta inválida');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear stock');
    }
  }

  static async updateStock(id: number, stockData: Partial<Stock>): Promise<Stock> {
    try {
      const response = await api.put<ApiResponse<Stock>>(`/stock/${id}`, stockData);
      if (!response.data.data) {
        throw new Error('Error al actualizar stock - respuesta inválida');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar stock');
    }
  }

  static async deleteStock(id: number): Promise<void> {
    try {
      await api.delete(`/stock/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar stock');
    }
  }

  static async updateStockQuantity(id: number, cantidad: number): Promise<Stock> {
    try {
      const response = await api.put<ApiResponse<Stock>>(`/stock/${id}`, {
        cantidad_disponible_stock: cantidad
      });
      if (!response.data.data) {
        throw new Error('Error al actualizar cantidad de stock - respuesta inválida');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar cantidad de stock');
    }
  }

  static async reduceStock(id: number, cantidad: number): Promise<Stock> {
    try {
      const stock = await this.getStockById(id);
      const nuevaCantidad = Math.max(0, stock.cantidadDisponible - cantidad);
      return await this.updateStockQuantity(id, nuevaCantidad);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reducir stock');
    }
  }

  static async increaseStock(id: number, cantidad: number): Promise<Stock> {
    try {
      const stock = await this.getStockById(id);
      const nuevaCantidad = Math.min(
        stock.cantidadTotal, 
        stock.cantidadDisponible + cantidad
      );
      return await this.updateStockQuantity(id, nuevaCantidad);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al aumentar stock');
    }
  }
}