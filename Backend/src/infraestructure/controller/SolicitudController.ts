import { Request, Response } from "express";
import { SolicitudApplication } from "../../application/SolicitudApplication";

export class SolicitudController {
    constructor(private solicitudApplication: SolicitudApplication) {}

    /**
     * Crear una nueva solicitud
     */
    async createSolicitud(req: Request, res: Response): Promise<void> {
        try {
            const { cantidad, fecha, id_estado_solicitud, id_usuario, id_publicacion } = req.body;

            // Validaciones básicas
            if (!cantidad || !fecha || !id_estado_solicitud || !id_usuario || !id_publicacion) {
                res.status(400).json({
                    success: false,
                    message: "Todos los campos son requeridos: cantidad, fecha, id_estado_solicitud, id_usuario, id_publicacion"
                });
                return;
            }

            const solicitudData = {
                cantidad: parseInt(cantidad),
                fecha: new Date(fecha),
                id_estado_solicitud: parseInt(id_estado_solicitud),
                id_usuario: parseInt(id_usuario),
                id_publicacion: parseInt(id_publicacion)
            };

            const solicitudId = await this.solicitudApplication.createSolicitud(solicitudData);

            res.status(201).json({
                success: true,
                message: "Solicitud creada exitosamente",
                data: { id: solicitudId }
            });
        } catch (error) {
            console.error("Error en controlador al crear solicitud:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al crear solicitud"
            });
        }
    }

    /**
     * Actualizar una solicitud
     */
    async updateSolicitud(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de solicitud inválido"
                });
                return;
            }

            const updateData: any = {};
            
            if (req.body.cantidad !== undefined) {
                updateData.cantidad = parseInt(req.body.cantidad);
            }
            if (req.body.fecha !== undefined) {
                updateData.fecha = new Date(req.body.fecha);
            }
            if (req.body.id_estado_solicitud !== undefined) {
                updateData.id_estado_solicitud = parseInt(req.body.id_estado_solicitud);
            }

            const updated = await this.solicitudApplication.updateSolicitud(id, updateData);

            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: "Solicitud no encontrada"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Solicitud actualizada exitosamente"
            });
        } catch (error) {
            console.error("Error en controlador al actualizar solicitud:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al actualizar solicitud"
            });
        }
    }

    /**
     * Eliminar una solicitud
     */
    async deleteSolicitud(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de solicitud inválido"
                });
                return;
            }

            const deleted = await this.solicitudApplication.deleteSolicitud(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Solicitud no encontrada"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Solicitud eliminada exitosamente"
            });
        } catch (error) {
            console.error("Error en controlador al eliminar solicitud:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }
    }

    /**
     * Obtener todas las solicitudes
     */
    async getAllSolicitudes(req: Request, res: Response): Promise<void> {
        try {
            const solicitudes = await this.solicitudApplication.getAllSolicitudes();
            res.status(200).json({
                success: true,
                message: "Solicitudes obtenidas exitosamente",
                data: solicitudes
            });
        } catch (error) {
            console.error("Error en controlador al obtener solicitudes:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }
    }

    /**
     * Obtener una solicitud por ID
     */
    async getSolicitudById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de solicitud inválido"
                });
                return;
            }

            const solicitud = await this.solicitudApplication.getSolicitudById(id);
            
            if (!solicitud) {
                res.status(404).json({
                    success: false,
                    message: "Solicitud no encontrada"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Solicitud obtenida exitosamente",
                data: solicitud
            });
        } catch (error) {
            console.error("Error en controlador al obtener solicitud por ID:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }
    }

    /**
     * Obtener solicitudes por usuario
     */
    async getSolicitudesByUsuario(req: Request, res: Response): Promise<void> {
        try {
            const id_usuario = parseInt(req.params.id_usuario);
            
            if (isNaN(id_usuario)) {
                res.status(400).json({
                    success: false,
                    message: "ID de usuario inválido"
                });
                return;
            }

            const solicitudes = await this.solicitudApplication.getSolicitudesByUsuario(id_usuario);
            res.status(200).json({
                success: true,
                message: "Solicitudes del usuario obtenidas exitosamente",
                data: solicitudes
            });
        } catch (error) {
            console.error("Error en controlador al obtener solicitudes por usuario:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }
    }

    /**
     * Obtener solicitudes por publicación
     */
    async getSolicitudesByPublicacion(req: Request, res: Response): Promise<void> {
        try {
            const id_publicacion = parseInt(req.params.id_publicacion);
            
            if (isNaN(id_publicacion)) {
                res.status(400).json({
                    success: false,
                    message: "ID de publicación inválido"
                });
                return;
            }

            const solicitudes = await this.solicitudApplication.getSolicitudesByPublicacion(id_publicacion);
            res.status(200).json({
                success: true,
                message: "Solicitudes de la publicación obtenidas exitosamente",
                data: solicitudes
            });
        } catch (error) {
            console.error("Error en controlador al obtener solicitudes por publicación:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }
    }

    /**
     * Obtener solicitudes por estado
     */
    async getSolicitudesByEstado(req: Request, res: Response): Promise<void> {
        try {
            const id_estado = parseInt(req.params.id_estado);
            
            if (isNaN(id_estado)) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado inválido"
                });
                return;
            }

            const solicitudes = await this.solicitudApplication.getSolicitudesByEstado(id_estado);
            res.status(200).json({
                success: true,
                message: "Solicitudes por estado obtenidas exitosamente",
                data: solicitudes
            });
        } catch (error) {
            console.error("Error en controlador al obtener solicitudes por estado:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }
    }

    /**
     * Cambiar estado de una solicitud
     */
    async cambiarEstadoSolicitud(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { nuevo_estado } = req.body;
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de solicitud inválido"
                });
                return;
            }

            if (!nuevo_estado) {
                res.status(400).json({
                    success: false,
                    message: "El nuevo estado es requerido"
                });
                return;
            }

            const updated = await this.solicitudApplication.cambiarEstadoSolicitud(id, parseInt(nuevo_estado));

            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: "Solicitud no encontrada"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Estado de solicitud cambiado exitosamente"
            });
        } catch (error) {
            console.error("Error en controlador al cambiar estado de solicitud:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al cambiar estado de solicitud"
            });
        }
    }

    /**
     * Aceptar una solicitud
     */
    async aceptarSolicitud(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de solicitud inválido"
                });
                return;
            }

            const updated = await this.solicitudApplication.aceptarSolicitud(id);

            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: "Solicitud no encontrada"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Solicitud aceptada exitosamente"
            });
        } catch (error) {
            console.error("Error en controlador al aceptar solicitud:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al aceptar solicitud"
            });
        }
    }

    /**
     * Rechazar una solicitud
     */
    async rechazarSolicitud(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de solicitud inválido"
                });
                return;
            }

            const updated = await this.solicitudApplication.rechazarSolicitud(id);

            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: "Solicitud no encontrada"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Solicitud rechazada exitosamente"
            });
        } catch (error) {
            console.error("Error en controlador al rechazar solicitud:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al rechazar solicitud"
            });
        }
    }

    /**
     * Cancelar una solicitud
     */
    async cancelarSolicitud(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de solicitud inválido"
                });
                return;
            }

            const updated = await this.solicitudApplication.cancelarSolicitud(id);

            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: "Solicitud no encontrada"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Solicitud cancelada exitosamente"
            });
        } catch (error) {
            console.error("Error en controlador al cancelar solicitud:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al cancelar solicitud"
            });
        }
    }
}