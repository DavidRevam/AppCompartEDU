import { DataSource } from "typeorm";
import {UserEntity} from "../entities/UserEntity";
import { PublicacionEntity } from "../entities/PublicacionEntity";
import { StockEntity } from "../entities/StockEntity";
import { ImagenEntity } from "../entities/ImagenEntity";
import { SolicitudEntity } from "../entities/SolicitudEntity";
import { EstadoSolicitudEntity } from "../entities/EstadoSolicitudEntity";
import envs from "../config/enviroment-vars";


/**Seteo de variables hacia lo que se lanza a la bd */
export const AppDataSource = new DataSource({

    type: "postgres", 
    host: envs.DB_HOST,
    port: Number(envs.DB_PORT),
    username: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_NAME,
    schema: envs.DB_SCHEMA,
    synchronize: true,
    logging: true,
    entities:[UserEntity, PublicacionEntity, StockEntity, ImagenEntity, SolicitudEntity, EstadoSolicitudEntity],
});

//Conectar a la base de Datos
export const connectDB = async ( )=>{
    try{
        AppDataSource.initialize();
        console.log("Database connnected")
    }catch (error){
        console.error("Error connecting to the DB:", error);
        process.exit(1);
    }
}