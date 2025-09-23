import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { SolicitudEntity } from "./SolicitudEntity";

@Entity({ name: "estado_solicitudes", schema: "compartedu" })
export class EstadoSolicitudEntity {

    @PrimaryGeneratedColumn()
    id_estado_solicitud!: number;

    @Column({ type: "character varying", length: 50 })
    descripcion_estado!: string;

    // Relación inversa: un estado puede tener muchas solicitudes
    @OneToMany(() => SolicitudEntity, solicitud => solicitud.estadoSolicitud)
    solicitudes!: SolicitudEntity[];
}