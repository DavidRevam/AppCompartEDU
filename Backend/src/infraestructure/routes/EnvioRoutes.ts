import { Router } from "express";
import { EnvioAdapter } from "../adapter/EnvioAdapter";
import { EnvioApplication } from "../../application/EnvioApplication";
import { EnvioController } from "../controller/EnvioController";

const router = Router();

// Inicializar capas
const envioAdapter = new EnvioAdapter();
const envioApplication = new EnvioApplication(envioAdapter);
const envioController = new EnvioController(envioApplication);

// Rutas
router.post("/", async (req, res) => {
    try {
        await envioController.createEnvio(req, res);
    } catch (error) {
        console.error("Error en envío:", error);
        res.status(400).json({ message: "Error en creación de envío" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        await envioController.updateEnvio(req, res);
    } catch (error) {
        console.error("Error en actualización de envío:", error);
        res.status(400).json({ message: "Error en actualización de envío" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await envioController.deleteEnvio(req, res);
    } catch (error) {
        console.error("Error en eliminación de envío:", error);
        res.status(400).json({ message: "Error en eliminación de envío" });
    }
});

router.get("/", async (req, res) => {
    try {
        await envioController.getAllEnvios(req, res);
    } catch (error) {
        console.error("Error en obtener envíos:", error);
        res.status(400).json({ message: "Error en obtener envíos" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        await envioController.getEnvioById(req, res);
    } catch (error) {
        console.error("Error en obtener envío:", error);
        res.status(400).json({ message: "Error en obtener envío" });
    }
});

router.get("/solicitud/:solicitudId", async (req, res) => {
    try {
        await envioController.getEnvioBySolicitudId(req, res);
    } catch (error) {
        console.error("Error en obtener envío por solicitud:", error);
        res.status(400).json({ message: "Error en obtener envío por solicitud" });
    }
});

export default router;