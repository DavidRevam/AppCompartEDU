import { Publicacion } from "../domain/Publicacion";
import { PublicacionPort } from "../domain/PublicacionPort";
import { UserPort } from '../domain/UserPort';
import { AuthApplication } from "./AuthApplication";
import { StockPort } from "../domain/StockPort";
import { Stock } from "../domain/Stock";
import { ImagenPort } from "../domain/ImagenPort";
import { Imagen } from "../domain/Imagen";

export class PublicacionApplication{
    private port: PublicacionPort;
    private userPort: UserPort;
    private stockPort: StockPort;
    private imagenPort: ImagenPort;

    constructor(port: PublicacionPort, userPort: UserPort, stockPort: StockPort, imagenPort: ImagenPort) {
        this.port = port;
        this.userPort = userPort;
        this.stockPort = stockPort;
        this.imagenPort = imagenPort;
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

    // Crear publicación con stock e imágenes en una sola operación
    async createPublicacionWithStockAndImages(
        publi: Omit<Publicacion, "id">, 
        stockData: Omit<Stock, "id" | "idPublicacion">,
        imagenesData: Omit<Imagen, "id" | "idPublicacion">[]
    ): Promise<{ publicacionId: number; stockId: number; imagenesIds: number[] }> {
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

            // Crear las imágenes asociadas a la publicación
            const imagenesIds: number[] = [];
            for (const imagenData of imagenesData) {
                const imagenToCreate: Omit<Imagen, "id"> = {
                    ...imagenData,
                    idPublicacion: publicacionId
                };
                const imagenId = await this.imagenPort.createImagen(imagenToCreate);
                imagenesIds.push(imagenId);
            }

            return { publicacionId, stockId, imagenesIds };
        } catch (error) {
            // Si algo falla, podríamos implementar rollback aquí
            throw new Error(`Error al crear publicación con stock e imágenes: ${error}`);
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

    // Obtener todas las publicaciones con stock e imágenes
    async getAllPublicacionesWithStockAndImages(): Promise<any[]> {
        try {
            console.log("📋 Obteniendo todas las publicaciones...");
            // Obtener todas las publicaciones
            const publicaciones = await this.port.getAllPublicaciones();
            console.log(`📊 Publicaciones encontradas: ${publicaciones.length}`);
            
            // Para cada publicación, obtener su stock e imágenes
            const publicacionesCompletas = await Promise.all(
                publicaciones.map(async (publicacion) => {
                    console.log(`🔍 Procesando publicación ID: ${publicacion.id}`);
                    const stock = await this.stockPort.getStockByPublicacionId(publicacion.id);
                    console.log(`📦 Stock encontrado para publicación ${publicacion.id}:`, stock ? 'SÍ' : 'NO');
                    const imagenes = await this.imagenPort.getImagenesByPublicacionId(publicacion.id);
                    console.log(`🖼️ Imágenes encontradas para publicación ${publicacion.id}: ${imagenes ? imagenes.length : 0}`);
                    
                    return {
                        ...publicacion,
                        stock: stock,
                        imagenes: imagenes
                    };
                })
            );
            
            console.log(`✅ Publicaciones completas procesadas: ${publicacionesCompletas.length}`);
            return publicacionesCompletas;
        } catch (error) {
            console.error("❌ Error en getAllPublicacionesWithStockAndImages:", error);
            throw new Error(`Error al obtener publicaciones con stock e imágenes: ${error}`);
        }
    }

    // Obtener una publicación específica con stock e imágenes
    async getPublicacionWithStockAndImagesById(id: number): Promise<any | null> {
        try {
            const publicacion = await this.port.getPublicacionById(id);
            if (!publicacion) {
                return null;
            }
            
            const stock = await this.stockPort.getStockByPublicacionId(publicacion.id);
            const imagenes = await this.imagenPort.getImagenesByPublicacionId(publicacion.id);
            
            return {
                ...publicacion,
                stock: stock,
                imagenes: imagenes
            };
        } catch (error) {
            throw new Error(`Error al obtener publicación con stock e imágenes: ${error}`);
        }
    }

}
