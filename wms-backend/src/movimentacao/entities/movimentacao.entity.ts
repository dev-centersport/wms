import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TipoMovimentacao {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
  TRANSFERENCIA = 'transferencia',
}

@Entity()
export class Movimentacao {
  @PrimaryGeneratedColumn()
  movimentacao_id: number;

  @Column({
    type: 'enum',
    enum: TipoMovimentacao,
    default: TipoMovimentacao.ENTRADA,
  })
  tipo: TipoMovimentacao;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataHora: Date;

  @ManyToOne(() => Usuario, (user) => user.movimentacoes)
  @JoinColumn()
  usuario: Usuario;

  @ManyToOne(
    () => Localizacao,
    (localizacao) => localizacao.movimentacoes_origem,
  )
  @JoinColumn()
  localizacao_origem: Localizacao;

  @ManyToOne(
    () => Localizacao,
    (localizacao) => localizacao.movimentacoes_destino,
  )
  @JoinColumn()
  localizacao_destino: Localizacao;
}
