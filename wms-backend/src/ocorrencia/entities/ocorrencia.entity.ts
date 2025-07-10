import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ocorrencia {
  @PrimaryGeneratedColumn()
  ocorrencia_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataHora: Date;
}
