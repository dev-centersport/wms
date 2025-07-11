import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import {
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataHora: Date;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @ManyToOne(() => ProdutoEstoque, (pe) => pe.ocorrencias)
  @JoinColumn()
  produto_estoque: ProdutoEstoque;

  @ManyToOne(() => Usuario, (user) => user.ocorrencias)
  @JoinColumn()
  usuario: Usuario;
}
