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
router.post("/", async (req, res) => {
    try {
        await solicitudController.createSolicitud(req, res);
    } catch (error) {
        console.error("Error en solicitud:", error);
        res.status(400).json({ message: "Error en creación de solicitud" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        await solicitudController.updateSolicitud(req, res);
    } catch (error) {
        console.error("Error en actualización de solicitud:", error);
        res.status(400).json({ message: "Error en actualización de solicitud" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await solicitudController.deleteSolicitud(req, res);
    } catch (error) {
        console.error("Error en eliminación de solicitud:", error);
        res.status(400).json({ message: "Error en eliminación de solicitud" });
    }
});

router.get("/", async (req, res) => {
    try {
        await solicitudController.getAllSolicitudes(req, res);
    } catch (error) {
        console.error("Error en obtener solicitudes:", error);
        res.status(400).json({ message: "Error en obtener solicitudes" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        await solicitudController.getSolicitudById(req, res);
    } catch (error) {
        console.error("Error en obtener solicitud:", error);
        res.status(400).json({ message: "Error en obtener solicitud" });
    }
});

// Rutas específicas por filtros
router.get("/usuario/:id_usuario", async (req, res) => {
    try {
        await solicitudController.getSolicitudesByUsuario(req, res);
    } catch (error) {
        console.error("Error en obtener solicitudes por usuario:", error);
        res.status(400).json({ message: "Error en obtener solicitudes por usuario" });
    }
});

router.get("/publicacion/:id_publicacion", async (req, res) => {
    try {
        await solicitudController.getSolicitudesByPublicacion(req, res);
    } catch (error) {
        console.error("Error en obtener solicitudes por publicación:", error);
        res.status(400).json({ message: "Error en obtener solicitudes por publicación" });
    }
});

router.get("/estado/:id_estado", async (req, res) => {
    try {
        await solicitudController.getSolicitudesByEstado(req, res);
    } catch (error) {
        console.error("Error en obtener solicitudes por estado:", error);
        res.status(400).json({ message: "Error en obtener solicitudes por estado" });
    }
});

// Rutas para cambio de estado
router.patch("/:id/estado", async (req, res) => {
    try {
        await solicitudController.cambiarEstadoSolicitud(req, res);
    } catch (error) {
        console.error("Error en cambio de estado de solicitud:", error);
        res.status(400).json({ message: "Error en cambio de estado de solicitud" });
    }
});

router.patch("/:id/aceptar", async (req, res) => {
    try {
        await solicitudController.aceptarSolicitud(req, res);
    } catch (error) {
        console.error("Error en aceptar solicitud:", error);
        res.status(400).json({ message: "Error en aceptar solicitud" });
    }
});

router.patch("/:id/rechazar", async (req, res) => {
    try {
        await solicitudController.rechazarSolicitud(req, res);
    } catch (error) {
        console.error("Error en rechazar solicitud:", error);
        res.status(400).json({ message: "Error en rechazar solicitud" });
    }
});

router.patch("/:id/cancelar", async (req, res) => {
    try {
        await solicitudController.cancelarSolicitud(req, res);
    } catch (error) {
        console.error("Error en cancelar solicitud:", error);
        res.status(400).json({ message: "Error en cancelar solicitud" });
    }
});

export default router;