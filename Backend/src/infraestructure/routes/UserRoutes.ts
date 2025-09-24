import { Router, response } from 'express';
import { UserApplication } from "../../application/UserApplication";
import { UserAdapter } from "../adapter/UserAdapter";
import { PublicacionAdapter } from "../adapter/PublicacionAdapter";
import { UserController } from "../controller/UserController"
import { authenticateToken } from '../web/authMiddleware';

//Express
const router = Router();

//INICIALIZACION DE CAPAS EN ORDEN
const userAdapter = new UserAdapter();
const publicacionAdapter = new PublicacionAdapter();
const userApp = new UserApplication(userAdapter, publicacionAdapter);
const userController = new UserController(userApp);

//Definicion Rutas. --> ENdpoint ->Especificacion URL


//Login
router.post("/login", async(request, response)=>{
    await userController.login(request, response);
});

//Primer endpoint Registrar Usuario
router.post("/users", /*authenticateToken,*/ async(request, response)=>{
    try{
        await userController.registerUser(request, response);
    }catch(error){
        console.error("Error en usuario:", error);
        response.status(400).json({message:"Error en creacion de usuario"});
    }
});

//Obtener todos los usuarios
router.get("/users", async(request, response)=>{
    try{
        await userController.allUsers(request, response);
    }catch(error){
        console.error("(allUsers) Error en usuarios:", error);
        response.status(400).json({message:"Error en usuarios"});
    }
});


//Obtener un usuario por ID
router.get("/users/:id",async(request,response)=>{
    try {
        await userController.searchUserById(request,response);
    } catch (error) {
        console.error(error);
        response.status(400).json({message:"Error en obtener usuario"});
    }
});

//Obtener un usuario por Email
router.get("/users/email/:email",async(request,response)=>{
    try {
        await userController.searchUserByEmail(request,response);
    } catch (error) {
        console.error(error);
        response.status(400).json({message:"Error en obtener usuario por Email"});
    }
});

//Actualizar un usuario por ID
router.put("/users/:id", authenticateToken, async(request,response)=>{
    try {
        await userController.updateUser(request,response);
    } catch (error) {
        console.error(error);
        response.status(400).json({message:"Error en obtener usuario por ID"});
    }
});

//Eliminacion
router.delete("/users/:id", authenticateToken, async(request,response)=>{
    try {
        await userController.downUser(request,response);
    } catch (error) {
        console.error(error);
        response.status(400).json({message:"Error en obtener usuario y borrar usuario por ID"});
    }
});


export default router;