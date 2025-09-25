import { Publicacion } from '../../domain/Publicacion';
import { PublicacionPort } from '../../domain/PublicacionPort';
import { PublicacionEntity } from '../entities/PublicacionEntity';
import { AppDataSource } from '../config/con_data_base';
import { Repository } from 'typeorm';
import { UserEntity } from "../entities/UserEntity";


export class PublicacionAdapter implements PublicacionPort {

    private publicacionRepository: Repository<PublicacionEntity>;

    constructor() {
        this.publicacionRepository = AppDataSource.getRepository(PublicacionEntity);
    }

    private toDomain(publi: PublicacionEntity): Publicacion {
        return {
            id: publi.id_publicacion,
            titulo: publi.titulo_publicacion,
            descripcion: publi.descripcion_publicacion,
            fecha: publi.fecha_publicacion,
            publicacion_activo: publi.estado_publi_activa, // 1 = activo, 0 = inactivo
            id_usuario: publi.usuario.id_usuario,
            usuario: publi.usuario ? {
                id: publi.usuario.id_usuario,
                nombre: publi.usuario.nombre_usuario,
                apellido: publi.usuario.apellido_usuario,
                telefono: publi.usuario.telefono_usuario,
                password: publi.usuario.password_usuario,
                email: publi.usuario.email_usuario,
                usuario_activo: publi.usuario.estado_usu_activo
            } : undefined
        }
    }

    private toEntity(publi: Omit<Publicacion, 'id'>): PublicacionEntity {
        const publicacionEntity = new PublicacionEntity();
        publicacionEntity.titulo_publicacion = publi.titulo;
        publicacionEntity.descripcion_publicacion = publi.descripcion;
        publicacionEntity.fecha_publicacion = publi.fecha;
        publicacionEntity.estado_publi_activa = publi.publicacion_activo;

        const userEntity = new UserEntity();
        userEntity.id_usuario = publi.id_usuario;
        publicacionEntity.usuario = userEntity;

        return publicacionEntity;
    }

    async createPublicacion(publi: Omit<Publicacion, "id">): Promise<number> {
        try {
            const newPublicacion = this.toEntity(publi);
            const savedPublicacion = await this.publicacionRepository.save(newPublicacion);
            return savedPublicacion.id_publicacion;
        } catch (error) {
            console.error("Error al crear publicacion", error);
            throw new Error("Error al crear publicacion");
        }
    }

    async updatePublicacion(id: number, publi: Partial<Publicacion>): Promise<boolean> {
        try {
            const existingPublicacion = await this.publicacionRepository.findOne({ where: { id_publicacion: id } });
            if (!existingPublicacion) {
                throw new Error("Publicacion no encontrada");
            }

            Object.assign(existingPublicacion, {
                titulo_publicacion: publi.titulo ?? existingPublicacion.titulo_publicacion,
                descripcion_publicacion: publi.descripcion ?? existingPublicacion.descripcion_publicacion,
                estado_publi_activa: publi.publicacion_activo ?? existingPublicacion.estado_publi_activa
            });

            await this.publicacionRepository.save(existingPublicacion);
            return true;
        } catch (error) {
            console.error("Error al actualizar la publicacion", error);
            throw new Error("Error al actualizar la publicacion");
        }

    }


    async deletePublicacion(id: number): Promise<boolean> {

        try {
            const existingPublicacion = await this.publicacionRepository.findOne({ where: { id_publicacion: id } });
            if (!existingPublicacion) {
                throw new Error("Publicacion no encontrada");
            }
            Object.assign(existingPublicacion, {
                estado_publi_activa: 0
            });
            await this.publicacionRepository.save(existingPublicacion);
            return true;

        } catch (error) {
            console.error("Error al eliminar la publicacion", error);
            throw new Error("Error al eliminar la publicacion");
        }
    }


    async getAllPublicaciones(): Promise<Publicacion[]> {
        try {
            const publicaciones = await this.publicacionRepository.find({ 
                where: { estado_publi_activa: 1 }, // Solo publicaciones activas
                relations: ["usuario"] 
            });
            return publicaciones.map(this.toDomain);
        } catch (error) {
            console.error("Error al obtener todas las publicaciones", error);
            throw new Error("Error al obtener todas las publicaciones");
        }
    }

    async getPublicacionById(id: number): Promise<Publicacion | null> {
        try {
            const publicacion = await this.publicacionRepository.findOne({ where: { id_publicacion: id }, relations: ["usuario"] });
            return publicacion ? this.toDomain(publicacion) : null;
        } catch (error) {
            console.error("Error al obtener la publicacion por id", error);
            throw new Error("Error al obtener la publicacion por id");
        }
    }

    async getPublicacionByUserId(id_usuario: number): Promise<Publicacion[]> {
        try {
            const publicaciones = await this.publicacionRepository.find({
                where: { 
                    usuario: { id_usuario },
                    estado_publi_activa: 1 // Solo publicaciones activas
                }, 
                relations: ["usuario"]
            });

            return publicaciones.map(this.toDomain);
        } catch (error) {
            console.error("Error al obtener publicaciones por usuario", error);
            throw new Error("Error al obtener publicaciones por usuario");
        }
    }

    async updatePublicacionesByUserId(id_usuario: number, data: Partial<Publicacion>): Promise<boolean> {
        try {
            await this.publicacionRepository.update(
                { usuario: { id_usuario } }, // condición WHERE
                { estado_publi_activa: data.publicacion_activo } // valores a actualizar
            );
            return true;
        } catch (error) {
            console.error("Error al actualizar publicaciones por usuario", error);
            throw new Error("Error al actualizar publicaciones por usuario");
        }
    }



}