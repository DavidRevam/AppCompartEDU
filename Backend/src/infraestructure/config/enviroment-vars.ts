/*
Este módulo se encarga de:
    Cargar variables de entorno desde un archivo .env usando dotenv.
    Validarlas con joi para asegurarse de que tengan los formatos esperados.
    Exportarlas como un objeto tipado para su uso en la aplicación.
 
*/
 
import * as joi from "joi";
import "dotenv/config";

export type ReturnEnvioronmentVars = {
    PORT: number; //variables de entorno
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_SCHEMA: string;
}

type ValidationEnvioronmentVars = {
    error: joi.ValidationError | undefined;
    value: ReturnEnvioronmentVars;
}

function validateEnvVars (vars: NodeJS.ProcessEnv): ValidationEnvioronmentVars {
    const envSchem = joi.object({
        PORT: joi.number().required(),
        DB_HOST: joi.string().required(),
        DB_PORT: joi.number().default(3306),
        DB_USER: joi.string().required(),
        DB_PASSWORD: joi.string().allow("").optional(),
        DB_NAME: joi.string().required(),
        DB_SCHEMA: joi.string().required() 
    }).unknown(true);
    const {error, value} = envSchem.validate(vars);
    return{error, value}
}

const loadEnvVars = (): ReturnEnvioronmentVars =>{
    const result = validateEnvVars(process.env);

    if (result.error){
        throw new Error(`Error validating environment variables: ${result.error.message}`);

    }
    const value = result.value;
    return{
        PORT: value.PORT,
        DB_HOST: value.DB_HOST,
        DB_PORT: value.DB_PORT,
        DB_USER: value.DB_USER,
        DB_PASSWORD: value.DB_PASSWORD,
        DB_NAME: value.DB_NAME,
        DB_SCHEMA: value.DB_SCHEMA
    }
}

const envs = loadEnvVars();
export default envs;