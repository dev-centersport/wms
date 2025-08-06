import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Modulo {
  ARMAZEM = 'armazem',
  TIPO_LOCALIZACAO = 'tipo_localizacao',
  LOCALIZACAO = 'localizacao',
  MOVIMENTACAO = 'movimentacao',
  TRANSFERENCIA = 'transferencia',
  OCORRENCIA = 'ocorrencia',
  AUDITORIA = 'auditoria',
  RELATORIO = 'relatorio',
  USUARIO = 'usuario',
}

@Entity()
export class Permissao {
  @PrimaryGeneratedColumn()
  permissao_id: number;

  @Column({ type: 'enum', enum: Modulo })
  modulo: Modulo;

  @Column({ type: 'boolean', default: false })
  pode_incluir: boolean;

  @Column({ type: 'boolean', default: false })
  pode_editar: boolean;

  @Column({ type: 'boolean', default: false })
  pode_excluir: boolean;
}
