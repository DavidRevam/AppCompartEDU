import { Solicitud } from "../domain/Solicitud";
import { SolicitudPort } from "../domain/SolicitudPort";

export class SolicitudApplication {
    constructor(private solicitudPort: SolicitudPort) {}

    async createSolicitud(solicitudData: Omit<Solicitud, "id">): Promise<number> {
        try {
            // Validaciones de negocio
            if (!solicitudData.cantidad || solicitudData.cantidad <= 0) {
                throw new Error("La cantidad debe ser mayor a 0");
            }

            if (!solicitudData.fecha) {
                throw new Error("La fecha de solicitud es requerida");
            }

            if (!solicitudData.id_estado_solicitud) {
                throw new Error("El estado de solicitud es requerido");
            }

            if (!solicitudData.id_usuario) {
                throw new Error("El usuario es requerido");
            }

            if (!solicitudData.id_publicacion) {
                throw new Error("La publicación es requerida");
            }

            return await this.solicitudPort.createSolicitud(solicitudData);
        } catch (error) {
            console.error("Error en aplicación al crear solicitud", error);
            throw error;
        }
    }

    async updateSolicitud(id: number, solicitudData: Partial<Solicitud>): Promise<boolean> {
        try {
            if (id <= 0) {
                throw new Error("ID de solicitud inválido");
            }

            // Validar cantidad si se está actualizando
            if (solicitudData.cantidad !== undefined && solicitudData.cantidad <= 0) {
                throw new Error("La cantidad debe ser mayor a 0");
            }

            return await this.solicitudPort.updateSolicitud(id, solicitudData);
        } catch (error) {
            console.error("Error en aplicación al actualizar solicitud", error);
            throw error;
        }
    }

    async deleteSolicitud(id: number): Promise<boolean> {
        try {
            if (id <= 0) {
                throw new Error("ID de solicitud inválido");
            }

            return await this.solicitudPort.deleteSolicitud(id);
        } catch (error) {
            console.error("Error en aplicación al eliminar solicitud", error);
            throw error;
        }
    }

    async getAllSolicitudes(): Promise<Solicitud[]> {
        try {
            return await this.solicitudPort.getAllSolicitudes();
        } catch (error) {
            console.error("Error en aplicación al obtener todas las solicitudes", error);
            throw new Error("Error al obtener todas las solicitudes");
        }
    }

    async getSolicitudById(id: number): Promise<Solicitud | null> {
        try {
            if (id <= 0) {
                throw new Error("ID de solicitud inválido");
            }

            return await this.solicitudPort.getSolicitudById(id);
        } catch (error) {
            console.error("Error en aplicación al obtener solicitud por ID", error);
            throw error;
        }
    }

    async getSolicitudesByUsuario(id_usuario: number): Promise<Solicitud[]> {
        try {
            if (id_usuario <= 0) {
                throw new Error("ID de usuario inválido");
            }

            return await this.solicitudPort.getSolicitudesByUsuario(id_usuario);
        } catch (error) {
            console.error("Error en aplicación al obtener solicitudes por usuario", error);
            throw error;
        }
    }

    async getSolicitudesByPublicacion(id_publicacion: number): Promise<Solicitud[]> {
        try {
            if (id_publicacion <= 0) {
                throw new Error("ID de publicación inválido");
            }

            return await this.solicitudPort.getSolicitudesByPublicacion(id_publicacion);
        } catch (error) {
            console.error("Error en aplicación al obtener solicitudes por publicación", error);
            throw error;
        }
    }

    async getSolicitudesByEstado(id_estado_solicitud: number): Promise<Solicitud[]> {
        try {
            if (id_estado_solicitud <= 0) {
                throw new Error("ID de estado de solicitud inválido");
            }

            return await this.solicitudPort.getSolicitudesByEstado(id_estado_solicitud);
        } catch (error) {
            console.error("Error en aplicación al obtener solicitudes por estado", error);
            throw error;
        }
    }

    async cambiarEstadoSolicitud(id: number, nuevo_estado: number): Promise<boolean> {
        try {
            if (id <= 0) {
                throw new Error("ID de solicitud inválido");
            }

            if (nuevo_estado <= 0) {
                throw new Error("ID de estado inválido");
            }

            // Verificar que la solicitud existe
            const solicitudExistente = await this.solicitudPort.getSolicitudById(id);
            if (!solicitudExistente) {
                throw new Error("La solicitud no existe");
            }

            return await this.solicitudPort.cambiarEstadoSolicitud(id, nuevo_estado);
        } catch (error) {
            console.error("Error en aplicación al cambiar estado de solicitud", error);
            throw error;
        }
    }

    // Método específico para cancelar una solicitud (cambiar a estado "Cancelada")
    async cancelarSolicitud(id: number): Promise<boolean> {
        try {
            // Asumiendo que el estado "Cancelada" tiene ID 4 según el INSERT inicial
            return await this.cambiarEstadoSolicitud(id, 4);
        } catch (error) {
            console.error("Error en aplicación al cancelar solicitud", error);
            throw error;
        }
    }

    // Método específico para aceptar una solicitud
    async aceptarSolicitud(id: number): Promise<boolean> {
        try {
            // Asumiendo que el estado "Aceptada" tiene ID 2 según el INSERT inicial
            return await this.cambiarEstadoSolicitud(id, 2);
        } catch (error) {
            console.error("Error en aplicación al aceptar solicitud", error);
            throw error;
        }
    }

    // Método específico para rechazar una solicitud
    async rechazarSolicitud(id: number): Promise<boolean> {
        try {
            // Asumiendo que el estado "Rechazada" tiene ID 3 según el INSERT inicial
            return await this.cambiarEstadoSolicitud(id, 3);
        } catch (error) {
            console.error("Error en aplicación al rechazar solicitud", error);
            throw error;
        }
    }
}