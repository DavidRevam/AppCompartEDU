import { Repository } from "typeorm";
import { Imagen } from "../../domain/Imagen";
import { ImagenPort } from "../../domain/ImagenPort";
import { ImagenEntity } from "../entities/ImagenEntity";
import { AppDataSource } from "../config/con_data_base";
import { PublicacionEntity } from '../entities/PublicacionEntity';

export class ImagenAdapter implements ImagenPort {
    private imagenRepository: Repository<ImagenEntity>;

    constructor() {
        this.imagenRepository = AppDataSource.getRepository(ImagenEntity);
    }

    // Conversión de entidad a dominio
    private toDomain(imagen: ImagenEntity): Imagen {
        return {
            id: imagen.id_imagen,
            url: imagen.url_imagen,
            idPublicacion: imagen.id_publicacion,
        };
    }

    // Conversión de dominio a entidad
    private toEntity(imagen: Omit<Imagen, "id">): ImagenEntity {
        const imagenEntity = new ImagenEntity();
        imagenEntity.url_imagen = imagen.url;
        imagenEntity.id_publicacion = imagen.idPublicacion;
        return imagenEntity;
    }

    async createImagen(imagen: Omit<Imagen, "id">): Promise<number> {
        try {
            const imagenEntity = this.toEntity(imagen);
            const savedImagen = await this.imagenRepository.save(imagenEntity);
            return savedImagen.id_imagen;
        } catch (error) {
            throw new Error(`Error al crear imagen: ${error}`);
        }
    }

    async updateImagen(id: number, imagen: Partial<Imagen>): Promise<boolean> {
        try {
            const updateData: any = {};
            if (imagen.url !== undefined) {
                updateData.url_imagen = imagen.url;
            }
            if (imagen.idPublicacion !== undefined) {
                updateData.id_publicacion = imagen.idPublicacion;
            }

            const result = await this.imagenRepository.update(id, updateData);
            return result.affected !== undefined && result.affected !== null && result.affected > 0;
        } catch (error) {
            throw new Error(`Error al actualizar imagen: ${error}`);
        }
    }

    async deleteImagen(id: number): Promise<boolean> {
        try {
            const result = await this.imagenRepository.delete(id);
            return result.affected !== undefined && result.affected !== null && result.affected > 0;
        } catch (error) {
            throw new Error(`Error al eliminar imagen: ${error}`);
        }
    }

    async getAllImagenes(): Promise<Imagen[]> {
        try {
            const imagenes = await this.imagenRepository.find({
                relations: ["publicacion"]
            });
            return imagenes.map(imagen => this.toDomain(imagen));
        } catch (error) {
            throw new Error(`Error al obtener todas las imágenes: ${error}`);
        }
    }

    async getImagenById(id: number): Promise<Imagen | null> {
        try {
            const imagen = await this.imagenRepository.findOne({
                where: { id_imagen: id },
                relations: ["publicacion"]
            });
            return imagen ? this.toDomain(imagen) : null;
        } catch (error) {
            throw new Error(`Error al obtener imagen por ID: ${error}`);
        }
    }

    async getImagenesByPublicacionId(idPublicacion: number): Promise<Imagen[]> {
        try {
            const imagenes = await this.imagenRepository.find({
                where: { id_publicacion: idPublicacion },
                relations: ["publicacion"]
            });
            return imagenes.map(imagen => this.toDomain(imagen));
        } catch (error) {
            throw new Error(`Error al obtener imágenes por publicación: ${error}`);
        }
    }
}