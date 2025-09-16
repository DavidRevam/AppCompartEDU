import app from "./infraestructure/web/app";
import { ServerBoostrap } from "./infraestructure/boostrap/server-boostrap";
import {connectDB} from "./infraestructure/config/con_data_base";

const server = new ServerBoostrap(app);

//Autoinvocacion
(
    async () =>{
        try{
            await connectDB();
            const instances = [server.init()];
            await Promise.all(instances);
        } catch (error){
            console.error("Error starting server", error);
    }
    }
)();
