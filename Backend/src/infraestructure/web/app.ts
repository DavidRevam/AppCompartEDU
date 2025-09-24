import express,{Request, Response} from "express";
import userRoutes from "../routes/UserRoutes";
import publicacionRoutes from "../routes/PublicacionRoutes";
import solicitudRoutes from "../routes/SolicitudRoutes";
import stockRoutes from "../routes/StockRoutes";
import imagenRoutes from "../routes/ImagenRoutes";
import envioRoutes from "../routes/EnvioRoutes";
import estadoSolicitudRoutes from "../routes/EstadoSolicitudRoutes";
import cors from "cors";

class App {
    private app: express.Application;


    constructor(){
        this.app = express();
        this.middleware();
        this.routes();
    }

    private middleware():void{
        this.app.use(cors());
        this.app.use(express.json());
    }


    private routes():void{
        this.app.use("/api", userRoutes);
        this.app.use("/api", publicacionRoutes);
        this.app.use("/api", stockRoutes);
        this.app.use("/api/imagenes", imagenRoutes);
        this.app.use("/api/solicitudes", solicitudRoutes);
        this.app.use("/api/estados-solicitud", estadoSolicitudRoutes);
        this.app.use("/api/envios", envioRoutes);
    }

    getApp(){
        return this.app;
    }
}

export default new App().getApp();

