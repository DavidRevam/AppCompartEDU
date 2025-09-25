import { Solicitud } from "./Solicitud";
import { User } from "./User";
import { Publicacion } from "./Publicacion";
import { EstadoSolicitud } from "./EstadoSolicitud";

export interface SolicitudCompleta {
    id: number;
    cantidad: number;
    fecha: Date;
    id_estado_solicitud: number;
    id_usuario: number;
    id_publicacion: number;
    usuario?: User;
    publicacion?: Publicacion;
    estadoSolicitud?: EstadoSolicitud;
}

export interface SolicitudPort {
    createSolicitud(solicitud: Omit<Solicitud, "id">): Promise<number>;
    updateSolicitud(id: number, solicitud: Partial<Solicitud>): Promise<boolean>;
    // Eliminado lógico: cambia el estado a "Cancelada" (id_estado_solicitud = 4)
    deleteSolicitud(id: number): Promise<boolean>;
    getAllSolicitudes(): Promise<Solicitud[]>;
    getSolicitudById(id: number): Promise<Solicitud | null>;
    getSolicitudesByUsuario(id_usuario: number): Promise<Solicitud[]>;
    getSolicitudesByPublicacion(id_publicacion: number): Promise<Solicitud[]>;
    getSolicitudesByEstado(id_estado_solicitud: number): Promise<Solicitud[]>;
    getSolicitudesByPublicacionesDelUsuario(id_usuario: number): Promise<Solicitud[]>;
    getSolicitudesCompletasByPublicacionesDelUsuario(id_usuario: number): Promise<SolicitudCompleta[]>;
    // Método para cambiar estado de solicitud (aceptar, rechazar, etc.)
    cambiarEstadoSolicitud(id: number, nuevo_estado: number): Promise<boolean>;
    // Cancelar todas las solicitudes de un usuario (eliminado lógico)
    cancelarSolicitudesByUsuario(id_usuario: number): Promise<boolean>;
}