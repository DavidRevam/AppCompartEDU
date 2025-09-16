import { Router, response } from 'express';
import { UserApplication } from "../../application/UserApplication";
import { UserAdapter } from "../adapter/UserAdapter";
import { UserController } from "../controller/UserController"
import { authenticateToken } from '../web/authMiddleware';

//Express
const router = Router();

//INICIALIZACION DE CAPAS EN ORDEN
const userAdapter = new UserAdapter();
const userApp = new UserApplication(userAdapter);
const userController = new UserController(userApp);

//Definicion Rutas. --> ENdpoint ->Especificacion URL


//Login
router.post("/login", async(request, response)=>{
    await userController.login(request, response);
});

//Primer endpoint
router.post("/users", /*authenticateToken,*/ async(request, response)=>{
    try{
        await userController.registerUser(request, response);
    }catch(error){
        console.error("Error en usuario:", error);
        response.status(400).json({message:"Error en creacion de usuario"});
    }
});

router.get("/users", async(request, response)=>{
    try{
        await userController.allUsers(request, response);
    }catch(error){
        console.error("(allUsers) Error en usuarios:", error);
        response.status(400).json({message:"Error en usuarios"});
    }
});

router.get("/users/:id",async(request,response)=>{
    try {
        await userController.searchUserById(request,response);
    } catch (error) {
        console.error(error);
        response.status(400).json({message:"Error en obtener usuario"});
    }
});

router.get("/users/email/:email",async(request,response)=>{
    try {
        await userController.searchUserByEmail(request,response);
    } catch (error) {
        console.error(error);
        response.status(400).json({message:"Error en obtener usuario"});
    }
});

router.put("/users/:id",async(request,response)=>{
    try {
        await userController.updateUser(request,response);
    } catch (error) {
        console.error(error);
        response.status(400).json({message:"Error en obtener usuario"});
    }
});

router.delete("/users/:id",async(request,response)=>{
    try {
        await userController.downUser(request,response);
    } catch (error) {
        console.error(error);
        response.status(400).json({message:"Error en obtener usuario"});
    }
});


export default router;