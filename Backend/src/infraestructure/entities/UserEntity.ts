import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { PublicacionEntity } from "./PublicacionEntity";

@Entity({ name: "usuarios", schema: "compartedu" })
export class UserEntity {

    /**Mapear y decoradores */
    @PrimaryGeneratedColumn()
    id_usuario!: number;

    @Column({ type: "character varying", length: 255 })
    nombre_usuario!: string;

    @Column({ type: "character varying", length: 255 })
    apellido_usuario!: string;

    @Column({ type: "character varying", length: 15, unique: true })
    telefono_usuario!: string;

    @Column({ type: "character varying", length: 255 })
    password_usuario!: string;

    @Column({ type: "character varying", length: 255, unique: true })
    email_usuario!: string;

    @Column({ type: "int", default: 1 })
    estado_usu_activo!: number;

    // Relación inversa: un usuario tiene muchas publicaciones
    @OneToMany(() => PublicacionEntity, publi => publi.usuario)
    publicaciones!: PublicacionEntity[];
}