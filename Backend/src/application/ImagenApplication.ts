import { Imagen } from "../domain/Imagen";
import { ImagenPort } from "../domain/ImagenPort";
import { PublicacionPort } from "../domain/PublicacionPort";

export class ImagenApplication {
    constructor(
        private imagenPort: ImagenPort,
        private publicacionPort: PublicacionPort
    ) {}

    async createImagen(imagen: Omit<Imagen, "id">): Promise<number> {
        // Validar que la URL no esté vacía
        if (!imagen.url || imagen.url.trim() === "") {
            throw new Error("La URL de la imagen es requerida");
        }

        // Validar que la publicación exista
        const publicacionExiste = await this.publicacionPort.getPublicacionById(imagen.idPublicacion);
        if (!publicacionExiste) {
            throw new Error("La publicación especificada no existe");
        }

        // Validar formato de URL básico
        if (!this.isValidUrl(imagen.url)) {
            throw new Error("La URL de la imagen no tiene un formato válido");
        }

        return await this.imagenPort.createImagen(imagen);
    }

    async updateImagen(id: number, imagen: Partial<Imagen>): Promise<boolean> {
        // Verificar que la imagen existe
        const imagenExistente = await this.imagenPort.getImagenById(id);
        if (!imagenExistente) {
            throw new Error("La imagen especificada no existe");
        }

        // Validar URL si se está actualizando
        if (imagen.url !== undefined) {
            if (!imagen.url || imagen.url.trim() === "") {
                throw new Error("La URL de la imagen es requerida");
            }
            if (!this.isValidUrl(imagen.url)) {
                throw new Error("La URL de la imagen no tiene un formato válido");
            }
        }

        // Validar publicación si se está actualizando
        if (imagen.idPublicacion !== undefined) {
            const publicacionExiste = await this.publicacionPort.getPublicacionById(imagen.idPublicacion);
            if (!publicacionExiste) {
                throw new Error("La publicación especificada no existe");
            }
        }

        return await this.imagenPort.updateImagen(id, imagen);
    }

    async deleteImagen(id: number): Promise<boolean> {
        // Verificar que la imagen existe
        const imagenExistente = await this.imagenPort.getImagenById(id);
        if (!imagenExistente) {
            throw new Error("La imagen especificada no existe");
        }

        return await this.imagenPort.deleteImagen(id);
    }

    async getAllImagenes(): Promise<Imagen[]> {
        return await this.imagenPort.getAllImagenes();
    }

    async getImagenById(id: number): Promise<Imagen | null> {
        if (id <= 0) {
            throw new Error("El ID de la imagen debe ser un número positivo");
        }

        return await this.imagenPort.getImagenById(id);
    }

    async getImagenesByPublicacionId(idPublicacion: number): Promise<Imagen[]> {
        if (idPublicacion <= 0) {
            throw new Error("El ID de la publicación debe ser un número positivo");
        }

        // Verificar que la publicación existe
        const publicacionExiste = await this.publicacionPort.getPublicacionById(idPublicacion);
        if (!publicacionExiste) {
            throw new Error("La publicación especificada no existe");
        }

        return await this.imagenPort.getImagenesByPublicacionId(idPublicacion);
    }

    // Método para crear múltiples imágenes para una publicación
    async createImagenesForPublicacion(idPublicacion: number, urls: string[]): Promise<number[]> {
        // Validar que la publicación existe
        const publicacionExiste = await this.publicacionPort.getPublicacionById(idPublicacion);
        if (!publicacionExiste) {
            throw new Error("La publicación especificada no existe");
        }

        // Validar que hay URLs
        if (!urls || urls.length === 0) {
            throw new Error("Se requiere al menos una URL de imagen");
        }

        // Validar todas las URLs
        for (const url of urls) {
            if (!url || url.trim() === "") {
                throw new Error("Todas las URLs de imagen son requeridas");
            }
            if (!this.isValidUrl(url)) {
                throw new Error(`La URL "${url}" no tiene un formato válido`);
            }
        }

        // Crear todas las imágenes
        const imagenesIds: number[] = [];
        for (const url of urls) {
            const imagenId = await this.imagenPort.createImagen({
                url: url.trim(),
                idPublicacion
            });
            imagenesIds.push(imagenId);
        }

        return imagenesIds;
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            // También aceptar URLs relativas o paths simples
            return url.includes('.') && (url.includes('/') || url.includes('\\'));
        }
    }
}