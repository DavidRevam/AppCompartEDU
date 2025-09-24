import { Envio } from "./Envio";

export interface EnvioPort {
    createEnvio(envio: Omit<Envio, "id">): Promise<number>;
    updateEnvio(id: number, envio: Partial<Envio>): Promise<boolean>;
    deleteEnvio(id: number): Promise<boolean>;
    getAllEnvios(): Promise<Envio[]>;
    getEnvioById(id: number): Promise<Envio | null>;
    getEnvioBySolicitudId(solicitudId: number): Promise<Envio | null>;
}