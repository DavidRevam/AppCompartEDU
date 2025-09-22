import { Repository } from "typeorm";
import { Stock } from "../../domain/Stock";
import { StockPort } from "../../domain/StockPort";
import { StockEntity } from "../entities/StockEntity";
import { AppDataSource } from "../config/con_data_base";
import { PublicacionEntity } from '../entities/PublicacionEntity';

export class StockAdapter implements StockPort {
    private stockRepository: Repository<StockEntity>;

    constructor() {
        this.stockRepository = AppDataSource.getRepository(StockEntity);
    }

    // Conversión de entidad a dominio
    private toDomain(stock: StockEntity): Stock {
        return {
            id: stock.id_stock,
            cantidadTotal: stock.cantidad_total_stock,
            cantidadReservada: stock.cantidad_reservada_stock,
            cantidadDisponible: stock.cantidad_disponible_stock,
            estado: stock.estado_stock_activo,
            idPublicacion: stock.publicacion.id_publicacion,
        };
    }

    // Conversión de dominio a entidad
    private toEntity(stock: Omit<Stock, "id">): StockEntity {
        const stockEntity = new StockEntity();
        stockEntity.cantidad_total_stock = stock.cantidadTotal;
        stockEntity.cantidad_reservada_stock = stock.cantidadReservada;
        stockEntity.cantidad_disponible_stock = stock.cantidadDisponible;
        stockEntity.estado_stock_activo = stock.estado;

        const publicacionEntity = new PublicacionEntity();
        publicacionEntity.id_publicacion = stock.idPublicacion;
        stockEntity.publicacion = publicacionEntity;
        return stockEntity;
    }

    async createStock(stock: Omit<Stock, "id">): Promise<number> {
        try {
            const newStock = this.toEntity(stock);
            const savedStock = await this.stockRepository.save(newStock);
            return savedStock.id_stock;
        } catch (error) {
            console.error("Error al crear stock", error);
            throw new Error("Error al crear stock");
        }
    }

    async updateStock(id: number, stock: Partial<Stock>): Promise<boolean> {
        try {
            const existingStock = await this.stockRepository.findOne({ where: { id_stock: id } });
            if (!existingStock) {
                throw new Error("Stock no encontrado");
            }

            // Actualizar propiedades
            if (stock.cantidadTotal !== undefined) {
                existingStock.cantidad_total_stock = stock.cantidadTotal;
            }
            if (stock.cantidadReservada !== undefined) {
                existingStock.cantidad_reservada_stock = stock.cantidadReservada;
            }
            if (stock.cantidadDisponible !== undefined) {
                existingStock.cantidad_disponible_stock = stock.cantidadDisponible;
            }
            if (stock.estado !== undefined) {
                existingStock.estado_stock_activo = stock.estado;
            }
            if (stock.idPublicacion !== undefined) {
                const publicacionEntity = new PublicacionEntity();
                publicacionEntity.id_publicacion = stock.idPublicacion;
                existingStock.publicacion = publicacionEntity;
            }

            await this.stockRepository.save(existingStock);
            return true;
        } catch (error) {
            console.error("Error al actualizar stock", error);
            throw new Error("Error al actualizar stock");
        }
    }

    async deleteStock(id: number): Promise<boolean> {
        try {
            const existingStock = await this.stockRepository.findOne({ where: { id_stock: id } });
            if (!existingStock) {
                throw new Error("Stock no encontrado");
            }
            
            // Marcar como inactivo en lugar de eliminar físicamente
            existingStock.estado_stock_activo = 0;
            await this.stockRepository.save(existingStock);
            return true;
        } catch (error) {
            console.error("Error al eliminar stock", error);
            throw new Error("Error al eliminar stock");
        }
    }

    async getAllStocks(): Promise<Stock[]> {
        try {
            const stocks = await this.stockRepository.find();
            return stocks.map(stock => this.toDomain(stock));
        } catch (error) {
            console.error("Error al obtener todos los stocks", error);
            throw new Error("Error al obtener todos los stocks");
        }
    }

    async getStockById(id: number): Promise<Stock | null> {
        try {
            const stock = await this.stockRepository.findOne({ where: { id_stock: id } });
            return stock ? this.toDomain(stock) : null;
        } catch (error) {
            console.error("Error al obtener stock por ID", error);
            throw new Error("Error al obtener stock por ID");
        }
    }

    async getStockByPublicacionId(idPublicacion: number): Promise<Stock | null> {
        try {
            const stock = await this.stockRepository.findOne({ where: { publicacion: { id_publicacion: idPublicacion } } });
            return stock ? this.toDomain(stock) : null;
        } catch (error) {
            console.error("Error al obtener stock por ID de publicación", error);
            throw new Error("Error al obtener stock por ID de publicación");
        }
    }
}