import { Repository } from "typeorm";
import { EstadoSolicitud } from "../../domain/EstadoSolicitud";
import { EstadoSolicitudPort } from "../../domain/EstadoSolicitudPort";
import { EstadoSolicitudEntity } from "../entities/EstadoSolicitudEntity";
import { AppDataSource } from "../config/con_data_base";

export class EstadoSolicitudAdapter implements EstadoSolicitudPort {
    private estadoSolicitudRepository: Repository<EstadoSolicitudEntity>;

    constructor() {
        this.estadoSolicitudRepository = AppDataSource.getRepository(EstadoSolicitudEntity);
    }

    // Conversión de entidad a dominio
    private toDomain(estadoSolicitud: EstadoSolicitudEntity): EstadoSolicitud {
        return {
            id: estadoSolicitud.id_estado_solicitud,
            descripcion: estadoSolicitud.descripcion_estado,
        };
    }

    async getAllEstadosSolicitud(): Promise<EstadoSolicitud[]> {
        try {
            const estados = await this.estadoSolicitudRepository.find();
            return estados.map(this.toDomain);
        } catch (error) {
            console.error("Error al obtener estados de solicitud", error);
            throw new Error("Error al obtener estados de solicitud");
        }
    }

    async getEstadoSolicitudById(id: number): Promise<EstadoSolicitud | null> {
        try {
            const estado = await this.estadoSolicitudRepository.findOne({
                where: { id_estado_solicitud: id }
            });
            return estado ? this.toDomain(estado) : null;
        } catch (error) {
            console.error("Error al obtener estado de solicitud por ID", error);
            throw new Error("Error al obtener estado de solicitud por ID");
        }
    }
}