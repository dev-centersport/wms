import { ItemAuditoria } from 'src/item_auditoria/entities/item_auditoria.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Ocorrencia } from 'src/ocorrencia/entities/ocorrencia.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ type: 'timestamp' })
  data_hora_inicio?: Date;

  @Column({ type: 'timestamp' })
  data_hora_conclusao?: Date;

  @Column({
    type: 'enum',
    enum: StatusAuditoria,
    default: StatusAuditoria.PENDENTE,
  })
  status: StatusAuditoria;

  @ManyToOne(() => Usuario, (user) => user.auditorias)
  @JoinColumn()
  usuario: Usuario;

  @ManyToOne(() => Ocorrencia, (o) => o.auditorias)
  @JoinColumn()
  ocorrencia: Ocorrencia;

  @ManyToOne(() => Localizacao, (loc) => loc.auditorias)
  @JoinColumn()
  localizacao: Localizacao;

  @OneToMany(() => ItemAuditoria, (ia) => ia.auditoria)
  itens_auditoria: ItemAuditoria[];
}
