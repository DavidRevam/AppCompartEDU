import { Envio } from "../domain/Envio";
import { EnvioPort } from "../domain/EnvioPort";

export class EnvioApplication {
    private port: EnvioPort;

    constructor(port: EnvioPort) {
        this.port = port;
    }

    async createEnvio(envio: Omit<Envio, "id">): Promise<number> {
        // Validar que la solicitud existe antes de crear el envío
        if (!envio.solicitudId) {
            throw new Error("El ID de solicitud es requerido");
        }

        if (!envio.direccion || !envio.barrio || !envio.localidad) {
            throw new Error("Todos los campos de dirección son requeridos");
        }

        return this.port.createEnvio(envio);
    }

    async updateEnvio(id: number, envio: Partial<Envio>): Promise<boolean> {
        const existingEnvio = await this.port.getEnvioById(id);
        if (!existingEnvio) {
            throw new Error("Envío no encontrado");
        }

        return this.port.updateEnvio(id, envio);
    }

    async deleteEnvio(id: number): Promise<boolean> {
        const existingEnvio = await this.port.getEnvioById(id);
        if (!existingEnvio) {
            throw new Error("Envío no encontrado");
        }

        return this.port.deleteEnvio(id);
    }

    async getEnvioById(id: number): Promise<Envio | null> {
        return this.port.getEnvioById(id);
    }

    async getEnvioBySolicitudId(solicitudId: number): Promise<Envio | null> {
        return this.port.getEnvioBySolicitudId(solicitudId);
    }

    async getAllEnvios(): Promise<Envio[]> {
        return this.port.getAllEnvios();
    }
}