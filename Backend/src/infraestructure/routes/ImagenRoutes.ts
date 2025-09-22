import { Router } from "express";
import { ImagenController } from "../controller/ImagenController";
import { ImagenApplication } from "../../application/ImagenApplication";
import { ImagenAdapter } from "../adapter/ImagenAdapter";
import { PublicacionAdapter } from "../adapter/PublicacionAdapter";

const router = Router();

// Instancias de dependencias
const imagenAdapter = new ImagenAdapter();
const publicacionAdapter = new PublicacionAdapter();
const imagenApplication = new ImagenApplication(imagenAdapter, publicacionAdapter);
const imagenController = new ImagenController(imagenApplication);

// Rutas para imágenes
router.post("/", (req, res) => imagenController.createImagen(req, res));
router.put("/:id", (req, res) => imagenController.updateImagen(req, res));
router.delete("/:id", (req, res) => imagenController.deleteImagen(req, res));
router.get("/", (req, res) => imagenController.getAllImagenes(req, res));
router.get("/:id", (req, res) => imagenController.getImagenById(req, res));

// Rutas específicas para imágenes por publicación
router.get("/publicacion/:idPublicacion", (req, res) => 
    imagenController.getImagenesByPublicacionId(req, res)
);
router.post("/publicacion/:idPublicacion/multiple", (req, res) => 
    imagenController.createImagenesForPublicacion(req, res)
);

export default router;