import { Repository } from "typeorm";
import { Solicitud } from "../../domain/Solicitud";
import { SolicitudPort, SolicitudCompleta } from "../../domain/SolicitudPort";
import { SolicitudEntity } from "../entities/SolicitudEntity";
import { AppDataSource } from "../config/con_data_base";
import { UserEntity } from "../entities/UserEntity";
import { PublicacionEntity } from "../entities/PublicacionEntity";
import { EstadoSolicitudEntity } from "../entities/EstadoSolicitudEntity";

export class SolicitudAdapter implements SolicitudPort {
    private solicitudRepository: Repository<SolicitudEntity>;

    constructor() {
        this.solicitudRepository = AppDataSource.getRepository(SolicitudEntity);
    }

    // Conversión de entidad a dominio
    private toDomain(solicitud: SolicitudEntity): Solicitud {
        return {
            id: solicitud.id_solicitud,
            cantidad: solicitud.cantidad_solicitud,
            fecha: solicitud.fecha_solicitud,
            id_estado_solicitud: solicitud.estadoSolicitud.id_estado_solicitud,
            id_usuario: solicitud.usuario.id_usuario,
            id_publicacion: solicitud.publicacion.id_publicacion,
            // Incluir datos completos de las relaciones
            usuario: solicitud.usuario ? {
                id: solicitud.usuario.id_usuario,
                nombre: solicitud.usuario.nombre_usuario,
                apellido: solicitud.usuario.apellido_usuario,
                email: solicitud.usuario.email_usuario,
                telefono: solicitud.usuario.telefono_usuario,
                password: solicitud.usuario.password_usuario,
                usuario_activo: solicitud.usuario.estado_usu_activo
            } : undefined,
            publicacion: solicitud.publicacion ? {
                id: solicitud.publicacion.id_publicacion,
                titulo: solicitud.publicacion.titulo_publicacion,
                descripcion: solicitud.publicacion.descripcion_publicacion,
                fecha: solicitud.publicacion.fecha_publicacion,
                publicacion_activo: solicitud.publicacion.estado_publi_activa,
                id_usuario: solicitud.publicacion.usuario.id_usuario,
                usuario: solicitud.publicacion.usuario ? {
                    id: solicitud.publicacion.usuario.id_usuario,
                    nombre: solicitud.publicacion.usuario.nombre_usuario,
                    apellido: solicitud.publicacion.usuario.apellido_usuario,
                    email: solicitud.publicacion.usuario.email_usuario,
                    telefono: solicitud.publicacion.usuario.telefono_usuario,
                    password: solicitud.publicacion.usuario.password_usuario,
                    usuario_activo: solicitud.publicacion.usuario.estado_usu_activo
                } : undefined
            } : undefined,
            estadoSolicitud: solicitud.estadoSolicitud ? {
                id: solicitud.estadoSolicitud.id_estado_solicitud,
                descripcion: solicitud.estadoSolicitud.descripcion_estado
            } : undefined
        };
    }

    // Conversión de dominio a entidad
    private toEntity(solicitud: Omit<Solicitud, "id">): SolicitudEntity {
        const solicitudEntity = new SolicitudEntity();
        solicitudEntity.cantidad_solicitud = solicitud.cantidad;
        solicitudEntity.fecha_solicitud = solicitud.fecha;

        // Crear las entidades relacionadas
        const estadoEntity = new EstadoSolicitudEntity();
        estadoEntity.id_estado_solicitud = solicitud.id_estado_solicitud;
        solicitudEntity.estadoSolicitud = estadoEntity;

        const userEntity = new UserEntity();
        userEntity.id_usuario = solicitud.id_usuario;
        solicitudEntity.usuario = userEntity;

        const publicacionEntity = new PublicacionEntity();
        publicacionEntity.id_publicacion = solicitud.id_publicacion;
        solicitudEntity.publicacion = publicacionEntity;

        return solicitudEntity;
    }

    async createSolicitud(solicitud: Omit<Solicitud, "id">): Promise<number> {
        try {
            const newSolicitud = this.toEntity(solicitud);
            const savedSolicitud = await this.solicitudRepository.save(newSolicitud);
            return savedSolicitud.id_solicitud;
        } catch (error) {
            console.error("Error al crear solicitud", error);
            throw new Error("Error al crear solicitud");
        }
    }

