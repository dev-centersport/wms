import { Agrupamento } from 'src/agrupamento/entities/agrupamento.entity';
import { Fileira } from 'src/fileira/entities/fileira.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Lado {
  @PrimaryGeneratedColumn()
  lado_id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'char', length: 1 })
  lado: string;

  @ManyToOne(() => Fileira, (fileira) => fileira.lados)
  @JoinColumn()
  fileira: Fileira;

  @OneToMany(() => Agrupamento, (agrup) => agrup.lado)
  agrupamentos: Agrupamento[];
}
