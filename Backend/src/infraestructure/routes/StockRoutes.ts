import { Router } from 'express';
import { StockApplication } from "../../application/StockApplication";
import { StockAdapter } from "../adapter/StockAdapter";
import { StockController } from "../controller/StockController";
import { authenticateToken } from '../web/authMiddleware';

//Express
const router = Router();

//INICIALIZACION DE CAPAS EN ORDEN
const stockAdapter = new StockAdapter();
const stockApp = new StockApplication(stockAdapter);
const stockController = new StockController(stockApp);

//Definicion Rutas. --> ENdpoint ->Especificacion URL

// Crear stock
router.post("/stocks", authenticateToken, async(request, response) => {
    try {
        await stockController.createStock(request, response);
    } catch (error) {
        console.error("Error en stock:", error);
        response.status(400).json({ message: "Error en creación de stock" });
    }
});

// Obtener todos los stocks
router.get("/stocks", async(request, response) => {
    try {
        await stockController.getAllStocks(request, response);
    } catch (error) {
        console.error("(getAllStocks) Error en stocks:", error);
        response.status(400).json({ message: "Error en stocks" });
    }
});

// Obtener stock por ID
router.get("/stocks/:id", async(request, response) => {
    try {
        await stockController.getStockById(request, response);
    } catch (error) {
        console.error(error);
        response.status(400).json({ message: "Error en obtener stock" });
    }
});

// Obtener stock por ID de publicación
router.get("/stocks/publicacion/:idPublicacion", async(request, response) => {
    try {
        await stockController.getStockByPublicacionId(request, response);
    } catch (error) {
        console.error(error);
        response.status(400).json({ message: "Error en obtener stock por publicación" });
    }
});

// Actualizar stock
router.put("/stocks/:id", authenticateToken, async(request, response) => {
    try {
        await stockController.updateStock(request, response);
    } catch (error) {
        console.error(error);
        response.status(400).json({ message: "Error en actualizar stock" });
    }
});

// Eliminación lógica de stock
router.delete("/stocks/:id", authenticateToken, async(request, response) => {
    try {
        await stockController.downStock(request, response);
    } catch (error) {
        console.error(error);
        response.status(400).json({ message: "Error en eliminar stock por ID" });
    }
});

export default router;