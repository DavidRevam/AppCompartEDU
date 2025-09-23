import { EstadoSolicitud } from "../domain/EstadoSolicitud";
import { EstadoSolicitudPort } from "../domain/EstadoSolicitudPort";

export class EstadoSolicitudApplication {
    constructor(private estadoSolicitudPort: EstadoSolicitudPort) {}

    async getAllEstadosSolicitud(): Promise<EstadoSolicitud[]> {
        try {
            return await this.estadoSolicitudPort.getAllEstadosSolicitud();
        } catch (error) {
            console.error("Error en aplicación al obtener estados de solicitud", error);
            throw new Error("Error al obtener estados de solicitud");
        }
    }

    async getEstadoSolicitudById(id: number): Promise<EstadoSolicitud | null> {
        try {
            if (id <= 0) {
                throw new Error("ID de estado de solicitud inválido");
            }
            return await this.estadoSolicitudPort.getEstadoSolicitudById(id);
        } catch (error) {
            console.error("Error en aplicación al obtener estado de solicitud por ID", error);
            throw new Error("Error al obtener estado de solicitud por ID");
        }
    }
}