import { Stock } from "./Stock";

export interface StockPort{
    createStock(stock: Omit<Stock, "id">): Promise<number>;
    updateStock(id: number, stock: Partial<Stock>): Promise<boolean>;
    deleteStock(id: number): Promise<boolean>;
    getAllStocks(): Promise<Stock[]>;
    getStockById(id: number): Promise<Stock | null>;
    getStockByPublicacionId(idPublicacion: number): Promise<Stock | null>;
}