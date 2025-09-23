import { Solicitud } from "./Solicitud";

export interface SolicitudPort {
    createSolicitud(solicitud: Omit<Solicitud, "id">): Promise<number>;
    updateSolicitud(id: number, solicitud: Partial<Solicitud>): Promise<boolean>;
    deleteSolicitud(id: number): Promise<boolean>;
    getAllSolicitudes(): Promise<Solicitud[]>;
    getSolicitudById(id: number): Promise<Solicitud | null>;
    getSolicitudesByUsuario(id_usuario: number): Promise<Solicitud[]>;
    getSolicitudesByPublicacion(id_publicacion: number): Promise<Solicitud[]>;
    getSolicitudesByEstado(id_estado_solicitud: number): Promise<Solicitud[]>;
    // Método para cambiar estado de solicitud (eliminado lógico)
    cambiarEstadoSolicitud(id: number, nuevo_estado: number): Promise<boolean>;
}