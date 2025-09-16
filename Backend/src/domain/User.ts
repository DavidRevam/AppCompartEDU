//interfaz para el modelo de usuario
export interface User{
    id: number;
    nombre: string;
    apellido: string;
    telefono: string;
    password: string;
    email: string;
    usuario_activo: number; // 1 = activo, 0 = inactivo
}