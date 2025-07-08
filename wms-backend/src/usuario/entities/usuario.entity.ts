import { Movimentacao } from 'src/movimentacao/entities/movimentacao.entity';
import { Perfil } from 'src/perfil/entities/perfil.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @ManyToOne(() => Perfil, (perfil) => perfil.usuarios)
  @JoinColumn()
  perfil: Perfil;

  @OneToMany(() => Movimentacao, (movimentacao) => movimentacao.usuario)
  movimentacoes: Movimentacao[];
}
