import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SolicitudEntity } from "./SolicitudEntity";

@Entity("envios")
export class EnvioEntity {
    @PrimaryGeneratedColumn()
    id_envio!: number;

    @Column({ type: "varchar", length: 500 })
    direccion_envio!: string;

    @Column({ type: "varchar", length: 100 })
    barrio_envio!: string;

    @Column({ type: "varchar", length: 100 })
    localidad_envio!: string;

    @Column()
    id_solicitud!: number;

    @ManyToOne(() => SolicitudEntity)
    @JoinColumn({ name: "id_solicitud" })
    solicitud!: SolicitudEntity;
}