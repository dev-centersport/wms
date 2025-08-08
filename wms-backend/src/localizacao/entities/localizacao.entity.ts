import { Agrupamento } from 'src/agrupamento/entities/agrupamento.entity';
import { Armazem } from 'src/armazem/entities/armazem.entity';
import { Auditoria } from 'src/auditoria/entities/auditoria.entity';
import { Movimentacao } from 'src/movimentacao/entities/movimentacao.entity';
import { Ocorrencia } from 'src/ocorrencia/entities/ocorrencia.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { TipoLocalizacao } from 'src/tipo_localizacao/entities/tipo_localizacao.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Polygon,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum StatusPrateleira {
  ABERTA = 'aberta',
  FECHADA = 'fechada',
}

export enum Posicao {
  F = 'frente',
  T = 'trás',
}

@Entity()
@Index(['nome'])
@Index(['ean'])
export class Localizacao {
  @PrimaryGeneratedColumn()
  localizacao_id: number;

  @Column({
    type: 'enum',
    enum: StatusPrateleira,
    default: StatusPrateleira.ABERTA,
  })
  status: StatusPrateleira;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  altura: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  largura: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  comprimento: number;

  @Column({ type: 'varchar', length: 13, unique: true })
  ean: string;

  @Column({ type: 'enum', enum: Posicao, nullable: true })
  posicao: Posicao;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geom: Polygon;

  // @BeforeInsert() hooks cannot be async, so ensure EAN is generated before saving the entity.
  // Remove this method and generate EAN in the service before saving the entity.

  // Relações
  @ManyToOne(() => TipoLocalizacao, (tipo) => tipo.localizacoes)
  @JoinColumn()
  tipo: TipoLocalizacao;

  @ManyToOne(() => Armazem, (armazem) => armazem.localizacoes)
  @JoinColumn()
  armazem: Armazem;

  @ManyToOne(() => Agrupamento, (agrup) => agrup.localizacoes, {
    nullable: true,
  })
  @JoinColumn()
  agrupamento: Agrupamento | null;

  @OneToMany(
    () => ProdutoEstoque,
    (produto_estoque) => produto_estoque.localizacao,
  )
  produtos_estoque: ProdutoEstoque[];

  @OneToMany(
    () => Movimentacao,
    (movimentacao) => movimentacao.localizacao_origem,
  )
  movimentacoes_origem: Movimentacao[];

  @OneToMany(
    () => Movimentacao,
    (movimentacao) => movimentacao.localizacao_destino,
  )
  movimentacoes_destino: Movimentacao[];

  @OneToMany(() => Ocorrencia, (o) => o.localizacao)
  ocorrencias: Ocorrencia[];

  @OneToMany(() => Auditoria, (a) => a.localizacao)
  auditorias: Auditoria[];
}
