//Comunicar con servicio (UserApplication.ts)

import { UserApplication } from "../../application/UserApplication";
import {User} from "../../domain/User";
import { Request, Response} from "express";


//Aqui la PETICION

export class UserController{
    private app: UserApplication;
    constructor(app: UserApplication){
        this.app = app;
    }

    async login(req: Request, res: Response): Promise<string | Response>{
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ error: "Email y contraseña son requeridos" });
 
      // Validación de email
      if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email))
        return res.status(400).json({ error: "Correo electrónico no válido" });
 
      // Validación de contraseña
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,25}$/.test(password))
        return res.status(400).json({
          error:
            "La contraseña debe tener al menos 6 caracteres y máximo 25, incluyendo al menos una letra y un número",
        });
 
      const token = await this.app.login(email, password);
      return res.status(200).json({ token });
     
    } catch (error) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
 
   
  }
 

    async registerUser(request: Request, response: Response): Promise<Response> {
    const { nombre, apellido, telefono, email, password } = request.body;
    try {
      //Validaciones con express regulares o regex
      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/;
      if (!nameRegex.test(nombre.trim())) {
        return response.status(400).json({ message: "Nombre invalido" });
      }
      if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email))
        return response
          .status(400)
          .json({ error: "Correo electrónico no válido" });

      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,25}$/.test(password))
        return response.status(400).json({
          error:
            "La contraseña debe tener al menos 6 caracteres y máximo 25, incluyendo al menos una letra y un número",
        });

      const usuario_activo = 1;
      const user: Omit<User, "id"> = { nombre, apellido, telefono, email, password, usuario_activo };
      const userId = await this.app.createUser(user);
      return response
        .status(201)
        .json({ message: "Usuario registrado correctamente", userId });
    } catch (error) {
      if (error instanceof Error) {
        return response.status(500).json({ message: "Error en servidor" });
      }
    }
    return response.status(400).json({ message: "Error en la peticion" });
  }

  async searchUserById(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const userId = parseInt(request.params.id);
      if (isNaN(userId))
        return response.status(400).json({ message: "error en parametro" });
      const user = await this.app.getUserById(userId);
      if (!user) {
        return response.status(404).json({ message: "Usuario no existe" });
      }
      return response.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(500).json({ message: "Error en servidor" });
      }
    }
    return response.status(400).json({ message: "Error en la peticion" });
  }

  async searchUserByEmail(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const { email } = request.params;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return response
          .status(400)
          .json({ error: "Correo electrónico no válido" });
      const user = await this.app.getUserByEmail(email);
      if (!user) {
        return response.status(404).json({ message: "Usuario no existe" });
      }
      return response.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(500).json({ message: "Error en servidor" });
      }
    }
    return response.status(400).json({ message: "Error en la peticion" });
  }

  async allUsers(request: Request, response: Response): Promise<Response> {
    try {
      const users = await this.app.getAllUsers();
      return response.status(200).json(users);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(500).json({ message: "Error en servidor" });
      }
    }
    return response.status(400).json({ message: "Error en la peticion" });
  }

  async downUser(request: Request, response: Response): Promise<Response> {
    try {
      const userId = parseInt(request.params.id);
      if (isNaN(userId))
        return response.status(400).json({ message: "error en parametro" });
      const user = await this.app.deleteUser(userId);
      if (!user) {
        return response.status(404).json({ message: "Usuario no existe" });
      }
      return response.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(500).json({ message: "Error en servidor" });
      }
    }
    return response.status(400).json({ message: "Error en la peticion" });
  }

  async updateUser(request: Request, response: Response): Promise<Response> {
    try {
      const userId = parseInt(request.params.id);
      if (isNaN(userId))
        return response.status(400).json({ message: "error en parametro" });
      let { nombre, apellido, telefono, email, password, usuario_activo } = request.body;
      // Validaciones antes de actualizar
      if (nombre && !/^[a-zA-Z\s]{3,}$/.test(nombre.trim()))
        return response.status(400).json({
          message:
            "El nombre debe tener al menos 3 caracteres y solo contener letras",
        });

      if (email && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email.trim()))
        return response
          .status(400)
          .json({ message: "Correo electrónico no válido" });

      if (
        password &&
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password.trim())
      )
        return response.status(400).json({
          message:
            "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
        });

      usuario_activo = 1;

      const updated = await this.app.updateUser(userId, {
        nombre, 
        apellido, 
        telefono, 
        email, 
        password, 
        usuario_activo, 
      });
      if (!updated){
        return response
          .status(404)
          .json({ message: "Usuario no encontrado o sin cambios " });
      }
      
      return response.status(200).json({ message: "Usuario actualizado correctamente" });

    } catch (error) {
      if (error instanceof Error) {
        return response.status(500).json({ message: "Error en servidor" });
      }
    }
    return response.status(400).json({ message: "Error en la peticion" });
  }
}

