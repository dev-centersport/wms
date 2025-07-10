import { Movimentacao } from 'src/movimentacao/entities/movimentacao.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ItemMovimentacao {
  @PrimaryGeneratedColumn()
  item_movimentacao_id: number;

  @Column({ type: 'int' })
  quantidade: number;

  @ManyToOne(
    () => ProdutoEstoque,
    (produto_estoque) => produto_estoque.itens_movimentacao,
  )
  @JoinColumn()
  produto_estoque: ProdutoEstoque;

  @ManyToOne(() => Movimentacao, (mov) => mov.itens_movimentacao)
  @JoinColumn()
  movimentacao: Movimentacao;
}
