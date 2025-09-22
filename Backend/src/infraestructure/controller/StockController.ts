//Comunicar con servicio (StockApplication.ts)

import { StockApplication } from "../../application/StockApplication";
import { Stock } from "../../domain/Stock";
import { Request, Response } from "express";

//Aqui la PETICION

export class StockController {
    private app: StockApplication;
    
    constructor(app: StockApplication) {
        this.app = app;
    }

    async createStock(request: Request, response: Response): Promise<Response> {
        const { cantidadTotal, cantidadReservada, cantidadDisponible, idPublicacion } = request.body;
        try {
            // Validaciones
            if (!cantidadTotal || cantidadTotal < 0) {
                return response.status(400).json({ message: "Cantidad total debe ser un número positivo" });
            }
            
            if (cantidadReservada < 0) {
                return response.status(400).json({ message: "Cantidad reservada no puede ser negativa" });
            }
            
            if (cantidadDisponible < 0) {
                return response.status(400).json({ message: "Cantidad disponible no puede ser negativa" });
            }
            
            if (!idPublicacion || idPublicacion <= 0) {
                return response.status(400).json({ message: "ID de publicación debe ser válido" });
            }

            // Validar que cantidadDisponible = cantidadTotal - cantidadReservada
            if (cantidadDisponible !== cantidadTotal - cantidadReservada) {
                return response.status(400).json({ 
                    message: "La cantidad disponible debe ser igual a la cantidad total menos la cantidad reservada" 
                });
            }

            const estado = 1; // Activo por defecto
            const stock: Omit<Stock, "id"> = { 
                cantidadTotal, 
                cantidadReservada, 
                cantidadDisponible, 
                estado, 
                idPublicacion 
            };
            
            const stockId = await this.app.createStock(stock);
            return response
                .status(201)
                .json({ message: "Stock creado correctamente", stockId });
                
        } catch (error) {
            if (error instanceof Error) {
                return response.status(500).json({ message: error.message });
            }
        }
        return response.status(400).json({ message: "Error en la petición" });
    }

    async getStockById(request: Request, response: Response): Promise<Response> {
        try {
            const stockId = parseInt(request.params.id);
            if (isNaN(stockId)) {
                return response.status(400).json({ message: "Error en parámetro" });
            }
            
            const stock = await this.app.getStockById(stockId);
            if (!stock) {
                return response.status(404).json({ message: "Stock no existe" });
            }
            
            return response.status(200).json(stock);
        } catch (error) {
            if (error instanceof Error) {
                return response.status(500).json({ message: "Error en servidor" });
            }
        }
        return response.status(400).json({ message: "Error en la petición" });
    }

    async getStockByPublicacionId(request: Request, response: Response): Promise<Response> {
        try {
            const publicacionId = parseInt(request.params.idPublicacion);
            if (isNaN(publicacionId)) {
                return response.status(400).json({ message: "Error en parámetro" });
            }
            
            const stock = await this.app.getStockByPublicacionId(publicacionId);
            if (!stock) {
                return response.status(404).json({ message: "Stock no encontrado para esta publicación" });
            }
            
            return response.status(200).json(stock);
        } catch (error) {
            if (error instanceof Error) {
                return response.status(500).json({ message: "Error en servidor" });
            }
        }
        return response.status(400).json({ message: "Error en la petición" });
    }

    async getAllStocks(request: Request, response: Response): Promise<Response> {
        try {
            const stocks = await this.app.getAllStocks();
            return response.status(200).json(stocks);
        } catch (error) {
            if (error instanceof Error) {
                return response.status(500).json({ message: "Error en servidor" });
            }
        }
        return response.status(400).json({ message: "Error en la petición" });
    }

    async updateStock(request: Request, response: Response): Promise<Response> {
        try {
            const stockId = parseInt(request.params.id);
            if (isNaN(stockId)) {
                return response.status(400).json({ message: "Error en parámetro" });
            }
            
            let { cantidadTotal, cantidadReservada, cantidadDisponible, estado } = request.body;
            
            // Validaciones antes de actualizar
            if (cantidadTotal !== undefined && cantidadTotal < 0) {
                return response.status(400).json({ 
                    message: "Cantidad total debe ser un número positivo" 
                });
            }
            
            if (cantidadReservada !== undefined && cantidadReservada < 0) {
                return response.status(400).json({ 
                    message: "Cantidad reservada no puede ser negativa" 
                });
            }
            
            if (cantidadDisponible !== undefined && cantidadDisponible < 0) {
                return response.status(400).json({ 
                    message: "Cantidad disponible no puede ser negativa" 
                });
            }

            // Mantener activo por defecto si no se especifica
            if (estado === undefined) {
                estado = 1;
            }

            const updated = await this.app.updateStock(stockId, {
                cantidadTotal,
                cantidadReservada,
                cantidadDisponible,
                estado
            });
            
            if (!updated) {
                return response
                    .status(404)
                    .json({ message: "Stock no encontrado o sin cambios" });
            }
            
            return response.status(200).json({ message: "Stock actualizado correctamente" });
            
        } catch (error) {
            if (error instanceof Error) {
                return response.status(500).json({ message: error.message });
            }
        }
        return response.status(400).json({ message: "Error en la petición" });
    }

    // 🗑️ ELIMINACIÓN LÓGICA: Siguiendo el mismo patrón que UserController.downUser
    async downStock(request: Request, response: Response): Promise<Response> {
        try {
            const stockId = parseInt(request.params.id);
            if (isNaN(stockId)) {
                return response.status(400).json({ message: "Error en parámetro" });
            }
            
            const stock = await this.app.deleteStock(stockId);
            if (!stock) {
                return response.status(404).json({ message: "Stock no existe" });
            }
            
            return response.status(200).json({ message: "Stock eliminado correctamente" });
        } catch (error) {
            if (error instanceof Error) {
                return response.status(500).json({ message: "Error en servidor" });
            }
        }
        return response.status(400).json({ message: "Error en la petición" });
    }
}