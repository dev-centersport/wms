import { Auditoria } from 'src/auditoria/entities/auditoria.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Ocorrencia {
  @PrimaryGeneratedColumn()
  ocorrencia_id: number;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP)',
  })
  dataHora: Date;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ type: 'int' })
  quantidade_esperada: number;

  @ManyToOne(() => ProdutoEstoque, (pe) => pe.ocorrencias)
  @JoinColumn()
  produto_estoque: ProdutoEstoque;

  @ManyToOne(() => Localizacao, (loc) => loc.ocorrencias)
  @JoinColumn()
  localizacao: Localizacao;

  @ManyToOne(() => Usuario, (user) => user.ocorrencias)
  @JoinColumn()
  usuario: Usuario;

  @OneToMany(() => Auditoria, (a) => a.ocorrencia)
  auditorias: Auditoria[];
}
