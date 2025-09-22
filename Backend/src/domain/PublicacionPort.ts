import { Publicacion } from "./Publicacion";

export interface PublicacionPort{
    createPublicacion(publi: Omit<Publicacion, "id">): Promise<number>;
    updatePublicacion(id: number, publi: Partial<Publicacion>): Promise<boolean>;
    deletePublicacion(id: number): Promise<boolean>;
    getAllPublicaciones(): Promise<Publicacion[]>;
    getPublicacionById(id: number): Promise<Publicacion | null>;
    getPublicacionByUserId(id_usuario: number): Promise<Publicacion[]>;
    //Agregado para cambio de todas las publicaciones de un usuario
    updatePublicacionesByUserId(id_usuario: number, data: Partial<Publicacion>): Promise<boolean>;
}


