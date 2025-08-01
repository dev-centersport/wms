import { Permissao } from 'src/permissao/entities/permissao.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Perfil {
  @PrimaryGeneratedColumn()
  perfil_id: number;

  @Column({ type: 'varchar', length: 50 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @ManyToMany(() => Permissao)
  @JoinTable()
  permissoes: Permissao[];

  @OneToMany(() => Usuario, (usuario) => usuario.perfil)
  usuarios: Usuario[];
}
