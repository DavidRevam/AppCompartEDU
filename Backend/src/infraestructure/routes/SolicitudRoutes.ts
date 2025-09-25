import { Router } from "express";
import { SolicitudController } from "../controller/SolicitudController";
import { SolicitudApplication } from "../../application/SolicitudApplication";
import { SolicitudAdapter } from "../adapter/SolicitudAdapter";
import { StockAdapter } from "../adapter/StockAdapter";
import { PublicacionAdapter } from "../adapter/PublicacionAdapter";
import { authenticateToken } from "../web/authMiddleware";

const router = Router();

// Configuración de dependencias
const solicitudAdapter = new SolicitudAdapter();
const stockAdapter = new StockAdapter();
const publicacionAdapter = new PublicacionAdapter();
const solicitudApplication = new SolicitudApplication(solicitudAdapter, stockAdapter, publicacionAdapter);
const solicitudController = new SolicitudController(solicitudApplication);

// Crear Solicitud
router.post("/", authenticateToken, async (req, res) => {
    try {
        await solicitudController.createSolicitud(req, res);
    } catch (error) {
        console.error("Error en solicitud:", error);
        res.status(400).json({ message: "Error en creación de solicitud" });
    }
});


// Actualizar Solicitud 
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        await solicitudController.updateSolicitud(req, res);
    } catch (error) {
        console.error("Error en actualización de solicitud:", error);
        res.status(400).json({ message: "Error en actualización de solicitud" });
    }
});

// Eliminar Solicitud
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        await solicitudController.deleteSolicitud(req, res);
    } catch (error) {
        console.error("Error en eliminación de solicitud:", error);
        res.status(400).json({ message: "Error en eliminación de solicitud" });
    }
});

// Obtener todas las Solicitudes
router.get("/", async (req, res) => {
    try {
        await solicitudController.getAllSolicitudes(req, res);
    } catch (error) {
        console.error("Error en obtener solicitudes:", error);
        res.status(400).json({ message: "Error en obtener solicitudes" });
    }
});

// Obtener Solicitud por ID
router.get("/:id", async (req, res) => {
    try {
        await solicitudController.getSolicitudById(req, res);
    } catch (error) {
        console.error("Error en obtener solicitud:", error);
        res.status(400).json({ message: "Error en obtener solicitud" });
    }
});

// Obtener Solicitudes x Usuario
router.get("/usuario/:id_usuario", async (req, res) => {
    try {
        await solicitudController.getSolicitudesByUsuario(req, res);
    } catch (error) {
        console.error("Error en obtener solicitudes por usuario:", error);
        res.status(400).json({ message: "Error en obtener solicitudes por usuario" });
    }
});

// Obtener Solicitudes x Publicación
router.get("/publicacion/:id_publicacion", async (req, res) => {
    try {
        await solicitudController.getSolicitudesByPublicacion(req, res);
    } catch (error) {
        console.error("Error en obtener solicitudes por publicación:", error);
        res.status(400).json({ message: "Error en obtener solicitudes por publicación" });
    }
});

// Obtener Solicitudes x Estado
router.get("/estado/:id_estado", async (req, res) => {
    try {
        await solicitudController.getSolicitudesByEstado(req, res);
    } catch (error) {
        console.error("Error en obtener solicitudes por estado:", error);
        res.status(400).json({ message: "Error en obtener solicitudes por estado" });
    }
});

// Obtener Solicitudes hechas a publicaciones del usuario
router.get("/mis-publicaciones/:id_usuario", authenticateToken, async (req, res) => {
    try {
        await solicitudController.getSolicitudesByPublicacionesDelUsuario(req, res);
    } catch (error) {
        console.error("Error en obtener solicitudes por publicaciones del usuario:", error);
        res.status(400).json({ message: "Error en obtener solicitudes por publicaciones del usuario" });
    }
});


// Rutas para cambio de estado
router.patch("/:id/estado", authenticateToken, async (req, res) => {
    try {
        await solicitudController.cambiarEstadoSolicitud(req, res);
    } catch (error) {
        console.error("Error en cambio de estado de solicitud:", error);
        res.status(400).json({ message: "Error en cambio de estado de solicitud" });
    }
});

router.patch("/:id/aceptar", authenticateToken, async (req, res) => {
    try {
        await solicitudController.aceptarSolicitud(req, res);
    } catch (error) {
        console.error("Error en aceptar solicitud:", error);
        res.status(400).json({ message: "Error en aceptar solicitud" });
    }
});

router.patch("/:id/rechazar", authenticateToken, async (req, res) => {
    try {
        await solicitudController.rechazarSolicitud(req, res);
    } catch (error) {
        console.error("Error en rechazar solicitud:", error);
        res.status(400).json({ message: "Error en rechazar solicitud" });
    }
});

router.patch("/:id/cancelar", authenticateToken, async (req, res) => {
    try {
        await solicitudController.cancelarSolicitud(req, res);
    } catch (error) {
        console.error("Error en cancelar solicitud:", error);
        res.status(400).json({ message: "Error en cancelar solicitud" });
    }
});

export default router;