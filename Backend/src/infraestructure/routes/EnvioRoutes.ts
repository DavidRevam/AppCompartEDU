import { Router } from "express";
import { EnvioAdapter } from "../adapter/EnvioAdapter";
import { EnvioApplication } from "../../application/EnvioApplication";
import { EnvioController } from "../controller/EnvioController";

const router = Router();

// Inicializar capas
const envioAdapter = new EnvioAdapter();
const envioApplication = new EnvioApplication(envioAdapter);
const envioController = new EnvioController(envioApplication);

// Crear Envio
router.post("/", async (req, res) => {
    try {
        await envioController.createEnvio(req, res);
    } catch (error) {
        console.error("Error en envío:", error);
        res.status(400).json({ message: "Error en creación de envío" });
    }
});

// Actualizar Envio
router.put("/:id", async (req, res) => {
    try {
        await envioController.updateEnvio(req, res);
    } catch (error) {
        console.error("Error en actualización de envío:", error);
        res.status(400).json({ message: "Error en actualización de envío" });
    }
});

//Eliminar Envio
router.delete("/:id", async (req, res) => {
    try {
        await envioController.deleteEnvio(req, res);
    } catch (error) {
        console.error("Error en eliminación de envío:", error);
        res.status(400).json({ message: "Error en eliminación de envío" });
    }
});

// Obtener todos los Envios
router.get("/", async (req, res) => {
    try {
        await envioController.getAllEnvios(req, res);
    } catch (error) {
        console.error("Error en obtener envíos:", error);
        res.status(400).json({ message: "Error en obtener envíos" });
    }
});

// Obtener Envio por ID
router.get("/:id", async (req, res) => {
    try {
        await envioController.getEnvioById(req, res);
    } catch (error) {
        console.error("Error en obtener envío:", error);
        res.status(400).json({ message: "Error en obtener envío" });
    }
});

// Obtener Envio por Solicitud ID
router.get("/solicitud/:solicitudId", async (req, res) => {
    try {
        await envioController.getEnvioBySolicitudId(req, res);
    } catch (error) {
        console.error("Error en obtener envío por solicitud:", error);
        res.status(400).json({ message: "Error en obtener envío por solicitud" });
    }
});

export default router;