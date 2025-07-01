import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TipoLocalizacao {
  @PrimaryGeneratedColumn()
  tipo_localizacao_id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  tipo: string;

  @OneToMany(() => Localizacao, (localizacao) => localizacao.tipo)
  localizacoes: Localizacao[];
}
