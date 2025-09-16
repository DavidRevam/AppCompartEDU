import { User } from "../domain/User";
import { UserPort } from "../domain/UserPort";
import bcrypt from "bcryptjs";
import { AuthApplication } from "./AuthApplication";


export class UserApplication{
    private port: UserPort;
    //inyeccion constructor

    constructor(port: UserPort){
        this.port = port;

    }

    async login(email:string, password:string):Promise<string>{
        const existingUser = await this.port.getUserByEmail(email);
        if(!existingUser){
            throw new Error("Credenciales invalidas")
        }
        const passwordMath = await bcrypt.compare(password, existingUser.password);
        if(!passwordMath){
            throw new Error("Credenciales invalidas")
        }
        const token = AuthApplication.generateToken({
            id: existingUser.id,
            email: existingUser.email
        });

        return token;
    }

    async createUser(user: Omit<User, "id">): Promise <number>{
        const existingUser = await this.port.getUserByEmail(user.email);
        if(existingUser){
            throw new Error("El correo electrónico ya está registrado");
        }
        
        const existingPhone = await this.port.getUserByTelefono(user.telefono);
        if(existingPhone){
            throw new Error("El número de teléfono ya está registrado");
        }
        
        const hashedPass = await bcrypt.hash(user.password, 10);
        user.password = hashedPass;
        return this.port.createUser(user);
    }

    async updateUser(id: number, user:Partial<User>): Promise <boolean>{
        const existingUser = await this.port.getUserById(id);
        if(!existingUser){
            throw new Error("El usuario no existe");
        }
        
        if(user.email){
            const emailTaken = await this.port.getUserByEmail(user.email);
            if(emailTaken && emailTaken.id !== id){
                throw new Error("El correo electrónico ya está en uso por otro usuario")
            }
        }
        
        if(user.telefono){
            const phoneTaken = await this.port.getUserByTelefono(user.telefono);
            if(phoneTaken && phoneTaken.id !== id){
                throw new Error("El número de teléfono ya está en uso por otro usuario")
            }
        }

        return await this.port.updateUser(id, user);


    }

    async deleteUser(id:number): Promise<boolean>{
        const existingUser = await this.port.getUserById(id);
        if(!existingUser){
            throw new Error("No se encontró el usuario");
        }
        return await this.port.deleteUser(id);
    }

    //Consultas GET
    async getUserById(id: number):Promise<User | null>{
        return await this.port.getUserById(id);
    }

    async getUserByEmail(email: string): Promise<User | null>{
        return await this.port.getUserByEmail(email);
    }
    
    async getUserByTelefono(telefono: string): Promise<User | null>{
        return await this.port.getUserByTelefono(telefono);
    }

    async getAllUsers(): Promise <User[]>{
        return await this.port.getAllUsers();
    }

}