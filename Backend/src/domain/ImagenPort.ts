import { Imagen } from "./Imagen";

export interface ImagenPort {
    createImagen(imagen: Omit<Imagen, "id">): Promise<number>;
    updateImagen(id: number, imagen: Partial<Imagen>): Promise<boolean>;
    deleteImagen(id: number): Promise<boolean>;
    getAllImagenes(): Promise<Imagen[]>;
    getImagenById(id: number): Promise<Imagen | null>;
    getImagenesByPublicacionId(idPublicacion: number): Promise<Imagen[]>;
}