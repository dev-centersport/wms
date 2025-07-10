import { ItemMovimentacao } from 'src/item_movimentacao/entities/item_movimentacao.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Produto {
  @PrimaryGeneratedColumn()
  produto_id: number;

  @Column({ type: 'int', unique: true })
  id_tiny: number;

  @Column({ type: 'varchar', length: 50 })
  @Index({ unique: true })
  sku: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url_foto: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  altura: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  largura: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  comprimento: number;

  @Column({ type: 'varchar', length: 13, unique: true, nullable: true })
  ean: string | null;

  @OneToMany(() => ProdutoEstoque, (produto_estoque) => produto_estoque.produto)
  produtos_estoque: ProdutoEstoque[];

  @OneToMany(
    () => ItemMovimentacao,
    (itens_movimentacao) => itens_movimentacao.produto,
  )
  itens_movimentacao: ItemMovimentacao[];
}
