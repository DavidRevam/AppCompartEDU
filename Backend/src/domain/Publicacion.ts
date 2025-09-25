import { User } from './User';

export interface Publicacion{
    id: number; 
    titulo: string;
    descripcion: string;
    fecha: Date;
    publicacion_activo: number; // 1 = activo, 0 = inactivo
    id_usuario: number;
    usuario?: User; // Información completa del usuario
}