// Tipos para las entidades del backend

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  usuario_activo: number;
}

export interface Publicacion {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  publicacion_activo: number;
  usuario: User;
  stock?: Stock;
  imagenes?: Imagen[];
}

export interface Stock {
  id: number;
  cantidadTotal: number;
  cantidadReservada: number;
  cantidadDisponible: number;
  estado: number;
  idPublicacion: number;
}

export interface Imagen {
  id: number;
  url: string;
  idPublicacion: number;
}

export interface Solicitud {
  id: number;
  cantidadSolicitud: number;
  fechaSolicitud: string;
  estadoSolicitud: EstadoSolicitud;
  usuario: User;
  publicacion: Publicacion;
}

export interface EstadoSolicitud {
  id: number;
  descripcionEstado: string;
}

export interface Envio {
  id_envio: number;
  direccion_envio: string;
  barrio_envio: string;
  localidad_envio: string;
  id_solicitud: number;
}

// Tipos para formularios
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
}

export interface PublicacionForm {
  titulo: string;
  descripcion: string;
  id_usuario: number;
  cantidadTotal: number;
  cantidadDisponible?: number;
  cantidadReservada?: number;
  imagenes?: string[];
}

// Tipos para respuestas de API
export interface AuthResponse {
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}