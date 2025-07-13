import { Movimentacao } from 'src/movimentacao/entities/movimentacao.entity';
import { Produto } from 'src/produto/entities/produto.entity';
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

  @ManyToOne(() => Produto, (produto) => produto.itens_movimentacao)
  @JoinColumn()
  produto: Produto;

  @ManyToOne(() => Movimentacao, (mov) => mov.itens_movimentacao)
  @JoinColumn()
  movimentacao: Movimentacao;
}
