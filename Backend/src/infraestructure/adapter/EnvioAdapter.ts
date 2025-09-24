import { Repository } from "typeorm";
import { Envio } from "../../domain/Envio";
import { EnvioPort } from "../../domain/EnvioPort";
import { EnvioEntity } from "../entities/EnvioEntity";
import { AppDataSource } from "../config/con_data_base";

//Conectar directamente con el TypeORM(Tener control sobre bd)
export class EnvioAdapter implements EnvioPort {

    private envioRepository: Repository<EnvioEntity>;

    constructor() {
        this.envioRepository = AppDataSource.getRepository(EnvioEntity);
    }

    //Conversion
    private toDomain(envio: EnvioEntity): Envio {
        return {
            id: envio.id_envio,
            direccion: envio.direccion_envio,
            barrio: envio.barrio_envio,
            localidad: envio.localidad_envio,
            solicitudId: envio.id_solicitud
        }
    }

    private toEntity(envio: Omit<Envio, "id">): EnvioEntity {
        const envioEntity = new EnvioEntity();
        envioEntity.direccion_envio = envio.direccion;
        envioEntity.barrio_envio = envio.barrio;
        envioEntity.localidad_envio = envio.localidad;
        envioEntity.id_solicitud = envio.solicitudId;
        return envioEntity;
    }

    async createEnvio(envio: Omit<Envio, "id">): Promise<number> {
        try {
            const envioEntity = this.toEntity(envio);
            const result = await this.envioRepository.save(envioEntity);
            return result.id_envio;
        } catch (error) {
            throw new Error(`Error creating envio: ${error}`);
        }
    }

    async updateEnvio(id: number, envio: Partial<Envio>): Promise<boolean> {
        try {
            const result = await this.envioRepository.update(id, {
                direccion_envio: envio.direccion,
                barrio_envio: envio.barrio,
                localidad_envio: envio.localidad,
                id_solicitud: envio.solicitudId
            });
            if (result.affected !== null && result.affected !== undefined && result.affected > 0) {
                return true;
            }
            return false;
        } catch (error) {
            throw new Error(`Error updating envio: ${error}`);
        }
    }

    async deleteEnvio(id: number): Promise<boolean> {
        try {
            const result = await this.envioRepository.delete(id);
            if (result.affected !== null && result.affected !== undefined && result.affected > 0) {
                return true;
            }
            return false;
        } catch (error) {
            throw new Error(`Error deleting envio: ${error}`);
        }
    }

    async getAllEnvios(): Promise<Envio[]> {
        try {
            const envios = await this.envioRepository.find();
            return envios.map(envio => this.toDomain(envio));
        } catch (error) {
            throw new Error(`Error getting all envios: ${error}`);
        }
    }

    async getEnvioById(id: number): Promise<Envio | null> {
        try {
            const envio = await this.envioRepository.findOne({ where: { id_envio: id } });
            return envio ? this.toDomain(envio) : null;
        } catch (error) {
            throw new Error(`Error getting envio by id: ${error}`);
        }
    }

    async getEnvioBySolicitudId(solicitudId: number): Promise<Envio | null> {
        try {
            const envio = await this.envioRepository.findOne({ where: { id_solicitud: solicitudId } });
            return envio ? this.toDomain(envio) : null;
        } catch (error) {
            throw new Error(`Error getting envio by solicitud id: ${error}`);
        }
    }
}