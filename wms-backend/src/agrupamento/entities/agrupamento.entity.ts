import { Column, Entity, Polygon, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Agrupamento {
  @PrimaryGeneratedColumn()
  agrupamento_id: number;

  @Column({ type: 'varchar' })
  nome: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
  geometry: Polygon;
}
