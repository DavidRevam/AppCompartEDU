import { Router, Request, Response } from "express";
import { PublicacionApplication } from "../../application/PublicacionApplication";
import { PublicacionAdapter } from "../adapter/PublicacionAdapter";
import { PublicacionController } from "../controller/PublicacionController";
import { UserAdapter } from "../adapter/UserAdapter"; // necesario porque PublicacionApplication recibe también el UserPort
import { StockAdapter } from "../adapter/StockAdapter"; // necesario porque PublicacionApplication recibe también el StockPort
import { authenticateToken } from "../web/authMiddleware";

const router = Router();

const publicacionAdapter = new PublicacionAdapter();
const userAdapter = new UserAdapter();
const stockAdapter = new StockAdapter();
const publicacionApp = new PublicacionApplication(publicacionAdapter, userAdapter, stockAdapter);
const publicacionController = new PublicacionController(publicacionApp);

// Crear publicación
router.post("/publicaciones", /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    await publicacionController.createPublicacion(req, res);
  } catch (error) {
    console.error("(createPublicacion) Error en publicación:", error);
    res.status(400).json({ message: "Error en creación de publicación" });
  }
});

// Obtener todas las publicaciones
router.get("/publicaciones", async (req: Request, res: Response) => {
  try {
    await publicacionController.getAllPublicaciones(req, res);
  } catch (error) {
    console.error("(getAllPublicaciones) Error en publicaciones:", error);
    res.status(400).json({ message: "Error en obtener publicaciones" });
  }
});

// Obtener publicación por ID
router.get("/publicaciones/:id", async (req: Request, res: Response) => {
  try {
    await publicacionController.getPublicacionById(req, res);
  } catch (error) {
    console.error("(getPublicacionById) Error en publicación:", error);
    res.status(400).json({ message: "Error en obtener publicación" });
  }
});

// Obtener publicaciones por usuario
router.get("/publicaciones/usuario/:id_usuario", async (req: Request, res: Response) => {
  try {
    await publicacionController.getPublicacionByUserId(req, res);
  } catch (error) {
    console.error("(getPublicacionByUserId) Error en publicaciones de usuario:", error);
    res.status(400).json({ message: "Error en obtener publicaciones del usuario" });
  }
});

// Actualizar publicación
router.put("/publicaciones/:id", async (req: Request, res: Response) => {
  try {
    await publicacionController.updatePublicacion(req, res);
  } catch (error) {
    console.error("(updatePublicacion) Error en publicación:", error);
    res.status(400).json({ message: "Error en actualizar publicación" });
  }
});

//"BORRADO LOGICO"
router.delete("/publicaciones/:id", async (req: Request, res: Response) => {
  try {
    await publicacionController.deletePublicacion(req, res);
  } catch (error) {
    console.error("(deletePublicacion) Error en publicación:", error);
    res.status(400).json({ message: "Error en eliminar publicación" });
  }
});

export default router;