import { Solicitud } from "../domain/Solicitud";
import { SolicitudPort } from "../domain/SolicitudPort";
import { StockPort } from "../domain/StockPort";
import { PublicacionPort } from "../domain/PublicacionPort";

export class SolicitudApplication {
    constructor(
        private solicitudPort: SolicitudPort,
        private stockPort: StockPort,
        private publicacionPort: PublicacionPort
    ) {}

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

            // Verificar y actualizar stock
            const stock = await this.stockPort.getStockByPublicacionId(solicitudData.id_publicacion);
            if (!stock) {
                throw new Error("No se encontró stock para esta publicación");
            }

            if (stock.cantidadDisponible < solicitudData.cantidad) {
                throw new Error(`Stock insuficiente. Disponible: ${stock.cantidadDisponible}, Solicitado: ${solicitudData.cantidad}`);
            }

            // Crear la solicitud
            const solicitudId = await this.solicitudPort.createSolicitud(solicitudData);

            // Actualizar el stock: reducir cantidad disponible y aumentar cantidad reservada
            const nuevaCantidadDisponible = stock.cantidadDisponible - solicitudData.cantidad;
            const nuevaCantidadReservada = stock.cantidadReservada + solicitudData.cantidad;

            await this.stockPort.updateStock(stock.id, {
                cantidadDisponible: nuevaCantidadDisponible,
                cantidadReservada: nuevaCantidadReservada
            });

            // Actualizar el estado de la publicación basado en el nuevo stock
            await this.actualizarEstadoPublicacionPorStock(solicitudData.id_publicacion);

            return solicitudId;
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

    // Eliminado lógico: cambia el estado de la solicitud a "Cancelada"
    async deleteSolicitud(id: number): Promise<boolean> {
        try {
            if (id <= 0) {
                throw new Error("ID de solicitud inválido");
            }

            // Obtener la solicitud antes de eliminarla para recuperar el stock
            const solicitud = await this.solicitudPort.getSolicitudById(id);
            if (!solicitud) {
                throw new Error("Solicitud no encontrada");
            }

            // Verificar que la solicitud esté en estado "Pendiente" (1) para poder cancelarla
            if (solicitud.id_estado_solicitud !== 1) {
                throw new Error("Solo se pueden cancelar solicitudes en estado pendiente");
            }

            // Eliminar/cancelar la solicitud
            const deleted = await this.solicitudPort.deleteSolicitud(id);
            
            if (deleted) {
                // Recuperar el stock de la publicación
                const stock = await this.stockPort.getStockByPublicacionId(solicitud.id_publicacion);
                if (stock) {
                    const nuevaCantidadDisponible = stock.cantidadDisponible + solicitud.cantidad;
                    await this.stockPort.updateStock(stock.id, {
                        cantidadDisponible: nuevaCantidadDisponible
                    });

                    // Si el stock ahora es mayor a 0, reactivar la publicación
                    if (nuevaCantidadDisponible > 0) {
                        await this.publicacionPort.updatePublicacion(solicitud.id_publicacion, {
                            publicacion_activo: 1 // Reactivar la publicación
                        });
                    }
                }
            }

            return deleted;
        } catch (error) {
            console.error("Error en aplicación al cancelar solicitud", error);
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
            if (id <= 0) {
                throw new Error("ID de solicitud inválido");
            }

            // Obtener la solicitud antes de cancelarla para recuperar el stock
            const solicitud = await this.solicitudPort.getSolicitudById(id);
            if (!solicitud) {
                throw new Error("Solicitud no encontrada");
            }

            // Verificar que la solicitud esté en estado "Pendiente" (1) para poder cancelarla
            if (solicitud.id_estado_solicitud !== 1) {
                throw new Error("Solo se pueden cancelar solicitudes en estado pendiente");
            }

            // Cancelar la solicitud
            const cancelled = await this.solicitudPort.cambiarEstadoSolicitud(id, 4); // 4 = Cancelada
            
            if (cancelled) {
                // Recuperar el stock de la publicación
                const stock = await this.stockPort.getStockByPublicacionId(solicitud.id_publicacion);
                if (stock) {
                    const nuevaCantidadDisponible = stock.cantidadDisponible + solicitud.cantidad;
                    await this.stockPort.updateStock(stock.id, {
                        cantidadDisponible: nuevaCantidadDisponible
                    });

                    // Si el stock ahora es mayor a 0, reactivar la publicación
                    if (nuevaCantidadDisponible > 0) {
                        await this.publicacionPort.updatePublicacion(solicitud.id_publicacion, {
                            publicacion_activo: 1 // Reactivar la publicación
                        });
                    }
                }
            }

            return cancelled;
        } catch (error) {
            console.error("Error en aplicación al cancelar solicitud", error);
            throw error;
        }
    }

    async cancelarSolicitudesByUsuario(id_usuario: number): Promise<boolean> {
        try {
            if (id_usuario <= 0) {
                throw new Error("ID de usuario inválido");
            }

            return await this.solicitudPort.cancelarSolicitudesByUsuario(id_usuario);
        } catch (error) {
            console.error("Error en aplicación al cancelar solicitudes del usuario", error);
            throw error;
        }
    }

