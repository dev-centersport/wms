import { Lado } from 'src/lado/entities/lado.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Polygon,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Agrupamento {
  @PrimaryGeneratedColumn()
  agrupamento_id: number;

  @Column({ type: 'varchar' })
  nome: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
  geom: Polygon;

  @ManyToOne(() => Lado, (lado) => lado.agrupamentos)
  @JoinColumn()
  lado: Lado;

  @OneToMany(() => Localizacao, (loc) => loc.agrupamento)
  localizacoes: Localizacao[];
}
