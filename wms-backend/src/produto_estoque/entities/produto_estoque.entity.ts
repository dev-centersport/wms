import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Produto } from 'src/produto/entities/produto.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProdutoEstoque {
  @PrimaryGeneratedColumn()
  produto_estoque_id: number;

  @Column({ type: 'int' })
  quantidade: number;

  @ManyToOne(() => Produto, (produto) => produto.produtos_estoque)
  @JoinColumn()
  produto: Produto;

  @ManyToOne(() => Localizacao, (localizacao) => localizacao.produtos_estoque)
  @JoinColumn()
  localizacao: Localizacao;
}