    // Método específico para aceptar una solicitud
    async aceptarSolicitud(id: number): Promise<boolean> {
        try {
            // Obtener la solicitud antes de aceptarla para manejar el stock
            const solicitud = await this.solicitudPort.getSolicitudById(id);
            if (!solicitud) {
                throw new Error("La solicitud no existe");
            }

            // Verificar que la solicitud esté en estado "Pendiente" (ID 1) para poder aceptarla
            if (!solicitud.estadoSolicitud || solicitud.estadoSolicitud.id !== 1) {
                throw new Error("Solo se pueden aceptar solicitudes en estado pendiente");
            }

            // Obtener el stock de la publicación
            const stock = await this.stockPort.getStockByPublicacionId(solicitud.id_publicacion);
            if (!stock) {
                throw new Error("No se encontró stock para esta publicación");
            }

            // Cambiar el estado de la solicitud a "Aceptada" (ID 2)
            const estadoCambiado = await this.cambiarEstadoSolicitud(id, 2);
            
            if (estadoCambiado) {
                // Al aceptar: reducir cantidad total y cantidad reservada (el stock ya estaba reservado)
                const nuevaCantidadTotal = stock.cantidadTotal - solicitud.cantidad;
                const nuevaCantidadReservada = stock.cantidadReservada - solicitud.cantidad;

                await this.stockPort.updateStock(stock.id, {
                    cantidadTotal: nuevaCantidadTotal >= 0 ? nuevaCantidadTotal : 0,
                    cantidadReservada: nuevaCantidadReservada >= 0 ? nuevaCantidadReservada : 0
                });

                console.log(`Stock actualizado para publicación ${solicitud.id_publicacion}: -${solicitud.cantidad} total y reservado`);
                
                // Actualizar el estado de la publicación basado en el nuevo stock
                await this.actualizarEstadoPublicacionPorStock(solicitud.id_publicacion);
            }

            return estadoCambiado;
        } catch (error) {
            console.error("Error en aplicación al aceptar solicitud", error);
            throw error;
        }
    }

    // Método específico para rechazar una solicitud
    async rechazarSolicitud(id: number): Promise<boolean> {
        try {
            // Obtener la solicitud antes de rechazarla para recuperar el stock
            const solicitud = await this.solicitudPort.getSolicitudById(id);
            if (!solicitud) {
                throw new Error("La solicitud no existe");
            }

            // Verificar que la solicitud esté en estado "Pendiente" (ID 1) para poder rechazarla
            if (!solicitud.estadoSolicitud || solicitud.estadoSolicitud.id !== 1) {
                throw new Error("Solo se pueden rechazar solicitudes en estado pendiente");
            }

            // Obtener el stock de la publicación
            const stock = await this.stockPort.getStockByPublicacionId(solicitud.id_publicacion);
            if (!stock) {
                throw new Error("No se encontró stock para esta publicación");
            }

            // Cambiar el estado de la solicitud a "Rechazada" (ID 3)
            const estadoCambiado = await this.cambiarEstadoSolicitud(id, 3);
            
            if (estadoCambiado) {
                // Recuperar el stock: aumentar cantidad disponible y reducir cantidad reservada
                const nuevaCantidadDisponible = stock.cantidadDisponible + solicitud.cantidad;
                const nuevaCantidadReservada = stock.cantidadReservada - solicitud.cantidad;

                await this.stockPort.updateStock(stock.id, {
                    cantidadDisponible: nuevaCantidadDisponible,
                    cantidadReservada: nuevaCantidadReservada >= 0 ? nuevaCantidadReservada : 0
                });

                console.log(`Stock recuperado para publicación ${solicitud.id_publicacion}: +${solicitud.cantidad} disponible`);
                
                // Actualizar el estado de la publicación basado en el nuevo stock
                await this.actualizarEstadoPublicacionPorStock(solicitud.id_publicacion);
            }

            return estadoCambiado;
        } catch (error) {
            console.error("Error en aplicación al rechazar solicitud", error);
            throw error;
        }
    }

    async getSolicitudesByPublicacionesDelUsuario(id_usuario: number): Promise<Solicitud[]> {
        try {
            if (id_usuario <= 0) {
                throw new Error("ID de usuario inválido");
            }

            return await this.solicitudPort.getSolicitudesByPublicacionesDelUsuario(id_usuario);
        } catch (error) {
            console.error("Error en aplicación al obtener solicitudes por publicaciones del usuario", error);
            throw error;
        }
    }

    // Método auxiliar para actualizar el estado de una publicación basado en su stock
    private async actualizarEstadoPublicacionPorStock(id_publicacion: number): Promise<void> {
        try {
            const stock = await this.stockPort.getStockByPublicacionId(id_publicacion);
            if (!stock) {
                console.warn(`No se encontró stock para la publicación ${id_publicacion}`);
                return;
            }

            // Determinar el nuevo estado basado en la cantidad disponible
            const nuevoEstado = stock.cantidadDisponible > 0 ? 1 : 0; // 1 = activo, 0 = inactivo

            // Actualizar el estado de la publicación
            await this.publicacionPort.updatePublicacion(id_publicacion, {
                publicacion_activo: nuevoEstado
            });

            console.log(`Publicación ${id_publicacion} ${nuevoEstado === 1 ? 'activada' : 'desactivada'} - Stock disponible: ${stock.cantidadDisponible}`);
        } catch (error) {
            console.error(`Error al actualizar estado de publicación ${id_publicacion}:`, error);
            // No lanzar el error para no interrumpir el flujo principal
        }
    }
}