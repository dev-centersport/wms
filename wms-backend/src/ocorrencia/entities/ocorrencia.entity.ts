import { Auditoria } from 'src/auditoria/entities/auditoria.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Ocorrencia {
  @PrimaryGeneratedColumn()
  ocorrencia_id: number;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dataHora: Date;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ type: 'int' })
  quantidade_esperada: number;

  @Column({ type: 'int' })
  quantidade_sistemas: number;

  @Column({ type: 'int' })
  diferenca_quantidade: number;

  @ManyToOne(() => ProdutoEstoque, (pe) => pe.ocorrencias)
  @JoinColumn()
  produto_estoque: ProdutoEstoque;

  @ManyToOne(() => Localizacao, (loc) => loc.ocorrencias)
  @JoinColumn()
  localizacao: Localizacao;

  @ManyToOne(() => Usuario, (user) => user.ocorrencias)
  @JoinColumn()
  usuario: Usuario;

  @ManyToOne(() => Auditoria, (a) => a.ocorrencias)
  @JoinColumn()
  auditoria: Auditoria;

  @BeforeInsert()
  @BeforeUpdate()
  calculateQuantities() {
    // Define quantidade_sistemas com base no produto_estoque
    if (this.produto_estoque && this.produto_estoque.quantidade !== undefined)
      this.quantidade_sistemas = this.produto_estoque.quantidade;

    // Calcula a diferença entre a quantidade fisíca e do sistema
    if (
      this.quantidade_esperada !== undefined &&
      this.quantidade_sistemas !== undefined
    )
      this.diferenca_quantidade =
        this.quantidade_sistemas - this.quantidade_esperada;
  }
}
