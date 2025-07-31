import { Auditoria } from 'src/auditoria/entities/auditoria.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum MotivoDiferenca {
  ESTOQUE_ZERADO = 'estoque zerado',
  PRODUTO_A_MAIS = 'produto a mais',
  PRODUTO_A_MENOS = 'produto a menos',
  OUTRO = 'outro',
}

@Entity()
export class ItemAuditoria {
  @PrimaryGeneratedColumn()
  item_auditoria_id: number;

  @Column({ type: 'int' })
  quantidades_sistema: number;

  @Column({ type: 'int' })
  quantidades_fisico: number;

  @Column({ type: 'enum', enum: MotivoDiferenca })
  motivo_diferenca: MotivoDiferenca;

  @Column({ type: 'text' })
  mais_informacoes?: string;

  @Column({ type: 'text' })
  acao_corretiva: string;

  @Column({ type: 'int' })
  estoque_anterior: number;

  @Column({ type: 'int' })
  estoque_novo: number;

  @ManyToOne(() => Auditoria, (a) => a.itens_auditoria)
  @JoinColumn()
  auditoria: Auditoria;
}
