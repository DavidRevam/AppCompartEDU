//Comunicar con servicio (EnvioApplication.ts)

import { EnvioApplication } from "../../application/EnvioApplication";
import { Envio } from "../../domain/Envio";
import { Request, Response } from "express";

//Aqui la PETICION

export class EnvioController {
    private app: EnvioApplication;
    
    constructor(app: EnvioApplication) {
        this.app = app;
    }

    async createEnvio(request: Request, response: Response): Promise<Response> {
        const { direccion, barrio, localidad, solicitudId } = request.body;
        
        try {
            // Validaciones
            if (!direccion || !barrio || !localidad || !solicitudId) {
                return response.status(400).json({ 
                    message: "Todos los campos son requeridos: direccion, barrio, localidad, solicitudId" 
                });
            }

            if (typeof direccion !== 'string' || direccion.trim().length === 0) {
                return response.status(400).json({ message: "Dirección de envío inválida" });
            }

            if (typeof barrio !== 'string' || barrio.trim().length === 0) {
                return response.status(400).json({ message: "Barrio de envío inválido" });
            }

            if (typeof localidad !== 'string' || localidad.trim().length === 0) {
                return response.status(400).json({ message: "Localidad de envío inválida" });
            }

            if (!Number.isInteger(solicitudId) || solicitudId <= 0) {
                return response.status(400).json({ message: "ID de solicitud inválido" });
            }

            const envio: Omit<Envio, "id"> = {
                direccion: direccion.trim(),
                barrio: barrio.trim(),
                localidad: localidad.trim(),
                solicitudId
            };

            const id = await this.app.createEnvio(envio);
            return response.status(201).json({ message: "Envío creado exitosamente", id });
        } catch (error) {
            return response.status(500).json({ message: `Error al crear envío: ${error}` });
        }
    }

    async updateEnvio(request: Request, response: Response): Promise<Response> {
        const { id } = request.params;
        const { direccion, barrio, localidad, solicitudId } = request.body;

        try {
            const envioId = parseInt(id);
            if (!Number.isInteger(envioId) || envioId <= 0) {
                return response.status(400).json({ message: "ID de envío inválido" });
            }

            const updateData: Partial<Envio> = {};

            if (direccion !== undefined) {
                if (typeof direccion !== 'string' || direccion.trim().length === 0) {
                    return response.status(400).json({ message: "Dirección de envío inválida" });
                }
                updateData.direccion = direccion.trim();
            }

            if (barrio !== undefined) {
                if (typeof barrio !== 'string' || barrio.trim().length === 0) {
                    return response.status(400).json({ message: "Barrio de envío inválido" });
                }
                updateData.barrio = barrio.trim();
            }

            if (localidad !== undefined) {
                if (typeof localidad !== 'string' || localidad.trim().length === 0) {
                    return response.status(400).json({ message: "Localidad de envío inválida" });
                }
                updateData.localidad = localidad.trim();
            }

            if (solicitudId !== undefined) {
                if (!Number.isInteger(solicitudId) || solicitudId <= 0) {
                    return response.status(400).json({ message: "ID de solicitud inválido" });
                }
                updateData.solicitudId = solicitudId;
            }

            const updated = await this.app.updateEnvio(envioId, updateData);
            if (updated) {
                return response.status(200).json({ message: "Envío actualizado exitosamente" });
            } else {
                return response.status(404).json({ message: "Envío no encontrado" });
            }
        } catch (error) {
            return response.status(500).json({ message: `Error al actualizar envío: ${error}` });
        }
    }

    async deleteEnvio(request: Request, response: Response): Promise<Response> {
        const { id } = request.params;

        try {
            const envioId = parseInt(id);
            if (!Number.isInteger(envioId) || envioId <= 0) {
                return response.status(400).json({ message: "ID de envío inválido" });
            }

            const deleted = await this.app.deleteEnvio(envioId);
            if (deleted) {
                return response.status(200).json({ message: "Envío eliminado exitosamente" });
            } else {
                return response.status(404).json({ message: "Envío no encontrado" });
            }
        } catch (error) {
            return response.status(500).json({ message: `Error al eliminar envío: ${error}` });
        }
    }

    async getEnvioById(request: Request, response: Response): Promise<Response> {
        const { id } = request.params;

        try {
            const envioId = parseInt(id);
            if (!Number.isInteger(envioId) || envioId <= 0) {
                return response.status(400).json({ message: "ID de envío inválido" });
            }

            const envio = await this.app.getEnvioById(envioId);
            if (envio) {
                return response.status(200).json(envio);
            } else {
                return response.status(404).json({ message: "Envío no encontrado" });
            }
        } catch (error) {
            return response.status(500).json({ message: `Error al obtener envío: ${error}` });
        }
    }

    async getEnvioBySolicitudId(request: Request, response: Response): Promise<Response> {
        const { solicitudId } = request.params;

        try {
            const solicitudIdNum = parseInt(solicitudId);
            if (!Number.isInteger(solicitudIdNum) || solicitudIdNum <= 0) {
                return response.status(400).json({ message: "ID de solicitud inválido" });
            }

            const envio = await this.app.getEnvioBySolicitudId(solicitudIdNum);
            if (envio) {
                return response.status(200).json(envio);
            } else {
                return response.status(404).json({ message: "Envío no encontrado para esta solicitud" });
            }
        } catch (error) {
            return response.status(500).json({ message: `Error al obtener envío por solicitud: ${error}` });
        }
    }

    async getAllEnvios(request: Request, response: Response): Promise<Response> {
        try {
            const envios = await this.app.getAllEnvios();
            return response.status(200).json(envios);
        } catch (error) {
            return response.status(500).json({ message: `Error al obtener envíos: ${error}` });
        }
    }
}