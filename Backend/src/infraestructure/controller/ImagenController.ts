import { Request, Response } from "express";
import { ImagenApplication } from "../../application/ImagenApplication";

export class ImagenController {
    constructor(private imagenApplication: ImagenApplication) {}

    async createImagen(req: Request, res: Response): Promise<void> {
        try {
            const { url, idPublicacion } = req.body;

            // Validaciones básicas
            if (!url || !idPublicacion) {
                res.status(400).json({
                    success: false,
                    message: "URL e ID de publicación son requeridos"
                });
                return;
            }

            const imagenId = await this.imagenApplication.createImagen({
                url,
                idPublicacion: parseInt(idPublicacion)
            });

            res.status(201).json({
                success: true,
                message: "Imagen creada exitosamente",
                data: { id: imagenId }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al crear imagen"
            });
        }
    }

    async updateImagen(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { url, idPublicacion } = req.body;

            if (!id || isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "ID de imagen inválido"
                });
                return;
            }

            const updateData: any = {};
            if (url !== undefined) updateData.url = url;
            if (idPublicacion !== undefined) updateData.idPublicacion = parseInt(idPublicacion);

            const updated = await this.imagenApplication.updateImagen(parseInt(id), updateData);

            if (updated) {
                res.status(200).json({
                    success: true,
                    message: "Imagen actualizada exitosamente"
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "Imagen no encontrada"
                });
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al actualizar imagen"
            });
        }
    }

    async deleteImagen(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "ID de imagen inválido"
                });
                return;
            }

            const deleted = await this.imagenApplication.deleteImagen(parseInt(id));

            if (deleted) {
                res.status(200).json({
                    success: true,
                    message: "Imagen eliminada exitosamente"
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "Imagen no encontrada"
                });
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al eliminar imagen"
            });
        }
    }

    async getAllImagenes(req: Request, res: Response): Promise<void> {
        try {
            const imagenes = await this.imagenApplication.getAllImagenes();

            res.status(200).json({
                success: true,
                message: "Imágenes obtenidas exitosamente",
                data: imagenes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al obtener imágenes"
            });
        }
    }

    async getImagenById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "ID de imagen inválido"
                });
                return;
            }

            const imagen = await this.imagenApplication.getImagenById(parseInt(id));

            if (imagen) {
                res.status(200).json({
                    success: true,
                    message: "Imagen obtenida exitosamente",
                    data: imagen
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "Imagen no encontrada"
                });
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al obtener imagen"
            });
        }
    }

    async getImagenesByPublicacionId(req: Request, res: Response): Promise<void> {
        try {
            const { idPublicacion } = req.params;

            if (!idPublicacion || isNaN(parseInt(idPublicacion))) {
                res.status(400).json({
                    success: false,
                    message: "ID de publicación inválido"
                });
                return;
            }

            const imagenes = await this.imagenApplication.getImagenesByPublicacionId(parseInt(idPublicacion));

            res.status(200).json({
                success: true,
                message: "Imágenes de la publicación obtenidas exitosamente",
                data: imagenes
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al obtener imágenes de la publicación"
            });
        }
    }

    async createImagenesForPublicacion(req: Request, res: Response): Promise<void> {
        try {
            const { idPublicacion } = req.params;
            const { urls } = req.body;

            if (!idPublicacion || isNaN(parseInt(idPublicacion))) {
                res.status(400).json({
                    success: false,
                    message: "ID de publicación inválido"
                });
                return;
            }

            if (!urls || !Array.isArray(urls)) {
                res.status(400).json({
                    success: false,
                    message: "Se requiere un array de URLs"
                });
                return;
            }

            const imagenesIds = await this.imagenApplication.createImagenesForPublicacion(
                parseInt(idPublicacion),
                urls
            );

            res.status(201).json({
                success: true,
                message: "Imágenes creadas exitosamente",
                data: { ids: imagenesIds }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al crear imágenes"
            });
        }
    }
}