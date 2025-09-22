import { Request, Response } from "express";
import { PublicacionApplication } from "../../application/PublicacionApplication";
import { Publicacion } from "../../domain/Publicacion";

export class PublicacionController {
  private app: PublicacionApplication;

  constructor(app: PublicacionApplication) {
    this.app = app;
  }

  // Crear una publicación con su stock asociado
  async createPublicacion(req: Request, res: Response): Promise<Response> {
    try {
      const { 
        titulo, 
        descripcion, 
        fecha, 
        publicacion_activo, 
        id_usuario,
        // Datos del stock
        cantidadTotal,
        cantidadReservada = 0,
        cantidadDisponible
      } = req.body;

      // Validaciones básicas de publicación
      if (!titulo || titulo.trim().length < 3) {
        return res.status(400).json({ error: "El título debe tener al menos 3 caracteres" });
      }
      if (!descripcion || descripcion.trim().length < 5) {
        return res.status(400).json({ error: "La descripción debe tener al menos 5 caracteres" });
      }
      if (!id_usuario || isNaN(id_usuario)) {
        return res.status(400).json({ error: "El id_usuario es requerido y debe ser numérico" });
      }

      // Validaciones de stock
      if (!cantidadTotal || cantidadTotal < 0) {
        return res.status(400).json({ error: "La cantidad total debe ser un número positivo" });
      }
      if (cantidadReservada < 0) {
        return res.status(400).json({ error: "La cantidad reservada no puede ser negativa" });
      }
      
      // Si no se proporciona cantidadDisponible, calcularla automáticamente
      const cantidadDisponibleFinal = cantidadDisponible !== undefined 
        ? cantidadDisponible 
        : cantidadTotal - cantidadReservada;
        
      if (cantidadDisponibleFinal < 0) {
        return res.status(400).json({ error: "La cantidad disponible no puede ser negativa" });
      }

      // Validar que cantidadDisponible = cantidadTotal - cantidadReservada
      if (cantidadDisponibleFinal !== cantidadTotal - cantidadReservada) {
        return res.status(400).json({ 
          error: "La cantidad disponible debe ser igual a la cantidad total menos la cantidad reservada" 
        });
      }

      const fecha_publicacion = fecha ? new Date(fecha) : new Date();
      const estado = publicacion_activo ?? 1; // por defecto activo

      const publicacion: Omit<Publicacion, "id"> = {
        titulo,
        descripcion,
        fecha: fecha_publicacion,
        publicacion_activo: estado,
        id_usuario,
      };

      const stockData = {
        cantidadTotal,
        cantidadReservada,
        cantidadDisponible: cantidadDisponibleFinal,
        estado: 1 // Stock activo por defecto
      };

      const result = await this.app.createPublicacionWithStock(publicacion, stockData);
      return res.status(201).json({ 
        message: "Publicación y stock creados correctamente", 
        publicacionId: result.publicacionId,
        stockId: result.stockId
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al crear la publicación y stock" });
    }
  }

  // Actualizar publicación
  async updatePublicacion(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

      const { titulo, descripcion, publicacion_activo } = req.body;

      const updated = await this.app.updatePublicacion(id, {
        titulo,
        descripcion,
        publicacion_activo,
      });

      if (!updated) {
        return res.status(404).json({ error: "Publicación no encontrada" });
      }

      return res.status(200).json({ message: "Publicación actualizada correctamente" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al actualizar la publicación" });
    }
  }

  // Eliminar publicación (lógico)
  async deletePublicacion(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

      const deleted = await this.app.deletePublicacion(id);
      if (!deleted) {
        return res.status(404).json({ error: "Publicación no encontrada" });
      }

      return res.status(200).json({ message: "Publicación eliminada correctamente" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al eliminar la publicación" });
    }
  }

  // Obtener todas las publicaciones
  async getAllPublicaciones(req: Request, res: Response): Promise<Response> {
    try {
      const publicaciones = await this.app.getAllPublicaciones();
      return res.status(200).json(publicaciones);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al obtener publicaciones" });
    }
  }

  // Obtener publicación por ID
  async getPublicacionById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

      const publicacion = await this.app.getPublicacionById(id);
      if (!publicacion) {
        return res.status(404).json({ error: "Publicación no encontrada" });
      }

      return res.status(200).json(publicacion);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al obtener la publicación" });
    }
  }

  // Obtener publicaciones de un usuario
  async getPublicacionByUserId(req: Request, res: Response): Promise<Response> {
    try {
      const id_usuario = parseInt(req.params.id_usuario);
      if (isNaN(id_usuario)) {
        return res.status(400).json({ error: "ID de usuario inválido" });
      }
      
      
      const publicaciones = await this.app.getPublicacionByUserId(id_usuario);
      return res.status(200).json(publicaciones);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al obtener publicaciones del usuario" });
    }
  }
}
