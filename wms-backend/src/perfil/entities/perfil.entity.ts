import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Perfil {
  @PrimaryGeneratedColumn()
  perfil_id: number;

  @Column({ type: 'varchar', length: 50 })
  nome: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'boolean', default: true })
  pode_ver: boolean;

  @Column({ type: 'boolean', default: false })
  pode_add: boolean;

  @Column({ type: 'boolean', default: false })
  pode_edit: boolean;

  @Column({ type: 'boolean', default: false })
  pode_delete: boolean;

  @OneToMany(() => Usuario, (usuario) => usuario.perfil)
  usuarios: Usuario[];
}
