import { Router } from "express";
import { SolicitudController } from "../controller/SolicitudController";
import { SolicitudApplication } from "../../application/SolicitudApplication";
import { SolicitudAdapter } from "../adapter/SolicitudAdapter";

const router = Router();

// Configuración de dependencias
const solicitudAdapter = new SolicitudAdapter();
const solicitudApplication = new SolicitudApplication(solicitudAdapter);
const solicitudController = new SolicitudController(solicitudApplication);

// Rutas CRUD básicas
router.post("/", (req, res) => solicitudController.createSolicitud(req, res));
router.put("/:id", (req, res) => solicitudController.updateSolicitud(req, res));
router.delete("/:id", (req, res) => solicitudController.deleteSolicitud(req, res));
router.get("/", (req, res) => solicitudController.getAllSolicitudes(req, res));
router.get("/:id", (req, res) => solicitudController.getSolicitudById(req, res));

// Rutas específicas por filtros
router.get("/usuario/:id_usuario", (req, res) => solicitudController.getSolicitudesByUsuario(req, res));
router.get("/publicacion/:id_publicacion", (req, res) => solicitudController.getSolicitudesByPublicacion(req, res));
router.get("/estado/:id_estado", (req, res) => solicitudController.getSolicitudesByEstado(req, res));

// Rutas para cambio de estado
router.patch("/:id/estado", (req, res) => solicitudController.cambiarEstadoSolicitud(req, res));
router.patch("/:id/aceptar", (req, res) => solicitudController.aceptarSolicitud(req, res));
router.patch("/:id/rechazar", (req, res) => solicitudController.rechazarSolicitud(req, res));
router.patch("/:id/cancelar", (req, res) => solicitudController.cancelarSolicitud(req, res));

export default router;