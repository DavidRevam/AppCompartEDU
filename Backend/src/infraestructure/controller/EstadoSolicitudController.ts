import { Request, Response } from "express";
import { EstadoSolicitudApplication } from "../../application/EstadoSolicitudApplication";

export class EstadoSolicitudController {
    constructor(private estadoSolicitudApplication: EstadoSolicitudApplication) {}

    /**
     * Obtener todos los estados de solicitud
     */
    async getAllEstadosSolicitud(req: Request, res: Response): Promise<void> {
        try {
            const estados = await this.estadoSolicitudApplication.getAllEstadosSolicitud();
            res.status(200).json({
                success: true,
                message: "Estados de solicitud obtenidos exitosamente",
                data: estados
            });
        } catch (error) {
            console.error("Error en controlador al obtener estados de solicitud:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido"
            });
        }
    }

    /**
     * Obtener un estado de solicitud por ID
     */
    async getEstadoSolicitudById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado de solicitud inválido"
                });
                return;
            }

            const estado = await this.estadoSolicitudApplication.getEstadoSolicitudById(id);
            
            if (!estado) {
                res.status(404).json({
                    success: false,
                    message: "Estado de solicitud no encontrado"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Estado de solicitud obtenido exitosamente",
                data: estado
            });
        } catch (error) {
            console.error("Error en controlador al obtener estado de solicitud por ID:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido"
            });
        }
    }
}