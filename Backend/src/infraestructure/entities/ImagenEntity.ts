import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { PublicacionEntity } from "./PublicacionEntity";

@Entity({ name: "imagenes", schema: "compartedu" })
export class ImagenEntity {
    @PrimaryGeneratedColumn({ name: "id_imagen" })
    id_imagen!: number;

    @Column({ name: "url_imagen", type: "text", nullable: false })
    url_imagen!: string;

    @Column({ name: "id_publicacion", nullable: false })
    id_publicacion!: number;

    // Relación Many-to-One con PublicacionEntity
    @ManyToOne(() => PublicacionEntity, (publicacion) => publicacion.imagenes, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "id_publicacion" })
    publicacion!: PublicacionEntity;
}