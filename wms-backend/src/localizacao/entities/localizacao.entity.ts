import { Armazem } from 'src/armazem/entities/armazem.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { TipoLocalizacao } from 'src/tipo_localizacao/entities/tipo_localizacao.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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

  // @BeforeInsert() hooks cannot be async, so ensure EAN is generated before saving the entity.
  // Remove this method and generate EAN in the service before saving the entity.

  @ManyToOne(() => TipoLocalizacao, (tipo) => tipo.localizacoes)
  @JoinColumn()
  tipo: TipoLocalizacao;

  @ManyToOne(() => Armazem, (armazem) => armazem.localizacoes)
  @JoinColumn()
  armazem: Armazem;

  @OneToMany(
    () => ProdutoEstoque,
    (produto_estoque) => produto_estoque.localizacao,
  )
  produtos_estoque: ProdutoEstoque[];
}
