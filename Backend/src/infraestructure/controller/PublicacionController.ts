import { Request, Response } from "express";
import { PublicacionApplication } from "../../application/PublicacionApplication";
import { Publicacion } from "../../domain/Publicacion";

export class PublicacionController {
  private app: PublicacionApplication;

  constructor(app: PublicacionApplication) {
    this.app = app;
  }



  // Crear una publicación (siempre con stock e imágenes)
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
        cantidadDisponible,
        // Datos de las imágenes
        imagenes = []
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

      // Validaciones de imágenes
      if (!Array.isArray(imagenes)) {
        return res.status(400).json({ error: "Las imágenes deben ser un array" });
      }

      // Validar cada imagen
      for (let i = 0; i < imagenes.length; i++) {
        const imagen = imagenes[i];
        if (!imagen.url || imagen.url.trim().length === 0) {
          return res.status(400).json({ error: `La imagen ${i + 1} debe tener una URL válida` });
        }
        if (!imagen.descripcion || imagen.descripcion.trim().length === 0) {
          return res.status(400).json({ error: `La imagen ${i + 1} debe tener una descripción` });
        }
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

      // Preparar datos de imágenes
      const imagenesData = imagenes.map((imagen: any) => ({
        url: imagen.url.trim(),
        descripcion: imagen.descripcion.trim(),
        estado: imagen.estado ?? 1 // Activo por defecto
      }));

      const result = await this.app.createPublicacionWithStockAndImages(publicacion, stockData, imagenesData);
      return res.status(201).json({ 
        message: "Publicación, stock e imágenes creados correctamente", 
        publicacionId: result.publicacionId,
        stockId: result.stockId,
        imagenesIds: result.imagenesIds,
        totalImagenes: result.imagenesIds.length
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al crear la publicación, stock e imágenes" });
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

  // Obtener todas las publicaciones con stock e imágenes
  async getAllPublicacionesWithStockAndImages(req: Request, res: Response): Promise<Response> {
    try {
      const publicacionesCompletas = await this.app.getAllPublicacionesWithStockAndImages();
      return res.status(200).json({
        message: "Publicaciones con stock e imágenes obtenidas correctamente",
        data: publicacionesCompletas,
        total: publicacionesCompletas.length
      });
    } catch (error) {
      console.error("❌ Error al obtener publicaciones completas:", error);
      return res.status(500).json({ error: "Error al obtener publicaciones con stock e imágenes" });
    }
  }

  // Obtener una publicación específica con stock e imágenes
  async getPublicacionWithStockAndImagesById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const publicacionCompleta = await this.app.getPublicacionWithStockAndImagesById(id);
      if (!publicacionCompleta) {
        return res.status(404).json({ error: "Publicación no encontrada" });
      }

      return res.status(200).json({
        message: "Publicación con stock e imágenes obtenida correctamente",
        data: publicacionCompleta
      });
    } catch (error) {
      console.error("Error al obtener publicación completa:", error);
      return res.status(500).json({ error: "Error al obtener publicación con stock e imágenes" });
    }
  }
}