    async updateSolicitud(id: number, solicitud: Partial<Solicitud>): Promise<boolean> {
        try {
            const updateData: any = {};
            
            if (solicitud.cantidad !== undefined) {
                updateData.cantidad_solicitud = solicitud.cantidad;
            }
            if (solicitud.fecha !== undefined) {
                updateData.fecha_solicitud = solicitud.fecha;
            }
            if (solicitud.id_estado_solicitud !== undefined) {
                updateData.estadoSolicitud = { id_estado_solicitud: solicitud.id_estado_solicitud };
            }

            const result = await this.solicitudRepository.update(id, updateData);
            return (result.affected ?? 0) > 0;
        } catch (error) {
            console.error("Error al actualizar solicitud", error);
            throw new Error("Error al actualizar solicitud");
        }
    }

    async deleteSolicitud(id: number): Promise<boolean> {
        try {
            // Eliminado lógico: cambiar estado a "Cancelada" (id = 4)
            const result = await this.solicitudRepository.update(id, {
                estadoSolicitud: { id_estado_solicitud: 4 } // Estado "Cancelada"
            });
            return (result.affected ?? 0) > 0;
        } catch (error) {
            console.error("Error al cancelar solicitud", error);
            throw new Error("Error al cancelar solicitud");
        }
    }

    async getAllSolicitudes(): Promise<Solicitud[]> {
        try {
            const solicitudes = await this.solicitudRepository.find({
                relations: ["estadoSolicitud", "usuario", "publicacion", "publicacion.usuario"]
            });
            return solicitudes.map(this.toDomain);
        } catch (error) {
            console.error("Error al obtener todas las solicitudes", error);
            throw new Error("Error al obtener todas las solicitudes");
        }
    }

    async getSolicitudById(id: number): Promise<Solicitud | null> {
        try {
            const solicitud = await this.solicitudRepository.findOne({
                where: { id_solicitud: id },
                relations: ["estadoSolicitud", "usuario", "publicacion", "publicacion.usuario"]
            });
            return solicitud ? this.toDomain(solicitud) : null;
        } catch (error) {
            console.error("Error al obtener solicitud por ID", error);
            throw new Error("Error al obtener solicitud por ID");
        }
    }

    async getSolicitudesByUsuario(id_usuario: number): Promise<Solicitud[]> {
        try {
            const solicitudes = await this.solicitudRepository.find({
                where: { usuario: { id_usuario } },
                relations: ["estadoSolicitud", "usuario", "publicacion", "publicacion.usuario"]
            });
            return solicitudes.map(this.toDomain);
        } catch (error) {
            console.error("Error al obtener solicitudes por usuario", error);
            throw new Error("Error al obtener solicitudes por usuario");
        }
    }

    async getSolicitudesByPublicacion(id_publicacion: number): Promise<Solicitud[]> {
        try {
            const solicitudes = await this.solicitudRepository.find({
                where: { publicacion: { id_publicacion } },
                relations: ["estadoSolicitud", "usuario", "publicacion", "publicacion.usuario"]
            });
            return solicitudes.map(this.toDomain);
        } catch (error) {
            console.error("Error al obtener solicitudes por publicación", error);
            throw new Error("Error al obtener solicitudes por publicación");
        }
    }

    async getSolicitudesByEstado(id_estado_solicitud: number): Promise<Solicitud[]> {
        try {
            const solicitudes = await this.solicitudRepository.find({
                where: { estadoSolicitud: { id_estado_solicitud } },
                relations: ["estadoSolicitud", "usuario", "publicacion", "publicacion.usuario"]
            });
            return solicitudes.map(this.toDomain);
        } catch (error) {
            console.error("Error al obtener solicitudes por estado", error);
            throw new Error("Error al obtener solicitudes por estado");
        }
    }

