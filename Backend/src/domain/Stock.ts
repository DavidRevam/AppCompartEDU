export interface Stock{
    id: number;
    cantidadTotal: number;
    cantidadReservada: number;
    cantidadDisponible: number;
    estado: number; // 1 = activo, 0 = inactivo
    idPublicacion: number;
}