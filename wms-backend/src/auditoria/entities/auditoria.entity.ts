import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum StatusAuditoria {
  PENDENTE = 'pendente',
  EM_ANDAMENTO = 'em andamento',
  CONCLUIDA = 'concluida',
  CANCELADA = 'cancelada',
}

@Entity()
export class Auditoria {
  @PrimaryGeneratedColumn()
  auditoria_id: number;

  @Column({ type: 'text' })
  conclusao: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data_hora_conclusao: Date;

  @Column({
    type: 'enum',
    enum: StatusAuditoria,
    default: StatusAuditoria.PENDENTE,
  })
  status: StatusAuditoria;
}
