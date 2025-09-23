import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { UserEntity } from "./UserEntity";
import { PublicacionEntity } from "./PublicacionEntity";
import { EstadoSolicitudEntity } from "./EstadoSolicitudEntity";

@Entity({ name: "solicitudes", schema: "compartedu" })
export class SolicitudEntity {

    @PrimaryGeneratedColumn()
    id_solicitud!: number;

    @Column({ type: "integer" })
    cantidad_solicitud!: number;

    @Column({ type: "date" })
    fecha_solicitud!: Date;

    // Relación Many-to-One con EstadoSolicitudEntity
    @ManyToOne(() => EstadoSolicitudEntity, estadoSolicitud => estadoSolicitud.solicitudes)
    @JoinColumn({ name: "id_estado_solicitud" })
    estadoSolicitud!: EstadoSolicitudEntity;

    // Relación Many-to-One con UserEntity
    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_usuario" })
    usuario!: UserEntity;

    // Relación Many-to-One con PublicacionEntity
    @ManyToOne(() => PublicacionEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_publicacion" })
    publicacion!: PublicacionEntity;
}