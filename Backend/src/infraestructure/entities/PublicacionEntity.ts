import { Column, Entity, ManyToOne, OneToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { UserEntity } from "./UserEntity";
import { StockEntity } from "./StockEntity";
import { ImagenEntity } from "./ImagenEntity";

@Entity({ name: "publicaciones", schema: "compartedu" })
export class PublicacionEntity {

    @PrimaryGeneratedColumn()
    id_publicacion!: number;

    @Column({ type: "character varying", length: 255 })
    titulo_publicacion!: string;

    @Column({ type: "character varying", length: 500 })
    descripcion_publicacion!: string;

    @Column({ type: "date" })
    fecha_publicacion!: Date;

    @Column({ type: "integer", default: 1 })
    estado_publi_activa!: number;

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_usuario" })  // FK
    usuario!: UserEntity;

    @OneToOne(() => StockEntity, (stock) => stock.publicacion)
    stock!: StockEntity;

    @OneToMany(() => ImagenEntity, (imagen) => imagen.publicacion)
    imagenes!: ImagenEntity[];
}
