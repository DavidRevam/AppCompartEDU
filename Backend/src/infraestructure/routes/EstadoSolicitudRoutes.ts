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
router.get("/", (req, res) => estadoSolicitudController.getAllEstadosSolicitud(req, res));
router.get("/:id", (req, res) => estadoSolicitudController.getEstadoSolicitudById(req, res));

export default router;