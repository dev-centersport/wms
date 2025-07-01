import { Armazem } from 'src/armazem/entities/armazem.entity';
import { TipoLocalizacao } from 'src/tipo_localizacao/entities/tipo_localizacao.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum StatusPrateleira {
  ABERTA = 'aberta',
  FECHADA = 'fechada',
}

@Entity()
export class Localizacao {
  @PrimaryGeneratedColumn()
  localizacao_id: number;

  @Column('enum', { enum: StatusPrateleira, default: StatusPrateleira.ABERTA })
  status: StatusPrateleira;

  @Column({ length: 100 })
  nome: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  altura: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  largura: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  comprimento: number;

  @Column({ type: 'varchar', length: 13, unique: true })
  ean: string;

  @ManyToOne(() => TipoLocalizacao, (tipo) => tipo.localizacoes)
  @JoinColumn()
  tipo: TipoLocalizacao;

  @ManyToOne(() => Armazem, (armazem) => armazem.localizacoes)
  @JoinColumn()
  armazem: Armazem;
}