    async cambiarEstadoSolicitud(id: number, nuevo_estado: number): Promise<boolean> {
        try {
            const result = await this.solicitudRepository.update(id, { 
                estadoSolicitud: { id_estado_solicitud: nuevo_estado } 
            });
            return result.affected !== undefined && result.affected > 0;
        } catch (error) {
            console.error("Error al cambiar estado de solicitud", error);
            throw new Error("Error al cambiar estado de solicitud");
        }
    }

    async cancelarSolicitudesByUsuario(id_usuario: number): Promise<boolean> {
        try {
            const result = await this.solicitudRepository.update(
                { usuario: { id_usuario } },
                { estadoSolicitud: { id_estado_solicitud: 4 } } // 4 = Cancelada
            );
            return true; // Siempre retorna true, incluso si no hay solicitudes que actualizar
        } catch (error) {
            console.error("Error al cancelar solicitudes del usuario", error);
            throw new Error("Error al cancelar solicitudes del usuario");
        }
    }

    async getSolicitudesByPublicacionesDelUsuario(id_usuario: number): Promise<Solicitud[]> {
        try {
            const solicitudes = await this.solicitudRepository.find({
                where: { publicacion: { usuario: { id_usuario } } },
                relations: ["estadoSolicitud", "usuario", "publicacion", "publicacion.usuario"]
            });
            return solicitudes.map(this.toDomain);
        } catch (error) {
            console.error("Error al obtener solicitudes por publicaciones del usuario", error);
            throw new Error("Error al obtener solicitudes por publicaciones del usuario");
        }
    }

    async getSolicitudesCompletasByPublicacionesDelUsuario(id_usuario: number): Promise<SolicitudCompleta[]> {
        try {
            const solicitudes = await this.solicitudRepository.find({
                where: { publicacion: { usuario: { id_usuario } } },
                relations: ["estadoSolicitud", "usuario", "publicacion", "publicacion.usuario"]
            });
            
            return solicitudes.map(solicitud => ({
                id: solicitud.id_solicitud,
                cantidad: solicitud.cantidad_solicitud,
                fecha: solicitud.fecha_solicitud,
                id_estado_solicitud: solicitud.estadoSolicitud?.id_estado_solicitud || 0,
                id_usuario: solicitud.usuario?.id_usuario || 0,
                id_publicacion: solicitud.publicacion?.id_publicacion || 0,
                usuario: solicitud.usuario ? {
                    id: solicitud.usuario.id_usuario,
                    nombre: solicitud.usuario.nombre_usuario,
                    apellido: solicitud.usuario.apellido_usuario,
                    email: solicitud.usuario.email_usuario,
                    telefono: solicitud.usuario.telefono_usuario,
                    password: solicitud.usuario.password_usuario,
                    usuario_activo: solicitud.usuario.estado_usu_activo
                } : undefined,
                publicacion: solicitud.publicacion ? {
                    id: solicitud.publicacion.id_publicacion,
                    titulo: solicitud.publicacion.titulo_publicacion,
                    descripcion: solicitud.publicacion.descripcion_publicacion,
                    fecha: solicitud.publicacion.fecha_publicacion,
                    publicacion_activo: solicitud.publicacion.estado_publi_activa,
                    id_usuario: solicitud.publicacion.usuario?.id_usuario || 0,
                    usuario: solicitud.publicacion.usuario ? {
                        id: solicitud.publicacion.usuario.id_usuario,
                        nombre: solicitud.publicacion.usuario.nombre_usuario,
                        apellido: solicitud.publicacion.usuario.apellido_usuario,
                        email: solicitud.publicacion.usuario.email_usuario,
                        telefono: solicitud.publicacion.usuario.telefono_usuario,
                        password: solicitud.publicacion.usuario.password_usuario,
                        usuario_activo: solicitud.publicacion.usuario.estado_usu_activo
                    } : undefined
                } : undefined,
                estadoSolicitud: solicitud.estadoSolicitud ? {
                    id: solicitud.estadoSolicitud.id_estado_solicitud,
                    descripcion: solicitud.estadoSolicitud.descripcion_estado
                } : undefined
            }));
        } catch (error) {
            console.error("Error al obtener solicitudes completas por publicaciones del usuario", error);
            throw new Error("Error al obtener solicitudes completas por publicaciones del usuario");
        }
    }
}