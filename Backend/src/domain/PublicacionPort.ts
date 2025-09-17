import { Publicacion } from "./Publicacion";

export interface PublicacionPort{
    createPublicacion(publi: Omit<Publicacion, "id">): Promise<number>;
    updatePublicacion(id: number, publi: Partial<Publicacion>): Promise<boolean>;
    deletePublicacion(id: number): Promise<boolean>;
    getAllPublicaciones(): Promise<Publicacion[]>;
    getPublicacionById(id: number): Promise<Publicacion | null>;
    getPublicacionByUserId(id_usuario: number): Promise<Publicacion[]>;
}


