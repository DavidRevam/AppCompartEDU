import { Repository } from "typeorm";
import { User } from "../../domain/User";
import { UserPort } from "../../domain/UserPort";
import { UserEntity } from "../entities/UserEntity";
import { AppDataSource } from "../config/con_data_base";


//Conectar directamente con el TypeORM(Tener control sobre bd)
export class UserAdapter implements UserPort{

    private userRepository: Repository<UserEntity>;

    constructor(){
        this.userRepository = AppDataSource.getRepository(UserEntity);
    }

    //Conversion
    private toDomain(user: UserEntity): User{
        return{
            id: user.id_usuario,
            nombre: user.nombre_usuario,
            apellido: user.apellido_usuario,
            telefono: user.telefono_usuario,
            password: user.password_usuario,
            email: user.email_usuario,
            usuario_activo: user.estado_usu_activo
        }
    }

    private toEntity(user: Omit<User, "id">): UserEntity{
        const userEntity = new UserEntity();
        userEntity.nombre_usuario = user.nombre;
        userEntity.apellido_usuario = user.apellido;
        userEntity.telefono_usuario = user.telefono;
        userEntity.password_usuario = user.password;
        userEntity.email_usuario = user.email;
        userEntity.estado_usu_activo = user.usuario_activo;
        return userEntity;
    }



    async createUser(user: Omit<User, "id">): Promise<number> {
        try{
            const newUser = this.toEntity(user);
            const savedUser = await this.userRepository.save(newUser);

            return savedUser.id_usuario;
        }catch(error){
            console.error("Error al crear usuario", error);
            throw new Error("Error al crear usuario");
        }
    }
    async updateUser(id: number, user: Partial<User>): Promise<boolean> {
        try{
            const existingUser = await this.userRepository.findOne({where:{id_usuario: id}});
            if(!existingUser){
                throw new Error("Usuario no encontrado")
            }
            //Actualizar atributos o propiedades enviadas
            Object.assign(existingUser,{
                nombre_usuario: user.nombre ?? existingUser.nombre_usuario,
                apellido_usuario: user.apellido ?? existingUser.apellido_usuario,
                telefono_usuario: user.telefono ?? existingUser.telefono_usuario,
                email_usuario: user.email ?? existingUser.email_usuario,
                password_usuario: user.password ?? existingUser.password_usuario,
                estado_usu_activo: user.usuario_activo ?? existingUser.estado_usu_activo
            });
            await this.userRepository.save(existingUser);
            return true;
        }catch (error){
            console.error("Error al actualizar usuario", error);
            throw new Error("Error al actualizar usuario");
        }
    }
    async deleteUser(id: number): Promise<boolean> {
        try{
            const existingUser = await this.userRepository.findOne({where:{id_usuario: id}});
            if(!existingUser){
                throw new Error("Usuario no encontrado")
            }
            Object.assign(existingUser,{
                estado_usu_activo: 0
            });
            await this.userRepository.save(existingUser);
            return true;
                
        }catch (error){
            console.error("Error al eliminar usuario", error);
            throw new Error("Error al eliminar usuario");
        }
    }

    //Consultas
    async getAllUsers(): Promise<User[]> {
        try{
            const users = await this.userRepository.find();
            return users.map(this.toDomain);
        }catch (error) {
            console.error("Error al obtener todos los usuarios", error);
            throw new Error("Error al obtener todos los usuarios");
        }
    }
    async getUserById(id: number): Promise<User | null> {
        try{
            const user = await this.userRepository.findOne({where:{id_usuario: id}});
            return user ? this.toDomain(user): null;
        }catch (error){
            console.error("Error al obtener usuario por ID", error);
            throw new Error("Error al obtener usuario por ID");
        }
    }
    async getUserByEmail(email: string): Promise<User | null> {
        try{
            const user = await this.userRepository.findOne({where:{email_usuario: email}});
            return user ? this.toDomain(user): null;
        }catch (error){
            console.error("Error al obtener usuario por email", error);
            throw new Error("Error al obtener usuario por email");
        }
    }
    
    async getUserByTelefono(telefono: string): Promise<User | null> {
        try{
            const user = await this.userRepository.findOne({where:{telefono_usuario: telefono}});
            return user ? this.toDomain(user): null;
        }catch (error){
            console.error("Error al obtener usuario por teléfono", error);
            throw new Error("Error al obtener usuario por teléfono");
        }
    }

}