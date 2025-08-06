import { Auditoria } from 'src/auditoria/entities/auditoria.entity';
import { Movimentacao } from 'src/movimentacao/entities/movimentacao.entity';
import { Ocorrencia } from 'src/ocorrencia/entities/ocorrencia.entity';
import { Perfil } from 'src/perfil/entities/perfil.entity';
import { Permissao } from 'src/permissao/entities/permissao.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum MovimentacaoSet {
  ENTRADA = 'entrada',
  SAIDA = 'saída',
}

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  usuario_id: number;

  @Column({ type: 'varchar', length: 150 })
  responsavel: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  usuario: string;

  @Column({ type: 'varchar', length: 100 })
  senha: string;

  @Column({ type: 'int' })
  nivel: number;

  @Column({ type: 'varchar', length: 11, unique: true })
  cpf: string;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({
    type: 'enum',
    enum: MovimentacaoSet,
    default: MovimentacaoSet.ENTRADA,
  })
  movimentacao_set: MovimentacaoSet;

  @Column({ type: 'boolean', default: false })
  is_logged: boolean;

  @Column({ type: 'text', nullable: true })
  current_token: string | null;

  @ManyToMany(() => Permissao)
  @JoinTable()
  permissoes_extras: Permissao[];

  @ManyToOne(() => Perfil, (perfil) => perfil.usuarios)
  @JoinColumn()
  perfil: Perfil;

  @OneToMany(() => Movimentacao, (movimentacao) => movimentacao.usuario)
  movimentacoes: Movimentacao[];

  @OneToMany(() => Ocorrencia, (o) => o.usuario)
  ocorrencias: Ocorrencia[];

  @OneToMany(() => Auditoria, (a) => a.usuario)
  auditorias: Auditoria[];
}
