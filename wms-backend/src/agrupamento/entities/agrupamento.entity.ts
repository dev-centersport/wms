import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import {
  Column,
  Entity,
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

  @OneToMany(() => Localizacao, (loc) => loc.agrupamento)
  localizacoes: Localizacao[];
}
