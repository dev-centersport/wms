// Importa os decoradores do TypeORM para definir entidades de banco de dados
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

// @Entity() marca a classe como uma entidade do banco de dados
// Isso fará com que o TypeORM crie uma tabela 'armazem' no banco de dados
@Entity()
export class Armazem {
  /*
   * Estrutura básica de uma entidade TypeORM:
   * 1. Coluna primária (PK)
   * 2. Colunas regulares
   * 3. Relacionamentos (se houver)
   */

  // @PrimaryGeneratedColumn() define a chave primária auto-incrementável
  // Equivalente a SERIAL no PostgreSQL ou AUTO_INCREMENT no MySQL
  @PrimaryGeneratedColumn()
  armazem_id: number; // Nome da coluna: armazem_id (tipo number)

  // @Column() define uma coluna regular na tabela
  // Por padrão, é NOT NULL e o tipo é inferido do TypeScript (string → varchar)
  @Column({ type: 'varchar', length: 150, unique: true })
  nome: string; // Nome da coluna: nome (tipo string/varchar)

  // Outra coluna regular
  @Column({ type: 'varchar', length: 200, unique: true })
  endereco: string; // Nome da coluna: endereco (tipo string/varchar)

  @Column({ type: 'varchar', length: 100 })
  cidade: string;

  @Column({ type: 'varchar', length: 2 })
  estado: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  altura: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  largura: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  comprimento: number;

  // Exemplo de coluna opcional (comentada)
  // @Column({ nullable: true }) permite valores NULL no banco
  // O '?' no TypeScript indica que o campo é opcional
  //   @Column({ nullable: true })
  //   description?: string;

  /*
   * Configurações comuns de colunas:
   * @Column({ type: 'varchar', length: 100 }) - Define tipo e tamanho
   * @Column({ default: 'valor padrão' }) - Define valor padrão
   * @Column({ unique: true }) - Garante valores únicos
   * @Column({ name: 'custom_name' }) - Nome personalizado no banco
   */

  @OneToMany(() => Localizacao, (localizacao) => localizacao.armazem)
  localizacoes: Localizacao[];
}
