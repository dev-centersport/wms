import { Agrupamento } from 'src/agrupamento/entities/agrupamento.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Fileira {
  @PrimaryGeneratedColumn()
  fileira_id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'geometry', spatialFeatureType: 'LineString', srid: 4326 })
  geom: string;

  @OneToMany(() => Agrupamento, (agrup) => agrup.fileira)
  agrupamentos: Agrupamento[];
}
