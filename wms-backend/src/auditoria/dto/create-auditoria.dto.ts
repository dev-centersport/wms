import { StatusAuditoria } from '../entities/auditoria.entity';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { idRelations } from 'src/utils/decorator.id.relations';
import { Ocorrencia } from 'src/ocorrencia/entities/ocorrencia.entity';

class OcorrenciaDto {
  @IsNotEmpty()
  @IsNumber()
  ocorrencia_id: number;
}

export class CreateAuditoriaDto {
  @idRelations()
  usuario_id: number;

  // @idRelations()
  // ocorrencia_id: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OcorrenciaDto)
  ocorrencias: Ocorrencia[];

  @idRelations()
  localizacao_id: number;

  @IsOptional()
  @IsString()
  conclusao?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  data_hora_inicio?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  data_hora_conclusao?: Date;

  @IsOptional()
  @IsEnum(StatusAuditoria)
  status?: StatusAuditoria;
}
