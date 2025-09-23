import { EstadoSolicitud } from "./EstadoSolicitud";

export interface EstadoSolicitudPort {
    getAllEstadosSolicitud(): Promise<EstadoSolicitud[]>;
    getEstadoSolicitudById(id: number): Promise<EstadoSolicitud | null>;
}