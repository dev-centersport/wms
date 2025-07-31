import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { idRelations } from 'src/utils/decorator.id.relations';
import { MotivoDiferenca } from '../entities/item_auditoria.entity';

export class CreateItemAuditoriaDto {
  @IsNotEmpty()
  @IsString()
  conclusao: string;

  @IsNotEmpty()
  @IsInt()
  quantidades_sistema: number;

  @IsNotEmpty()
  @IsInt()
  quantidades_fisico: number;

  @IsNotEmpty()
  @IsEnum(MotivoDiferenca)
  motivo_diferenca: MotivoDiferenca;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  mais_informacoes?: string;

  @IsNotEmpty()
  @IsString()
  acao_corretiva: string;

  @IsNotEmpty()
  @IsInt()
  estoque_anterior: number;

  @IsNotEmpty()
  @IsInt()
  estoque_novo: number;

  @idRelations()
  auditoria_id: number;
}
