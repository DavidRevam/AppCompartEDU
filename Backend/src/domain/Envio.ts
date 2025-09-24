// Interfaz para el modelo de envío
export interface Envio {
    id: number;
    direccion: string;
    barrio: string;
    localidad: string;
    solicitudId: number;
}