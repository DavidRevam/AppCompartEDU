import { Router } from "express";
import { EstadoSolicitudController } from "../controller/EstadoSolicitudController";
import { EstadoSolicitudApplication } from "../../application/EstadoSolicitudApplication";
import { EstadoSolicitudAdapter } from "../adapter/EstadoSolicitudAdapter";

const router = Router();

// Configuración de dependencias
const estadoSolicitudAdapter = new EstadoSolicitudAdapter();
const estadoSolicitudApplication = new EstadoSolicitudApplication(estadoSolicitudAdapter);
const estadoSolicitudController = new EstadoSolicitudController(estadoSolicitudApplication);

// Rutas para estados de solicitud
router.get("/", async (req, res) => {
    try {
        await estadoSolicitudController.getAllEstadosSolicitud(req, res);
    } catch (error) {
        console.error("Error en obtener estados de solicitud:", error);
        res.status(400).json({ message: "Error en obtener estados de solicitud" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        await estadoSolicitudController.getEstadoSolicitudById(req, res);
    } catch (error) {
        console.error("Error en obtener estado de solicitud:", error);
        res.status(400).json({ message: "Error en obtener estado de solicitud" });
    }
});

export default router;