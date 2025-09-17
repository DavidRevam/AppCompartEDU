import { Publicacion } from "../domain/Publicacion";
import { PublicacionPort } from "../domain/PublicacionPort";
import { UserPort } from '../domain/UserPort';
import { AuthApplication } from "./AuthApplication";

export class PublicacionApplication{
    private port: PublicacionPort;
    private userPort: UserPort;

    constructor(port: PublicacionPort, userPort: UserPort) {
        this.port = port;
        this.userPort = userPort;
    }

    async createPublicacion(publi: Omit<Publicacion, "id">): Promise<number>{
        //Existe el usuario?
        const existingUser = await this.userPort.getUserById(publi.id_usuario);
        if(!existingUser){
            throw new Error("El usuario asociado no existe");
        }
        return this.port.createPublicacion(publi);
    }

    async updatePublicacion(id: number, publi: Partial<Publicacion>): Promise<boolean>{
        const existingPublicacion = await this.port.getPublicacionById(id);
        if(!existingPublicacion){
            throw new Error ("La publicacion no existe, no se puede editar");
        }
        return this.port.updatePublicacion(id, publi);
    }

    async deletePublicacion(id: number): Promise<boolean>{
        const existingPublicacion = await this.port.getPublicacionById(id);
        if(!existingPublicacion){
            throw new Error ("La publicacion no existe, no se puede eliminar");
        }
        return this.port.deletePublicacion(id);
    }

    //Consultas GET 
    async getPublicacionById(id: number): Promise<Publicacion | null>{
        return this.port.getPublicacionById(id);
    }

    async getAllPublicaciones(): Promise<Publicacion[]>{
        return this.port.getAllPublicaciones();
    }

    async getPublicacionByUserId(id_usuario: number): Promise<Publicacion[]>{
        return this.port.getPublicacionByUserId(id_usuario);
    }




}
