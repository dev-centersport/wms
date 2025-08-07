import { Agrupamento } from 'src/agrupamento/entities/agrupamento.entity';
import { Lado } from 'src/lado/entities/lado.entity';
import {
  Column,
  Entity,
  OneToMany,
  Polygon,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Fileira {
  @PrimaryGeneratedColumn()
  fileira_id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'geometry', spatialFeatureType: 'LineString', srid: 4326 })
  geom: Polygon;

  @OneToMany(() => Lado, (l) => l.fileira)
  lados: Lado[];
}
