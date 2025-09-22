import { Publicacion } from "../domain/Publicacion";
import { PublicacionPort } from "../domain/PublicacionPort";
import { UserPort } from '../domain/UserPort';
import { AuthApplication } from "./AuthApplication";
import { StockPort } from "../domain/StockPort";
import { Stock } from "../domain/Stock";

export class PublicacionApplication{
    private port: PublicacionPort;
    private userPort: UserPort;
    private stockPort: StockPort;

    constructor(port: PublicacionPort, userPort: UserPort, stockPort: StockPort) {
        this.port = port;
        this.userPort = userPort;
        this.stockPort = stockPort;
    }

    async createPublicacion(publi: Omit<Publicacion, "id">): Promise<number>{
        //Existe el usuario?
        const existingUser = await this.userPort.getUserById(publi.id_usuario);
        if(!existingUser){
            throw new Error("El usuario asociado no existe");
        }
        return this.port.createPublicacion(publi);
    }

    // Crear publicación con su stock asociado
    async createPublicacionWithStock(publi: Omit<Publicacion, "id">, stockData: Omit<Stock, "id" | "idPublicacion">): Promise<{ publicacionId: number; stockId: number }> {
        // Verificar que el usuario existe
        const existingUser = await this.userPort.getUserById(publi.id_usuario);
        if (!existingUser) {
            throw new Error("El usuario asociado no existe");
        }

        try {
            // Crear la publicación primero
            const publicacionId = await this.port.createPublicacion(publi);

            // Crear el stock asociado a la publicación
            const stockToCreate: Omit<Stock, "id"> = {
                ...stockData,
                idPublicacion: publicacionId
            };

            const stockId = await this.stockPort.createStock(stockToCreate);

            return { publicacionId, stockId };
        } catch (error) {
            // Si algo falla, podríamos implementar rollback aquí
            throw new Error(`Error al crear publicación con stock: ${error}`);
        }
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

    async updatePublicacionesByUserId(id_usuario: number, data: Partial<Publicacion>): Promise<boolean>{
        // Validación de negocio: Verificar que el usuario existe
        const existingUser = await this.userPort.getUserById(id_usuario);
        if(!existingUser){
            throw new Error("El usuario no existe, no se pueden actualizar sus publicaciones");
        }

        // Validación de negocio: Verificar que el usuario tiene publicaciones
        const userPublicaciones = await this.port.getPublicacionByUserId(id_usuario);
        if(userPublicaciones.length === 0){
            throw new Error("El usuario no tiene publicaciones para actualizar");
        }

        // Validación de datos: Verificar que se proporcionen datos válidos para actualizar
        if(!data || Object.keys(data).length === 0){
            throw new Error("No se proporcionaron datos para actualizar");
        }

        // Lógica de negocio: Si se está desactivando, verificar stocks relacionados
        if(data.publicacion_activo === 0){
            // Aquí podrías agregar lógica adicional, como:
            // - Verificar si hay stocks activos
            // - Notificar a usuarios interesados
            // - Registrar en logs de auditoría
            console.log(`Desactivando todas las publicaciones del usuario ${id_usuario}`);
        }

        // Ejecutar la actualización a través del puerto
        return this.port.updatePublicacionesByUserId(id_usuario, data);
    }

}
