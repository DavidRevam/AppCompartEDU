import { Stock } from "../domain/Stock";
import { StockPort } from "../domain/StockPort";

export class StockApplication {
    private port: StockPort;

    constructor(port: StockPort) {
        this.port = port;
    }

    async createStock(stock: Omit<Stock, "id">): Promise<number> {
        try {
            // Validar que la cantidad disponible sea correcta
            if (stock.cantidadDisponible !== stock.cantidadTotal - stock.cantidadReservada) {
                throw new Error("La cantidad disponible debe ser igual a la cantidad total menos la cantidad reservada");
            }
            
            // Verificar si ya existe un stock para esta publicación
            const existingStock = await this.port.getStockByPublicacionId(stock.idPublicacion);
            if (existingStock) {
                throw new Error("Ya existe un stock para esta publicación");
            }

            return await this.port.createStock(stock);
        } catch (error) {
            console.error("Error al crear stock", error);
            throw error;
        }
    }

    async updateStock(id: number, stock: Partial<Stock>): Promise<boolean> {
        try {
            const existingStock = await this.port.getStockById(id);
            if (!existingStock) {
                throw new Error("Stock no encontrado");
            }

            // Si se actualiza alguna de las cantidades, recalcular la cantidad disponible
            let cantidadTotal = stock.cantidadTotal ?? existingStock.cantidadTotal;
            let cantidadReservada = stock.cantidadReservada ?? existingStock.cantidadReservada;
            
            // Si se proporciona cantidadDisponible, validar que sea coherente
            if (stock.cantidadDisponible !== undefined) {
                if (stock.cantidadDisponible !== cantidadTotal - cantidadReservada) {
                    throw new Error("La cantidad disponible debe ser igual a la cantidad total menos la cantidad reservada");
                }
            } else {
                // Si no se proporciona, calcularla
                stock.cantidadDisponible = cantidadTotal - cantidadReservada;
            }

            return await this.port.updateStock(id, stock);
        } catch (error) {
            console.error("Error al actualizar stock", error);
            throw error;
        }
    }

    async deleteStock(id: number): Promise<boolean> {
        try {
            const existingStock = await this.port.getStockById(id);
            if (!existingStock) {
                throw new Error("Stock no encontrado");
            }
            return await this.port.deleteStock(id);
        } catch (error) {
            console.error("Error al eliminar stock", error);
            throw error;
        }
    }

    // Consultas
    async getAllStocks(): Promise<Stock[]> {
        try {
            return await this.port.getAllStocks();
        } catch (error) {
            console.error("Error al obtener todos los stocks", error);
            throw error;
        }
    }

    async getStockById(id: number): Promise<Stock | null> {
        try {
            return await this.port.getStockById(id);
        } catch (error) {
            console.error("Error al obtener stock por ID", error);
            throw error;
        }
    }

    async getStockByPublicacionId(idPublicacion: number): Promise<Stock | null> {
        try {
            return await this.port.getStockByPublicacionId(idPublicacion);
        } catch (error) {
            console.error("Error al obtener stock por ID de publicación", error);
            throw error;
        }
    }
}