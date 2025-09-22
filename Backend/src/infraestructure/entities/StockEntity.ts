import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PublicacionEntity } from "./PublicacionEntity";

@Entity({name: "stocks", schema: "compartedu"})
export class StockEntity {
    @PrimaryGeneratedColumn()
    id_stock!: number;

    @Column({type: "int"})
    cantidad_total_stock!: number;

    @Column({type: "int"})
    cantidad_reservada_stock!: number;

    @Column({type: "int"})
    cantidad_disponible_stock!: number;

    @Column({type: "int", default: 1})
    estado_stock_activo!: number;

    @OneToOne(() => PublicacionEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_publicacion" }) // FK única
    publicacion!: PublicacionEntity;
}