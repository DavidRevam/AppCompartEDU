// Interfaz para el modelo de solicitud
export interface Solicitud {
    id: number;
    cantidad: number;
    fecha: Date;
    id_estado_solicitud: number;
    id_usuario: number;
    id_publicacion: number;
}